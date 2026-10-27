'use client';

import { useState, useEffect } from 'react';
import { useGriyaStore } from '@/lib/use-store';
import { 
  LogIn, UserPlus, X, ShieldCheck, KeyRound, Sparkles, 
  CheckCircle2, AlertTriangle, ArrowRight, User, Mail, ChevronRight
} from 'lucide-react';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialMode?: 'login' | 'register';
  initialOpenGoogle?: boolean;
}

// Komponen SVG Logo Resmi Google
function GoogleLogo({ className = "h-4 w-4" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24">
      <path
        fill="#4285F4"
        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
      />
      <path
        fill="#34A853"
        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
      />
      <path
        fill="#FBBC05"
        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
      />
      <path
        fill="#EA4335"
        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
      />
    </svg>
  );
}

export default function AuthModal({ 
  isOpen, 
  onClose, 
  initialMode = 'login',
  initialOpenGoogle = false 
}: AuthModalProps) {
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

  // Google Sign-In State
  const [isGoogleChooserOpen, setIsGoogleChooserOpen] = useState(false);
  const [googleCustomEmail, setGoogleCustomEmail] = useState('');
  const [googleCustomName, setGoogleCustomName] = useState('');
  const [showCustomGoogleInput, setShowCustomGoogleInput] = useState(false);
  const [googleLinkedEmail, setGoogleLinkedEmail] = useState<string | null>(null);
  const [unregisteredNotice, setUnregisteredNotice] = useState<{ email: string; name: string } | null>(null);

  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  // Sync mode with props
  useEffect(() => {
    setMode(initialMode);
    if (initialOpenGoogle) {
      setIsGoogleChooserOpen(true);
    }
  }, [initialMode, initialOpenGoogle, isOpen]);

  if (!isOpen) return null;

  // Daftar profil dari store untuk daftar akun Google yang terdeteksi
  const registeredProfiles = store.getState().profiles;

  // Handler Login Biasa
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

  // Handler Register Akun Baru
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
      setSuccessMsg(
        googleLinkedEmail
          ? `Pendaftaran berhasil! Akun Google (${googleLinkedEmail}) kini terhubung sebagai Penyewa.`
          : 'Pendaftaran akun berhasil! Anda otomatis terdaftar sebagai Penyewa.'
      );
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

  // Handler Quick Demo Login
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

  // Handler Memilih / Menguji Akun Google
  const handleSelectGoogleAccount = (email: string, name?: string) => {
    setErrorMsg('');
    const trimmed = email.trim();
    if (!trimmed) {
      setErrorMsg('Masukkan alamat email Google');
      return;
    }

    const isRegistered = store.isEmailRegistered(trimmed);

    if (isRegistered) {
      // 1. KASUS SUDAH TERDAFTAR: LANGSUNG MASUK
      try {
        store.loginWithGoogle(trimmed);
        setSuccessMsg(`Berhasil masuk dengan Akun Google: ${trimmed}`);
        setIsGoogleChooserOpen(false);
        setUnregisteredNotice(null);
        setTimeout(() => {
          onClose();
        }, 700);
      } catch (err: unknown) {
        if (err instanceof Error) setErrorMsg(err.message);
      }
    } else {
      // 2. KASUS BELUM TERDAFTAR: HARUS SIGN IN DULU / BUAT AKUN PENDAFTARAN
      const resolvedName = name || trimmed.split('@')[0].replace(/[._]/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
      setUnregisteredNotice({
        email: trimmed,
        name: resolvedName
      });
    }
  };

  // Handler Melanjutkan ke Pendaftaran dari Akun Google yang belum terdaftar
  const handleProceedToRegisterWithGoogle = () => {
    if (!unregisteredNotice) return;
    const { email, name } = unregisteredNotice;

    // Alihkan ke tab pendaftaran akun baru
    setRegEmail(email);
    setRegName(name);
    setGoogleLinkedEmail(email);
    setMode('register');
    setIsGoogleChooserOpen(false);
    setUnregisteredNotice(null);
    setErrorMsg('');
    setSuccessMsg('');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#171D16]/75 p-4 backdrop-blur-sm animate-in fade-in duration-200">
      
      {/* ============================================================== */}
      {/* POPUP / MODAL GOOGLE SIGN IN CHOOSER                           */}
      {/* ============================================================== */}
      {isGoogleChooserOpen ? (
        <div className="w-full max-w-md rounded-[28px] border border-[#DCE5D8] bg-white p-6 sm:p-7 shadow-2xl dark:border-[#2C382A] dark:bg-[#1E261D] transition-all animate-in zoom-in-95 duration-200">
          
          {/* Header Google Sign In */}
          <div className="flex items-center justify-between pb-3.5 border-b border-[#E8EFE5] dark:border-[#2A3728]">
            <div className="flex items-center gap-2.5">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-white shadow-xs border border-stone-200 dark:border-stone-700">
                <GoogleLogo className="h-5 w-5" />
              </div>
              <div>
                <h3 className="text-base font-extrabold tracking-tight text-[#222520] dark:text-[#ECEAE4]">
                  Masuk dengan Google
                </h3>
                <p className="text-[11px] text-[#5D6B58] dark:text-[#A7B8A3]">
                  Pilih akun untuk melanjutkan ke Griya Kenanga
                </p>
              </div>
            </div>
            <button
              onClick={() => {
                setIsGoogleChooserOpen(false);
                setUnregisteredNotice(null);
                setShowCustomGoogleInput(false);
              }}
              className="rounded-xl p-1.5 text-[#5D6B58] hover:bg-[#E8EFE5] dark:text-[#A7B8A3] dark:hover:bg-[#2A3728] transition-colors"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          {/* Kondisi 1: Notifikasi Akun Google Belum Terdaftar */}
          {unregisteredNotice ? (
            <div className="mt-4 space-y-4">
              <div className="rounded-2xl border border-amber-300/80 bg-amber-50/90 p-4 text-xs text-amber-900 dark:border-amber-800 dark:bg-amber-950/40 dark:text-amber-200">
                <div className="flex items-start gap-2.5">
                  <AlertTriangle className="h-5 w-5 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
                  <div>
                    <h4 className="font-bold text-sm text-amber-950 dark:text-amber-200">
                      Akun Google Belum Terdaftar
                    </h4>
                    <p className="mt-1 text-xs leading-relaxed text-amber-800 dark:text-amber-300">
                      Akun Google <strong className="font-semibold underline">{unregisteredNotice.email}</strong> belum terdaftar dalam sistem Griya Kenanga Residence.
                    </p>
                    <p className="mt-2 text-[11px] text-amber-700 dark:text-amber-400 font-medium">
                      💡 Sesuai ketentuan, Anda harus membuat akun pendaftaran terlebih dahulu agar akun Google ini dapat langsung masuk ke aplikasi.
                    </p>
                  </div>
                </div>
              </div>

              <div className="space-y-2 pt-1">
                <button
                  type="button"
                  onClick={handleProceedToRegisterWithGoogle}
                  className="w-full flex items-center justify-center gap-2 rounded-full bg-[#3B5336] py-3 text-xs sm:text-sm font-bold text-white shadow-md hover:bg-[#2D4129] active:scale-95 transition-all"
                >
                  <UserPlus className="h-4 w-4" />
                  <span>Buat Akun Pendaftaran Sekarang</span>
                  <ArrowRight className="h-4 w-4" />
                </button>

                <button
                  type="button"
                  onClick={() => setUnregisteredNotice(null)}
                  className="w-full rounded-full border border-[#DCE5D8] py-2 text-xs font-semibold text-[#5D6B58] hover:bg-[#F4F7F2] dark:border-[#2C382A] dark:text-[#A7B8A3] dark:hover:bg-[#161F15] transition-all"
                >
                  Pilih Akun Google Lain
                </button>
              </div>
            </div>
          ) : (
            /* Kondisi 2: Daftar Pilihan Akun Google */
            <div className="mt-4 space-y-3">
              <span className="text-[11px] font-semibold text-[#5D6B58] dark:text-[#A7B8A3] block">
                Akun Google yang terhubung &amp; terdeteksi di perangkat:
              </span>

              {/* List Akun Terdaftar (Bisa langsung masuk) */}
              <div className="space-y-2 max-h-52 overflow-y-auto pr-1">
                {registeredProfiles.map((p) => (
                  <button
                    key={p.id}
                    type="button"
                    onClick={() => handleSelectGoogleAccount(p.email, p.nama_lengkap)}
                    className="w-full flex items-center justify-between p-2.5 rounded-2xl border border-[#DCE5D8] bg-[#F9FBF8] hover:bg-[#E8EFE5] dark:border-[#2C382A] dark:bg-[#161F15] dark:hover:bg-[#243022] text-left transition-all active:scale-[0.99] group"
                  >
                    <div className="flex items-center gap-3">
                      <div className="h-9 w-9 rounded-full bg-[#3B5336] text-white flex items-center justify-center font-bold text-xs shadow-xs">
                        {p.nama_lengkap.charAt(0)}
                      </div>
                      <div>
                        <div className="text-xs font-bold text-[#222520] dark:text-[#ECEAE4] group-hover:text-[#3B5336] dark:group-hover:text-[#95B08A]">
                          {p.nama_lengkap}
                        </div>
                        <div className="text-[11px] text-[#5D6B58] dark:text-[#A7B8A3]">
                          {p.email}
                        </div>
                      </div>
                    </div>
                    <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-[#3B5336]/10 text-[#3B5336] dark:bg-[#95B08A]/20 dark:text-[#95B08A] uppercase tracking-wider">
                      Terdaftar ({p.peran})
                    </span>
                  </button>
                ))}
              </div>

              {/* Opsi: Masukkan Akun Google Baru / Lain */}
              {!showCustomGoogleInput ? (
                <div className="pt-2 border-t border-[#E8EFE5] dark:border-[#2A3728]">
                  <button
                    type="button"
                    onClick={() => setShowCustomGoogleInput(true)}
                    className="w-full flex items-center justify-center gap-2 p-2.5 rounded-2xl border border-dashed border-[#95B08A] text-[#3B5336] hover:bg-[#E8EFE5] dark:border-[#3B5336] dark:text-[#95B08A] dark:hover:bg-[#161F15] text-xs font-bold transition-all"
                  >
                    <UserPlus className="h-3.5 w-3.5" />
                    <span>Gunakan Akun Google Lain / Baru</span>
                  </button>
                  
                  <div className="mt-2 text-center">
                    <span className="text-[10px] text-[#7F9979] dark:text-[#8D9F88]">
                      Tips: Coba gunakan email baru untuk menguji alur pembuatan akun pendaftaran jika belum terdaftar.
                    </span>
                  </div>
                </div>
              ) : (
                <div className="pt-2 border-t border-[#E8EFE5] dark:border-[#2A3728] space-y-2.5 animate-in fade-in duration-200">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-bold text-[#222520] dark:text-[#ECEAE4]">
                      Masukkan Akun Google Baru
                    </span>
                    <button
                      type="button"
                      onClick={() => setShowCustomGoogleInput(false)}
                      className="text-[10px] text-[#5D6B58] hover:underline"
                    >
                      Batal
                    </button>
                  </div>

                  <div>
                    <input
                      type="email"
                      value={googleCustomEmail}
                      onChange={(e) => setGoogleCustomEmail(e.target.value)}
                      placeholder="contoh.anda@gmail.com"
                      className="w-full rounded-xl bg-[#F0F5EE] p-2.5 text-xs text-stone-900 focus:text-stone-900 placeholder-stone-500 border border-[#DCE5D8] focus:border-[#3B5336] focus:bg-white focus:outline-none dark:bg-[#161F15] dark:border-[#2B382A] dark:text-white dark:focus:text-white dark:placeholder-stone-400 dark:focus:bg-[#202B1F] dark:focus:border-[#6B9065] transition-all"
                    />
                  </div>

                  <div>
                    <input
                      type="text"
                      value={googleCustomName}
                      onChange={(e) => setGoogleCustomName(e.target.value)}
                      placeholder="Nama Lengkap Google (Opsional)"
                      className="w-full rounded-xl bg-[#F0F5EE] p-2.5 text-xs text-stone-900 focus:text-stone-900 placeholder-stone-500 border border-[#DCE5D8] focus:border-[#3B5336] focus:bg-white focus:outline-none dark:bg-[#161F15] dark:border-[#2B382A] dark:text-white dark:focus:text-white dark:placeholder-stone-400 dark:focus:bg-[#202B1F] dark:focus:border-[#6B9065] transition-all"
                    />
                  </div>

                  <button
                    type="button"
                    onClick={() => handleSelectGoogleAccount(googleCustomEmail, googleCustomName)}
                    className="w-full rounded-full bg-[#3B5336] py-2 text-xs font-bold text-white hover:bg-[#2D4129] transition-all"
                  >
                    Lanjutkan dengan Google
                  </button>
                </div>
              )}

            </div>
          )}

        </div>
      ) : (
        /* ============================================================== */
        /* MODAL UTAMA: FORM LOGIN & REGISTER BIASA                        */
        /* ============================================================== */
        <div className="w-full max-w-md rounded-[28px] border border-[#DCE5D8] bg-white p-6 sm:p-7 shadow-2xl dark:border-[#2C382A] dark:bg-[#1E261D] transition-all">
          
          {/* Header Modal */}
          <div className="flex items-center justify-between pb-3.5 border-b border-[#E8EFE5] dark:border-[#2A3728]">
            <div className="flex items-center gap-2.5">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#3B5336] text-white shadow-xs">
                <KeyRound className="h-4 w-4" />
              </div>
              <div>
                <h3 className="text-base font-extrabold tracking-tight text-[#222520] dark:text-[#ECEAE4]">
                  Griya Kenanga Residence
                </h3>
                <p className="text-[11px] text-[#5D6B58] dark:text-[#A7B8A3]">Portal Akses Masuk &amp; Pendaftaran</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="rounded-xl p-1.5 text-[#5D6B58] hover:bg-[#E8EFE5] dark:text-[#A7B8A3] dark:hover:bg-[#2A3728] transition-colors"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          {/* Tab Switcher: Masuk vs Daftar */}
          <div className="mt-4 flex rounded-2xl border border-[#DCE5D8] bg-[#F4F7F2] p-1 text-xs dark:border-[#2A3728] dark:bg-[#182117]">
            <button
              type="button"
              onClick={() => {
                setMode('login');
                setErrorMsg('');
              }}
              className={`flex-1 rounded-xl py-2 font-bold transition-all ${
                mode === 'login'
                  ? 'bg-[#3B5336] text-white shadow-sm'
                  : 'text-[#5D6B58] hover:text-[#222520] dark:text-[#A7B8A3] dark:hover:text-[#ECEAE4]'
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
              className={`flex-1 rounded-xl py-2 font-bold transition-all ${
                mode === 'register'
                  ? 'bg-[#3B5336] text-white shadow-sm'
                  : 'text-[#5D6B58] hover:text-[#222520] dark:text-[#A7B8A3] dark:hover:text-[#ECEAE4]'
              }`}
            >
              Daftar Akun Baru
            </button>
          </div>

          {/* Feedback Alert */}
          {errorMsg && (
            <div className="mt-3.5 rounded-2xl border border-[#F3C5BF] bg-[#FDF0EE] p-3 text-xs text-[#A63A2E] dark:border-red-900/50 dark:bg-red-950/40 dark:text-red-300">
              {errorMsg}
            </div>
          )}

          {successMsg && (
            <div className="mt-3.5 rounded-2xl border border-[#95B08A]/50 bg-[#E8EFE5] p-3 text-xs font-medium text-[#2D4129] dark:border-emerald-900/50 dark:bg-emerald-950/40 dark:text-emerald-300">
              {successMsg}
            </div>
          )}

          {/* Badge Khusus bila sedang mendaftar dengan Akun Google */}
          {mode === 'register' && googleLinkedEmail && (
            <div className="mt-3.5 flex items-center justify-between rounded-2xl border border-[#95B08A] bg-[#EBF3E8] p-3 text-xs text-[#2A3E26] dark:border-[#3B5336] dark:bg-[#1C261B] dark:text-[#D5E6D2]">
              <div className="flex items-center gap-2">
                <GoogleLogo className="h-4 w-4" />
                <span>
                  Menghubungkan Akun Google: <strong>{googleLinkedEmail}</strong>
                </span>
              </div>
              <button
                type="button"
                onClick={() => setGoogleLinkedEmail(null)}
                className="text-[11px] underline text-[#5D6B58] hover:text-red-600"
              >
                Lepas
              </button>
            </div>
          )}

          {/* ============================================================== */}
          {/* TAB LOGIN                                                      */}
          {/* ============================================================== */}
          {mode === 'login' ? (
            <div className="mt-4 space-y-4 text-xs">
              
              {/* TOMBOL UTAMA: MASUK DENGAN GOOGLE */}
              <button
                type="button"
                onClick={() => {
                  setErrorMsg('');
                  setIsGoogleChooserOpen(true);
                }}
                className="w-full flex items-center justify-center gap-3 rounded-2xl border border-[#DCE5D8] bg-white py-3 px-4 text-xs sm:text-sm font-semibold text-[#222520] shadow-xs hover:bg-[#F4F7F2] hover:border-[#3B5336]/40 active:scale-[0.99] transition-all dark:bg-[#161F15] dark:border-[#2B382A] dark:text-[#ECEAE4] dark:hover:bg-[#1E291C]"
              >
                <GoogleLogo className="h-4 w-4" />
                <span>Masuk dengan Akun Google</span>
              </button>

              {/* Pembatas / Divider */}
              <div className="relative flex items-center justify-center my-3">
                <div className="border-t border-[#E8EFE5] dark:border-[#2A3728] w-full" />
                <span className="bg-white dark:bg-[#1E261D] px-2.5 text-[11px] text-[#7F9979] dark:text-[#8D9F88] font-medium absolute">
                  atau masuk dengan email &amp; kata sandi
                </span>
              </div>

              {/* Form Login Standar */}
              <form onSubmit={handleLoginSubmit} className="space-y-3.5">
                <div>
                  <label className="block text-[#4F604A] dark:text-[#A7B8A3] mb-1 font-semibold">
                    Alamat Email
                  </label>
                  <input
                    type="email"
                    required
                    value={loginEmail}
                    onChange={(e) => setLoginEmail(e.target.value)}
                    placeholder="nama@griyakenanga.test"
                    className="w-full rounded-2xl bg-[#E8EFE5]/70 p-3 text-xs sm:text-sm text-stone-900 focus:text-stone-900 placeholder-stone-500 border border-transparent focus:border-[#3B5336] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#3B5336]/20 transition-all dark:bg-[#161F15] dark:border-[#2B382A] dark:text-white dark:focus:text-white dark:placeholder-stone-400 dark:focus:bg-[#202B1F] dark:focus:border-[#6B9065]"
                  />
                </div>

                <div>
                  <label className="block text-[#4F604A] dark:text-[#A7B8A3] mb-1 font-semibold">
                    Kata Sandi
                  </label>
                  <input
                    type="password"
                    required
                    value={loginPassword}
                    onChange={(e) => setLoginPassword(e.target.value)}
                    placeholder="Kata sandi akun"
                    className="w-full rounded-2xl bg-[#E8EFE5]/70 p-3 text-xs sm:text-sm text-stone-900 focus:text-stone-900 placeholder-stone-500 border border-transparent focus:border-[#3B5336] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#3B5336]/20 transition-all dark:bg-[#161F15] dark:border-[#2B382A] dark:text-white dark:focus:text-white dark:placeholder-stone-400 dark:focus:bg-[#202B1F] dark:focus:border-[#6B9065] font-mono"
                  />
                  <span className="text-[10px] text-[#5D6B58] dark:text-[#A7B8A3] mt-1.5 block">
                    Sandi akun contoh: <code className="text-[#3B5336] dark:text-[#95B08A] font-bold font-mono">Latihan#2026</code>
                  </span>
                </div>

                <button
                  type="submit"
                  className="mt-2 w-full rounded-full bg-[#3B5336] py-3 text-xs sm:text-sm font-bold text-white shadow-md hover:bg-[#2D4129] active:scale-95 transition-all"
                >
                  Masuk ke Aplikasi
                </button>

                {/* Quick Demo Helper (Pilihan 1-Klik) */}
                <div className="pt-3.5 border-t border-[#E8EFE5] dark:border-[#2A3728]">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-[#5D6B58] dark:text-[#A7B8A3] block mb-2 text-center">
                    ⚡ Masuk Cepat Akun Demo (Uji 3 Peran):
                  </span>
                  <div className="grid grid-cols-3 gap-1.5">
                    <button
                      type="button"
                      onClick={() => handleQuickLogin('ratna@griyakenanga.test')}
                      className="rounded-xl border border-amber-300/80 bg-amber-50/80 p-2 text-center hover:bg-amber-100 dark:border-amber-800 dark:bg-amber-950/30 text-amber-900 dark:text-amber-300 text-[11px] font-bold shadow-2xs transition-all active:scale-95"
                    >
                      👑 Pemilik
                    </button>
                    <button
                      type="button"
                      onClick={() => handleQuickLogin('bayu@griyakenanga.test')}
                      className="rounded-xl border border-[#95B08A] bg-[#E8EFE5] p-2 text-center hover:bg-[#DCE7D9] dark:border-[#3B5336] dark:bg-[#1C261B] text-[#2D4129] dark:text-[#D5E6D2] text-[11px] font-bold shadow-2xs transition-all active:scale-95"
                    >
                      🏢 Pengelola
                    </button>
                    <button
                      type="button"
                      onClick={() => handleQuickLogin('dimas@griyakenanga.test')}
                      className="rounded-xl border border-sky-300/80 bg-sky-50/80 p-2 text-center hover:bg-sky-100 dark:border-sky-800 dark:bg-sky-950/30 text-sky-900 dark:text-sky-300 text-[11px] font-bold shadow-2xs transition-all active:scale-95"
                    >
                      👤 Penyewa
                    </button>
                  </div>
                </div>
              </form>
            </div>
          ) : (
            /* ============================================================== */
            /* TAB DAFTAR AKUN BARU                                           */
            /* ============================================================== */
            <form onSubmit={handleRegisterSubmit} className="mt-4 space-y-3.5 text-xs">
              
              {/* Opsi Daftar Otomatis via Google jika belum link */}
              {!googleLinkedEmail && (
                <button
                  type="button"
                  onClick={() => {
                    setErrorMsg('');
                    setIsGoogleChooserOpen(true);
                  }}
                  className="w-full flex items-center justify-center gap-2.5 rounded-2xl border border-[#DCE5D8] bg-[#F9FBF8] py-2.5 px-3 text-xs font-semibold text-[#222520] hover:bg-[#E8EFE5] dark:border-[#2C382A] dark:bg-[#161F15] dark:text-[#ECEAE4] transition-all"
                >
                  <GoogleLogo className="h-4 w-4" />
                  <span>Daftar Lebih Cepat dengan Akun Google</span>
                </button>
              )}

              <div>
                <label className="block text-[#4F604A] dark:text-[#A7B8A3] mb-1 font-semibold">
                  Nama Lengkap
                </label>
                <input
                  type="text"
                  required
                  value={regName}
                  onChange={(e) => setRegName(e.target.value)}
                  placeholder="Contoh: Rian Anggoro"
                  className="w-full rounded-2xl bg-[#E8EFE5]/70 p-2.5 text-xs sm:text-sm text-stone-900 focus:text-stone-900 placeholder-stone-500 border border-transparent focus:border-[#3B5336] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#3B5336]/20 transition-all dark:bg-[#161F15] dark:border-[#2B382A] dark:text-white dark:focus:text-white dark:placeholder-stone-400 dark:focus:bg-[#202B1F] dark:focus:border-[#6B9065]"
                />
              </div>

              <div>
                <label className="block text-[#4F604A] dark:text-[#A7B8A3] mb-1 font-semibold">
                  Email
                </label>
                <input
                  type="email"
                  required
                  value={regEmail}
                  onChange={(e) => setRegEmail(e.target.value)}
                  placeholder="rian@email.test"
                  className="w-full rounded-2xl bg-[#E8EFE5]/70 p-2.5 text-xs sm:text-sm text-stone-900 focus:text-stone-900 placeholder-stone-500 border border-transparent focus:border-[#3B5336] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#3B5336]/20 transition-all dark:bg-[#161F15] dark:border-[#2B382A] dark:text-white dark:focus:text-white dark:placeholder-stone-400 dark:focus:bg-[#202B1F] dark:focus:border-[#6B9065]"
                />
              </div>

              <div>
                <label className="block text-[#4F604A] dark:text-[#A7B8A3] mb-1 font-semibold">
                  Nomor Handphone (WhatsApp)
                </label>
                <input
                  type="text"
                  value={regPhone}
                  onChange={(e) => setRegPhone(e.target.value)}
                  placeholder="081234567890"
                  className="w-full rounded-2xl bg-[#E8EFE5]/70 p-2.5 text-xs sm:text-sm text-stone-900 focus:text-stone-900 placeholder-stone-500 border border-transparent focus:border-[#3B5336] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#3B5336]/20 transition-all dark:bg-[#161F15] dark:border-[#2B382A] dark:text-white dark:focus:text-white dark:placeholder-stone-400 dark:focus:bg-[#202B1F] dark:focus:border-[#6B9065]"
                />
              </div>

              <div>
                <label className="block text-[#4F604A] dark:text-[#A7B8A3] mb-1 font-semibold">
                  Kata Sandi
                </label>
                <input
                  type="password"
                  required
                  minLength={6}
                  value={regPassword}
                  onChange={(e) => setRegPassword(e.target.value)}
                  placeholder="Minimal 6 karakter"
                  className="w-full rounded-2xl bg-[#E8EFE5]/70 p-2.5 text-xs sm:text-sm text-stone-900 focus:text-stone-900 placeholder-stone-500 border border-transparent focus:border-[#3B5336] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#3B5336]/20 transition-all dark:bg-[#161F15] dark:border-[#2B382A] dark:text-white dark:focus:text-white dark:placeholder-stone-400 dark:focus:bg-[#202B1F] dark:focus:border-[#6B9065] font-mono"
                />
              </div>

              <button
                type="submit"
                className="mt-2 w-full rounded-full bg-[#3B5336] py-3 text-xs sm:text-sm font-bold text-white shadow-md hover:bg-[#2D4129] active:scale-95 transition-all"
              >
                Daftar Sekarang &amp; Masuk
              </button>
            </form>
          )}

        </div>
      )}

    </div>
  );
}
