'use client';

import { useState } from 'react';
import { useGriyaStore } from '@/lib/use-store';
import Link from 'next/link';
import Image from 'next/image';
import { Info, ArrowRight, Sparkles, Building2, CheckCircle2 } from 'lucide-react';
import AuthModal from './AuthModal';

export default function LandingHero() {
  const { store } = useGriyaStore();
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [authMode, setAuthMode] = useState<'login' | 'register'>('login');
  const [openGoogleInModal, setOpenGoogleInModal] = useState(false);
  
  // Local login state in the hero card
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('Latihan#2026');
  const [errorMsg, setErrorMsg] = useState('');
  const [showForgotTip, setShowForgotTip] = useState(false);

  const handleInlineLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    try {
      if (!email.trim()) {
        throw new Error('Silakan masukkan email Anda');
      }
      store.login(email.trim(), password);
    } catch (err: unknown) {
      if (err instanceof Error) {
        setErrorMsg(err.message);
      } else {
        setErrorMsg('Gagal masuk');
      }
    }
  };

  const handleQuickLogin = (quickEmail: string) => {
    store.login(quickEmail, 'Latihan#2026');
  };

  const handleOpenGoogleAuth = () => {
    setAuthMode('login');
    setOpenGoogleInModal(true);
    setErrorMsg('');
    setAuthModalOpen(true);
  };

  return (
    <div className="space-y-12 animate-in fade-in duration-300">
      
      {/* Canvas Mockup Container */}
      <div className="mx-auto max-w-5xl overflow-hidden rounded-[28px] sm:rounded-[36px] shadow-2xl border border-stone-800/10 bg-[#95B08A] transition-all">
        
        {/* Content Body: Soft Pastel Sage Green */}
        <div id="hero" className="p-6 sm:p-10 lg:p-12 relative overflow-hidden">
          
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-10 items-center">
            
            {/* Sisi Kiri: Rounded Login Card */}
            <div className="lg:col-span-6 xl:col-span-5 flex justify-center">
              <div className="w-full max-w-sm rounded-[28px] bg-[#738F67]/90 p-6 sm:p-8 text-white shadow-xl backdrop-blur-xs border border-white/10">
                
                {/* Greeting Title */}
                <div className="text-center mb-5">
                  <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white">
                    Hello!
                  </h1>
                  <p className="text-xs text-[#E1EDE0] mt-1 font-medium">
                    Welcome back to GriyaApp
                  </p>
                </div>

                {errorMsg && (
                  <div className="mb-4 rounded-xl bg-red-500/20 border border-red-300/30 px-3 py-2 text-[11px] text-red-100 text-center">
                    {errorMsg}
                  </div>
                )}

                {/* Form Input */}
                <form onSubmit={handleInlineLogin} className="space-y-4">
                  <div>
                    <label className="block text-[11px] font-medium text-[#E2EFE0] mb-1">
                      Email Address
                    </label>
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="dimas@griyakenanga.test"
                      required
                      className="w-full rounded-2xl bg-[#E8EFE5] px-4 py-2.5 text-xs sm:text-sm text-[#263823] placeholder-[#7F9979] border border-transparent focus:border-[#3B5336] focus:bg-white focus:outline-none transition-all"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-medium text-[#E2EFE0] mb-1">
                      Password
                    </label>
                    <input
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="••••••••"
                      required
                      className="w-full rounded-2xl bg-[#E8EFE5] px-4 py-2.5 text-xs sm:text-sm text-[#263823] placeholder-[#7F9979] border border-transparent focus:border-[#3B5336] focus:bg-white focus:outline-none transition-all"
                    />
                    <div className="flex justify-end mt-1">
                      <button
                        type="button"
                        onClick={() => setShowForgotTip(!showForgotTip)}
                        className="text-[11px] italic text-[#D8E8D5] hover:text-white transition-colors hover:underline"
                      >
                        Forget password?
                      </button>
                    </div>

                    {showForgotTip && (
                      <div className="mt-2 rounded-xl bg-[#52734C]/60 p-2 text-[10px] text-[#E8F2E6] text-center border border-white/10">
                        Password demo default: <span className="font-mono font-bold">Latihan#2026</span>
                      </div>
                    )}
                  </div>

                  {/* Tombol Log in */}
                  <div className="pt-2">
                    <button
                      type="submit"
                      className="w-full rounded-full bg-[#3B5336] py-2.5 text-xs sm:text-sm font-bold text-white shadow-md hover:bg-[#2D4129] active:scale-95 transition-all"
                    >
                      Log in
                    </button>
                  </div>
                </form>

                {/* Continue with / Akun Demo Cepat */}
                <div className="mt-5 text-center">
                  <span className="text-[10px] uppercase tracking-wider text-[#D5E6D2]">
                    Continue with:
                  </span>
                  
                  {/* Google Login Button */}
                  <div className="mt-2.5 flex justify-center">
                    <button
                      type="button"
                      onClick={handleOpenGoogleAuth}
                      className="flex items-center justify-center gap-2 px-4 py-2 rounded-full bg-white shadow-sm hover:scale-105 active:scale-95 transition-all text-[#263823] text-xs font-bold hover:bg-stone-50"
                      title="Masuk dengan Akun Google"
                    >
                      <svg className="h-4 w-4" viewBox="0 0 24 24">
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
                      <span>Masuk dengan Google</span>
                    </button>
                  </div>

                  {/* Switch Akun Cepat Role Latihan */}
                  <div className="mt-3 flex items-center justify-center gap-1.5 text-[10px]">
                    <span className="text-[#CADBC7]">Akses:</span>
                    <button
                      type="button"
                      onClick={() => handleQuickLogin('ratna@griyakenanga.test')}
                      className="underline hover:text-white font-medium text-[#FAFDF9]"
                    >
                      👑 Pemilik
                    </button>
                    <span>·</span>
                    <button
                      type="button"
                      onClick={() => handleQuickLogin('bayu@griyakenanga.test')}
                      className="underline hover:text-white font-medium text-[#FAFDF9]"
                    >
                      🏢 Pengelola
                    </button>
                    <span>·</span>
                    <button
                      type="button"
                      onClick={() => handleQuickLogin('dimas@griyakenanga.test')}
                      className="underline hover:text-white font-medium text-[#FAFDF9]"
                    >
                      👤 Penyewa
                    </button>
                  </div>
                </div>

                {/* Footer Link: Sign Up */}
                <div className="mt-5 text-center text-xs text-[#E1EDE0]">
                  Don&apos;t have an account?{' '}
                  <button
                    type="button"
                    onClick={() => {
                      setAuthMode('register');
                      setAuthModalOpen(true);
                    }}
                    className="font-bold text-white hover:underline ml-0.5"
                  >
                    Sign Up
                  </button>
                </div>

              </div>
            </div>

            {/* Sisi Kanan: 3D Isometric Home / Interior Illustration */}
            <div className="lg:col-span-6 xl:col-span-7 flex flex-col items-center justify-center relative">
              
              {/* Soft ambient backlight circle */}
              <div className="absolute h-64 w-64 sm:h-80 sm:w-80 rounded-full bg-white/20 blur-2xl pointer-events-none" />

              {/* 3D House Interior Visual */}
              <div className="relative z-10 group transition-transform duration-500 hover:scale-[1.02]">
                <Image
                  src="/3d-house-interior.jpg"
                  alt="3D Cozy Modern House Interior"
                  width={520}
                  height={520}
                  priority
                  className="w-full max-w-sm sm:max-w-md lg:max-w-lg rounded-[32px] shadow-2xl object-cover border-4 border-white/20 transition-all h-auto"
                />

                {/* Floating Chips / Property Badges */}
                <div className="absolute -top-3 -left-3 sm:-left-6 rounded-2xl bg-white/90 px-3.5 py-1.5 text-[11px] font-bold text-[#2D4129] shadow-lg backdrop-blur-md border border-white/40 flex items-center gap-1.5 animate-bounce [animation-duration:4s]">
                  <span>🏡</span>
                  <span>Griya Kenanga 24 Unit</span>
                </div>

                <div className="absolute -bottom-3 -right-3 sm:-right-4 rounded-2xl bg-[#3B5336]/90 px-3.5 py-1.5 text-[11px] font-bold text-white shadow-lg backdrop-blur-md border border-white/20 flex items-center gap-1.5">
                  <span>🌿</span>
                  <span>Hunian Kos & Studio Modern</span>
                </div>
              </div>

              {/* Short Description & Link ke Info */}
              <p className="mt-5 text-center text-xs sm:text-sm text-[#263B23] font-medium max-w-md">
                Kenyamanan hunian kos eksklusif dan studio sewa modern dengan tata ruang estetis di Sleman, Yogyakarta.
              </p>

              <div className="mt-5 flex flex-wrap items-center justify-center gap-3">
                <Link
                  href="/sewa"
                  className="inline-flex items-center gap-2 rounded-full bg-[#3B5336] px-5 py-2.5 text-xs font-bold text-white shadow-md hover:bg-[#2B3E27] hover:scale-105 active:scale-95 transition-all"
                >
                  <Building2 className="h-4 w-4" />
                  <span>Katalog Kamar &amp; Ketersediaan</span>
                  <ArrowRight className="h-3.5 w-3.5" />
                </Link>
                <Link
                  href="/info"
                  className="inline-flex items-center gap-2 rounded-full bg-white/80 backdrop-blur-xs px-4 py-2.5 text-xs font-bold text-[#263B23] shadow-sm hover:bg-white hover:scale-105 active:scale-95 transition-all"
                >
                  <Info className="h-4 w-4" />
                  <span>Fasilitas &amp; Tarif</span>
                </Link>
              </div>
            </div>

          </div>

        </div>

      </div>

      {/* Seksi Galeri & Foto Kamar Hunian */}
      <div className="space-y-6 pt-4">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 border-b border-[#DCE5D8] pb-4 dark:border-[#2C382A]">
          <div>
            <div className="inline-flex items-center gap-1.5 rounded-full bg-[#E8EFE5] px-3 py-1 text-xs font-bold text-[#2D4129] dark:bg-[#1E261D] dark:text-[#95B08A] mb-2">
              <Sparkles className="h-3.5 w-3.5" />
              <span>Foto Asli Kamar &amp; Suasana Hunian</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-extrabold text-[#222520] dark:text-[#ECEAE4]">
              Pilihan Tipe Kamar Kos &amp; Studio Griya Kenanga
            </h2>
            <p className="text-xs sm:text-sm text-[#5D6B58] dark:text-[#A7B8A3] mt-1">
              Setiap kamar didesain dengan sirkulasi udara bersih, pencahayaan alami, kamar mandi dalam, dan furnitur berkualitas.
            </p>
          </div>
          <Link
            href="/sewa"
            className="inline-flex items-center gap-1.5 rounded-full bg-[#3B5336] px-5 py-2.5 text-xs font-bold text-white shadow-xs hover:bg-[#2D4129] transition-all shrink-0"
          >
            <span>Buka Katalog 24 Kamar</span>
            <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Card 1: Kamar Standar */}
          <div className="group rounded-3xl border border-[#DCE5D8] bg-white overflow-hidden shadow-xs hover:shadow-md transition-all hover:border-[#738F67] dark:border-[#2C382A] dark:bg-[#1E261D] flex flex-col justify-between">
            <div>
              <div className="relative h-52 w-full bg-stone-100 overflow-hidden">
                <Image
                  src="/images/rooms/kamar-standar.jpg"
                  alt="Kamar Standar Non-AC Lantai 1"
                  fill
                  className="object-cover transition-transform duration-500 group-hover:scale-105"
                  sizes="(max-width: 768px) 100vw, 33vw"
                />
                <div className="absolute top-3 left-3 rounded-full bg-[#E8EFE5] text-[#2D4129] px-3 py-1 text-[11px] font-bold shadow-md border border-[#95B08A]/40">
                  Lantai 1 · Blok A
                </div>
                <div className="absolute bottom-3 right-3 rounded-md bg-black/60 backdrop-blur-xs text-white px-2 py-0.5 text-[10px] font-bold">
                  8 Unit (15–16 m²)
                </div>
              </div>
              <div className="p-5 space-y-3">
                <h3 className="text-lg font-bold text-[#222520] dark:text-[#ECEAE4]">
                  Kamar Standar (Non-AC)
                </h3>
                <div className="rounded-xl bg-[#F4F7F2] p-3 text-xs dark:bg-[#171D16] border border-[#DCE5D8] dark:border-[#2C382A]">
                  <span className="text-[10px] uppercase font-medium text-[#5D6B58] block">Mulai dari</span>
                  <div className="text-base font-extrabold text-[#3B5336] dark:text-[#95B08A]">
                    Rp1.350.000 <span className="text-xs font-normal text-stone-400">/ bulan</span>
                  </div>
                </div>
                <ul className="text-xs text-stone-600 dark:text-stone-300 space-y-1.5 pt-1">
                  <li className="flex items-center gap-1.5">
                    <CheckCircle2 className="h-3.5 w-3.5 text-[#3B5336] dark:text-[#95B08A] shrink-0" />
                    <span>Kamar mandi dalam shower &amp; kloset duduk</span>
                  </li>
                  <li className="flex items-center gap-1.5">
                    <CheckCircle2 className="h-3.5 w-3.5 text-[#3B5336] dark:text-[#95B08A] shrink-0" />
                    <span>Kasur single, meja belajar &amp; lemari pakaian</span>
                  </li>
                  <li className="flex items-center gap-1.5">
                    <CheckCircle2 className="h-3.5 w-3.5 text-[#3B5336] dark:text-[#95B08A] shrink-0" />
                    <span>Ventilasi jendela asri &amp; listrik token mandiri</span>
                  </li>
                </ul>
              </div>
            </div>
            <div className="p-5 pt-0">
              <Link
                href="/sewa"
                className="w-full flex items-center justify-center gap-1.5 rounded-full bg-[#E8EFE5] hover:bg-[#3B5336] hover:text-white py-2.5 text-xs font-bold text-[#2D4129] transition-all"
              >
                <span>Lihat Unit Standar</span>
                <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            </div>
          </div>

          {/* Card 2: Kamar AC */}
          <div className="group rounded-3xl border border-[#DCE5D8] bg-white overflow-hidden shadow-xs hover:shadow-md transition-all hover:border-[#738F67] dark:border-[#2C382A] dark:bg-[#1E261D] flex flex-col justify-between">
            <div>
              <div className="relative h-52 w-full bg-stone-100 overflow-hidden">
                <Image
                  src="/images/rooms/kamar-ac.jpg"
                  alt="Kamar AC &amp; Water Heater Lantai 2"
                  fill
                  className="object-cover transition-transform duration-500 group-hover:scale-105"
                  sizes="(max-width: 768px) 100vw, 33vw"
                />
                <div className="absolute top-3 left-3 rounded-full bg-amber-100 text-amber-900 px-3 py-1 text-[11px] font-bold shadow-md border border-amber-300">
                  Lantai 2 · Blok B (Favorit)
                </div>
                <div className="absolute bottom-3 right-3 rounded-md bg-black/60 backdrop-blur-xs text-white px-2 py-0.5 text-[10px] font-bold">
                  8 Unit (17–19 m²)
                </div>
              </div>
              <div className="p-5 space-y-3">
                <h3 className="text-lg font-bold text-[#222520] dark:text-[#ECEAE4]">
                  Kamar Ber-AC &amp; Water Heater
                </h3>
                <div className="rounded-xl bg-[#F4F7F2] p-3 text-xs dark:bg-[#171D16] border border-[#DCE5D8] dark:border-[#2C382A]">
                  <span className="text-[10px] uppercase font-medium text-[#5D6B58] block">Mulai dari</span>
                  <div className="text-base font-extrabold text-[#3B5336] dark:text-[#95B08A]">
                    Rp1.750.000 <span className="text-xs font-normal text-stone-400">/ bulan</span>
                  </div>
                </div>
                <ul className="text-xs text-stone-600 dark:text-stone-300 space-y-1.5 pt-1">
                  <li className="flex items-center gap-1.5">
                    <CheckCircle2 className="h-3.5 w-3.5 text-[#3B5336] dark:text-[#95B08A] shrink-0" />
                    <span>AC 1/2 PK hemat daya &amp; water heater</span>
                  </li>
                  <li className="flex items-center gap-1.5">
                    <CheckCircle2 className="h-3.5 w-3.5 text-[#3B5336] dark:text-[#95B08A] shrink-0" />
                    <span>Kasur springbed single besar / queen</span>
                  </li>
                  <li className="flex items-center gap-1.5">
                    <CheckCircle2 className="h-3.5 w-3.5 text-[#3B5336] dark:text-[#95B08A] shrink-0" />
                    <span>Meja kerja minimalis &amp; balkon view luar</span>
                  </li>
                </ul>
              </div>
            </div>
            <div className="p-5 pt-0">
              <Link
                href="/sewa"
                className="w-full flex items-center justify-center gap-1.5 rounded-full bg-[#E8EFE5] hover:bg-[#3B5336] hover:text-white py-2.5 text-xs font-bold text-[#2D4129] transition-all"
              >
                <span>Lihat Unit AC</span>
                <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            </div>
          </div>

          {/* Card 3: Studio Suite */}
          <div className="group rounded-3xl border border-[#DCE5D8] bg-white overflow-hidden shadow-xs hover:shadow-md transition-all hover:border-[#738F67] dark:border-[#2C382A] dark:bg-[#1E261D] flex flex-col justify-between">
            <div>
              <div className="relative h-52 w-full bg-stone-100 overflow-hidden">
                <Image
                  src="/images/rooms/kamar-studio.jpg"
                  alt="Studio Eksklusif Lantai 3"
                  fill
                  className="object-cover transition-transform duration-500 group-hover:scale-105"
                  sizes="(max-width: 768px) 100vw, 33vw"
                />
                <div className="absolute top-3 left-3 rounded-full bg-[#3B5336] text-white px-3 py-1 text-[11px] font-bold shadow-md">
                  Lantai 3 · Blok C (Eksklusif)
                </div>
                <div className="absolute bottom-3 right-3 rounded-md bg-black/60 backdrop-blur-xs text-white px-2 py-0.5 text-[10px] font-bold">
                  8 Unit (24.5–26 m²)
                </div>
              </div>
              <div className="p-5 space-y-3">
                <h3 className="text-lg font-bold text-[#222520] dark:text-[#ECEAE4]">
                  Studio Luas + Kitchenette
                </h3>
                <div className="rounded-xl bg-[#F4F7F2] p-3 text-xs dark:bg-[#171D16] border border-[#DCE5D8] dark:border-[#2C382A]">
                  <span className="text-[10px] uppercase font-medium text-[#5D6B58] block">Mulai dari</span>
                  <div className="text-base font-extrabold text-[#3B5336] dark:text-[#95B08A]">
                    Rp2.650.000 <span className="text-xs font-normal text-stone-400">/ bulan</span>
                  </div>
                </div>
                <ul className="text-xs text-stone-600 dark:text-stone-300 space-y-1.5 pt-1">
                  <li className="flex items-center gap-1.5">
                    <CheckCircle2 className="h-3.5 w-3.5 text-[#3B5336] dark:text-[#95B08A] shrink-0" />
                    <span>Kitchenette pribadi (meja dapur &amp; sink) + kulkas</span>
                  </li>
                  <li className="flex items-center gap-1.5">
                    <CheckCircle2 className="h-3.5 w-3.5 text-[#3B5336] dark:text-[#95B08A] shrink-0" />
                    <span>Ruang ekstra luas + area santai karpet</span>
                  </li>
                  <li className="flex items-center gap-1.5">
                    <CheckCircle2 className="h-3.5 w-3.5 text-[#3B5336] dark:text-[#95B08A] shrink-0" />
                    <span>Smart TV ready, AC 1 PK &amp; water heater</span>
                  </li>
                </ul>
              </div>
            </div>
            <div className="p-5 pt-0">
              <Link
                href="/sewa"
                className="w-full flex items-center justify-center gap-1.5 rounded-full bg-[#E8EFE5] hover:bg-[#3B5336] hover:text-white py-2.5 text-xs font-bold text-[#2D4129] transition-all"
              >
                <span>Lihat Unit Studio</span>
                <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Modal Login & Register */}
      <AuthModal
        isOpen={authModalOpen}
        initialMode={authMode}
        initialOpenGoogle={openGoogleInModal}
        onClose={() => {
          setAuthModalOpen(false);
          setOpenGoogleInModal(false);
        }}
      />

    </div>
  );
}
