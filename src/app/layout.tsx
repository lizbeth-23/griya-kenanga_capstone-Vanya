import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import Navbar from '@/components/Navbar';

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'Griya Kenanga Residence | Sistem Manajemen Properti',
  description: 'Aplikasi Manajemen Properti Kos dan Studio Sewa 24 Unit di Sleman, Yogyakarta.',
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
    <html lang="id" className={`${inter.variable} antialiased h-full`}>
      <head>
        <meta name="robots" content="noindex, nofollow" />
      </head>
      <body className="flex min-h-full flex-col bg-stone-50 text-stone-900 selection:bg-emerald-500/20 selection:text-emerald-900 dark:bg-stone-950 dark:text-stone-100">
        <Navbar />
        <main className="flex-1 pb-16">
          {children}
        </main>
        <footer className="border-t border-stone-200/80 bg-white/50 py-6 text-center text-xs text-stone-500 backdrop-blur-sm dark:border-stone-800/80 dark:bg-stone-950/50 dark:text-stone-400">
          <div className="mx-auto max-w-7xl px-4 flex flex-col sm:flex-row items-center justify-between gap-2">
            <div>
              <span className="font-semibold text-stone-800 dark:text-stone-200">Griya Kenanga Residence</span> — 24 Unit Kos & Studio Sewa, Sleman, Yogyakarta
            </div>
            <div className="flex items-center gap-3 text-[11px]">
              <span>Capstone 05 · Bootcamp AI Web Programming</span>
              <span>•</span>
              <span className="text-emerald-600 dark:text-emerald-400 font-medium">Acuan: 15 Okt 2026</span>
            </div>
          </div>
        </footer>
      </body>
    </html>
  );
}
