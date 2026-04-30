import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'AuraStream Pro - Next-Gen Streaming Platform',
  description: 'High-end, plugin-based streaming web application with dynamic provider engine and ultra-premium UI.',
  keywords: ['streaming', 'video', 'hls', 'cloudstream', 'plugin', 'movies', 'series'],
  authors: [{ name: 'AuraStream Team' }],
  icons: {
    icon: '/favicon.ico',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark">
      <body className="min-h-screen bg-background text-text-primary antialiased">
        {children}
      </body>
    </html>
  );
}
