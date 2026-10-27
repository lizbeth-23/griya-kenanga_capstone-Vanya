import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import AppShell from '@/components/AppShell';

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'Griya Kenanga | Manajemen Properti',
  description: 'Sistem Manajemen Properti Kos dan Studio Sewa Griya Kenanga Residence.',
  robots: {
    index: false,
    follow: false,
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="id" className={`${inter.variable} antialiased h-full scroll-smooth`}>
      <head>
        <meta name="robots" content="noindex, nofollow" />
      </head>
      <body className="min-h-full text-[#222520] selection:bg-[#3B5336]/20 selection:text-[#2D4129] dark:text-[#ECEAE4]">
        <AppShell>
          {children}
        </AppShell>
      </body>
    </html>
  );
}
