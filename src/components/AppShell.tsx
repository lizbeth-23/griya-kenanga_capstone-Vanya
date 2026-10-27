'use client';

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { useGriyaStore } from '@/lib/use-store';
import { 
  Building2, Home, KeyRound, Receipt, Wrench, BarChart3, 
  Users, Settings, Menu, X, ChevronDown, RefreshCw, CheckCircle2, 
  UserCheck, LogOut, Info, ArrowRight, ShieldCheck
} from 'lucide-react';
import { UserRole } from '@/lib/types';
import AuthModal from './AuthModal';

export default function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { currentUser, store, state } = useGriyaStore();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [roleSwitcherOpen, setRoleSwitcherOpen] = useState(false);
  const [resetConfirmOpen, setResetConfirmOpen] = useState(false);
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [authMode, setAuthMode] = useState<'login' | 'register'>('login');

  const handleSwitchUser = (email: string) => {
    store.setCurrentUserByEmail(email);
    setRoleSwitcherOpen(false);
    setSidebarOpen(false);
  };

  const handleLogout = () => {
    store.logout();
    setSidebarOpen(false);
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
    setSidebarOpen(false);
  };

  const isOwner = currentUser?.peran === 'pemilik';
  const isTenant = currentUser?.peran === 'penyewa';

  // Navigation Links sesuai Peran Akun (Wireframe & Tenant Flow)
  const mainNavItems = isTenant
    ? [
        { href: '/', label: 'Beranda' },
        { href: '/sewa', label: 'Pilih & Sewa Kamar' },
        { href: '/tagihan', label: 'Tagihan Saya' },
        { href: '/kerusakan', label: 'Lapor Kerusakan' },
      ]
    : [
        { href: '/', label: 'Beranda' },
        { href: '/unit', label: 'Unit' },
        { href: '/penyewa', label: 'Penyewa' },
        { href: '/kontrak', label: 'Kontrak' },
        { href: '/tagihan', label: 'Tagihan' },
        { href: '/kerusakan', label: 'Kerusakan' },
      ];

  const ownerNavItems = [
    { href: '/laporan', label: 'Laporan' },
    { href: '/laporan?tab=peran', label: 'Pengaturan' },
  ];

  // =========================================================================
  // JIKA PENGUNJUNG (BELUM LOGIN): TAMPILKAN HEADER LANDING
  // =========================================================================
  if (!currentUser) {
    return (
      <div className="flex min-h-screen flex-col bg-[#F5F2EB] text-[#222520] dark:bg-[#171D16] dark:text-[#ECEAE4]">
        {/* Top Navbar Pengunjung */}
        <header className="sticky top-0 z-40 w-full border-b border-[#2C4127] bg-[#3B5336] text-white shadow-sm">
          <div className="mx-auto flex h-16 sm:h-20 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
            <Link href="/" className="flex items-center gap-2.5 transition-transform active:scale-95">
              <div className="relative h-10 w-10 sm:h-11 sm:w-11 overflow-hidden rounded-full border border-white/20 shadow-xs">
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
            </div>
          </div>
        </header>

        <main className="flex-1 pb-16">{children}</main>

        <AuthModal
          isOpen={authModalOpen}
          initialMode={authMode}
          onClose={() => setAuthModalOpen(false)}
        />
      </div>
    );
  }

  // =========================================================================
  // JIKA SUDAH LOGIN: TAMPILKAN LAYOUT PERSIS WIREFRAME (SIDEBAR KIRI)
  // =========================================================================
  const sidebarContent = (
    <div className="flex h-full flex-col justify-between bg-[#1E251F] text-white">
      {/* Top Branding & Menu */}
      <div className="p-5">
        <Link href="/" className="block pb-6 border-b border-[#2D382E]">
          <div className="text-lg font-bold tracking-tight text-white leading-tight">
            Griya Kenanga
          </div>
          <div className="text-xs font-medium text-[#9EB39C] mt-0.5">
            Manajemen Properti
          </div>
        </Link>

        {/* Main Nav Items */}
        <nav className="mt-5 space-y-1">
          {mainNavItems.map((item) => {
            const isActive = pathname === item.href || (item.href !== '/' && pathname.startsWith(item.href));
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setSidebarOpen(false)}
                className={`block px-3.5 py-2 text-sm font-medium rounded-lg transition-colors ${
                  isActive
                    ? 'bg-[#2E3C2F] text-white font-semibold'
                    : 'text-[#B0C4AE] hover:bg-[#283429] hover:text-white'
                }`}
              >
                {item.label}
              </Link>
            );
          })}

          {/* Section KHUSUS PEMILIK (Sesuai Wireframe) */}
          {(isOwner || currentUser.peran === 'pengelola') && (
            <div className="pt-6">
              <div className="px-3.5 text-[11px] font-bold uppercase tracking-wider text-[#738C71]">
                KHUSUS PEMILIK
              </div>
              <div className="mt-2 space-y-1">
                {ownerNavItems.map((item) => {
                  const isActive = pathname === item.href.split('?')[0];
                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      onClick={() => setSidebarOpen(false)}
                      className={`block px-3.5 py-2 text-sm font-medium rounded-lg transition-colors ${
                        isActive
                          ? 'bg-[#2E3C2F] text-white font-semibold'
                          : 'text-[#B0C4AE] hover:bg-[#283429] hover:text-white'
                      }`}
                    >
                      {item.label}
                    </Link>
                  );
                })}
              </div>
            </div>
          )}
        </nav>
      </div>

      {/* Bottom User Profile Card Sesuai Wireframe */}
      <div className="p-4 border-t border-[#2D382E] bg-[#171D18]">
        <div 
          onClick={() => setRoleSwitcherOpen(true)}
          className="group flex items-center justify-between p-2 rounded-xl hover:bg-[#232C24] cursor-pointer transition-colors"
          title="Klik untuk ganti akun demo / peran"
        >
          <div className="min-w-0 pr-2">
            <div className="text-sm font-bold text-white truncate">
              {currentUser.nama_lengkap}
            </div>
            <div className="text-xs text-[#8FA58D] capitalize font-medium">
              {currentUser.peran}
            </div>
          </div>
          <ChevronDown className="h-4 w-4 text-[#738C71] group-hover:text-white transition-colors shrink-0" />
        </div>

        {/* Quick Actions */}
        <div className="mt-2 pt-2 border-t border-[#273228] flex items-center justify-between text-[11px] text-[#8FA58D]">
          <button
            onClick={() => setResetConfirmOpen(true)}
            className="hover:text-white flex items-center gap-1 transition-colors"
            title="Reset data ke default"
          >
            <RefreshCw className="h-3 w-3" />
            Reset Data
          </button>
          <button
            onClick={handleLogout}
            className="text-red-400 hover:text-red-300 flex items-center gap-1 transition-colors"
          >
            <LogOut className="h-3 w-3" />
            Keluar
          </button>
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#F5F2EB]/50 text-[#222520] dark:bg-[#161C15] dark:text-[#ECEAE4] flex flex-col lg:flex-row">
      
      {/* ===================================================================== */}
      {/* DESKTOP SIDEBAR (FIXED W-60)                                          */}
      {/* ===================================================================== */}
      <aside className="hidden lg:flex w-60 flex-col shrink-0 sticky top-0 h-screen shadow-md z-30">
        {sidebarContent}
      </aside>

      {/* ===================================================================== */}
      {/* MOBILE TOP BAR & DRAWER                                               */}
      {/* ===================================================================== */}
      <div className="lg:hidden sticky top-0 z-40 flex items-center justify-between bg-[#1E251F] px-4 py-3 text-white border-b border-[#2D382E]">
        <div className="flex items-center gap-2">
          <button
            onClick={() => setSidebarOpen(true)}
            className="p-1.5 rounded-lg hover:bg-[#283429] text-white"
            aria-label="Buka navigasi"
          >
            <Menu className="h-6 w-6" />
          </button>
          <span className="font-bold text-base">Griya Kenanga</span>
        </div>
        <button
          onClick={() => setRoleSwitcherOpen(true)}
          className="text-xs bg-[#2E3C2F] px-3 py-1.5 rounded-full text-[#B0C4AE] hover:text-white font-medium"
        >
          {currentUser.nama_lengkap.split(' ')[0]} ({currentUser.peran})
        </button>
      </div>

      {/* Mobile Drawer Overlay */}
      {sidebarOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div 
            className="fixed inset-0 bg-black/60 backdrop-blur-xs transition-opacity" 
            onClick={() => setSidebarOpen(false)}
          />
          <div className="fixed inset-y-0 left-0 w-64 shadow-2xl z-50">
            {sidebarContent}
          </div>
        </div>
      )}

      {/* ===================================================================== */}
      {/* MAIN CONTENT AREA                                                     */}
      {/* ===================================================================== */}
      <main className="flex-1 min-w-0 min-h-screen overflow-x-hidden">
        {children}
      </main>

      {/* Role Switcher Modal (Semua 25 Akun Uji) */}
      {roleSwitcherOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="w-full max-w-xl rounded-2xl border border-[#DCE5D8] bg-white p-6 shadow-2xl dark:border-[#2C382A] dark:bg-[#1E261D] max-h-[85vh] flex flex-col">
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
                      className={`flex items-center justify-between rounded-xl border p-3 text-left transition-all ${
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
                      className={`flex items-center justify-between rounded-xl border p-3 text-left transition-all ${
                        currentUser?.id === p.id 
                          ? 'border-[#3B5336] bg-[#E8EFE5] shadow-xs dark:bg-[#182317]' 
                          : 'border-[#E8EFE5] hover:border-[#95B08A] dark:border-[#2A3728] dark:hover:border-[#3B5336]'
                      }`}
                    >
                      <div>
                        <div className="font-bold text-[#222520] dark:text-[#ECEAE4]">{p.nama_lengkap}</div>
                        <div className="text-[#5D6B58] dark:text-[#A7B8A3]">{p.email}</div>
                      </div>
                      {currentUser?.id === p.id && <CheckCircle2 className="h-4 w-4 text-[#3B5336]" />}
                    </button>
                  ))}
                </div>
              </div>

              {/* Penyewa */}
              <div>
                <span className="text-[11px] font-bold tracking-wider uppercase text-sky-700 dark:text-sky-400">
                  Penyewa (Warga Kos Aktif &amp; Calon) · 22 Akun
                </span>
                <div className="mt-1.5 grid sm:grid-cols-2 gap-1.5">
                  {state.profiles.filter(p => p.peran === 'penyewa').map(p => {
                    const contract = state.contracts.find(c => c.penyewa_id === p.id && c.status === 'aktif');
                    const unit = contract ? state.units.find(u => u.id === contract.unit_id) : null;
                    return (
                      <button
                        key={p.id}
                        onClick={() => handleSwitchUser(p.email)}
                        className={`flex items-center justify-between rounded-xl border p-2.5 text-left transition-all ${
                          currentUser?.id === p.id 
                            ? 'border-sky-500/60 bg-sky-50/70 shadow-xs dark:bg-sky-950/20' 
                            : 'border-[#E8EFE5] hover:border-[#95B08A] dark:border-[#2A3728] dark:hover:border-[#3B5336]'
                        }`}
                      >
                        <div>
                          <div className="font-bold text-[#222520] dark:text-[#ECEAE4] flex items-center gap-1.5">
                            {p.nama_lengkap}
                            {unit && (
                              <span className="rounded-md bg-[#E8EFE5] px-1.5 py-0.2 text-[10px] font-mono font-bold text-[#2D4129] dark:bg-[#1E281C] dark:text-[#95B08A]">
                                {unit.kode}
                              </span>
                            )}
                          </div>
                          <div className="text-[#5D6B58] dark:text-[#A7B8A3] text-[11px]">{p.email}</div>
                        </div>
                        {currentUser?.id === p.id && <CheckCircle2 className="h-4 w-4 text-sky-600" />}
                      </button>
                    );
                  })}
                </div>
              </div>

            </div>

            <div className="pt-3 border-t border-[#E8EFE5] dark:border-[#2A3728] text-right">
              <button
                onClick={() => setRoleSwitcherOpen(false)}
                className="rounded-xl bg-[#3B5336] px-5 py-2 text-xs font-bold text-white hover:bg-[#2D4129] transition-all"
              >
                Tutup
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal Reset Data Konfirmasi */}
      {resetConfirmOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="w-full max-w-md rounded-2xl border border-[#DCE5D8] bg-white p-6 shadow-2xl dark:border-[#2C382A] dark:bg-[#1E261D]">
            <h3 className="text-base font-bold text-[#222520] dark:text-[#ECEAE4]">
              Kembalikan ke Data Awal?
            </h3>
            <p className="mt-2 text-xs text-[#5D6B58] dark:text-[#A7B8A3]">
              Tindakan ini akan mengembalikan seluruh 24 unit, 19 kontrak aktif, tagihan Oktober, dan status kerusakan ke kondisi awal simulasi tugas capstone.
            </p>
            <div className="mt-5 flex justify-end gap-2.5">
              <button
                onClick={() => setResetConfirmOpen(false)}
                className="rounded-xl border border-[#DCE5D8] px-4 py-2 text-xs font-semibold text-[#5D6B58] hover:bg-[#E8EFE5] dark:border-[#2C382A] dark:text-[#A7B8A3]"
              >
                Batal
              </button>
              <button
                onClick={() => {
                  store.resetToDefault();
                  setResetConfirmOpen(false);
                }}
                className="rounded-xl bg-red-600 px-4 py-2 text-xs font-bold text-white hover:bg-red-700"
              >
                Ya, Reset Sekarang
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
