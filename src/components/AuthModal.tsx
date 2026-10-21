'use client';

import { useState } from 'react';
import { useGriyaStore } from '@/lib/use-store';
import { LogIn, UserPlus, X, ShieldCheck, KeyRound, Sparkles } from 'lucide-react';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialMode?: 'login' | 'register';
}

export default function AuthModal({ isOpen, onClose, initialMode = 'login' }: AuthModalProps) {
  const { store } = useGriyaStore();
  const [mode, setMode] = useState<'login' | 'register'>(initialMode);
  
  // Login State
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('Latihan#2026');

  // Register State
  const [regName, setRegName] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regPhone, setRegPhone] = useState('');
  const [regPassword, setRegPassword] = useState('Latihan#2026');

  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  if (!isOpen) return null;

  const handleLoginSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setErrorMsg('');
      store.login(loginEmail, loginPassword);
      setSuccessMsg('Berhasil masuk! Mengarahkan ke beranda...');
      setTimeout(() => {
        onClose();
      }, 600);
    } catch (err: unknown) {
      if (err instanceof Error) {
        setErrorMsg(err.message);
      } else {
        setErrorMsg('Gagal masuk');
      }
    }
  };

  const handleRegisterSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setErrorMsg('');
      store.register({
        nama_lengkap: regName,
        email: regEmail,
        no_hp: regPhone,
        kata_sandi: regPassword
      });
      setSuccessMsg('Pendaftaran akun berhasil! Anda otomatis terdaftar sebagai Penyewa.');
      setTimeout(() => {
        onClose();
      }, 800);
    } catch (err: unknown) {
      if (err instanceof Error) {
        setErrorMsg(err.message);
      } else {
        setErrorMsg('Gagal mendaftar');
      }
    }
  };

  const handleQuickLogin = (email: string) => {
    try {
      setErrorMsg('');
      store.login(email, 'Latihan#2026');
      setSuccessMsg('Berhasil masuk!');
      setTimeout(() => {
        onClose();
      }, 400);
    } catch (err: unknown) {
      if (err instanceof Error) setErrorMsg(err.message);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-stone-900/60 p-4 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="w-full max-w-md rounded-2xl border border-stone-200 bg-white p-6 shadow-2xl dark:border-stone-800 dark:bg-stone-900">
        
        {/* Header Modal */}
        <div className="flex items-center justify-between pb-3 border-b border-stone-100 dark:border-stone-800">
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-stone-900 text-stone-50 dark:bg-stone-100 dark:text-stone-900">
              <KeyRound className="h-4 w-4" />
            </div>
            <div>
              <h3 className="text-base font-bold text-stone-900 dark:text-stone-100">
                Griya Kenanga Residence
              </h3>
              <p className="text-[11px] text-stone-400">Portal Akses Masuk & Pendaftaran</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="rounded-lg p-1.5 text-stone-400 hover:bg-stone-100 dark:hover:bg-stone-800"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Tab Switcher: Masuk vs Daftar */}
        <div className="mt-4 flex rounded-xl border border-stone-200 bg-stone-50 p-1 text-xs dark:border-stone-800 dark:bg-stone-800/50">
          <button
            type="button"
            onClick={() => {
              setMode('login');
              setErrorMsg('');
            }}
            className={`flex-1 rounded-lg py-1.5 font-semibold transition-all ${
              mode === 'login'
                ? 'bg-white text-stone-900 shadow-xs dark:bg-stone-900 dark:text-stone-100'
                : 'text-stone-500 hover:text-stone-900 dark:text-stone-400'
            }`}
          >
            Masuk (Login)
          </button>
          <button
            type="button"
            onClick={() => {
              setMode('register');
              setErrorMsg('');
            }}
            className={`flex-1 rounded-lg py-1.5 font-semibold transition-all ${
              mode === 'register'
                ? 'bg-white text-stone-900 shadow-xs dark:bg-stone-900 dark:text-stone-100'
                : 'text-stone-500 hover:text-stone-900 dark:text-stone-400'
            }`}
          >
            Daftar Akun Baru
          </button>
        </div>

        {/* Feedback Alert */}
        {errorMsg && (
          <div className="mt-3 rounded-xl border border-red-200 bg-red-50 p-2.5 text-xs text-red-700 dark:border-red-900/50 dark:bg-red-950/40 dark:text-red-300">
            {errorMsg}
          </div>
        )}

        {successMsg && (
          <div className="mt-3 rounded-xl border border-emerald-200 bg-emerald-50 p-2.5 text-xs text-emerald-700 dark:border-emerald-900/50 dark:bg-emerald-950/40 dark:text-emerald-300">
            {successMsg}
          </div>
        )}

        {/* ============================================================== */}
        {/* FORM LOGIN                                                     */}
        {/* ============================================================== */}
        {mode === 'login' ? (
          <form onSubmit={handleLoginSubmit} className="mt-4 space-y-3 text-xs">
            <div>
              <label className="block text-stone-600 dark:text-stone-400 mb-1 font-medium">
                Alamat Email
              </label>
              <input
                type="email"
                required
                value={loginEmail}
                onChange={(e) => setLoginEmail(e.target.value)}
                placeholder="nama@griyakenanga.test"
                className="w-full rounded-xl border border-stone-200 p-2.5 text-xs text-stone-900 dark:border-stone-700 dark:bg-stone-800 dark:text-stone-100"
              />
            </div>

            <div>
              <label className="block text-stone-600 dark:text-stone-400 mb-1 font-medium">
                Kata Sandi
              </label>
              <input
                type="password"
                required
                value={loginPassword}
                onChange={(e) => setLoginPassword(e.target.value)}
                placeholder="Kata sandi akun"
                className="w-full rounded-xl border border-stone-200 p-2.5 text-xs text-stone-900 dark:border-stone-700 dark:bg-stone-800 dark:text-stone-100 font-mono"
              />
              <span className="text-[10px] text-stone-400 mt-1 block">
                Sandi akun contoh: <code className="text-emerald-600 font-semibold font-mono">Latihan#2026</code>
              </span>
            </div>

            <button
              type="submit"
              className="mt-2 w-full rounded-xl bg-stone-900 py-2.5 text-xs font-semibold text-white hover:bg-emerald-700 dark:bg-stone-100 dark:text-stone-900 transition-colors"
            >
              Masuk ke Aplikasi
            </button>

            {/* Quick Demo Helper (Pilihan 1-Klik) */}
            <div className="pt-3 border-t border-stone-100 dark:border-stone-800">
              <span className="text-[10px] font-semibold uppercase text-stone-400 block mb-2">
                ⚡ Masuk Cepat Akun Demo (Uji 3 Peran):
              </span>
              <div className="grid grid-cols-3 gap-1.5">
                <button
                  type="button"
                  onClick={() => handleQuickLogin('ratna@griyakenanga.test')}
                  className="rounded-lg border border-amber-300 bg-amber-50/70 p-1.5 text-center hover:bg-amber-100 dark:border-amber-800 dark:bg-amber-950/30 text-amber-900 dark:text-amber-300 text-[11px] font-semibold"
                >
                  👑 Pemilik
                </button>
                <button
                  type="button"
                  onClick={() => handleQuickLogin('bayu@griyakenanga.test')}
                  className="rounded-lg border border-emerald-300 bg-emerald-50/70 p-1.5 text-center hover:bg-emerald-100 dark:border-emerald-800 dark:bg-emerald-950/30 text-emerald-900 dark:text-emerald-300 text-[11px] font-semibold"
                >
                  🏢 Pengelola
                </button>
                <button
                  type="button"
                  onClick={() => handleQuickLogin('dimas@griyakenanga.test')}
                  className="rounded-lg border border-sky-300 bg-sky-50/70 p-1.5 text-center hover:bg-sky-100 dark:border-sky-800 dark:bg-sky-950/30 text-sky-900 dark:text-sky-300 text-[11px] font-semibold"
                >
                  👤 Penyewa
                </button>
              </div>
            </div>
          </form>
        ) : (
          /* ============================================================== */
          /* FORM DAFTAR AKUN BARU                                          */
          /* ============================================================== */
          <form onSubmit={handleRegisterSubmit} className="mt-4 space-y-3 text-xs">
            <div>
              <label className="block text-stone-600 dark:text-stone-400 mb-1 font-medium">
                Nama Lengkap
              </label>
              <input
                type="text"
                required
                value={regName}
                onChange={(e) => setRegName(e.target.value)}
                placeholder="Contoh: Rian Anggoro"
                className="w-full rounded-xl border border-stone-200 p-2 text-xs text-stone-900 dark:border-stone-700 dark:bg-stone-800 dark:text-stone-100"
              />
            </div>

            <div>
              <label className="block text-stone-600 dark:text-stone-400 mb-1 font-medium">
                Email
              </label>
              <input
                type="email"
                required
                value={regEmail}
                onChange={(e) => setRegEmail(e.target.value)}
                placeholder="rian@email.test"
                className="w-full rounded-xl border border-stone-200 p-2 text-xs text-stone-900 dark:border-stone-700 dark:bg-stone-800 dark:text-stone-100"
              />
            </div>

            <div>
              <label className="block text-stone-600 dark:text-stone-400 mb-1 font-medium">
                Nomor Handphone (WhatsApp)
              </label>
              <input
                type="text"
                value={regPhone}
                onChange={(e) => setRegPhone(e.target.value)}
                placeholder="081234567890"
                className="w-full rounded-xl border border-stone-200 p-2 text-xs text-stone-900 dark:border-stone-700 dark:bg-stone-800 dark:text-stone-100"
              />
            </div>

            <div>
              <label className="block text-stone-600 dark:text-stone-400 mb-1 font-medium">
                Kata Sandi
              </label>
              <input
                type="password"
                required
                minLength={6}
                value={regPassword}
                onChange={(e) => setRegPassword(e.target.value)}
                placeholder="Minimal 6 karakter"
                className="w-full rounded-xl border border-stone-200 p-2 text-xs text-stone-900 dark:border-stone-700 dark:bg-stone-800 dark:text-stone-100 font-mono"
              />
            </div>

            <div className="rounded-xl border border-stone-100 bg-stone-50 p-2 text-[11px] text-stone-500 dark:border-stone-800 dark:bg-stone-800/40">
              Sesuai aturan PRD: Akun baru yang mendaftar sendiri otomatis berperan sebagai <strong>Penyewa</strong>. Peran Pengelola dan Pemilik hanya bisa diubah oleh Pemilik.
            </div>

            <button
              type="submit"
              className="mt-2 w-full rounded-xl bg-emerald-700 py-2.5 text-xs font-semibold text-white hover:bg-emerald-800 transition-colors"
            >
              Daftar Sekarang & Masuk
            </button>
          </form>
        )}

      </div>
    </div>
  );
}
