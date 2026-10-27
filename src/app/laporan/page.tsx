'use client';

import { useState } from 'react';
import { useGriyaStore } from '@/lib/use-store';
import { formatRupiah, formatDateTimeIndo } from '@/lib/formatters';
import { UserRole } from '@/lib/types';
import { BarChart3, ShieldAlert, Download, FileSpreadsheet, History, UserCog, CheckCircle2, Search } from 'lucide-react';
import AuthGuard from '@/components/AuthGuard';

export default function LaporanPage() {
  const { currentUser, state, store } = useGriyaStore();
  const [activeTab, setActiveTab] = useState<'pendapatan' | 'audit' | 'peran'>('pendapatan');
  const [auditFilterAksi, setAuditFilterAksi] = useState<string>('all');
  const [auditSearch, setAuditSearch] = useState<string>('');

  // Kelola Peran Akun
  const [targetUserId, setTargetUserId] = useState<string>('');
  const [newRole, setNewRole] = useState<UserRole>('pengelola');
  const [roleError, setRoleError] = useState('');
  const [roleSuccess, setRoleSuccess] = useState('');

  // Wireframe UI States
  const [showAllUnits, setShowAllUnits] = useState(false);
  const [selectedPeriode, setSelectedPeriode] = useState('Agu 2026 s.d. Okt 2026');

  // PROTEKSI ROUTE: Belum login
  if (!currentUser) {
    return <AuthGuard moduleName="laporan finansial dan audit" />;
  }

  // BR-10: Halaman Laporan HANYA dapat dibuka oleh Pemilik
  if (currentUser.peran !== 'pemilik') {
    return (
      <div className="mx-auto max-w-lg px-4 py-16 text-center">
        <ShieldAlert className="mx-auto h-12 w-12 text-red-500 mb-3" />
        <h2 className="text-xl font-bold text-stone-900 dark:text-stone-100">Akses Ditolak (BR-10)</h2>
        <p className="mt-2 text-sm text-stone-500">
          Laporan pendapatan finansial, okupansi hunian, dan audit log adalah data rahasia yang hanya dapat diakses oleh Pemilik (Owner).
        </p>
      </div>
    );
  }

  // --- KALKULASI DATA PENDAPATAN SESUAI WIREFRAME PAGE 4 ---
  // Periode: Agustus s/d Oktober 2026
  const relevantInvoices = state.invoices.filter(i => 
    ['2026-08-01', '2026-09-01', '2026-10-01'].includes(i.periode)
  );

  const totalDitagihkan = relevantInvoices.reduce((acc, i) => acc + (i.nominal_sewa + i.denda), 0);
  const totalDiterima = relevantInvoices.reduce((acc, i) => acc + i.terbayar, 0);
  const totalTunggakan = totalDitagihkan - totalDiterima;
  const persenDiterima = totalDitagihkan > 0 ? ((totalDiterima / totalDitagihkan) * 100).toFixed(1) : '0';

  // Rekap Per Bulan Dinamis
  const getMonthData = (periode: string, bulanLabel: string) => {
    const invs = state.invoices.filter(i => i.periode === periode);
    const ditagihkan = invs.reduce((acc, i) => acc + (i.nominal_sewa + i.denda), 0);
    const diterima = invs.reduce((acc, i) => acc + i.terbayar, 0);
    return {
      bulan: bulanLabel,
      periode,
      ditagihkanJuta: Number((ditagihkan / 1000000).toFixed(1)),
      diterimaJuta: Number((diterima / 1000000).toFixed(1)),
      hunian: 82.6
    };
  };

  const monthlyStats = [
    getMonthData('2026-08-01', 'Agu 2026'),
    getMonthData('2026-09-01', 'Sep 2026'),
    getMonthData('2026-10-01', 'Okt 2026')
  ];

  // Rekap Pendapatan per Unit (Diurutkan berdasarkan tunggakan tertinggi)
  const unitStats = state.units.map((u) => {
    // Cari kontrak di unit ini
    const unitContracts = state.contracts.filter(c => c.unit_id === u.id);
    const contractIds = unitContracts.map(c => c.id);
    const unitInvs = relevantInvoices.filter(i => contractIds.includes(i.kontrak_id));

    const ditagihkan = unitInvs.reduce((acc, i) => acc + (i.nominal_sewa + i.denda), 0);
    const diterima = unitInvs.reduce((acc, i) => acc + i.terbayar, 0);
    const tunggakan = ditagihkan - diterima;

    return {
      unitKode: u.kode,
      ditagihkan,
      diterima,
      tunggakan
    };
  }).sort((a, b) => b.tunggakan - a.tunggakan);

  // FITUR PENINGKATAN: Ekspor CSV Laporan Pendapatan & Tunggakan
  const handleExportCSV = () => {
    const headers = ['Unit', 'Total Ditagihkan (Rp)', 'Total Diterima (Rp)', 'Tunggakan (Rp)'];
    const rows = unitStats.map(u => [
      u.unitKode,
      u.ditagihkan,
      u.diterima,
      u.tunggakan
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + 
      [headers.join(','), ...rows.map(e => e.join(','))].join('\n');

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `Laporan_Pendapatan_Griya_Kenanga_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Filter Audit Log
  const filteredAuditLogs = state.auditLogs.filter((l) => {
    if (auditFilterAksi !== 'all' && !l.aksi.startsWith(auditFilterAksi)) return false;
    if (auditSearch) {
      const term = auditSearch.toLowerCase();
      const match = l.aksi.toLowerCase().includes(term) ||
                    l.tabel.toLowerCase().includes(term) ||
                    (l.pelaku_nama && l.pelaku_nama.toLowerCase().includes(term));
      if (!match) return false;
    }
    return true;
  });

  const handleUpdateRole = (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setRoleError('');
      store.updateUserRole(targetUserId, newRole);
      setRoleSuccess('Peran akun berhasil diubah!');
      setTargetUserId('');
      setTimeout(() => setRoleSuccess(''), 3000);
    } catch (err: unknown) {
      if (err instanceof Error) {
        setRoleError(err.message);
      } else {
        setRoleError('Gagal mengubah peran akun');
      }
    }
  };

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8 space-y-6">
      
      {/* Header Halaman Sesuai Wireframe Page 4 */}
      <div className="flex flex-col gap-4 border-b border-stone-200 pb-5 dark:border-stone-800">
        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
          <div>
            <h1 className="text-xl font-bold text-stone-900 dark:text-stone-100 sm:text-2xl">
              Laporan Pendapatan dan Hunian
            </h1>
            <p className="mt-1 text-xs text-stone-500 dark:text-stone-400">
              Agustus sampai Oktober 2026 · hanya dapat dibuka Pemilik
            </p>
          </div>

          <div className="flex flex-col sm:items-end gap-2">
            <span className="self-start sm:self-auto rounded-xs border border-amber-300 bg-[#FDF6B2] px-2.5 py-0.5 text-[10px] font-bold text-amber-900 uppercase tracking-wide">
              REFERENSI TAMPILAN, bukan desain wajib
            </span>

            {/* Tab & Filter Bar Sesuai Wireframe Page 4 */}
            <div className="flex flex-wrap items-center gap-2">
              {/* Tab Pill Buttons */}
              <div className="flex rounded-full bg-stone-100 p-0.5 border border-stone-200 text-xs font-semibold dark:bg-stone-800 dark:border-stone-700">
                <button
                  onClick={() => setActiveTab('pendapatan')}
                  className={`rounded-full px-4 py-1 transition-all ${
                    activeTab === 'pendapatan'
                      ? 'bg-[#1E251F] text-white shadow-xs'
                      : 'text-stone-600 hover:text-stone-900 dark:text-stone-300'
                  }`}
                >
                  Pendapatan
                </button>
                <button
                  onClick={() => setActiveTab('audit')}
                  className={`rounded-full px-4 py-1 transition-all ${
                    activeTab === 'audit'
                      ? 'bg-[#1E251F] text-white shadow-xs'
                      : 'text-stone-600 hover:text-stone-900 dark:text-stone-300'
                  }`}
                >
                  Audit log
                </button>
                <button
                  onClick={() => setActiveTab('peran')}
                  className={`rounded-full px-4 py-1 transition-all ${
                    activeTab === 'peran'
                      ? 'bg-[#1E251F] text-white shadow-xs'
                      : 'text-stone-600 hover:text-stone-900 dark:text-stone-300'
                  }`}
                >
                  Kelola peran
                </button>
              </div>

              {/* Periode Dropdown */}
              <select
                value={selectedPeriode}
                onChange={(e) => setSelectedPeriode(e.target.value)}
                className="rounded-sm border border-stone-300 bg-white px-3 py-1 text-xs text-stone-800 focus:outline-none focus:ring-1 focus:ring-stone-400 dark:border-stone-700 dark:bg-stone-800 dark:text-stone-200"
              >
                <option value="Agu 2026 s.d. Okt 2026">Agu 2026 s.d. Okt 2026</option>
                <option value="Okt 2026">Okt 2026</option>
              </select>

              {/* Unduh CSV Button */}
              <button
                onClick={handleExportCSV}
                className="rounded-sm border border-stone-300 bg-white px-3 py-1 text-xs font-medium text-stone-800 hover:bg-stone-50 dark:border-stone-700 dark:bg-stone-800 dark:text-stone-200 transition-colors"
              >
                Unduh CSV
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* ==================================================================== */}
      {/* TAB 1: LAPORAN PENDAPATAN & HUNIAN (Sesuai Wireframe Page 4)          */}
      {/* ==================================================================== */}
      {activeTab === 'pendapatan' && (
        <div className="space-y-5 animate-in fade-in duration-200">
          
          {/* 4 Kartu Metrik (Sesuai Wireframe Page 4) */}
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            
            {/* Total Ditagihkan */}
            <div className="rounded-sm border border-stone-200 bg-white p-4 dark:border-stone-800 dark:bg-[#1E261D]">
              <div className="text-xs text-stone-500 dark:text-stone-400">Total ditagihkan</div>
              <div className="mt-1 text-2xl font-bold text-stone-900 dark:text-stone-100">
                {formatRupiah(totalDitagihkan)}
              </div>
              <div className="mt-1 text-xs text-stone-400 dark:text-stone-400">
                {relevantInvoices.length} tagihan, termasuk denda
              </div>
            </div>

            {/* Total Diterima */}
            <div className="rounded-sm border border-stone-200 bg-white p-4 dark:border-stone-800 dark:bg-[#1E261D]">
              <div className="text-xs text-stone-500 dark:text-stone-400">Total diterima</div>
              <div className="mt-1 text-2xl font-bold text-[#1F5144] dark:text-[#95B08A]">
                {formatRupiah(totalDiterima)}
              </div>
              <div className="mt-1 text-xs text-stone-400 dark:text-stone-400">
                {persenDiterima}% dari tagihan
              </div>
            </div>

            {/* Tunggakan */}
            <div className="rounded-sm border border-stone-200 bg-white p-4 dark:border-stone-800 dark:bg-[#1E261D]">
              <div className="text-xs text-stone-500 dark:text-stone-400">Tunggakan</div>
              <div className="mt-1 text-2xl font-bold text-[#D0382B] dark:text-red-400">
                {formatRupiah(totalTunggakan)}
              </div>
              <div className="mt-1 text-xs text-stone-400 dark:text-stone-400">
                {relevantInvoices.filter(i => i.status !== 'lunas' && i.status !== 'dibatalkan').length} tagihan belum lunas
              </div>
            </div>

            {/* Hunian Oktober */}
            <div className="rounded-sm border border-stone-200 bg-white p-4 dark:border-stone-800 dark:bg-[#1E261D]">
              <div className="text-xs text-stone-500 dark:text-stone-400">Hunian Oktober</div>
              <div className="mt-1 text-2xl font-bold text-stone-900 dark:text-stone-100">
                82.6%
              </div>
              <div className="mt-1 text-xs text-stone-400 dark:text-stone-400">
                19 dari 23 unit layak sewa
              </div>
            </div>

          </div>

          {/* Grid 2 Kolom: Grafik Ditagihkan vs Diterima & Tabel Pendapatan per Unit */}
          <div className="grid grid-cols-1 gap-5 lg:grid-cols-12">
            
            {/* Kolom Kiri: Visual Grafik Batang Vertikal Sesuai Wireframe Page 4 */}
            <div className="lg:col-span-5 rounded-sm border border-stone-200 bg-white p-5 dark:border-stone-800 dark:bg-[#1E261D] flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between pb-3">
                  <h3 className="text-sm font-bold text-stone-900 dark:text-stone-100">
                    Ditagihkan dan diterima per bulan
                  </h3>
                  <div className="flex items-center gap-3 text-xs text-stone-600 dark:text-stone-300">
                    <div className="flex items-center gap-1.5">
                      <span className="h-3 w-3 bg-[#BCC3BA]"></span>
                      <span>Ditagihkan</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <span className="h-3 w-3 bg-[#1F5144]"></span>
                      <span>Diterima</span>
                    </div>
                  </div>
                </div>

                {/* Vertical Chart Container */}
                <div className="mt-4 relative h-56 pt-6 pb-6">
                  {/* Y Axis Grid lines and labels */}
                  <div className="absolute inset-0 flex flex-col justify-between pointer-events-none text-[10px] text-stone-400">
                    <div className="flex items-center gap-2">
                      <span className="w-8 text-right font-medium text-stone-500">juta Rp</span>
                      <div className="flex-1 border-b border-transparent"></div>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="w-8 text-right">40</span>
                      <div className="flex-1 border-b border-stone-100 dark:border-stone-800"></div>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="w-8 text-right">30</span>
                      <div className="flex-1 border-b border-stone-100 dark:border-stone-800"></div>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="w-8 text-right">20</span>
                      <div className="flex-1 border-b border-stone-100 dark:border-stone-800"></div>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="w-8 text-right">10</span>
                      <div className="flex-1 border-b border-stone-100 dark:border-stone-800"></div>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="w-8 text-right">0</span>
                      <div className="flex-1 border-b border-stone-300 dark:border-stone-700"></div>
                    </div>
                  </div>

                  {/* Bars Container */}
                  <div className="ml-10 h-full flex items-end justify-around relative z-10 pb-0">
                    {monthlyStats.map((item) => (
                      <div key={item.bulan} className="flex flex-col items-center">
                        {/* Bars Group */}
                        <div className="flex items-end gap-1.5 h-44">
                          {/* Bar Ditagihkan (Gray) */}
                          <div className="flex flex-col items-center">
                            <span className="text-[10px] text-stone-700 font-medium mb-1 dark:text-stone-300">
                              {item.ditagihkanJuta}
                            </span>
                            <div
                              style={{ height: `${(item.ditagihkanJuta / 40) * 140}px` }}
                              className="w-7 sm:w-8 bg-[#BCC3BA] transition-all hover:opacity-90"
                              title={`Ditagihkan: Rp${item.ditagihkanJuta} Juta`}
                            />
                          </div>

                          {/* Bar Diterima (Teal/Dark Green) */}
                          <div className="flex flex-col items-center">
                            <span className="text-[10px] text-stone-700 font-medium mb-1 dark:text-stone-300">
                              {item.diterimaJuta}
                            </span>
                            <div
                              style={{ height: `${(item.diterimaJuta / 40) * 140}px` }}
                              className="w-7 sm:w-8 bg-[#1F5144] transition-all hover:opacity-90"
                              title={`Diterima: Rp${item.diterimaJuta} Juta`}
                            />
                          </div>
                        </div>

                        {/* X Axis Label */}
                        <span className="mt-2 text-xs text-stone-700 dark:text-stone-300 font-medium">
                          {item.bulan}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Footer Hunian */}
              <div className="mt-4 pt-3 border-t border-stone-200 text-xs text-stone-500 dark:border-stone-800 dark:text-stone-400">
                Hunian: Agu 82.6% · Sep 82.6% · Okt 82.6%
              </div>
            </div>

            {/* Kolom Kanan: Tabel Pendapatan per Unit (Urut Tunggakan) Sesuai Wireframe Page 4 */}
            <div className="lg:col-span-7 rounded-sm border border-stone-200 bg-white p-5 dark:border-stone-800 dark:bg-[#1E261D] flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between pb-2">
                  <h3 className="text-sm font-bold text-stone-900 dark:text-stone-100">
                    Pendapatan per unit (urut tunggakan)
                  </h3>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead className="border-b border-stone-200 text-stone-600 dark:border-stone-800 dark:text-stone-400 font-normal">
                      <tr>
                        <th className="py-2 pr-3 font-normal">Unit</th>
                        <th className="py-2 px-3 font-normal">Ditagihkan</th>
                        <th className="py-2 px-3 font-normal">Diterima</th>
                        <th className="py-2 pl-3 text-right font-normal">Tunggakan</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-stone-100 dark:divide-stone-800 text-stone-800 dark:text-stone-200">
                      {unitStats.slice(0, showAllUnits ? unitStats.length : 9).map((u) => (
                        <tr key={u.unitKode} className="hover:bg-stone-50/80 dark:hover:bg-stone-800/40 transition-colors">
                          <td className="py-2.5 pr-3 font-normal text-stone-900 dark:text-stone-100">
                            {u.unitKode}
                          </td>
                          <td className="py-2.5 px-3">
                            {formatRupiah(u.ditagihkan)}
                          </td>
                          <td className="py-2.5 px-3">
                            {formatRupiah(u.diterima)}
                          </td>
                          <td className="py-2.5 pl-3 text-right">
                            {u.tunggakan > 0 ? (
                              <span className="text-[#D0382B] dark:text-red-400">
                                {formatRupiah(u.tunggakan)}
                              </span>
                            ) : (
                              <span className="text-stone-400">-</span>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Footer Tabel */}
              <div className="mt-4 pt-3 border-t border-stone-200 text-xs text-stone-500 dark:border-stone-800 dark:text-stone-400">
                Menampilkan {showAllUnits ? unitStats.length : Math.min(9, unitStats.length)} dari {unitStats.length} unit ·{' '}
                <button
                  onClick={() => setShowAllUnits(!showAllUnits)}
                  className="text-stone-700 underline hover:text-stone-900 dark:text-stone-300 dark:hover:text-stone-100 font-medium"
                >
                  {showAllUnits ? 'Tampilkan ringkas' : 'Lihat semua'}
                </button>
              </div>
            </div>

          </div>

        </div>
      )}

      {/* ==================================================================== */}
      {/* TAB 2: AUDIT LOG (Catatan Aksi Sensitif - BR-09, BR-10)               */}
      {/* ==================================================================== */}
      {activeTab === 'audit' && (
        <div className="space-y-4 animate-in fade-in duration-200">
          
          {/* Filter Bar */}
          <div className="flex flex-wrap items-center justify-between gap-3 rounded-[24px] border border-[#DCE5D8] bg-white p-4 shadow-xs dark:border-[#2C382A] dark:bg-[#1E261D]">
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold text-[#5D6B58] dark:text-stone-400">Filter Aksi:</span>
              <select
                value={auditFilterAksi}
                onChange={(e) => setAuditFilterAksi(e.target.value)}
                className="rounded-full border border-[#DCE5D8] bg-[#F4F7F2] px-3.5 py-1.5 text-xs font-bold text-[#2D4129] focus:outline-none focus:ring-2 focus:ring-[#3B5336]/20 dark:border-[#2C382A] dark:bg-[#171D16] dark:text-[#95B08A]"
              >
                <option value="all">Semua Aksi</option>
                <option value="identitas">Verifikasi Identitas</option>
                <option value="kontrak">Kontrak Sewa</option>
                <option value="tagihan">Tagihan</option>
                <option value="pembayaran">Pembayaran</option>
                <option value="status:kerusakan">Laporan Kerusakan</option>
                <option value="unit">Perubahan Unit</option>
              </select>
            </div>

            <div className="relative">
              <Search className="absolute left-3.5 top-2.5 h-3.5 w-3.5 text-[#5D6B58]" />
              <input
                type="text"
                placeholder="Cari aksi / pelaku..."
                value={auditSearch}
                onChange={(e) => setAuditSearch(e.target.value)}
                className="rounded-full border border-[#DCE5D8] bg-[#F4F7F2] pl-9 pr-4 py-1.5 text-xs text-stone-800 placeholder-[#5D6B58]/60 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#3B5336]/20 dark:border-[#2C382A] dark:bg-[#171D16] dark:text-stone-200"
              />
            </div>
          </div>

          {/* List Audit Log */}
          <div className="overflow-hidden rounded-[24px] border border-[#DCE5D8] bg-white shadow-xs dark:border-[#2C382A] dark:bg-[#1E261D]">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="border-b border-[#DCE5D8] bg-[#E8EFE5]/60 font-bold text-[#4F604A] dark:border-[#2C382A] dark:bg-[#171D16]/70 dark:text-[#95B08A]">
                  <tr>
                    <th className="py-3 px-4">Waktu</th>
                    <th className="py-3 px-3">Pelaku</th>
                    <th className="py-3 px-3">Aksi</th>
                    <th className="py-3 px-3">Tabel / ID</th>
                    <th className="py-3 px-4">Detail Perubahan</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#DCE5D8]/70 dark:divide-[#2C382A] text-stone-800 dark:text-stone-200">
                  {filteredAuditLogs.map((log) => (
                    <tr key={log.id} className="hover:bg-[#F4F7F2]/60 dark:hover:bg-[#2C382A]/30 transition-colors">
                      <td className="py-3 px-4 font-mono text-[#5D6B58] whitespace-nowrap">
                        {formatDateTimeIndo(log.dibuat_pada)}
                      </td>
                      <td className="py-3 px-3">
                        <div className="font-bold text-stone-900 dark:text-stone-100">{log.pelaku_nama || 'Sistem / Webhook'}</div>
                        <div className="text-[10px] text-[#5D6B58] capitalize font-medium">{log.peran || 'System'}</div>
                      </td>
                      <td className="py-3 px-3">
                        <span className="font-mono font-bold rounded-full bg-[#E8EFE5] border border-[#95B08A]/30 px-2.5 py-0.5 text-[#2D4129] dark:bg-[#2C382A] dark:text-[#95B08A]">
                          {log.aksi}
                        </span>
                      </td>
                      <td className="py-3 px-3 font-mono text-[11px] text-[#5D6B58] dark:text-stone-400">
                        {log.tabel}:{log.data_id}
                      </td>
                      <td className="py-3 px-4 font-mono text-[11px]">
                        {log.sesudah && (
                          <span className="text-[#3B5336] dark:text-[#95B08A] font-semibold">
                            {JSON.stringify(log.sesudah)}
                          </span>
                        )}
                        {log.sebelum && (
                          <div className="text-stone-400 text-[10px] mt-0.5">
                            sebelum: {JSON.stringify(log.sebelum)}
                          </div>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ==================================================================== */}
      {/* TAB 3: KELOLA PERAN AKUN (BR-10)                                      */}
      {/* ==================================================================== */}
      {activeTab === 'peran' && (
        <div className="max-w-2xl rounded-[28px] border border-[#DCE5D8] bg-white p-6 shadow-xs dark:border-[#2C382A] dark:bg-[#1E261D] space-y-4 animate-in fade-in duration-200">
          <div>
            <h3 className="text-base font-bold text-stone-900 dark:text-stone-100 flex items-center gap-2.5">
              <div className="h-8 w-8 rounded-full bg-[#E8EFE5] text-[#3B5336] flex items-center justify-center dark:bg-[#2C382A] dark:text-[#95B08A]">
                <UserCog className="h-4 w-4" />
              </div>
              Pengaturan Hak Akses & Peran Akun (BR-10)
            </h3>
            <p className="mt-1 text-xs text-[#5D6B58] dark:text-stone-400">
              Peran akun hanya bisa diubah Pemilik. Pemilik tidak bisa mengubah peran akunnya sendiri.
            </p>
          </div>

          {roleError && (
            <div className="rounded-2xl border border-red-200 bg-red-50 p-3.5 text-xs text-red-700 dark:bg-red-950/30 dark:text-red-300">
              {roleError}
            </div>
          )}

          {roleSuccess && (
            <div className="rounded-2xl border border-[#95B08A]/40 bg-[#E8EFE5] p-3.5 text-xs font-medium text-[#2D4129] dark:bg-[#2C382A]/40 dark:text-[#95B08A]">
              {roleSuccess}
            </div>
          )}

          <form onSubmit={handleUpdateRole} className="space-y-4 text-xs pt-2">
            <div>
              <label className="block text-xs font-semibold text-[#5D6B58] dark:text-stone-300 mb-1.5">Pilih Pengguna Sasaran</label>
              <select
                required
                value={targetUserId}
                onChange={(e) => setTargetUserId(e.target.value)}
                className="w-full rounded-2xl border border-[#DCE5D8] bg-[#E8EFE5]/40 p-2.5 text-xs font-bold text-stone-900 focus:bg-white focus:border-[#3B5336] focus:ring-2 focus:ring-[#3B5336]/20 focus:outline-none dark:border-[#2C382A] dark:bg-[#2C382A] dark:text-stone-100"
              >
                <option value="">-- Pilih Akun --</option>
                {state.profiles.map((p) => (
                  <option key={p.id} value={p.id} disabled={p.id === currentUser.id}>
                    {p.nama_lengkap} ({p.email}) - Peran Saat Ini: {p.peran} {p.id === currentUser.id ? '(Akun Anda Sendiri)' : ''}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#5D6B58] dark:text-stone-300 mb-1.5">Pilih Peran Baru</label>
              <select
                value={newRole}
                onChange={(e) => setNewRole(e.target.value as UserRole)}
                className="w-full rounded-2xl border border-[#DCE5D8] bg-[#E8EFE5]/40 p-2.5 text-xs font-bold text-stone-900 focus:bg-white focus:border-[#3B5336] focus:ring-2 focus:ring-[#3B5336]/20 focus:outline-none dark:border-[#2C382A] dark:bg-[#2C382A] dark:text-stone-100"
              >
                <option value="pengelola">Pengelola (Staf Operasional)</option>
                <option value="penyewa">Penyewa (Penghuni)</option>
                <option value="pemilik">Pemilik (Owner Tambahan)</option>
              </select>
            </div>

            <button
              type="submit"
              className="rounded-full bg-[#3B5336] px-5 py-2.5 text-xs font-bold text-white shadow-sm hover:bg-[#2D4129] active:scale-95 transition-all"
            >
              Simpan Perubahan Peran
            </button>
          </form>
        </div>
      )}

    </div>
  );
}
