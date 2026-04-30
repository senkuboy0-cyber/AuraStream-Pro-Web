import './globals.css';
import type { Metadata } from 'next';

export const metadata = {
  title: 'AuraStream Pro - Next-Generation Streaming',
  description: 'High-end plugin-based streaming platform with dynamic provider engine.',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="dark">
      <body className="min-h-screen bg-[#050505] text-white antialiased">
        {children}
      </body>
    </html>
  );
}
