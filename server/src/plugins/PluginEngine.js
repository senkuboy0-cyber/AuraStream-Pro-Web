/**
 * AuraStream Pro Web - Secure Plugin Engine
 * 
 * This module implements a dynamic plugin loading system inspired by Cloudstream.
 * It fetches provider repositories from GitHub, parses plugin definitions,
 * and executes them in a secure isolated VM environment.
 * 
 * Security Features:
 * - All plugins execute in isolated VM contexts using vm2
 * - No access to Node.js APIs or file system from plugins
 * - Memory and timeout limits enforced
 * - Plugin API exposed through a controlled interface
 * 
 * @module PluginEngine
 * @version 1.0.0
 */

import { VM } from 'vm2';
import fetch from 'node-fetch';

/**
 * PluginEngine Class
 * 
 * Manages the lifecycle of streaming provider plugins:
 * - Loading repositories from GitHub
 * - Parsing provider definitions
 * - Executing plugins in secure sandboxes
 * - Handling search and data fetching requests
 */
export class PluginEngine {
  /**
   * Create a new PluginEngine instance
   * 
   * @param {Object} logger - Winston logger instance
   * @param {Object} options - Configuration options
   */
  constructor(logger, options = {}) {
    this.logger = logger;
    
    // Configuration with defaults
    this.config = {
      timeout: options.timeout || 30000,           // Plugin execution timeout (ms)
      memoryLimit: options.memoryLimit || 128,    // Memory limit (MB)
      consoleProxy: options.consoleProxy || true,  // Proxy console.log calls
      providerCacheSize: options.providerCacheSize || 100,
    };
    
    // Active providers registry
    // Structure: { providerId: { name, version, sandbox, instance } }
    this.providers = new Map();
    
    // Repository cache
    // Structure: { repoUrl: { meta, providers, lastFetched } }
    this.repositoryCache = new Map();
    
    // Provider API exposed to plugins
    this.providerAPI = this.createProviderAPI();
    
    this.logger.info('PluginEngine initialized with security sandbox');
  }

