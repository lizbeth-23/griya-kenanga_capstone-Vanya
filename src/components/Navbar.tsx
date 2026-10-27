'use client';

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { useGriyaStore } from '@/lib/use-store';
import { 
  Building2, Home, KeyRound, Receipt, Wrench, BarChart3, 
  Users, ShieldAlert, Menu, X, ChevronDown, RefreshCw, CheckCircle2, UserCheck, LogOut, Info
} from 'lucide-react';
import { UserRole } from '@/lib/types';
import AuthModal from './AuthModal';

export default function Navbar() {
  const pathname = usePathname();
  const { currentUser, store, state } = useGriyaStore();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [roleSwitcherOpen, setRoleSwitcherOpen] = useState(false);
  const [resetConfirmOpen, setResetConfirmOpen] = useState(false);
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [authMode, setAuthMode] = useState<'login' | 'register'>('login');

  const getNavLinks = () => {
    if (!currentUser) return [];
    const role = currentUser.peran;
    const links = [
      { href: '/', label: 'Beranda', icon: Home, roles: ['penyewa', 'pengelola', 'pemilik'] },
      { href: '/info', label: 'Info Kos', icon: Info, roles: ['penyewa', 'pengelola', 'pemilik'] },
      { href: '/unit', label: 'Unit', icon: Building2, roles: ['pengelola', 'pemilik'] },
      { href: '/penyewa', label: 'Penyewa', icon: Users, roles: ['pengelola', 'pemilik'] },
      { href: '/kontrak', label: 'Kontrak', icon: KeyRound, roles: ['pengelola', 'pemilik'] },
      { href: '/tagihan', label: 'Tagihan', icon: Receipt, roles: ['pengelola', 'pemilik'] },
      { href: '/kerusakan', label: 'Kerusakan', icon: Wrench, roles: ['penyewa', 'pengelola', 'pemilik'] },
      { href: '/laporan', label: 'Laporan & Audit', icon: BarChart3, roles: ['pemilik'] }
    ];

    return links.filter(l => l.roles.includes(role));
  };

  const navLinks = getNavLinks();

  const handleSwitchUser = (email: string) => {
    store.setCurrentUserByEmail(email);
    setRoleSwitcherOpen(false);
    setMobileMenuOpen(false);
  };

  const handleLogout = () => {
    store.logout();
    setMobileMenuOpen(false);
  };

  const handleScrollToAnchor = (e: React.MouseEvent<HTMLAnchorElement>, targetId: string) => {
    if (pathname === '/info') {
      e.preventDefault();
      const el = document.getElementById(targetId);
      if (el) {
        el.scrollIntoView({ behavior: 'smooth', block: 'center' });
        window.history.pushState(null, '', `/info#${targetId}`);
      }
    }
    setMobileMenuOpen(false);
  };

  const getRoleBadgeColor = (role: UserRole) => {
    switch (role) {
      case 'pemilik':
        return 'bg-amber-500/10 text-amber-700 border-amber-500/30 dark:bg-amber-400/10 dark:text-amber-300 dark:border-amber-400/30';
      case 'pengelola':
        return 'bg-emerald-500/10 text-emerald-700 border-emerald-500/30 dark:bg-emerald-400/10 dark:text-emerald-300 dark:border-emerald-400/30';
      case 'penyewa':
        return 'bg-sky-500/10 text-sky-700 border-sky-500/30 dark:bg-sky-400/10 dark:text-sky-300 dark:border-sky-400/30';
    }
  };

  return (
    <>
      <header className="sticky top-0 z-40 w-full border-b border-[#2C4127] bg-[#3B5336] text-white shadow-sm">
        <div className="mx-auto flex h-16 sm:h-20 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
          
          {/* Logo & Brand (Sesuai Gambar Referensi) */}
          <div className="flex items-center gap-3">
            <Link href="/" className="group flex items-center gap-2.5 transition-transform active:scale-95">
              <div className="relative h-10 w-10 sm:h-11 sm:w-11 overflow-hidden rounded-full border border-white/20 shadow-xs transition-all group-hover:scale-105">
                <Image
                  src="/3d-house-interior.jpg"
                  alt="Logo Griya Kenanga"
                  width={44}
                  height={44}
                  priority
                  className="h-full w-full object-cover"
                />
              </div>
              <div className="flex flex-col">
                <span className="block text-base sm:text-lg font-bold tracking-tight text-white leading-tight font-sans">
                  Griya Kenanga
                </span>
                <span className="block text-[10px] font-semibold uppercase tracking-widest text-[#B5CBB3] -mt-0.5">
                  RESIDENCE
                </span>
              </div>
            </Link>
          </div>

          {/* Desktop Navigation Links untuk Pengunjung (Belum Login) - 3 Menu: Home, Units & Pricing, Contact */}
          {!currentUser && (
            <nav className="hidden md:flex items-center gap-6 sm:gap-8 text-sm font-medium text-[#E2EFE0]">
              <Link
                href="/"
                className={`transition-colors ${pathname === '/' ? 'text-white font-bold' : 'hover:text-white'}`}
              >
                Home
              </Link>
              <Link
                href="/info#units-pricing"
                onClick={(e) => handleScrollToAnchor(e, 'units-pricing')}
                className={`transition-colors ${pathname === '/info' ? 'text-white font-bold' : 'hover:text-white'}`}
              >
                Units &amp; Pricing
              </Link>
              <Link
                href="/info#contact"
                onClick={(e) => handleScrollToAnchor(e, 'contact')}
                className="hover:text-white transition-colors"
              >
                Contact
              </Link>
            </nav>
          )}

          {/* Desktop Navigation Links (Jika sudah login) */}
          {currentUser && (
            <nav className="hidden lg:flex items-center gap-1">
              {navLinks.map((item) => {
                const isActive = pathname === item.href;
                const Icon = item.icon;
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`flex items-center gap-1.5 rounded-xl px-3 py-1.5 text-xs font-semibold transition-all ${
                      isActive
                        ? 'bg-white/20 text-white shadow-xs font-bold'
                        : 'text-[#DDE9DB] hover:bg-white/10 hover:text-white'
                    }`}
                  >
                    <Icon className="h-4 w-4" />
                    <span>{item.label}</span>
                  </Link>
                );
              })}
            </nav>
          )}

          {/* Right Section: Auth Buttons / User Pill */}
          <div className="flex items-center gap-2">
            
            {currentUser ? (
              <>
                {/* Quick Switcher Button */}
                <button
                  onClick={() => setRoleSwitcherOpen(true)}
                  className="flex items-center gap-2 rounded-xl border border-white/20 bg-white/10 px-2.5 py-1.5 text-left text-xs transition-all hover:bg-white/20 text-white"
                  title="Ganti Akun & Peran Uji"
                >
                  <div className="flex flex-col">
                    <span className="font-semibold text-white line-clamp-1">
                      {currentUser.nama_lengkap}
                    </span>
                    <span className={`inline-flex w-fit items-center rounded-md border px-1.5 py-0.2 text-[10px] font-medium uppercase tracking-wider ${getRoleBadgeColor(currentUser.peran)}`}>
                      {currentUser.peran}
                    </span>
                  </div>
                  <ChevronDown className="h-3.5 w-3.5 text-[#CADBC7]" />
                </button>

                {/* Reset Demo Data Button */}
                <button
                  onClick={() => setResetConfirmOpen(true)}
                  className="hidden sm:flex h-9 w-9 items-center justify-center rounded-xl border border-white/20 text-white/80 transition-colors hover:bg-white/10 hover:text-white"
                  title="Reset ke Data Awal Contoh"
                >
                  <RefreshCw className="h-4 w-4" />
                </button>

                {/* Logout Button */}
                <button
                  onClick={handleLogout}
                  className="flex h-9 items-center gap-1.5 rounded-xl border border-white/20 px-3 text-xs font-semibold text-white/90 transition-colors hover:bg-red-500/20 hover:text-red-100"
                  title="Keluar dari akun"
                >
                  <LogOut className="h-3.5 w-3.5" />
                  <span className="hidden sm:inline">Keluar</span>
                </button>

                {/* Mobile Menu Trigger */}
                <button
                  onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                  className="flex h-9 w-9 items-center justify-center rounded-xl border border-white/20 text-white lg:hidden"
                  aria-label="Toggle navigation menu"
                >
                  {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
                </button>
              </>
            ) : (
              /* KETIKA BELUM LOGIN: MATCHING GAMBAR REFERENSI DENGAN TOMBOL SIGN UP PILL */
              <div className="flex items-center gap-2 sm:gap-3">
                <button
                  onClick={() => {
                    setAuthMode('login');
                    setAuthModalOpen(true);
                  }}
                  className="text-xs sm:text-sm font-semibold text-[#DCE8DA] hover:text-white px-2 py-1.5 transition-colors"
                >
                  Log in
                </button>

                <button
                  onClick={() => {
                    setAuthMode('register');
                    setAuthModalOpen(true);
                  }}
                  className="rounded-full bg-[#EBF3E8] px-5 sm:px-6 py-2 text-xs sm:text-sm font-bold text-[#2A3E26] shadow-xs hover:bg-white hover:scale-105 active:scale-95 transition-all"
                >
                  Sign up
                </button>

                {/* Mobile Menu Toggle untuk Pengunjung */}
                <button
                  onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                  className="flex h-9 w-9 items-center justify-center rounded-xl border border-white/20 text-white md:hidden"
                  aria-label="Toggle navigation menu"
                >
                  {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
                </button>
              </div>
            )}

          </div>
        </div>

        {/* Mobile Navigation Drawer (Jika belum login) */}
        {mobileMenuOpen && !currentUser && (
          <div className="border-b border-[#DCE5D8] bg-[#F5F2EB]/98 px-4 pt-2.5 pb-4 backdrop-blur-md md:hidden dark:border-[#2A3728] dark:bg-[#161F15]/98 transition-all">
            <div className="grid gap-1">
              <Link
                href="/"
                onClick={() => setMobileMenuOpen(false)}
                className={`flex items-center gap-2.5 rounded-xl px-3.5 py-2 text-sm font-semibold transition-all ${
                  pathname === '/'
                    ? 'bg-[#3B5336] text-white shadow-xs'
                    : 'text-[#222520] hover:bg-[#E8EFE5] dark:text-[#ECEAE4] dark:hover:bg-[#1E281C]'
                }`}
              >
                Home
              </Link>
              <Link
                href="/info#units-pricing"
                onClick={(e) => handleScrollToAnchor(e, 'units-pricing')}
                className={`flex items-center gap-2.5 rounded-xl px-3.5 py-2 text-sm font-semibold transition-all ${
                  pathname === '/info'
                    ? 'bg-[#3B5336] text-white shadow-xs'
                    : 'text-[#222520] hover:bg-[#E8EFE5] dark:text-[#ECEAE4] dark:hover:bg-[#1E281C]'
                }`}
              >
                Units &amp; Pricing
              </Link>
              <Link
                href="/info#contact"
                onClick={(e) => handleScrollToAnchor(e, 'contact')}
                className="flex items-center gap-2.5 rounded-xl px-3.5 py-2 text-sm font-semibold text-[#222520] hover:bg-[#E8EFE5] dark:text-[#ECEAE4] dark:hover:bg-[#1E281C]"
              >
                Contact
              </Link>
            </div>
          </div>
        )}

        {/* Mobile Navigation Drawer (Jika sudah login) */}
        {mobileMenuOpen && currentUser && (
          <div className="border-b border-[#DCE5D8] bg-[#F5F2EB]/98 px-4 pt-2.5 pb-4 backdrop-blur-md lg:hidden dark:border-[#2A3728] dark:bg-[#161F15]/98 transition-all">
            <div className="mb-3 flex items-center justify-between border-b border-[#E8EFE5] pb-2 dark:border-[#2A3728]">
              <span className="text-xs font-bold uppercase tracking-wider text-[#5D6B58] dark:text-[#A7B8A3]">
                Navigasi ({currentUser.peran})
              </span>
            </div>
            <div className="grid gap-1">
              {navLinks.map((item) => {
                const isActive = pathname === item.href;
                const Icon = item.icon;
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => setMobileMenuOpen(false)}
                    className={`flex items-center gap-2.5 rounded-xl px-3.5 py-2 text-sm font-semibold transition-all ${
                      isActive
                        ? 'bg-[#3B5336] text-white shadow-xs'
                        : 'text-[#222520] hover:bg-[#E8EFE5] dark:text-[#ECEAE4] dark:hover:bg-[#1E281C]'
                    }`}
                  >
                    <Icon className="h-4 w-4" />
                    <span>{item.label}</span>
                  </Link>
                );
              })}
            </div>
            <div className="mt-4 pt-3 border-t border-[#E8EFE5] dark:border-[#2A3728] flex justify-between items-center">
              <button
                onClick={() => {
                  setRoleSwitcherOpen(true);
                  setMobileMenuOpen(false);
                }}
                className="text-xs font-bold text-[#3B5336] hover:underline dark:text-[#95B08A]"
              >
                Ganti Akun Demo &rarr;
              </button>
              <button
                onClick={handleLogout}
                className="text-xs font-bold text-red-600 hover:underline"
              >
                Keluar
              </button>
            </div>
          </div>
        )}
      </header>

      {/* Role Switcher Modal (Semua 25 Akun Uji) */}
      {roleSwitcherOpen && currentUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#171D16]/75 p-4 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="w-full max-w-xl rounded-[28px] border border-[#DCE5D8] bg-white p-6 shadow-2xl dark:border-[#2C382A] dark:bg-[#1E261D] max-h-[85vh] flex flex-col">
            <div className="flex items-center justify-between pb-3.5 border-b border-[#E8EFE5] dark:border-[#2A3728]">
              <div>
                <h3 className="text-base font-extrabold text-[#222520] dark:text-[#ECEAE4] flex items-center gap-2">
                  <UserCheck className="h-5 w-5 text-[#3B5336] dark:text-[#95B08A]" />
                  Pilih Akun Uji (25 Akun Contoh)
                </h3>
                <p className="text-xs text-[#5D6B58] dark:text-[#A7B8A3] mt-0.5">
                  Sandi semua akun: <code className="bg-[#E8EFE5] dark:bg-[#172016] px-1.5 py-0.5 rounded text-[#2D4129] dark:text-[#95B08A] font-bold font-mono">Latihan#2026</code>
                </p>
              </div>
              <button
                onClick={() => setRoleSwitcherOpen(false)}
                className="rounded-xl p-1.5 text-[#5D6B58] hover:bg-[#E8EFE5] dark:text-[#A7B8A3] dark:hover:bg-[#2A3728]"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Akun List Grouped by Role */}
            <div className="overflow-y-auto py-3 space-y-4 flex-1 pr-1 text-xs">
              
              {/* Pemilik */}
              <div>
                <span className="text-[11px] font-bold tracking-wider uppercase text-amber-700 dark:text-amber-400">
                  Pemilik (Owner) · 1 Akun
                </span>
                <div className="mt-1.5 grid gap-1.5">
                  {state.profiles.filter(p => p.peran === 'pemilik').map(p => (
                    <button
                      key={p.id}
                      onClick={() => handleSwitchUser(p.email)}
                      className={`flex items-center justify-between rounded-2xl border p-3 text-left transition-all ${
                        currentUser?.id === p.id 
                          ? 'border-amber-500/60 bg-amber-50/70 shadow-xs dark:bg-amber-950/20' 
                          : 'border-[#E8EFE5] hover:border-[#95B08A] dark:border-[#2A3728] dark:hover:border-[#3B5336]'
                      }`}
                    >
                      <div>
                        <div className="font-bold text-[#222520] dark:text-[#ECEAE4]">{p.nama_lengkap}</div>
                        <div className="text-[#5D6B58] dark:text-[#A7B8A3]">{p.email}</div>
                      </div>
                      {currentUser?.id === p.id && <CheckCircle2 className="h-4 w-4 text-amber-600" />}
                    </button>
                  ))}
                </div>
              </div>

              {/* Pengelola */}
              <div>
                <span className="text-[11px] font-bold tracking-wider uppercase text-[#2D4129] dark:text-[#95B08A]">
                  Pengelola (Staf Operasional) · 2 Akun
                </span>
                <div className="mt-1.5 grid sm:grid-cols-2 gap-1.5">
                  {state.profiles.filter(p => p.peran === 'pengelola').map(p => (
                    <button
                      key={p.id}
                      onClick={() => handleSwitchUser(p.email)}
                      className={`flex items-center justify-between rounded-2xl border p-3 text-left transition-all ${
                        currentUser?.id === p.id 
                          ? 'border-[#3B5336] bg-[#E8EFE5] shadow-xs dark:bg-[#182317]' 
                          : 'border-[#E8EFE5] hover:border-[#95B08A] dark:border-[#2A3728] dark:hover:border-[#3B5336]'
                      }`}
                    >
                      <div>
                        <div className="font-bold text-[#222520] dark:text-[#ECEAE4]">{p.nama_lengkap}</div>
                        <div className="text-[#5D6B58] dark:text-[#A7B8A3]">{p.email}</div>
                      </div>
                      {currentUser?.id === p.id && <CheckCircle2 className="h-4 w-4 text-[#3B5336] dark:text-[#95B08A]" />}
                    </button>
                  ))}
                </div>
              </div>

              {/* Penyewa Kasus Uji Kunci */}
              <div>
                <span className="text-[11px] font-bold tracking-wider uppercase text-sky-700 dark:text-sky-400">
                  Penyewa Penting untuk Kasus Uji (BR-01 s/d BR-12)
                </span>
                <div className="mt-1.5 grid sm:grid-cols-2 gap-1.5">
                  {state.profiles.filter(p => ['dimas@griyakenanga.test', 'hana@griyakenanga.test', 'fajar@griyakenanga.test', 'cahya@griyakenanga.test', 'oki@griyakenanga.test', 'laras@griyakenanga.test', 'gilang@griyakenanga.test'].includes(p.email)).map(p => (
                    <button
                      key={p.id}
                      onClick={() => handleSwitchUser(p.email)}
                      className={`flex items-center justify-between rounded-2xl border p-3 text-left transition-all ${
                        currentUser?.id === p.id 
                          ? 'border-sky-500/60 bg-sky-50/70 shadow-xs dark:bg-sky-950/20' 
                          : 'border-[#E8EFE5] hover:border-[#95B08A] dark:border-[#2A3728] dark:hover:border-[#3B5336]'
                      }`}
                    >
                      <div>
                        <div className="font-bold text-[#222520] dark:text-[#ECEAE4]">{p.nama_lengkap}</div>
                        <div className="text-[#5D6B58] dark:text-[#A7B8A3] text-[11px]">{p.email}</div>
                      </div>
                      {currentUser?.id === p.id && <CheckCircle2 className="h-4 w-4 text-sky-600" />}
                    </button>
                  ))}
                </div>
              </div>

              {/* Penyewa Lainnya */}
              <div>
                <span className="text-[11px] font-bold tracking-wider uppercase text-[#5D6B58] dark:text-[#A7B8A3]">
                  Penyewa Lainnya (22 Unit)
                </span>
                <div className="mt-1.5 grid sm:grid-cols-3 gap-1.5">
                  {state.profiles.filter(p => p.peran === 'penyewa' && !['dimas@griyakenanga.test', 'hana@griyakenanga.test', 'fajar@griyakenanga.test', 'cahya@griyakenanga.test', 'oki@griyakenanga.test', 'laras@griyakenanga.test', 'gilang@griyakenanga.test'].includes(p.email)).map(p => (
                    <button
                      key={p.id}
                      onClick={() => handleSwitchUser(p.email)}
                      className={`rounded-xl border p-2 text-left transition-all ${
                        currentUser?.id === p.id 
                          ? 'border-[#3B5336] bg-[#E8EFE5] dark:bg-[#182317]' 
                          : 'border-[#E8EFE5] hover:bg-[#F4F7F2] dark:border-[#2A3728] dark:hover:bg-[#1E281C]'
                      }`}
                    >
                      <div className="font-semibold text-[#222520] dark:text-[#ECEAE4] truncate">{p.nama_lengkap}</div>
                      <div className="text-[10px] text-[#5D6B58] dark:text-[#A7B8A3] truncate">{p.email}</div>
                    </button>
                  ))}
                </div>
              </div>

            </div>

            <div className="pt-3.5 border-t border-[#E8EFE5] dark:border-[#2A3728] flex justify-end">
              <button
                onClick={() => setRoleSwitcherOpen(false)}
                className="rounded-full bg-[#3B5336] px-6 py-2 text-xs font-bold text-white hover:bg-[#2D4129] active:scale-95 transition-all shadow-xs"
              >
                Tutup
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Reset Confirmation Modal */}
      {resetConfirmOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#171D16]/75 p-4 backdrop-blur-sm">
          <div className="w-full max-w-sm rounded-[28px] border border-[#DCE5D8] bg-white p-6 shadow-2xl dark:border-[#2C382A] dark:bg-[#1E261D]">
            <div className="flex items-center gap-3 text-amber-600 mb-3">
              <ShieldAlert className="h-6 w-6" />
              <h3 className="font-bold text-[#222520] dark:text-[#ECEAE4]">Reset Data Demo?</h3>
            </div>
            <p className="text-xs text-[#5D6B58] dark:text-[#A7B8A3] leading-relaxed">
              Tindakan ini akan mengembalikan data 24 unit, 23 kontrak, 57 tagihan, dan 13 laporan kerusakan ke kondisi awal acuan 15 Oktober 2026.
            </p>
            <div className="mt-5 flex justify-end gap-2">
              <button
                onClick={() => setResetConfirmOpen(false)}
                className="rounded-full border border-[#DCE5D8] px-4 py-2 text-xs font-semibold text-[#5D6B58] hover:bg-[#E8EFE5] dark:border-[#2A3728] dark:text-[#A7B8A3] dark:hover:bg-[#1E281C]"
              >
                Batal
              </button>
              <button
                onClick={() => {
                  store.resetToDefault();
                  setResetConfirmOpen(false);
                }}
                className="rounded-full bg-red-600 px-5 py-2 text-xs font-bold text-white hover:bg-red-700 shadow-xs"
              >
                Ya, Reset Sekarang
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Auth Modal (Login / Register) */}
      <AuthModal
        isOpen={authModalOpen}
        initialMode={authMode}
        onClose={() => setAuthModalOpen(false)}
      />
    </>
  );
}
