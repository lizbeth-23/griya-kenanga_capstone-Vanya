'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useGriyaStore } from '@/lib/use-store';
import { 
  Building2, Home, KeyRound, Receipt, Wrench, BarChart3, 
  Users, ShieldAlert, Menu, X, ChevronDown, RefreshCw, CheckCircle2, UserCheck, LogIn, LogOut, UserPlus
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
      <header className="sticky top-0 z-40 w-full border-b border-stone-200/80 bg-white/85 backdrop-blur-md dark:border-stone-800/80 dark:bg-stone-950/85">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
          
          {/* Logo & Brand */}
          <div className="flex items-center gap-3">
            <Link href="/" className="group flex items-center gap-2.5 transition-transform active:scale-95">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-stone-900 text-stone-50 shadow-sm transition-all group-hover:bg-emerald-700 dark:bg-stone-100 dark:text-stone-900">
                <Building2 className="h-5 w-5" />
              </div>
              <div>
                <span className="block text-base font-semibold tracking-tight text-stone-900 dark:text-stone-100">
                  Griya Kenanga
                </span>
                <span className="block text-[11px] font-medium uppercase tracking-wider text-stone-500 dark:text-stone-400">
                  Residence
                </span>
              </div>
            </Link>

            {/* Date Reference Badge (15 Okt 2026) */}
            <div className="hidden items-center gap-1.5 rounded-full border border-stone-200/90 bg-stone-50 px-2.5 py-1 text-[11px] font-medium text-stone-600 md:flex dark:border-stone-800 dark:bg-stone-900 dark:text-stone-300">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
              <span>Acuan: 15 Okt 2026</span>
            </div>
          </div>

          {/* Desktop Navigation Links (Hanya muncul jika sudah login) */}
          {currentUser && (
            <nav className="hidden lg:flex items-center gap-1">
              {navLinks.map((item) => {
                const isActive = pathname === item.href;
                const Icon = item.icon;
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-sm font-medium transition-all ${
                      isActive
                        ? 'bg-stone-900 text-stone-50 shadow-sm dark:bg-stone-100 dark:text-stone-900'
                        : 'text-stone-600 hover:bg-stone-100 hover:text-stone-900 dark:text-stone-400 dark:hover:bg-stone-900 dark:hover:text-stone-100'
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
                  className="flex items-center gap-2 rounded-xl border border-stone-200/90 bg-stone-50/80 px-2.5 py-1.5 text-left text-xs transition-all hover:bg-stone-100 dark:border-stone-800 dark:bg-stone-900/80 dark:hover:bg-stone-800"
                  title="Ganti Akun & Peran Uji"
                >
                  <div className="flex flex-col">
                    <span className="font-semibold text-stone-900 line-clamp-1 dark:text-stone-100">
                      {currentUser.nama_lengkap}
                    </span>
                    <span className={`inline-flex w-fit items-center rounded-md border px-1.5 py-0.2 text-[10px] font-medium uppercase tracking-wider ${getRoleBadgeColor(currentUser.peran)}`}>
                      {currentUser.peran}
                    </span>
                  </div>
                  <ChevronDown className="h-3.5 w-3.5 text-stone-400" />
                </button>

                {/* Reset Demo Data Button */}
                <button
                  onClick={() => setResetConfirmOpen(true)}
                  className="hidden sm:flex h-9 w-9 items-center justify-center rounded-xl border border-stone-200 text-stone-500 transition-colors hover:border-stone-300 hover:text-stone-900 dark:border-stone-800 dark:text-stone-400 dark:hover:border-stone-700"
                  title="Reset ke Data Awal Contoh"
                >
                  <RefreshCw className="h-4 w-4" />
                </button>

                {/* Logout Button */}
                <button
                  onClick={handleLogout}
                  className="flex h-9 items-center gap-1.5 rounded-xl border border-stone-200 px-3 text-xs font-semibold text-stone-600 transition-colors hover:border-red-200 hover:bg-red-50 hover:text-red-700 dark:border-stone-800 dark:text-stone-300 dark:hover:bg-red-950/30 dark:hover:text-red-400"
                  title="Keluar dari akun"
                >
                  <LogOut className="h-3.5 w-3.5" />
                  <span className="hidden sm:inline">Keluar</span>
                </button>

                {/* Mobile Menu Trigger */}
                <button
                  onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                  className="flex h-9 w-9 items-center justify-center rounded-xl border border-stone-200 text-stone-600 lg:hidden dark:border-stone-800 dark:text-stone-400"
                  aria-label="Toggle navigation menu"
                >
                  {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
                </button>
              </>
            ) : (
              /* KETIKA BELUM LOGIN: TAMPILKAN TOMBOL MASUK & DAFTAR */
              <div className="flex items-center gap-2">
                <button
                  onClick={() => {
                    setAuthMode('login');
                    setAuthModalOpen(true);
                  }}
                  className="flex items-center gap-1.5 rounded-xl border border-stone-200 bg-white px-3.5 py-2 text-xs font-semibold text-stone-800 shadow-xs hover:bg-stone-50 dark:border-stone-800 dark:bg-stone-900 dark:text-stone-200 transition-all"
                >
                  <LogIn className="h-3.5 w-3.5 text-stone-500" />
                  <span>Masuk</span>
                </button>

                <button
                  onClick={() => {
                    setAuthMode('register');
                    setAuthModalOpen(true);
                  }}
                  className="flex items-center gap-1.5 rounded-xl bg-stone-900 px-4 py-2 text-xs font-semibold text-white shadow-xs hover:bg-emerald-700 dark:bg-stone-100 dark:text-stone-900 transition-all"
                >
                  <UserPlus className="h-3.5 w-3.5" />
                  <span>Daftar Akun</span>
                </button>
              </div>
            )}

          </div>
        </div>

        {/* Mobile Navigation Drawer (Jika sudah login) */}
        {mobileMenuOpen && currentUser && (
          <div className="border-b border-stone-200 bg-white/95 px-4 pt-2 pb-4 backdrop-blur-md lg:hidden dark:border-stone-800 dark:bg-stone-950/95">
            <div className="mb-3 flex items-center justify-between border-b border-stone-100 pb-2 dark:border-stone-900">
              <span className="text-xs font-semibold uppercase text-stone-400">Navigasi ({currentUser.peran})</span>
              <span className="text-[11px] text-stone-500">15 Okt 2026</span>
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
                    className={`flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm font-medium ${
                      isActive
                        ? 'bg-stone-900 text-stone-50 dark:bg-stone-100 dark:text-stone-900'
                        : 'text-stone-600 hover:bg-stone-100 dark:text-stone-400 dark:hover:bg-stone-900'
                    }`}
                  >
                    <Icon className="h-4 w-4" />
                    <span>{item.label}</span>
                  </Link>
                );
              })}
            </div>
            <div className="mt-4 pt-3 border-t border-stone-100 dark:border-stone-900 flex justify-between items-center">
              <button
                onClick={() => {
                  setRoleSwitcherOpen(true);
                  setMobileMenuOpen(false);
                }}
                className="text-xs font-medium text-emerald-600 hover:underline dark:text-emerald-400"
              >
                Ganti Akun Demo &rarr;
              </button>
              <button
                onClick={handleLogout}
                className="text-xs font-semibold text-red-600 hover:underline"
              >
                Keluar
              </button>
            </div>
          </div>
        )}
      </header>

      {/* Role Switcher Modal (Semua 25 Akun Uji) */}
      {roleSwitcherOpen && currentUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-stone-900/60 p-4 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="w-full max-w-xl rounded-2xl border border-stone-200 bg-white p-6 shadow-2xl dark:border-stone-800 dark:bg-stone-900 max-h-[85vh] flex flex-col">
            <div className="flex items-center justify-between pb-3 border-b border-stone-100 dark:border-stone-800">
              <div>
                <h3 className="text-base font-semibold text-stone-900 dark:text-stone-100 flex items-center gap-2">
                  <UserCheck className="h-5 w-5 text-emerald-600" />
                  Pilih Akun Uji (25 Akun Contoh)
                </h3>
                <p className="text-xs text-stone-500 dark:text-stone-400">
                  Sandi semua akun: <code className="bg-stone-100 dark:bg-stone-800 px-1 py-0.5 rounded text-emerald-600 font-mono">Latihan#2026</code>
                </p>
              </div>
              <button
                onClick={() => setRoleSwitcherOpen(false)}
                className="rounded-lg p-1.5 text-stone-400 hover:bg-stone-100 dark:hover:bg-stone-800"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Akun List Grouped by Role */}
            <div className="overflow-y-auto py-3 space-y-4 flex-1 pr-1 text-xs">
              
              {/* Pemilik */}
              <div>
                <span className="text-[11px] font-semibold tracking-wider uppercase text-amber-700 dark:text-amber-400">
                  Pemilik (Owner) · 1 Akun
                </span>
                <div className="mt-1.5 grid gap-1.5">
                  {state.profiles.filter(p => p.peran === 'pemilik').map(p => (
                    <button
                      key={p.id}
                      onClick={() => handleSwitchUser(p.email)}
                      className={`flex items-center justify-between rounded-xl border p-2.5 text-left transition-all ${
                        currentUser?.id === p.id 
                          ? 'border-amber-500/50 bg-amber-50/60 dark:bg-amber-950/20' 
                          : 'border-stone-200 hover:border-stone-300 dark:border-stone-800 dark:hover:border-stone-700'
                      }`}
                    >
                      <div>
                        <div className="font-semibold text-stone-900 dark:text-stone-100">{p.nama_lengkap}</div>
                        <div className="text-stone-500 dark:text-stone-400">{p.email}</div>
                      </div>
                      {currentUser?.id === p.id && <CheckCircle2 className="h-4 w-4 text-amber-600" />}
                    </button>
                  ))}
                </div>
              </div>

              {/* Pengelola */}
              <div>
                <span className="text-[11px] font-semibold tracking-wider uppercase text-emerald-700 dark:text-emerald-400">
                  Pengelola (Staf Operasional) · 2 Akun
                </span>
                <div className="mt-1.5 grid sm:grid-cols-2 gap-1.5">
                  {state.profiles.filter(p => p.peran === 'pengelola').map(p => (
                    <button
                      key={p.id}
                      onClick={() => handleSwitchUser(p.email)}
                      className={`flex items-center justify-between rounded-xl border p-2.5 text-left transition-all ${
                        currentUser?.id === p.id 
                          ? 'border-emerald-500/50 bg-emerald-50/60 dark:bg-emerald-950/20' 
                          : 'border-stone-200 hover:border-stone-300 dark:border-stone-800 dark:hover:border-stone-700'
                      }`}
                    >
                      <div>
                        <div className="font-semibold text-stone-900 dark:text-stone-100">{p.nama_lengkap}</div>
                        <div className="text-stone-500 dark:text-stone-400">{p.email}</div>
                      </div>
                      {currentUser?.id === p.id && <CheckCircle2 className="h-4 w-4 text-emerald-600" />}
                    </button>
                  ))}
                </div>
              </div>

              {/* Penyewa Kasus Uji Kunci */}
              <div>
                <span className="text-[11px] font-semibold tracking-wider uppercase text-sky-700 dark:text-sky-400">
                  Penyewa Penting untuk Kasus Uji (BR-01 s/d BR-12)
                </span>
                <div className="mt-1.5 grid sm:grid-cols-2 gap-1.5">
                  {state.profiles.filter(p => ['dimas@griyakenanga.test', 'hana@griyakenanga.test', 'fajar@griyakenanga.test', 'cahya@griyakenanga.test', 'oki@griyakenanga.test', 'laras@griyakenanga.test', 'gilang@griyakenanga.test'].includes(p.email)).map(p => (
                    <button
                      key={p.id}
                      onClick={() => handleSwitchUser(p.email)}
                      className={`flex items-center justify-between rounded-xl border p-2.5 text-left transition-all ${
                        currentUser?.id === p.id 
                          ? 'border-sky-500/50 bg-sky-50/60 dark:bg-sky-950/20' 
                          : 'border-stone-200 hover:border-stone-300 dark:border-stone-800 dark:hover:border-stone-700'
                      }`}
                    >
                      <div>
                        <div className="font-semibold text-stone-900 dark:text-stone-100">{p.nama_lengkap}</div>
                        <div className="text-stone-500 text-[11px]">{p.email}</div>
                      </div>
                      {currentUser?.id === p.id && <CheckCircle2 className="h-4 w-4 text-sky-600" />}
                    </button>
                  ))}
                </div>
              </div>

              {/* Penyewa Lainnya */}
              <div>
                <span className="text-[11px] font-semibold tracking-wider uppercase text-stone-500">
                  Penyewa Lainnya (22 Unit)
                </span>
                <div className="mt-1.5 grid sm:grid-cols-3 gap-1.5">
                  {state.profiles.filter(p => p.peran === 'penyewa' && !['dimas@griyakenanga.test', 'hana@griyakenanga.test', 'fajar@griyakenanga.test', 'cahya@griyakenanga.test', 'oki@griyakenanga.test', 'laras@griyakenanga.test', 'gilang@griyakenanga.test'].includes(p.email)).map(p => (
                    <button
                      key={p.id}
                      onClick={() => handleSwitchUser(p.email)}
                      className={`rounded-lg border p-2 text-left transition-all ${
                        currentUser?.id === p.id 
                          ? 'border-sky-500 bg-sky-50 dark:bg-sky-950' 
                          : 'border-stone-200 hover:bg-stone-50 dark:border-stone-800 dark:hover:bg-stone-800'
                      }`}
                    >
                      <div className="font-medium text-stone-800 dark:text-stone-200 truncate">{p.nama_lengkap}</div>
                      <div className="text-[10px] text-stone-400 truncate">{p.email}</div>
                    </button>
                  ))}
                </div>
              </div>

            </div>

            <div className="pt-3 border-t border-stone-100 dark:border-stone-800 flex justify-end">
              <button
                onClick={() => setRoleSwitcherOpen(false)}
                className="rounded-xl bg-stone-900 px-4 py-2 text-xs font-semibold text-white dark:bg-stone-100 dark:text-stone-900"
              >
                Tutup
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Reset Confirmation Modal */}
      {resetConfirmOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-stone-900/60 p-4 backdrop-blur-sm">
          <div className="w-full max-w-sm rounded-2xl border border-stone-200 bg-white p-5 shadow-xl dark:border-stone-800 dark:bg-stone-900">
            <div className="flex items-center gap-3 text-amber-600 mb-3">
              <ShieldAlert className="h-6 w-6" />
              <h3 className="font-semibold text-stone-900 dark:text-stone-100">Reset Data Demo?</h3>
            </div>
            <p className="text-xs text-stone-600 dark:text-stone-300">
              Tindakan ini akan mengembalikan data 24 unit, 23 kontrak, 57 tagihan, dan 13 laporan kerusakan ke kondisi awal acuan 15 Oktober 2026.
            </p>
            <div className="mt-5 flex justify-end gap-2">
              <button
                onClick={() => setResetConfirmOpen(false)}
                className="rounded-xl border border-stone-200 px-3.5 py-1.5 text-xs font-medium text-stone-600 dark:border-stone-700 dark:text-stone-300"
              >
                Batal
              </button>
              <button
                onClick={() => {
                  store.resetToDefault();
                  setResetConfirmOpen(false);
                }}
                className="rounded-xl bg-red-600 px-3.5 py-1.5 text-xs font-medium text-white hover:bg-red-700"
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
