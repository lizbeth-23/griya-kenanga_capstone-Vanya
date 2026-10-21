'use client';

import { useState } from 'react';
import { useGriyaStore } from '@/lib/use-store';
import { 
  Building2, KeyRound, Receipt, Wrench, ShieldCheck, 
  ArrowRight, LogIn, UserPlus, Sparkles, CheckCircle2, ChevronRight, UserCheck
} from 'lucide-react';
import AuthModal from './AuthModal';

export default function LandingHero() {
  const { store } = useGriyaStore();
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [authMode, setAuthMode] = useState<'login' | 'register'>('login');

  const handleQuickLogin = (email: string) => {
    store.login(email, 'Latihan#2026');
  };

  return (
    <div className="space-y-12 animate-in fade-in duration-300">
      
      {/* Hero Section */}
      <div className="relative overflow-hidden rounded-3xl border border-stone-200/90 bg-white/70 p-8 sm:p-12 shadow-xs backdrop-blur-md dark:border-stone-800 dark:bg-stone-900/60 text-center max-w-4xl mx-auto">
        
        {/* Glow Accent */}
        <div className="absolute -top-24 left-1/2 -translate-x-1/2 h-48 w-96 rounded-full bg-emerald-500/10 blur-3xl pointer-events-none" />

        <div className="inline-flex items-center gap-2 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-3 py-1 text-xs font-semibold text-emerald-800 dark:text-emerald-300 mb-6">
          <Sparkles className="h-3.5 w-3.5" />
          <span>Sistem Manajemen Properti Internal Terintegrasi</span>
        </div>

        <h1 className="text-3xl font-extrabold tracking-tight text-stone-900 sm:text-5xl dark:text-stone-100">
          Griya Kenanga <span className="text-emerald-700 dark:text-emerald-400">Residence</span>
        </h1>
        
        <p className="mx-auto mt-4 max-w-2xl text-sm sm:text-base text-stone-600 dark:text-stone-300 leading-relaxed">
          Hunian kos eksklusif dan studio sewa 24 unit di Sleman, Yogyakarta. Platform internal terpadu untuk pemilik, staf pengelola, dan seluruh penghuni kos.
        </p>

        {/* Tombol Utama: Masuk / Daftar */}
        <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-3">
          <button
            onClick={() => {
              setAuthMode('login');
              setAuthModalOpen(true);
            }}
            className="w-full sm:w-auto flex items-center justify-center gap-2 rounded-2xl bg-stone-900 px-6 py-3.5 text-sm font-semibold text-white shadow-md hover:bg-emerald-700 transition-all dark:bg-stone-100 dark:text-stone-900 dark:hover:bg-emerald-400 active:scale-95"
          >
            <LogIn className="h-4 w-4" />
            <span>Masuk ke Akun Anda</span>
          </button>

          <button
            onClick={() => {
              setAuthMode('register');
              setAuthModalOpen(true);
            }}
            className="w-full sm:w-auto flex items-center justify-center gap-2 rounded-2xl border border-stone-200 bg-white px-6 py-3.5 text-sm font-semibold text-stone-800 shadow-xs hover:bg-stone-50 transition-all dark:border-stone-700 dark:bg-stone-800 dark:text-stone-200 active:scale-95"
          >
            <UserPlus className="h-4 w-4 text-emerald-600" />
            <span>Daftar Akun Penyewa Baru</span>
          </button>
        </div>

        {/* Quick Demo Login Box (Khusus Penilai/Mentor) */}
        <div className="mt-10 rounded-2xl border border-stone-200/80 bg-stone-50/80 p-5 dark:border-stone-800 dark:bg-stone-800/40 text-left">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold uppercase tracking-wider text-stone-700 dark:text-stone-300 flex items-center gap-1.5">
              <UserCheck className="h-4 w-4 text-emerald-600" />
              Akses Cepat Demo (Pilih Peran untuk Masuk Langsung):
            </span>
            <span className="text-[11px] text-stone-400 font-mono hidden sm:inline">Sandi: Latihan#2026</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
            {/* Pemilik */}
            <button
              onClick={() => handleQuickLogin('ratna@griyakenanga.test')}
              className="group flex flex-col justify-between rounded-xl border border-amber-300/80 bg-white p-3 text-left shadow-xs hover:border-amber-400 hover:bg-amber-50/40 dark:border-amber-900/40 dark:bg-stone-900 dark:hover:bg-amber-950/20 transition-all"
            >
              <div>
                <span className="text-[10px] font-bold uppercase text-amber-700 dark:text-amber-400">👑 Pemilik (Owner)</span>
                <div className="text-xs font-bold text-stone-900 dark:text-stone-100 mt-0.5">Ratna Kusumawardani</div>
                <div className="text-[10px] text-stone-400 mt-0.5">Laporan omset, audit log, harga unit</div>
              </div>
              <span className="mt-2 text-[10px] font-semibold text-amber-700 group-hover:underline flex items-center gap-1">
                Masuk sebagai Pemilik &rarr;
              </span>
            </button>

            {/* Pengelola */}
            <button
              onClick={() => handleQuickLogin('bayu@griyakenanga.test')}
              className="group flex flex-col justify-between rounded-xl border border-emerald-300/80 bg-white p-3 text-left shadow-xs hover:border-emerald-400 hover:bg-emerald-50/40 dark:border-emerald-900/40 dark:bg-stone-900 dark:hover:bg-emerald-950/20 transition-all"
            >
              <div>
                <span className="text-[10px] font-bold uppercase text-emerald-700 dark:text-emerald-400">🏢 Pengelola (Staf)</span>
                <div className="text-xs font-bold text-stone-900 dark:text-stone-100 mt-0.5">Bayu Prasetyo</div>
                <div className="text-[10px] text-stone-400 mt-0.5">Verifikasi KTP, tagihan, perbaikan</div>
              </div>
              <span className="mt-2 text-[10px] font-semibold text-emerald-700 group-hover:underline flex items-center gap-1">
                Masuk sebagai Pengelola &rarr;
              </span>
            </button>

            {/* Penyewa */}
            <button
              onClick={() => handleQuickLogin('dimas@griyakenanga.test')}
              className="group flex flex-col justify-between rounded-xl border border-sky-300/80 bg-white p-3 text-left shadow-xs hover:border-sky-400 hover:bg-sky-50/40 dark:border-sky-900/40 dark:bg-stone-900 dark:hover:bg-sky-950/20 transition-all"
            >
              <div>
                <span className="text-[10px] font-bold uppercase text-sky-700 dark:text-sky-400">👤 Penyewa (A-104)</span>
                <div className="text-xs font-bold text-stone-900 dark:text-stone-100 mt-0.5">Dimas Saputra</div>
                <div className="text-[10px] text-stone-400 mt-0.5">Tagihan bulanan, lapor kerusakan</div>
              </div>
              <span className="mt-2 text-[10px] font-semibold text-sky-700 group-hover:underline flex items-center gap-1">
                Masuk sebagai Penyewa &rarr;
              </span>
            </button>
          </div>
        </div>

      </div>

      {/* Grid 3 Tipe Unit Griya Kenanga */}
      <div>
        <div className="text-center mb-6">
          <h2 className="text-lg font-bold text-stone-900 dark:text-stone-100">
            Kategori Unit Hunian
          </h2>
          <p className="text-xs text-stone-500">24 Unit di 3 Lantai Hunian Griya Kenanga Residence</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5 max-w-5xl mx-auto">
          {/* Lantai 1 */}
          <div className="rounded-2xl border border-stone-200/90 bg-white p-5 shadow-xs dark:border-stone-800 dark:bg-stone-900">
            <span className="text-[11px] font-semibold uppercase text-stone-400">Blok A · Lantai 1</span>
            <h3 className="text-base font-bold text-stone-900 dark:text-stone-100 mt-1">Kamar Standar</h3>
            <p className="mt-1 text-xs text-stone-500">
              8 Unit (A-101 s.d A-108). Kamar mandi dalam, kasur single, lemari pakaian, luas 15–16 m².
            </p>
            <div className="mt-4 text-xs font-semibold text-emerald-700 dark:text-emerald-400">
              Rp1.350.000 – Rp1.450.000 / bulan
            </div>
          </div>

          {/* Lantai 2 */}
          <div className="rounded-2xl border border-stone-200/90 bg-white p-5 shadow-xs dark:border-stone-800 dark:bg-stone-900">
            <span className="text-[11px] font-semibold uppercase text-stone-400">Blok B · Lantai 2</span>
            <h3 className="text-base font-bold text-stone-900 dark:text-stone-100 mt-1">Kamar Ber-AC</h3>
            <p className="mt-1 text-xs text-stone-500">
              8 Unit (B-201 s.d B-208). Dilengkapi pendingin ruangan (AC), water heater, luas 17.5–19 m².
            </p>
            <div className="mt-4 text-xs font-semibold text-emerald-700 dark:text-emerald-400">
              Rp1.750.000 – Rp2.000.000 / bulan
            </div>
          </div>

          {/* Lantai 3 */}
          <div className="rounded-2xl border border-stone-200/90 bg-white p-5 shadow-xs dark:border-stone-800 dark:bg-stone-900">
            <span className="text-[11px] font-semibold uppercase text-stone-400">Blok C · Lantai 3</span>
            <h3 className="text-base font-bold text-stone-900 dark:text-stone-100 mt-1">Studio Luas</h3>
            <p className="mt-1 text-xs text-stone-500">
              8 Unit (C-301 s.d C-308). Studio eksklusif dengan kitchen sink, kulkas mini, luas 25–26 m².
            </p>
            <div className="mt-4 text-xs font-semibold text-emerald-700 dark:text-emerald-400">
              Rp2.650.000 – Rp2.800.000 / bulan
            </div>
          </div>
        </div>
      </div>

      {/* Modal Login & Register */}
      <AuthModal
        isOpen={authModalOpen}
        initialMode={authMode}
        onClose={() => setAuthModalOpen(false)}
      />

    </div>
  );
}
