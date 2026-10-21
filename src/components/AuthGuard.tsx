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
      <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-amber-500/10 text-amber-700 mx-auto mb-4 border border-amber-500/30">
        <Lock className="h-7 w-7" />
      </div>
      <h2 className="text-xl font-bold text-stone-900 dark:text-stone-100">
        Perlu Masuk Akun
      </h2>
      <p className="mt-2 text-xs sm:text-sm text-stone-500 leading-relaxed">
        Anda harus masuk (login) atau mendaftar terlebih dahulu untuk mengakses data dan fitur {moduleName}.
      </p>

      <div className="mt-6 flex justify-center">
        <button
          onClick={() => setModalOpen(true)}
          className="flex items-center gap-2 rounded-2xl bg-stone-900 px-6 py-2.5 text-xs font-semibold text-white shadow-xs hover:bg-emerald-700 transition-all dark:bg-stone-100 dark:text-stone-900"
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
