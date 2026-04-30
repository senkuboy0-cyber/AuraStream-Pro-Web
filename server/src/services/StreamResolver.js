/**
 * AuraStream Pro Web - Stream Resolver Service
 * 
 * This module handles all streaming-related HTTP requests.
 * It acts as a proxy to bypass CORS restrictions and
 * User-Agent blocks from various streaming sites.
 * 
 * Features:
 * - CORS proxy for streaming content
 * - Custom header handling
 * - Range request support for video seeking
 * - Response streaming for large files
 * - Quality stream selection
 * 
 * @module StreamResolver
 * @version 1.0.0
 */

import fetch from 'node-fetch';
import { Readable } from 'stream';

/**
 * StreamResolver Class
 * 
 * Provides methods to resolve and proxy streaming content.
 * Handles various streaming protocols including HLS, DASH, and direct video.
 */
export class StreamResolver {
  /**
   * Create a new StreamResolver instance
   * 
   * @param {Object} logger - Winston logger instance
   * @param {Object} options - Configuration options
   */
  constructor(logger, options = {}) {
    this.logger = logger;
    
    // Default headers to use when proxying requests
    this.defaultHeaders = {
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
      'Accept': '*/*',
      'Accept-Language': 'en-US,en;q=0.9',
      'Accept-Encoding': 'gzip, deflate, br',
      'Connection': 'keep-alive',
      'Sec-Fetch-Dest': 'empty',
      'Sec-Fetch-Mode': 'cors',
      'Sec-Fetch-Site': 'same-origin'
    };
    
    // Request timeout in milliseconds
    this.timeout = options.timeout || 30000;
    
    // Maximum response size in bytes (100MB)
    this.maxResponseSize = options.maxResponseSize || 100 * 1024 * 1024;
    
    this.logger.info('StreamResolver initialized');
  }

  /**
   * Fetch content with custom headers (CORS proxy)
   * 
   * @param {string} url - Target URL
   * @param {Object} options - Fetch options
   * @returns {Promise<Object>} Response with status, headers, and body
   */
  async fetch(url, options = {}) {
    const {
      headers = {},
      method = 'GET',
      timeout = this.timeout,
      responseType = 'auto' // 'auto', 'json', 'text', 'buffer', 'stream'
    } = options;
    
    try {
      this.logger.debug(`Fetching: ${url}`);
      
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), timeout);
      
      const response = await fetch(url, {
        method,
        headers: {
          ...this.defaultHeaders,
          ...headers
        },
        signal: controller.signal,
        redirect: 'follow'
      });
      
      clearTimeout(timeoutId);
      
      // Determine response type
      const contentType = response.headers.get('content-type') || '';
      
      let body;
      if (responseType === 'stream' || contentType.includes('video') || contentType.includes('audio')) {
        body = response.body;
      } else if (responseType === 'json' || contentType.includes('application/json')) {
        body = await response.json();
      } else if (responseType === 'buffer') {
        body = await response.buffer();
      } else {
        // Auto-detect
        if (contentType.includes('application/json')) {
          body = await response.json();
        } else {
          body = await response.text();
        }
      }
      
