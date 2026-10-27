'use client';

import { useState } from 'react';
import { Lock, LogIn } from 'lucide-react';
import AuthModal from './AuthModal';

interface AuthGuardProps {
  moduleName?: string;
}

export default function AuthGuard({ moduleName = 'halaman ini' }: AuthGuardProps) {
  const [modalOpen, setModalOpen] = useState(false);

  return (
    <div className="mx-auto max-w-lg px-4 py-20 text-center animate-in fade-in duration-200">
      <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-[#E8EFE5] text-[#3B5336] mx-auto mb-4 border border-[#95B08A]/40 shadow-xs dark:bg-[#1E281C] dark:text-[#95B08A] dark:border-[#2B382A]">
        <Lock className="h-7 w-7" />
      </div>
      <h2 className="text-xl sm:text-2xl font-extrabold tracking-tight text-[#222520] dark:text-[#ECEAE4]">
        Perlu Masuk Akun
      </h2>
      <p className="mt-2 text-xs sm:text-sm text-[#5D6B58] dark:text-[#A7B8A3] leading-relaxed max-w-md mx-auto">
        Anda harus masuk (login) atau mendaftar terlebih dahulu untuk mengakses data dan fitur {moduleName}.
      </p>

      <div className="mt-6 flex justify-center">
        <button
          onClick={() => setModalOpen(true)}
          className="flex items-center gap-2 rounded-full bg-[#3B5336] px-7 py-3 text-xs sm:text-sm font-bold text-white shadow-md hover:bg-[#2D4129] active:scale-95 transition-all"
        >
          <LogIn className="h-4 w-4" />
          <span>Masuk / Daftar Sekarang</span>
        </button>
      </div>

      <AuthModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
      />
    </div>
  );
}
