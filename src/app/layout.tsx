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
    <html lang="id" className={`${inter.variable} antialiased h-full scroll-smooth`}>
      <head>
        <meta name="robots" content="noindex, nofollow" />
      </head>
      <body className="flex min-h-full flex-col text-[#222520] selection:bg-[#3B5336]/20 selection:text-[#2D4129] dark:text-[#ECEAE4]">
        <Navbar />
        <main className="flex-1 pb-16">
          {children}
        </main>
        <footer className="border-t border-[#DCE5D8] bg-[#F5F2EB]/90 py-5 sm:py-6 text-xs text-[#5D6B58] backdrop-blur-md dark:border-[#2B382A] dark:bg-[#161C15]/90 dark:text-[#A7B8A3]">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-3 sm:gap-4 text-center sm:text-left">
            <div className="space-y-0.5">
              <p className="font-medium text-[#222520] dark:text-[#ECEAE4]">
                <span className="font-bold text-[#2D4129] dark:text-[#E2EFE0]">Griya Kenanga Residence</span>
                <span className="hidden sm:inline"> — </span>
                <span className="block sm:inline text-[#5D6B58] dark:text-[#A7B8A3]">
                  24 Unit Kos &amp; Studio Sewa, Sleman, Yogyakarta
                </span>
              </p>
            </div>
            <div className="flex flex-wrap items-center justify-center sm:justify-end gap-2 sm:gap-3 text-[11px] text-[#5D6B58] dark:text-[#A7B8A3]">
            </div>
          </div>
        </footer>
      </body>
    </html>
  );
}