      return {
        success: true,
        status: response.status,
        statusText: response.statusText,
        headers: Object.fromEntries(response.headers.entries()),
        body
      };
      
    } catch (error) {
      this.logger.error(`Fetch error for ${url}: ${error.message}`);
      
      return {
        success: false,
        error: error.message,
        code: error.code || 'FETCH_ERROR'
      };
    }
  }

  /**
   * Proxy a request with custom headers (for bypassing blocks)
   * 
   * @param {string} url - Target URL
   * @param {Object} customHeaders - Custom headers to send
   * @returns {Promise<Object>} Proxied response
   */
  async proxyRequest(url, customHeaders = {}) {
    return this.fetch(url, {
      headers: {
        ...this.defaultHeaders,
        ...customHeaders
      }
    });
  }

  /**
   * Fetch HLS master playlist and extract available qualities
   * 
   * @param {string} masterUrl - URL to the master.m3u8 playlist
   * @returns {Promise<Object>} Available streams and metadata
   */
  async getHLSManifest(masterUrl) {
    try {
      const response = await this.fetch(masterUrl, {
        responseType: 'text'
      });
      
      if (!response.success) {
        return response;
      }
      
      const playlist = response.body;
      const lines = playlist.split('\n');
      
      const streams = [];
      const variants = [];
      let currentVariant = null;
      
      for (const line of lines) {
        const trimmed = line.trim();
        
        if (trimmed.startsWith('#EXT-X-STREAM-INF:')) {
          // Parse stream info
          const bandwidthMatch = trimmed.match(/BANDWIDTH=(\d+)/);
          const resolutionMatch = trimmed.match(/RESOLUTION=([^,]+)/);
          const codecsMatch = trimmed.match(/CODECS="([^"]+)"/);
          
          currentVariant = {
            bandwidth: bandwidthMatch ? parseInt(bandwidthMatch[1]) : 0,
            resolution: resolutionMatch ? resolutionMatch[1] : 'unknown',
            codecs: codecsMatch ? codecsMatch[1] : '',
            url: null
          };
          
        } else if (trimmed && !trimmed.startsWith('#')) {
          // This is a URL
          if (currentVariant) {
            currentVariant.url = trimmed.startsWith('http') 
              ? trimmed 
              : masterUrl.substring(0, masterUrl.lastIndexOf('/') + 1) + trimmed;
            
            variants.push(currentVariant);
            currentVariant = null;
          }
        }
      }
      
      // Sort by bandwidth (highest first)
      variants.sort((a, b) => b.bandwidth - a.bandwidth);
      
      // Generate quality labels
      for (let i = 0; i < variants.length; i++) {
        const variant = variants[i];
        const bandwidthKbps = Math.round(variant.bandwidth / 1000);
        
        streams.push({
          quality: this.getQualityLabel(variant.resolution, bandwidthKbps),
          url: variant.url,
          bandwidth: variant.bandwidth,
          resolution: variant.resolution,
          codecs: variant.codecs,
          height: this.extractResolution(variant.resolution)
        });
      }
      
      return {
        success: true,
        masterUrl,
        streams,
        isMasterPlaylist: variants.length > 0
      };
      
    } catch (error) {
      this.logger.error(`HLS manifest error: ${error.message}`);
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * Get a specific quality stream URL from an HLS playlist
   * 
   * @param {string} masterUrl - Master playlist URL
   * @param {number} targetHeight - Target video height (e.g., 720)
   * @returns {Promise<string|null>} Stream URL or null
   */
  async getQualityStream(masterUrl, targetHeight = 720) {
    const manifest = await this.getHLSManifest(masterUrl);
    
    if (!manifest.success || !manifest.streams.length) {
      return null;
    }
    
    // Find closest quality
    let selected = manifest.streams[0];
    let minDiff = Math.abs(selected.height - targetHeight);
    
    for (const stream of manifest.streams) {
      const diff = Math.abs(stream.height - targetHeight);
      if (diff < minDiff) {
        minDiff = diff;
        selected = stream;
      }
    }
    
    return selected?.url || manifest.streams[0]?.url;
  }

  /**
   * Fetch subtitle file (VTT/SRT) and convert if needed
   * 
   * @param {string} subtitleUrl - URL to subtitle file
   * @param {string} format - Target format ('vtt', 'srt')
   * @returns {Promise<Object>} Subtitle data
   */
  async getSubtitle(subtitleUrl, format = 'vtt') {
    try {
      const response = await this.fetch(subtitleUrl, {
        responseType: 'text'
      });
      
      if (!response.success) {
        return response;
      }
      
      let content = response.body;
      
      // Convert SRT to VTT if needed
      if (format === 'vtt' && !content.includes('WEBVTT')) {
        content = this.srtToVtt(content);
      }
      
      return {
        success: true,
        content,
        format,
        url: subtitleUrl
      };
      
    } catch (error) {
      this.logger.error(`Subtitle fetch error: ${error.message}`);
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * Convert SRT subtitles to VTT format
   * 
   * @param {string} srt - SRT content
   * @returns {string} VTT content
   */
  srtToVtt(srt) {
    let vtt = 'WEBVTT\n\n';
    
    // Remove all numeric identifiers
    let blocks = srt.split(/\d+\s*\n/);
    blocks.shift(); // Remove empty first block
    
    for (const block of blocks) {
      if (block.trim()) {
        // Replace comma with dot in timestamps
        const lines = block.trim().split('\n');
        const timestamps = lines[0].replace(',', '.'');
        
        vtt += timestamps + '\n';
        for (let i = 1; i < lines.length; i++) {
          vtt += lines[i] + '\n';
        }
        vtt += '\n';
      }
    }
    
    return vtt;
  }

  /**
   * Handle range requests for video seeking
   * 
   * @param {string} url - Video URL
   * @param {number} start - Start byte
   * @param {number} end - End byte (optional)
   * @returns {Promise<Object>} Partial content
   */
  async fetchRange(url, start, end = null) {
    try {
      const headers = {
        Range: end ? `bytes=${start}-${end}` : `bytes=${start}-`
      };
      
      return this.fetch(url, {
        headers,
        responseType: 'buffer'
      });
      
    } catch (error) {
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * Extract quality label from resolution and bandwidth
   * 
   * @param {string} resolution - Video resolution (e.g., "1920x1080")
   * @param {number} bandwidth - Bandwidth in Kbps
   * @returns {string} Quality label
   */
  getQualityLabel(resolution, bandwidth) {
    const height = this.extractResolution(resolution);
    
    if (height >= 2160) return '4K';
    if (height >= 1440) return '1440p';
    if (height >= 1080) return '1080p';
    if (height >= 720) return '720p';
    if (height >= 480) return '480p';
    if (height >= 360) return '360p';
    if (height >= 240) return '240p';
    
    return `${height}p`;
  }

  /**
   * Extract numeric height from resolution string
   * 
   * @param {string} resolution - Resolution string
   * @returns {number} Height in pixels
   */
  extractResolution(resolution) {
    if (!resolution) return 0;
    
    const match = resolution.match(/(\d+)x(\d+)/i);
    if (match) {
      return parseInt(match[2]);
    }
    
    return parseInt(resolution) || 0;
  }

  /**
   * Validate if a URL is a valid streaming source
   * 
   * @param {string} url - URL to validate
   * @returns {boolean} True if valid streaming URL
   */
  isValidStreamUrl(url) {
    if (!url || typeof url !== 'string') return false;
    
    try {
      const parsed = new URL(url);
      const validProtocols = ['http:', 'https:'];
      const validExtensions = ['.m3u8', '.mp4', '.webm', '.mkv', '.mov'];
      
      if (!validProtocols.includes(parsed.protocol)) return false;
      
      const path = parsed.pathname.toLowerCase();
      return validExtensions.some(ext => path.endsWith(ext)) || path.includes('.m3u8');
      
    } catch {
      return false;
    }
  }

  /**
   * Extract all stream URLs from a page or response
   * 
   * @param {string} content - HTML or text content
   * @returns {Array<string>} Array of found stream URLs
   */
  extractStreamUrls(content) {
    const patterns = [
      // HLS streams
      /https?:\/\/[^\s"'<>]+\.m3u8[^\s"'<>]*/gi,
      // Direct video
      /https?:\/\/[^\s"'<>]+\.(?:mp4|webm|mkv|mov)[^\s"'<>]*/gi,
      // Embed players
      /src\s*=\s*["'](https?:\/\/[^'"]+)["']/gi,
      // Iframe sources
      /<iframe[^>]+src\s*=\s*["']([^"']+)["']/gi
    ];
    
    const urls = new Set();
    
    for (const pattern of patterns) {
      const matches = content.match(pattern);
      if (matches) {
        matches.forEach(url => {
          // Clean up the URL
          const cleaned = url.replace(/^src\s*=\s*["']|["']$/gi, '').replace(/^<iframe[^>]+src\s*=\s*["']/gi, '');
          if (this.isValidStreamUrl(cleaned)) {
            urls.add(cleaned);
          }
        });
      }
    }
    
    return Array.from(urls);
  }
}

export default StreamResolver;
