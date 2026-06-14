import type { Metadata } from 'next';
import { Geist, Geist_Mono } from 'next/font/google';
import './globals.css';
import { AuthProvider } from '../hooks/useAuth';

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
});

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
});

export const metadata: Metadata = {
  title: 'EcoTrack AI - Carbon Footprint Tracker & AI Sustainability Coach',
  description: 'Calculate, monitor, and reduce your carbon footprint with AI-driven insights, environmental challenges, gamification, and printable carbon reports.',
  keywords: ['carbon footprint', 'sustainability', 'AI coach', 'green lifestyle', 'eco tracking', 'climate action'],
  authors: [{ name: 'EcoTrack AI Team' }],
  viewport: 'width=device-width, initial-scale=1',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased min-h-screen flex flex-col bg-[#090a0f] text-[#f3f4f6]`}
      >
        <AuthProvider>
          {children}
        </AuthProvider>
      </body>
    </html>
  );
}
