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

  // Rekap Per Bulan
  const monthlyStats = [
    { bulan: 'Agu 2026', periode: '2026-08-01', ditagihkanJuta: 36.8, diterimaJuta: 36.8, hunian: 82.6 },
    { bulan: 'Sep 2026', periode: '2026-09-01', ditagihkanJuta: 36.7, diterimaJuta: 36.3, hunian: 82.6 },
    { bulan: 'Okt 2026', periode: '2026-10-01', ditagihkanJuta: 37.9, diterimaJuta: 29.8, hunian: 82.6 }
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
      
      {/* Header Halaman */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-stone-200/80 pb-6 dark:border-stone-800">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-stone-900 dark:text-stone-100 sm:text-3xl flex items-center gap-2.5">
            <BarChart3 className="h-7 w-7 text-stone-800 dark:text-stone-200" />
            Laporan Pendapatan & Pengaturan Usaha
          </h1>
          <p className="mt-1 text-sm text-stone-500 dark:text-stone-400">
            Agustus sampai Oktober 2026 · Halaman khusus hak akses Pemilik (Ratna Kusumawardani - BR-10)
          </p>
        </div>

        {/* Tab Selector & Ekspor Button */}
        <div className="flex flex-wrap items-center gap-2">
          <div className="flex rounded-xl border border-stone-200 bg-white p-1 text-xs dark:border-stone-800 dark:bg-stone-900">
            <button
              onClick={() => setActiveTab('pendapatan')}
              className={`rounded-lg px-3 py-1.5 font-medium transition-all ${
                activeTab === 'pendapatan'
                  ? 'bg-stone-900 text-white dark:bg-stone-100 dark:text-stone-900'
                  : 'text-stone-600 dark:text-stone-400'
              }`}
            >
              Pendapatan & Hunian
            </button>
            <button
              onClick={() => setActiveTab('audit')}
              className={`rounded-lg px-3 py-1.5 font-medium transition-all ${
                activeTab === 'audit'
                  ? 'bg-stone-900 text-white dark:bg-stone-100 dark:text-stone-900'
                  : 'text-stone-600 dark:text-stone-400'
              }`}
            >
              Audit Log
            </button>
            <button
              onClick={() => setActiveTab('peran')}
              className={`rounded-lg px-3 py-1.5 font-medium transition-all ${
                activeTab === 'peran'
                  ? 'bg-stone-900 text-white dark:bg-stone-100 dark:text-stone-900'
                  : 'text-stone-600 dark:text-stone-400'
              }`}
            >
              Kelola Peran
            </button>
          </div>

          {activeTab === 'pendapatan' && (
            <button
              onClick={handleExportCSV}
              className="flex items-center gap-1.5 rounded-xl border border-stone-300 bg-white px-3.5 py-1.5 text-xs font-semibold text-stone-800 shadow-xs hover:bg-stone-50 dark:border-stone-700 dark:bg-stone-900 dark:text-stone-200 transition-colors"
            >
              <Download className="h-4 w-4 text-emerald-600" />
              Unduh CSV
            </button>
          )}
        </div>
      </div>

      {/* ==================================================================== */}
      {/* TAB 1: LAPORAN PENDAPATAN & HUNIAN (Sesuai Wireframe Page 4)          */}
      {/* ==================================================================== */}
      {activeTab === 'pendapatan' && (
        <div className="space-y-6 animate-in fade-in duration-200">
          
          {/* 4 Kartu Metrik (Sesuai Wireframe) */}
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            
            {/* Total Ditagihkan */}
            <div className="rounded-2xl border border-stone-200/90 bg-white p-5 shadow-xs dark:border-stone-800 dark:bg-stone-900">
              <span className="text-xs font-semibold uppercase tracking-wider text-stone-400">Total Ditagihkan</span>
              <div className="mt-2 text-2xl font-extrabold text-stone-900 dark:text-stone-100">
                {formatRupiah(totalDitagihkan)}
              </div>
              <p className="mt-1 text-[11px] text-stone-500">
                {relevantInvoices.length} tagihan, termasuk denda keterlambatan
              </p>
            </div>

            {/* Total Diterima */}
            <div className="rounded-2xl border border-emerald-200 bg-emerald-50/20 p-5 shadow-xs dark:border-emerald-950/40 dark:bg-emerald-950/10">
              <span className="text-xs font-semibold uppercase tracking-wider text-emerald-700 dark:text-emerald-400">Total Diterima</span>
              <div className="mt-2 text-2xl font-extrabold text-emerald-800 dark:text-emerald-300">
                {formatRupiah(totalDiterima)}
              </div>
              <p className="mt-1 text-[11px] text-emerald-700/80 dark:text-emerald-400/80">
                {persenDiterima}% dari total seluruh tagihan
              </p>
            </div>

            {/* Tunggakan */}
            <div className="rounded-2xl border border-red-200 bg-red-50/20 p-5 shadow-xs dark:border-red-950/40 dark:bg-red-950/10">
              <span className="text-xs font-semibold uppercase tracking-wider text-red-600 dark:text-red-400">Tunggakan</span>
              <div className="mt-2 text-2xl font-extrabold text-red-600 dark:text-red-400">
                {formatRupiah(totalTunggakan)}
              </div>
              <p className="mt-1 text-[11px] text-red-700/80 dark:text-red-400/80">
                7 tagihan belum lunas per 15 Oktober 2026
              </p>
            </div>

            {/* Hunian Oktober */}
            <div className="rounded-2xl border border-stone-200/90 bg-white p-5 shadow-xs dark:border-stone-800 dark:bg-stone-900">
              <span className="text-xs font-semibold uppercase tracking-wider text-stone-400">Hunian Oktober</span>
              <div className="mt-2 text-2xl font-extrabold text-stone-900 dark:text-stone-100">
                82.6%
              </div>
              <p className="mt-1 text-[11px] text-stone-500">
                19 dari 23 unit layak sewa (A-108 nonaktif)
              </p>
            </div>

          </div>

          {/* Grid 2 Kolom: Grafik Ditagihkan vs Diterima & Tabel Pendapatan per Unit */}
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
            
            {/* Kolom Kiri: Visual Grafik Batang (5 Kolom) */}
            <div className="lg:col-span-5 rounded-2xl border border-stone-200/90 bg-white p-5 shadow-xs dark:border-stone-800 dark:bg-stone-900 space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-stone-100 dark:border-stone-800">
                <h3 className="text-sm font-bold text-stone-900 dark:text-stone-100">
                  Ditagihkan dan Diterima per Bulan
                </h3>
              </div>

              {/* Batang Perbandingan per Bulan */}
              <div className="space-y-5 pt-2">
                {monthlyStats.map((item) => (
                  <div key={item.bulan} className="space-y-1.5 text-xs">
                    <div className="flex justify-between font-semibold">
                      <span className="text-stone-800 dark:text-stone-200">{item.bulan}</span>
                      <span className="text-stone-500 font-mono text-[11px]">
                        Tagih: {item.ditagihkanJuta}jt | Terima: {item.diterimaJuta}jt
                      </span>
                    </div>

                    {/* Progress Bar Ganda */}
                    <div className="h-5 w-full rounded-lg bg-stone-100 p-0.5 dark:bg-stone-800 flex gap-1">
                      <div
                        style={{ width: `${(item.diterimaJuta / 40) * 100}%` }}
                        className="h-full rounded-md bg-emerald-600 text-[10px] text-white flex items-center justify-end pr-1.5 font-bold"
                        title={`Diterima: Rp${item.diterimaJuta} Juta`}
                      >
                        {item.diterimaJuta}
                      </div>
                      <div
                        style={{ width: `${((item.ditagihkanJuta - item.diterimaJuta) / 40) * 100}%` }}
                        className="h-full rounded-md bg-stone-400/80 text-[10px] text-white flex items-center justify-center font-bold"
                        title={`Sisa Tagihan: Rp${(item.ditagihkanJuta - item.diterimaJuta).toFixed(1)} Juta`}
                      >
                        {item.ditagihkanJuta > item.diterimaJuta ? (item.ditagihkanJuta - item.diterimaJuta).toFixed(1) : ''}
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <div className="pt-4 border-t border-stone-100 dark:border-stone-800 flex items-center justify-between text-xs text-stone-500">
                <div className="flex items-center gap-2">
                  <span className="h-3 w-3 rounded-sm bg-emerald-600"></span>
                  <span>Diterima</span>
                  <span className="h-3 w-3 rounded-sm bg-stone-400 ml-2"></span>
                  <span>Belum Lunas</span>
                </div>
                <span>Hunian Stabil 82.6%</span>
              </div>
            </div>

            {/* Kolom Kanan: Tabel Pendapatan per Unit (7 Kolom) */}
            <div className="lg:col-span-7 rounded-2xl border border-stone-200/90 bg-white p-5 shadow-xs dark:border-stone-800 dark:bg-stone-900 space-y-3">
              <div className="flex items-center justify-between pb-3 border-b border-stone-100 dark:border-stone-800">
                <h3 className="text-sm font-bold text-stone-900 dark:text-stone-100">
                  Pendapatan per Unit (Urut Tunggakan)
                </h3>
                <span className="text-[11px] text-stone-400">Total 24 Unit</span>
              </div>

              <div className="overflow-x-auto max-h-[350px]">
                <table className="w-full text-left text-xs">
                  <thead className="border-b border-stone-200/80 bg-stone-50/70 font-semibold text-stone-600 dark:border-stone-800 dark:bg-stone-800/40 dark:text-stone-300 sticky top-0">
                    <tr>
                      <th className="py-2.5 px-3">Unit</th>
                      <th className="py-2.5 px-3">Ditagihkan</th>
                      <th className="py-2.5 px-3">Diterima</th>
                      <th className="py-2.5 px-3 text-right">Tunggakan</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-stone-100 dark:divide-stone-800/60 text-stone-800 dark:text-stone-200">
                    {unitStats.map((u) => (
                      <tr key={u.unitKode} className="hover:bg-stone-50/70 dark:hover:bg-stone-800/30">
                        <td className="py-2 px-3 font-bold text-stone-900 dark:text-stone-100">
                          {u.unitKode}
                        </td>
                        <td className="py-2 px-3">
                          {formatRupiah(u.ditagihkan)}
                        </td>
                        <td className="py-2 px-3 font-medium text-emerald-700 dark:text-emerald-400">
                          {formatRupiah(u.diterima)}
                        </td>
                        <td className="py-2 px-3 text-right">
                          {u.tunggakan > 0 ? (
                            <span className="font-bold text-red-600 dark:text-red-400">
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

          </div>

        </div>
      )}

      {/* ==================================================================== */}
      {/* TAB 2: AUDIT LOG (Catatan Aksi Sensitif - BR-09, BR-10)               */}
      {/* ==================================================================== */}
      {activeTab === 'audit' && (
        <div className="space-y-4 animate-in fade-in duration-200">
          
          {/* Filter Bar */}
          <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-stone-200/90 bg-white p-3.5 shadow-xs dark:border-stone-800 dark:bg-stone-900">
            <div className="flex items-center gap-2">
              <span className="text-xs text-stone-400">Filter Aksi:</span>
              <select
                value={auditFilterAksi}
                onChange={(e) => setAuditFilterAksi(e.target.value)}
                className="rounded-xl border border-stone-200 bg-stone-50 px-3 py-1.5 text-xs font-semibold text-stone-800 dark:border-stone-700 dark:bg-stone-800 dark:text-stone-200"
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
              <Search className="absolute left-3 top-2.5 h-3.5 w-3.5 text-stone-400" />
              <input
                type="text"
                placeholder="Cari aksi / pelaku..."
                value={auditSearch}
                onChange={(e) => setAuditSearch(e.target.value)}
                className="rounded-xl border border-stone-200 bg-stone-50 pl-8 pr-3 py-1.5 text-xs text-stone-800 dark:border-stone-700 dark:bg-stone-800 dark:text-stone-200"
              />
            </div>
          </div>

          {/* List Audit Log */}
          <div className="overflow-hidden rounded-2xl border border-stone-200/90 bg-white shadow-xs dark:border-stone-800 dark:bg-stone-900">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="border-b border-stone-200/80 bg-stone-50/70 font-semibold text-stone-600 dark:border-stone-800 dark:bg-stone-800/40 dark:text-stone-300">
                  <tr>
                    <th className="py-3 px-4">Waktu</th>
                    <th className="py-3 px-3">Pelaku</th>
                    <th className="py-3 px-3">Aksi</th>
                    <th className="py-3 px-3">Tabel / ID</th>
                    <th className="py-3 px-4">Detail Perubahan</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-stone-100 dark:divide-stone-800/60 text-stone-800 dark:text-stone-200">
                  {filteredAuditLogs.map((log) => (
                    <tr key={log.id} className="hover:bg-stone-50/70 dark:hover:bg-stone-800/30">
                      <td className="py-3 px-4 font-mono text-stone-500 whitespace-nowrap">
                        {formatDateTimeIndo(log.dibuat_pada)}
                      </td>
                      <td className="py-3 px-3">
                        <div className="font-semibold text-stone-900 dark:text-stone-100">{log.pelaku_nama || 'Sistem / Webhook'}</div>
                        <div className="text-[10px] text-stone-400 capitalize">{log.peran || 'System'}</div>
                      </td>
                      <td className="py-3 px-3">
                        <span className="font-mono font-medium rounded-md bg-stone-100 px-2 py-0.5 text-stone-800 dark:bg-stone-800 dark:text-stone-200">
                          {log.aksi}
                        </span>
                      </td>
                      <td className="py-3 px-3 font-mono text-[11px] text-stone-500">
                        {log.tabel}:{log.data_id}
                      </td>
                      <td className="py-3 px-4 font-mono text-[11px]">
                        {log.sesudah && (
                          <span className="text-emerald-700 dark:text-emerald-400">
                            {JSON.stringify(log.sesudah)}
                          </span>
                        )}
                        {log.sebelum && (
                          <div className="text-stone-400 text-[10px]">
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
        <div className="max-w-2xl rounded-2xl border border-stone-200/90 bg-white p-6 shadow-xs dark:border-stone-800 dark:bg-stone-900 space-y-4 animate-in fade-in duration-200">
          <div>
            <h3 className="text-base font-bold text-stone-900 dark:text-stone-100 flex items-center gap-2">
              <UserCog className="h-5 w-5 text-emerald-600" />
              Pengaturan Hak Akses & Peran Akun (BR-10)
            </h3>
            <p className="mt-1 text-xs text-stone-500">
              Peran akun hanya bisa diubah Pemilik. Pemilik tidak bisa mengubah peran akunnya sendiri.
            </p>
          </div>

          {roleError && (
            <div className="rounded-xl border border-red-200 bg-red-50 p-3 text-xs text-red-700 dark:bg-red-950/30 dark:text-red-300">
              {roleError}
            </div>
          )}

          {roleSuccess && (
            <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-3 text-xs text-emerald-700 dark:bg-emerald-950/30 dark:text-emerald-300">
              {roleSuccess}
            </div>
          )}

          <form onSubmit={handleUpdateRole} className="space-y-4 text-xs pt-2">
            <div>
              <label className="block text-stone-500 mb-1">Pilih Pengguna Sasaran</label>
              <select
                required
                value={targetUserId}
                onChange={(e) => setTargetUserId(e.target.value)}
                className="w-full rounded-xl border border-stone-200 p-2.5 text-xs text-stone-900 dark:border-stone-700 dark:bg-stone-800 dark:text-stone-100"
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
              <label className="block text-stone-500 mb-1">Pilih Peran Baru</label>
              <select
                value={newRole}
                onChange={(e) => setNewRole(e.target.value as UserRole)}
                className="w-full rounded-xl border border-stone-200 p-2.5 text-xs text-stone-900 dark:border-stone-700 dark:bg-stone-800 dark:text-stone-100"
              >
                <option value="pengelola">Pengelola (Staf Operasional)</option>
                <option value="penyewa">Penyewa (Penghuni)</option>
                <option value="pemilik">Pemilik (Owner Tambahan)</option>
              </select>
            </div>

            <button
              type="submit"
              className="rounded-xl bg-stone-900 px-4 py-2 text-xs font-semibold text-white hover:bg-emerald-700 dark:bg-stone-100 dark:text-stone-900 transition-colors"
            >
              Simpan Perubahan Peran
            </button>
          </form>
        </div>
      )}

    </div>
  );
}