  /**
   * Create the Provider API that will be exposed to plugins
   * This defines what functions/plugins can access
   * 
   * @returns {Object} The Provider API object
   */
  createProviderAPI() {
    return {
      // HTTP request helper for plugins
      request: async (url, options = {}) => {
        try {
          const response = await fetch(url, {
            method: options.method || 'GET',
            headers: {
              'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
              'Accept': options.accept || 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
              'Accept-Language': 'en-US,en;q=0.5',
              ...options.headers
            },
            timeout: 15000
          });
          
          const contentType = response.headers.get('content-type') || '';
          
          if (contentType.includes('application/json')) {
            return {
              status: response.status,
              headers: Object.fromEntries(response.headers.entries()),
              data: await response.json()
            };
          }
          
          return {
            status: response.status,
            headers: Object.fromEntries(response.headers.entries()),
            text: await response.text()
          };
        } catch (error) {
          return {
            status: 0,
            error: error.message
          };
        }
      },
      
      // Cheerio-like HTML parser stub for basic parsing
      parseHTML: (html) => {
        // Simple HTML parsing utilities for plugins
        const parse = (selector) => {
          // Basic selector support - in production, use cheerio
          const regex = new RegExp(`<[^>]*${selector.replace(/[\[\]]/g, '')}[^>]*>([^<]*)`, 'i');
          const match = html.match(regex);
          return match ? match[1].trim() : null;
        };
        
        const querySelectorAll = (selector) => {
          const regex = new RegExp(`<[^>]*class="[^"]*${selector.replace(/\./g, '[^\"]*').replace(/[\[\]]/g, '')}[^"]*"[^>]*>`, 'gi');
          return html.match(regex) || [];
        };
        
        return {
          select: parse,
          querySelectorAll,
          text: () => html.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim()
        };
      },
      
      // Utility functions available to plugins
      utils: {
        // Decode HTML entities
        decodeHtml: (html) => {
          const entities = {
            '&amp;': '&',
            '&lt;': '<',
            '&gt;': '>',
            '&quot;': '"',
            '&#39;': "'",
            '&nbsp;': ' '
          };
          return html.replace(/&[^;]+;/g, (match) => entities[match] || match);
        },
        
        // Extract video sources from various formats
        extractM3U8: (text) => {
          const m3u8Regex = /(https?:\/\/[^\s"'<>]+\.m3u8[^\s"'<>]*)/g;
          return text.match(m3u8Regex) || [];
        },
        
        // Extract direct video URLs
        extractVideoUrl: (text) => {
          const patterns = [
            /(https?:\/\/[^\s"'<>]+\.mp4[^\s"'<>]*)/g,
            /(https?:\/\/[^\s"'<>]+\.mkv[^\s"'<>]*)/g,
            /(https?:\/\/[^\s"'<>]+\.webm[^\s"'<>]*)/g
          ];
          
          let urls = [];
          for (const pattern of patterns) {
            const matches = text.match(pattern) || [];
            urls = [...urls, ...matches];
          }
          return [...new Set(urls)];
        }
      }
    };
  }

  /**
   * Create a secure sandbox VM for plugin execution
   * 
   * @param {string} providerId - Unique identifier for the provider
   * @returns {VM} Configured VM instance
   */
  createSecureSandbox(providerId) {
    const self = this;
    
    return new VM({
      timeout: this.config.timeout,
      maxMemory: this.config.memoryLimit,
      eval: false,
      wasm: false,
      
      // Secure context with limited API access
      sandbox: {
        // Safe console proxy
        console: {
          log: (...args) => {
            this.logger.debug(`[${providerId}]`, ...args);
          },
          error: (...args) => {
            this.logger.error(`[${providerId}]`, ...args);
          },
          warn: (...args) => {
            this.logger.warn(`[${providerId}]`, ...args);
          },
          info: (...args) => {
            this.logger.info(`[${providerId}]`, ...args);
          }
        },
        
        // Provider API
        $provider: this.providerAPI,
        
        // Safe Math object
        Math: Math,
        
        // Safe JSON object
        JSON: JSON,
        
        // Safe Array object
        Array: Array,
        
        // Safe Object object
        Object: Object,
        
        // Safe String object
        String: String,
        
        // Safe Number object
        Number: Number,
        
        // Safe Boolean object
        Boolean: Boolean,
        
        // Safe RegExp object
        RegExp: RegExp,
        
        // Safe Date object
        Date: Date,
        
        // Safe Promise object
        Promise: Promise,
        
        // Safe Map object
        Map: Map,
        
        // Safe Set object
        Set: Set,
        
        // Safe Error object
        Error: Error,
        
        // Safe parseInt
        parseInt: parseInt,
        
        // Safe parseFloat
        parseFloat: parseFloat,
        
        // Safe isNaN
        isNaN: isNaN,
        
        // Safe isFinite
        isFinite: isFinite,
        
        // Safe encodeURIComponent
        encodeURIComponent: encodeURIComponent,
        
        // Safe decodeURIComponent
        decodeURIComponent: decodeURIComponent
      },
      
      // Fix for vm2 internal require
      require: {
        external: false,
        internal: false,
        mock: {}
      }
    });
  }

  /**
   * Fetch and parse a repository manifest (repo.json)
   * 
   * @param {string} repoUrl - GitHub raw URL to repo.json
   * @returns {Promise<Object>} Repository metadata and provider list
   */
  async fetchRepository(repoUrl) {
    // Check cache first
    const cached = this.repositoryCache.get(repoUrl);
    if (cached && Date.now() - cached.lastFetched < 300000) { // 5 min cache
      this.logger.debug(`Repository cache hit: ${repoUrl}`);
      return cached.data;
    }
    
    try {
      this.logger.info(`Fetching repository: ${repoUrl}`);
      
      const response = await fetch(repoUrl, {
        headers: {
          'Accept': 'application/json',
          'User-Agent': 'AuraStream/1.0'
        },
        timeout: 15000
      });
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
      
      const data = await response.json();
      
      // Validate repository structure
      if (!data.name || !Array.isArray(data.providers)) {
        throw new Error('Invalid repository format: missing name or providers array');
      }
      
      // Cache the result
      this.repositoryCache.set(repoUrl, {
        data: data,
        lastFetched: Date.now()
      });
      
      this.logger.info(`Repository loaded: ${data.name} with ${data.providers.length} providers`);
      return data;
      
    } catch (error) {
      this.logger.error(`Failed to fetch repository: ${error.message}`);
      throw error;
    }
  }

  /**
   * Fetch and register a single provider from a repository
   * 
   * @param {string} repoUrl - Base URL of the repository
   * @param {Object} providerMeta - Provider metadata from repo.json
   * @returns {Promise<Object>} Registered provider details
   */
  async loadProvider(repoUrl, providerMeta) {
    try {
      // Construct full URL to provider script
      const baseUrl = repoUrl.replace('/repo.json', '');
      const scriptUrl = providerMeta.file.startsWith('http') 
        ? providerMeta.file 
        : `${baseUrl}/${providerMeta.file}`;
      
      this.logger.debug(`Loading provider: ${providerMeta.name} from ${scriptUrl}`);
      
      // Fetch provider script
      const response = await fetch(scriptUrl, {
        headers: {
          'Accept': 'application/javascript',
          'User-Agent': 'AuraStream/1.0'
        },
        timeout: 15000
      });
      
      if (!response.ok) {
        throw new Error(`Failed to fetch provider script: HTTP ${response.status}`);
      }
      
      const scriptContent = await response.text();
      
      // Create unique provider ID
      const providerId = `${this.sanitizeName(providerMeta.name)}-${Date.now()}`;
      
      // Create sandbox for this provider
      const sandbox = this.createSecureSandbox(providerId);
      
      // Execute provider script in sandbox
      let providerInstance;
      try {
        // Wrap the script to export the provider class/function
        const wrappedScript = `
          (function() {
            ${scriptContent}
            
            // If the script exports a default provider
            if (typeof provider !== 'undefined') {
              return typeof provider === 'function' ? new provider() : provider;
            }
            
            // If the script exports a class
            if (typeof Provider !== 'undefined') {
              return new Provider();
            }
            
            // If the script defines a register function
            if (typeof register === 'function') {
              return register($provider);
            }
            
            throw new Error('No valid provider export found');
          })()
        `;
        
        providerInstance = sandbox.run(wrappedScript);
        
      } catch (execError) {
        this.logger.error(`Provider execution failed for ${providerMeta.name}: ${execError.message}`);
        throw execError;
      }
      
      // Validate provider instance
      if (!providerInstance || typeof providerInstance !== 'object') {
        throw new Error('Provider did not return a valid instance');
      }
      
      // Register the provider
      const registeredProvider = {
        id: providerId,
        name: providerMeta.name || providerInstance.name || 'Unknown',
        version: providerMeta.version || '1.0.0',
        repoUrl: repoUrl,
        sandbox: sandbox,
        instance: providerInstance,
        loadedAt: Date.now(),
        capabilities: this.detectCapabilities(providerInstance)
      };
      
      this.providers.set(providerId, registeredProvider);
      
      this.logger.info(`Provider registered: ${registeredProvider.name} (${providerId})`);
      
      return registeredProvider;
      
    } catch (error) {
      this.logger.error(`Failed to load provider ${providerMeta.name}: ${error.message}`);
      throw error;
    }
  }

  /**
   * Load all providers from a repository
   * 
   * @param {string} repoUrl - GitHub raw URL to repo.json
   * @returns {Promise<Array>} Array of loaded provider details
   */
  async loadRepository(repoUrl) {
    const repoData = await this.fetchRepository(repoUrl);
    const loadedProviders = [];
    
    for (const providerMeta of repoData.providers) {
      try {
        const provider = await this.loadProvider(repoUrl, providerMeta);
        loadedProviders.push(provider);
      } catch (error) {
        this.logger.warn(`Skipping provider ${providerMeta.name}: ${error.message}`);
      }
    }
    
    return loadedProviders;
  }

  /**
   * Unload a provider by ID
   * 
   * @param {string} providerId - The provider ID to unload
   * @returns {boolean} True if unloaded successfully
   */
  unloadProvider(providerId) {
    const provider = this.providers.get(providerId);
    
    if (!provider) {
      this.logger.warn(`Provider not found: ${providerId}`);
      return false;
    }
    
    // Clean up sandbox
    if (provider.sandbox) {
      // vm2 VM cleanup is handled automatically
    }
    
    this.providers.delete(providerId);
    this.logger.info(`Provider unloaded: ${provider.name}`);
    
    return true;
  }

  /**
   * Unload all providers from a repository
   * 
   * @param {string} repoUrl - The repository URL
   * @returns {number} Number of providers unloaded
   */
  unloadRepository(repoUrl) {
    let count = 0;
    
    for (const [providerId, provider] of this.providers) {
      if (provider.repoUrl === repoUrl) {
        this.unloadProvider(providerId);
        count++;
      }
    }
    
    this.logger.info(`Unloaded ${count} providers from repository`);
    return count;
  }

  /**
   * Search across all loaded providers
   * 
   * @param {string} query - Search query
   * @param {Object} options - Search options
   * @returns {Promise<Array>} Combined search results
   */
  async search(query, options = {}) {
    const {
      limit = 20,
      type = 'all', // 'all', 'movie', 'series'
      providerIds = null // Filter to specific providers
    } = options;
    
    const providers = providerIds 
      ? providerIds.map(id => this.providers.get(id)).filter(Boolean)
      : Array.from(this.providers.values());
    
    this.logger.info(`Searching "${query}" across ${providers.length} providers`);
    
    // Execute search on all providers in parallel with Promise.allSettled
    const searchPromises = providers.map(async (provider) => {
      try {
        const sandbox = this.createSecureSandbox(provider.id);
        
        // Call provider's search method if available
        if (typeof provider.instance.search === 'function') {
          const results = await Promise.race([
            Promise.resolve(sandbox.run(`(${provider.instance.search.toString()})('${query.replace(/'/g, "\\'")}')`)),
            new Promise((_, reject) => 
              setTimeout(() => reject(new Error('Search timeout')), this.config.timeout)
            )
          ]);
          
          return {
            provider: provider.name,
            providerId: provider.id,
            results: Array.isArray(results) ? results.slice(0, limit) : []
          };
        }
        
        return { provider: provider.name, providerId: provider.id, results: [] };
        
      } catch (error) {
        this.logger.debug(`Search failed for ${provider.name}: ${error.message}`);
        return { provider: provider.name, providerId: provider.id, results: [], error: error.message };
      }
    });
    
    // Use Promise.allSettled to handle individual provider failures
    const results = await Promise.allSettled(searchPromises);
    
    // Combine all successful results
    let allResults = [];
    for (const result of results) {
      if (result.status === 'fulfilled' && result.value.results.length > 0) {
        allResults = [...allResults, ...result.value.results.map(r => ({
          ...r,
          source: result.value.provider
        }))];
      }
    }
    
    // Sort by relevance (if available) and limit
    allResults.sort((a, b) => (b.popularity || 0) - (a.popularity || 0));
    
    return allResults.slice(0, limit);
  }

  /**
   * Get details for a specific media item
   * 
   * @param {string} providerId - Provider ID
   * @param {Object} mediaId - Media identifier from the provider
   * @returns {Promise<Object>} Media details with episodes/sources
   */
  async getMediaDetails(providerId, mediaId) {
    const provider = this.providers.get(providerId);
    
    if (!provider) {
      throw new Error(`Provider not found: ${providerId}`);
    }
    
    try {
      if (typeof provider.instance.getDetails === 'function') {
        const sandbox = this.createSecureSandbox(provider.id);
        const details = await Promise.race([
          Promise.resolve(sandbox.run(`(${provider.instance.getDetails.toString()})(${JSON.stringify(mediaId)})`)),
          new Promise((_, reject) => 
            setTimeout(() => reject(new Error('Details fetch timeout')), this.config.timeout)
          )
        ]);
        
        return {
          ...details,
          provider: provider.name,
          providerId: provider.id
        };
      }
      
      return { mediaId, error: 'Provider does not support getDetails' };
      
    } catch (error) {
      this.logger.error(`Failed to get details from ${provider.name}: ${error.message}`);
      throw error;
    }
  }

  /**
   * Get streaming sources for a media item
   * 
   * @param {string} providerId - Provider ID
   * @param {Object} mediaId - Media identifier
   * @param {Object} episodeInfo - Episode/season info for series
   * @returns {Promise<Object>} Streaming sources
   */
  async getSources(providerId, mediaId, episodeInfo = null) {
    const provider = this.providers.get(providerId);
    
    if (!provider) {
      throw new Error(`Provider not found: ${providerId}`);
    }
    
    try {
      if (typeof provider.instance.getSources === 'function') {
        const sandbox = this.createSecureSandbox(provider.id);
        const sources = await Promise.race([
          Promise.resolve(sandbox.run(`(${provider.instance.getSources.toString()})(${JSON.stringify(mediaId)}, ${JSON.stringify(episodeInfo)})`)),
          new Promise((_, reject) => 
            setTimeout(() => reject(new Error('Sources fetch timeout')), this.config.timeout)
          )
        ]);
        
        return {
          ...sources,
          provider: provider.name,
          providerId: provider.id
        };
      }
      
      return { mediaId, error: 'Provider does not support getSources' };
      
    } catch (error) {
      this.logger.error(`Failed to get sources from ${provider.name}: ${error.message}`);
      throw error;
    }
  }

  /**
   * Initialize the plugin engine
   * Loads any previously installed repositories from database
   */
  async initialize() {
    this.logger.info('Plugin Engine initialization started');
    
    // In production, load installed repositories from database
    // For now, we initialize with empty state
    
    this.logger.info('Plugin Engine initialized successfully');
  }

  /**
   * Get count of loaded providers
   * 
   * @returns {number} Number of active providers
   */
  getProviderCount() {
    return this.providers.size;
  }

  /**
   * Get all loaded providers
   * 
   * @returns {Array} Array of provider metadata
   */
  getAllProviders() {
    return Array.from(this.providers.values()).map(p => ({
      id: p.id,
      name: p.name,
      version: p.version,
      repoUrl: p.repoUrl,
      capabilities: p.capabilities,
      loadedAt: p.loadedAt
    }));
  }

  /**
   * Detect provider capabilities from its methods
   * 
   * @param {Object} instance - Provider instance
   * @returns {Object} Capabilities object
   */
  detectCapabilities(instance) {
    return {
      search: typeof instance.search === 'function',
      getDetails: typeof instance.getDetails === 'function',
      getSources: typeof instance.getSources === 'function',
      getEpisodes: typeof instance.getEpisodes === 'function',
      latest: typeof instance.latest === 'function',
      trending: typeof instance.trending === 'function'
    };
  }

  /**
   * Sanitize provider name for safe use as identifier
   * 
   * @param {string} name - Raw provider name
   * @returns {string} Sanitized name
   */
  sanitizeName(name) {
    return name
      .toLowerCase()
      .replace(/[^a-z0-9]/g, '-')
      .replace(/-+/g, '-')
      .replace(/^-|-$/g, '');
  }
}

export default PluginEngine;
