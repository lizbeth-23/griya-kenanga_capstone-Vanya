'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useGriyaStore } from '@/lib/use-store';
import { formatRupiah, formatDateIndo, maskNIK } from '@/lib/formatters';
import { 
  Building2, Users, AlertCircle, Clock, CheckCircle2, 
  ArrowUpRight, Receipt, Wrench, ShieldAlert, KeyRound, AlertTriangle, FileText
} from 'lucide-react';
import { REFERENCE_DATE } from '@/lib/store';
import LandingHero from '@/components/LandingHero';

export default function HomePage() {
  const { currentUser, state, store } = useGriyaStore();
  const [payModalInvoiceId, setPayModalInvoiceId] = useState<string | null>(null);
  const [payAmount, setPayAmount] = useState<number>(0);
  const [payMethod, setPayMethod] = useState<'tunai' | 'transfer' | 'mayar'>('transfer');
  const [payProofPath, setPayProofPath] = useState<string>('/uploads/bukti/transfer_manual.jpg');
  const [payError, setPayError] = useState<string>('');
  const [paySuccess, setPaySuccess] = useState<string>('');

  // JIKA BELUM LOGIN: TAMPILKAN HALAMAN AWAL (LANDING HERO DENGAN BUTTON MASUK/DAFTAR)
  if (!currentUser) {
    return (
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <LandingHero />
      </div>
    );
  }

  const isStaff = currentUser.peran === 'pengelola' || currentUser.peran === 'pemilik';

  // --- DATA HITUNGAN BERANDA OPERASIONAL ---
  const eligibleUnits = state.units.filter(u => u.status !== 'nonaktif');
  const occupiedUnitsCount = state.contracts.filter(c => c.status === 'aktif').length; // 19
  const totalEligibleCount = eligibleUnits.length; // 23

  // Tagihan Oktober 2026
  const oktInvoices = state.invoices.filter(i => i.periode === '2026-10-01');
  const oktLunasCount = oktInvoices.filter(i => i.status === 'lunas').length; // 13
  const totalOktInvoices = oktInvoices.length; // 19

  // Tagihan lewat jatuh tempo (jatuh tempo 10 Okt 2026, tanggal acuan 15 Okt 2026)
  const overdueInvoices = state.invoices.filter(i => {
    if (i.status === 'lunas' || i.status === 'dibatalkan') return false;
    return i.jatuh_tempo < REFERENCE_DATE;
  }); // 7 tagihan

  // Laporan kerusakan terbuka (dilaporkan, diproses, menunggu_persetujuan)
  const openDamageReports = state.damageReports.filter(r => 
    ['dilaporkan', 'diproses', 'menunggu_persetujuan'].includes(r.status)
  ); // 5 laporan

  // Kontrak perlu tindakan: berakhir dalam 30 hari (31 Okt) atau draf yang butuh verifikasi
  const actionRequiredContracts = state.contracts.filter(c => {
    if (c.status === 'aktif' && c.tanggal_selesai <= '2026-10-31') return true;
    if (c.status === 'draf') return true;
    return false;
  });

  // --- DATA UNTUK PENYEWA ---
  const myContract = state.contracts.find(c => c.penyewa_id === currentUser.id && c.status === 'aktif');
  const myUnit = myContract ? state.units.find(u => u.id === myContract.unit_id) : null;
  const myInvoices = state.invoices.filter(i => myContract && i.kontrak_id === myContract.id);
  const myUnpaidInvoice = myInvoices.find(i => i.status !== 'lunas' && i.status !== 'dibatalkan');
  const myIdentity = state.identities.find(i => i.penyewa_id === currentUser.id);
  const myDamageReports = state.damageReports.filter(r => r.pelapor_id === currentUser.id);

  const handleOpenPayModal = (invoiceId: string) => {
    const inv = state.invoices.find(i => i.id === invoiceId);
    if (!inv) return;

    let denda = inv.denda;
    if (REFERENCE_DATE > inv.jatuh_tempo) {
      const d1 = new Date(REFERENCE_DATE).getTime();
      const d2 = new Date(inv.jatuh_tempo).getTime();
      const diffDays = Math.max(0, Math.ceil((d1 - d2) / (1000 * 60 * 60 * 24)));
      denda = Math.min(200000, Math.max(inv.denda, diffDays * 20000));
    }
    const sisa = (inv.nominal_sewa + denda) - inv.terbayar;

    setPayModalInvoiceId(invoiceId);
    setPayAmount(sisa);
    setPayMethod(currentUser.peran === 'penyewa' ? 'mayar' : 'transfer');
    setPayError('');
    setPaySuccess('');
  };

  const handleSavePayment = () => {
    if (!payModalInvoiceId) return;
    try {
      setPayError('');
      store.recordPayment({
        tagihan_id: payModalInvoiceId,
        jumlah: payAmount,
        metode: payMethod,
        tanggal_bayar: REFERENCE_DATE,
        bukti_path: payMethod === 'transfer' ? payProofPath : undefined,
        referensi_mayar: payMethod === 'mayar' ? `MYR-${Date.now()}` : undefined
      });
      setPaySuccess('Pembayaran berhasil dicatat dan status tagihan telah diperbarui!');
      setTimeout(() => {
        setPayModalInvoiceId(null);
      }, 1000);
    } catch (err: unknown) {
      if (err instanceof Error) {
        setPayError(err.message);
      } else {
        setPayError('Gagal mencatat pembayaran');
      }
    }
  };

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      
      {/* ============================================================== */}
      {/* TAMPILAN OPERASIONAL STAF (PENGELOLA & PEMILIK)                 */}
      {/* ============================================================== */}
      {isStaff ? (
        <div className="space-y-8 animate-in fade-in duration-300">
          
          {/* Header Info */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-stone-200/80 pb-6 dark:border-stone-800">
            <div>
              <h1 className="text-2xl font-bold tracking-tight text-stone-900 dark:text-stone-100 sm:text-3xl">
                Beranda Operasional
              </h1>
              <p className="mt-1 text-sm text-stone-500 dark:text-stone-400">
                Kamis, 15 Oktober 2026 · Ringkasan aktivitas dan tugas harian Griya Kenanga Residence
              </p>
            </div>
            <div className="flex items-center gap-2">
              <span className="inline-flex items-center gap-1.5 rounded-xl border border-stone-200 bg-white px-3 py-1.5 text-xs font-medium text-stone-700 shadow-xs dark:border-stone-800 dark:bg-stone-900 dark:text-stone-300">
                <span className="h-2 w-2 rounded-full bg-emerald-500"></span>
                Login: {currentUser.nama_lengkap} ({currentUser.peran})
              </span>
            </div>
          </div>

          {/* 4 Kartu Metrik Ringkasan Operasional (Sesuai Wireframe) */}
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            
            {/* Unit Terisi */}
            <div className="rounded-2xl border border-stone-200/90 bg-white p-5 shadow-xs dark:border-stone-800/90 dark:bg-stone-900">
              <div className="flex items-center justify-between text-stone-500 dark:text-stone-400">
                <span className="text-xs font-semibold uppercase tracking-wider">Unit Terisi</span>
                <Building2 className="h-4 w-4 text-stone-400" />
              </div>
              <div className="mt-2 text-3xl font-extrabold tracking-tight text-stone-900 dark:text-stone-100">
                {occupiedUnitsCount} <span className="text-base font-normal text-stone-400">/ {totalEligibleCount}</span>
              </div>
              <p className="mt-2 text-[11px] text-stone-500 dark:text-stone-400">
                1 unit perbaikan (B-205), 1 nonaktif (A-108) tidak dihitung
              </p>
            </div>

            {/* Tagihan Oktober Lunas */}
            <div className="rounded-2xl border border-stone-200/90 bg-white p-5 shadow-xs dark:border-stone-800/90 dark:bg-stone-900">
              <div className="flex items-center justify-between text-stone-500 dark:text-stone-400">
                <span className="text-xs font-semibold uppercase tracking-wider">Tagihan Oktober Lunas</span>
                <CheckCircle2 className="h-4 w-4 text-emerald-500" />
              </div>
              <div className="mt-2 text-3xl font-extrabold tracking-tight text-stone-900 dark:text-stone-100">
                {oktLunasCount} <span className="text-base font-normal text-stone-400">/ {totalOktInvoices}</span>
              </div>
              <p className="mt-2 text-[11px] text-stone-500 dark:text-stone-400">
                Jatuh tempo 10 Oktober 2026
              </p>
            </div>

            {/* Tagihan Lewat Jatuh Tempo */}
            <div className="rounded-2xl border border-red-200/70 bg-red-50/30 p-5 shadow-xs dark:border-red-950/50 dark:bg-red-950/10">
              <div className="flex items-center justify-between text-red-600 dark:text-red-400">
                <span className="text-xs font-semibold uppercase tracking-wider">Lewat Jatuh Tempo</span>
                <AlertCircle className="h-4 w-4" />
              </div>
              <div className="mt-2 text-3xl font-extrabold tracking-tight text-red-600 dark:text-red-400">
                {overdueInvoices.length}
              </div>
              <p className="mt-2 text-[11px] text-red-700/80 dark:text-red-400/80">
                Denda Rp20.000/hari, maks Rp200.000
              </p>
            </div>

            {/* Laporan Kerusakan Terbuka */}
            <div className="rounded-2xl border border-amber-200/70 bg-amber-50/30 p-5 shadow-xs dark:border-amber-950/50 dark:bg-amber-950/10">
              <div className="flex items-center justify-between text-amber-600 dark:text-amber-400">
                <span className="text-xs font-semibold uppercase tracking-wider">Kerusakan Terbuka</span>
                <Wrench className="h-4 w-4" />
              </div>
              <div className="mt-2 text-3xl font-extrabold tracking-tight text-amber-600 dark:text-amber-400">
                {openDamageReports.length}
              </div>
              <p className="mt-2 text-[11px] text-amber-700/80 dark:text-amber-400/80">
                1 menunggu persetujuan Pemilik (LK-0010)
              </p>
            </div>

          </div>

          {/* Grid Konten 2 Kolom: Kiri (Tagihan Overdue), Kanan (Kerusakan & Kontrak Perlu Tindakan) */}
          <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
            
            {/* Kolom Kiri: Tabel Tagihan Lewat Jatuh Tempo */}
            <div className="lg:col-span-2 space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-base font-semibold text-stone-900 dark:text-stone-100 flex items-center gap-2">
                    <AlertTriangle className="h-4 w-4 text-red-500" />
                    Tagihan Lewat Jatuh Tempo ({overdueInvoices.length})
                  </h2>
                  <p className="text-xs text-stone-500">
                    Per 15 Oktober 2026, denda otomatis terakumulasi
                  </p>
                </div>
                <Link
                  href="/tagihan"
                  className="text-xs font-medium text-emerald-600 hover:text-emerald-700 dark:text-emerald-400 flex items-center gap-1"
                >
                  Lihat Semua Tagihan &rarr;
                </Link>
              </div>

              <div className="overflow-hidden rounded-2xl border border-stone-200/90 bg-white shadow-xs dark:border-stone-800 dark:bg-stone-900">
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead className="border-b border-stone-200/80 bg-stone-50/70 font-semibold text-stone-600 dark:border-stone-800 dark:bg-stone-800/40 dark:text-stone-300">
                      <tr>
                        <th className="py-3 px-3.5">Nomor</th>
                        <th className="py-3 px-3">Unit</th>
                        <th className="py-3 px-3">Penyewa</th>
                        <th className="py-3 px-3">Sisa + Denda Hari Ini</th>
                        <th className="py-3 px-3">Status</th>
                        <th className="py-3 px-3 text-right">Aksi</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-stone-100 dark:divide-stone-800/60 text-stone-800 dark:text-stone-200">
                      {overdueInvoices.map((inv) => {
                        const contract = state.contracts.find(c => c.id === inv.kontrak_id);
                        const unit = contract ? state.units.find(u => u.id === contract.unit_id) : null;
                        const tenant = contract ? state.profiles.find(p => p.id === contract.penyewa_id) : null;
                        
                        // Hitung denda real-time per 15 Okt
                        let denda = inv.denda;
                        if (REFERENCE_DATE > inv.jatuh_tempo) {
                          const d1 = new Date(REFERENCE_DATE).getTime();
                          const d2 = new Date(inv.jatuh_tempo).getTime();
                          const diffDays = Math.max(0, Math.ceil((d1 - d2) / (1000 * 60 * 60 * 24)));
                          denda = Math.min(200000, Math.max(inv.denda, diffDays * 20000));
                        }
                        const sisa = (inv.nominal_sewa + denda) - inv.terbayar;

                        return (
                          <tr key={inv.id} className="hover:bg-stone-50/80 dark:hover:bg-stone-800/30 transition-colors">
                            <td className="py-3 px-3.5 font-mono font-medium text-stone-900 dark:text-stone-100">
                              {inv.nomor}
                            </td>
                            <td className="py-3 px-3 font-semibold text-stone-900 dark:text-stone-100">
                              {unit?.kode || '-'}
                            </td>
                            <td className="py-3 px-3 font-medium">
                              {tenant?.nama_lengkap || '-'}
                            </td>
                            <td className="py-3 px-3">
                              <div className="font-semibold text-stone-900 dark:text-stone-100">
                                {formatRupiah(sisa)}
                              </div>
                              <div className="text-[10px] text-red-600 dark:text-red-400">
                                denda {formatRupiah(denda)}
                              </div>
                            </td>
                            <td className="py-3 px-3">
                              <span className={`inline-flex rounded-full px-2 py-0.5 text-[10px] font-medium ${
                                inv.status === 'sebagian'
                                  ? 'bg-amber-100 text-amber-800 dark:bg-amber-950/40 dark:text-amber-300'
                                  : 'bg-red-100 text-red-800 dark:bg-red-950/40 dark:text-red-300'
                              }`}>
                                {inv.status === 'sebagian' ? 'Sebagian' : 'Belum Bayar'}
                              </span>
                            </td>
                            <td className="py-3 px-3 text-right">
                              <button
                                onClick={() => handleOpenPayModal(inv.id)}
                                className="rounded-lg bg-stone-900 px-2.5 py-1 text-xs font-semibold text-white hover:bg-emerald-700 dark:bg-stone-100 dark:text-stone-900 dark:hover:bg-emerald-400 transition-colors"
                              >
                                Catat bayar
                              </button>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>

            {/* Kolom Kanan: Laporan Terbuka & Kontrak Perlu Tindakan */}
            <div className="space-y-6">
              
              {/* Laporan Kerusakan Terbuka */}
              <div className="rounded-2xl border border-stone-200/90 bg-white p-5 shadow-xs dark:border-stone-800 dark:bg-stone-900">
                <div className="flex items-center justify-between pb-3 border-b border-stone-100 dark:border-stone-800">
                  <h3 className="text-sm font-semibold text-stone-900 dark:text-stone-100 flex items-center gap-2">
                    <Wrench className="h-4 w-4 text-stone-500" />
                    Laporan Kerusakan Terbuka
                  </h3>
                  <Link href="/kerusakan" className="text-[11px] text-emerald-600 hover:underline">
                    Lihat Semua
                  </Link>
                </div>
                <div className="mt-3 space-y-3">
                  {openDamageReports.slice(0, 5).map((rep) => {
                    const unit = state.units.find(u => u.id === rep.unit_id);
                    return (
                      <Link
                        key={rep.id}
                        href="/kerusakan"
                        className="block rounded-xl border border-stone-100 p-2.5 hover:border-stone-200 hover:bg-stone-50/60 dark:border-stone-800 dark:hover:bg-stone-800/40 transition-all"
                      >
                        <div className="flex items-center justify-between text-xs">
                          <span className="font-mono text-[11px] text-stone-500">{rep.nomor}</span>
                          <span className={`rounded-md px-1.5 py-0.5 text-[10px] font-medium capitalize ${
                            rep.status === 'menunggu_persetujuan'
                              ? 'bg-amber-100 text-amber-800 dark:bg-amber-950/40 dark:text-amber-300'
                              : rep.status === 'diproses'
                              ? 'bg-blue-100 text-blue-800 dark:bg-blue-950/40 dark:text-blue-300'
                              : 'bg-stone-100 text-stone-700 dark:bg-stone-800 dark:text-stone-300'
                          }`}>
                            {rep.status.replace('_', ' ')}
                          </span>
                        </div>
                        <div className="mt-1 font-medium text-xs text-stone-900 dark:text-stone-100">
                          {unit?.kode} · {rep.judul}
                        </div>
                      </Link>
                    );
                  })}
                </div>
              </div>

              {/* Kontrak Perlu Tindakan */}
              <div className="rounded-2xl border border-stone-200/90 bg-white p-5 shadow-xs dark:border-stone-800 dark:bg-stone-900">
                <div className="flex items-center justify-between pb-3 border-b border-stone-100 dark:border-stone-800">
                  <h3 className="text-sm font-semibold text-stone-900 dark:text-stone-100 flex items-center gap-2">
                    <KeyRound className="h-4 w-4 text-stone-500" />
                    Kontrak Perlu Tindakan
                  </h3>
                  <Link href="/kontrak" className="text-[11px] text-emerald-600 hover:underline">
                    Kelola
                  </Link>
                </div>
                <div className="mt-3 space-y-3">
                  {actionRequiredContracts.slice(0, 5).map((ktr) => {
                    const unit = state.units.find(u => u.id === ktr.unit_id);
                    const tenant = state.profiles.find(p => p.id === ktr.penyewa_id);
                    const isDraft = ktr.status === 'draf';
                    return (
                      <div
                        key={ktr.id}
                        className="rounded-xl border border-stone-100 p-2.5 text-xs dark:border-stone-800"
                      >
                        <div className="flex items-center justify-between font-medium text-stone-900 dark:text-stone-100">
                          <span>{ktr.nomor} · {unit?.kode} {isDraft ? '(draf)' : ''}</span>
                        </div>
                        <div className="text-[11px] text-stone-500">{tenant?.nama_lengkap}</div>
                        <div className="mt-1 text-[11px] font-semibold text-amber-700 dark:text-amber-400">
                          {isDraft ? (
                            ktr.id === 'ktr-0022' ? 'identitas belum diverifikasi' : 'menunggu kontrak lama selesai'
                          ) : (
                            `Berakhir ${formatDateIndo(ktr.tanggal_selesai)}`
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

            </div>

          </div>

          <div className="text-center pt-2">
            <p className="text-xs text-stone-400 italic">
              Pengelola tidak melihat angka pendapatan. Kartu dan tabel di Beranda hanya berisi jumlah dan daftar kerja.
            </p>
          </div>
        </div>
      ) : (
        /* ============================================================== */
        /* TAMPILAN DASHBOARD KHUSUS PENYEWA (Dimas, Hana, Fajar, dll)    */
        /* ============================================================== */
        <div className="space-y-8 animate-in fade-in duration-300">
          
          {/* Header Sambutan */}
          <div className="border-b border-stone-200/80 pb-6 dark:border-stone-800">
            <h1 className="text-2xl font-bold tracking-tight text-stone-900 dark:text-stone-100 sm:text-3xl">
              Halo, {currentUser.nama_lengkap}!
            </h1>
            <p className="mt-1 text-sm text-stone-500 dark:text-stone-400">
              Selamat datang di portal hunian Griya Kenanga Residence. Pantau kontrak, tagihan, dan ajukan perbaikan unit dengan mudah.
            </p>
          </div>

          {/* Kartu Status Kontrak & Unit */}
          <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
            
            {/* Info Unit & Kontrak */}
            <div className="rounded-2xl border border-stone-200/90 bg-white p-6 shadow-xs dark:border-stone-800 dark:bg-stone-900 md:col-span-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold uppercase tracking-wider text-stone-400">Unit Sewa Anda</span>
                <span className="rounded-full bg-emerald-100 px-2.5 py-0.5 text-xs font-semibold text-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-300">
                  {myContract?.status === 'aktif' ? 'Kontrak Aktif' : 'Belum Ada Kontrak Aktif'}
                </span>
              </div>
              
              {myContract && myUnit ? (
                <div className="mt-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div>
                    <div className="text-3xl font-extrabold text-stone-900 dark:text-stone-100">
                      Unit {myUnit.kode}
                    </div>
                    <div className="text-xs text-stone-500 mt-1 capitalize">
                      Lantai {myUnit.lantai} · Tipe {myUnit.tipe} · {myUnit.luas_m2} m²
                    </div>
                    <div className="mt-3 text-xs text-stone-600 dark:text-stone-300">
                      Nomor Kontrak: <span className="font-mono font-medium">{myContract.nomor}</span>
                      <br />
                      Masa Sewa: {formatDateIndo(myContract.tanggal_mulai)} s.d {formatDateIndo(myContract.tanggal_selesai)}
                    </div>
                  </div>
                  <div className="text-right sm:border-l sm:pl-6 border-stone-100 dark:border-stone-800">
                    <span className="text-xs text-stone-400">Biaya Sewa Terkunci</span>
                    <div className="text-xl font-bold text-emerald-700 dark:text-emerald-400">
                      {formatRupiah(myContract.harga_sewa_bulanan)}
                      <span className="text-xs font-normal text-stone-400">/bln</span>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="mt-4 text-sm text-stone-500">
                  Anda belum memiliki kontrak aktif. Silakan hubungi staf pengelola di lokasi untuk pemesanan unit.
                </div>
              )}
            </div>

            {/* Status Verifikasi Identitas */}
            <div className="rounded-2xl border border-stone-200/90 bg-white p-6 shadow-xs dark:border-stone-800 dark:bg-stone-900">
              <span className="text-xs font-semibold uppercase tracking-wider text-stone-400">Identitas KTP</span>
              <div className="mt-4">
                {myIdentity ? (
                  <div className="space-y-3">
                    <div className="flex items-center gap-2">
                      <span className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-semibold capitalize ${
                        myIdentity.status_verifikasi === 'terverifikasi'
                          ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-300'
                          : myIdentity.status_verifikasi === 'ditolak'
                          ? 'bg-red-100 text-red-800 dark:bg-red-950/40 dark:text-red-300'
                          : 'bg-amber-100 text-amber-800 dark:bg-amber-950/40 dark:text-amber-300'
                      }`}>
                        {myIdentity.status_verifikasi}
                      </span>
                    </div>
                    <div className="text-xs text-stone-600 dark:text-stone-300">
                      NIK: <span className="font-mono">{maskNIK(myIdentity.nik)}</span>
                      <br />
                      Kontak Darurat: {myIdentity.kontak_darurat_nama}
                    </div>
                    {myIdentity.alasan_tolak && (
                      <div className="rounded-lg bg-red-50 p-2 text-[11px] text-red-700 dark:bg-red-950/30 dark:text-red-300">
                        Alasan Tolak: {myIdentity.alasan_tolak}
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="text-xs text-stone-500 space-y-2">
                    <p>Identitas KTP belum diunggah. Diperlukan untuk aktivasi kontrak sewa.</p>
                  </div>
                )}
              </div>
            </div>

          </div>

          {/* Tagihan & Pembayaran Online */}
          <div className="rounded-2xl border border-stone-200/90 bg-white p-6 shadow-xs dark:border-stone-800 dark:bg-stone-900">
            <div className="flex items-center justify-between pb-4 border-b border-stone-100 dark:border-stone-800">
              <h2 className="text-base font-semibold text-stone-900 dark:text-stone-100 flex items-center gap-2">
                <Receipt className="h-5 w-5 text-emerald-600" />
                Tagihan Sewa Anda
              </h2>
            </div>

            {myUnpaidInvoice ? (
              <div className="mt-5 rounded-2xl border border-amber-200 bg-amber-50/30 p-5 dark:border-amber-900/40 dark:bg-amber-950/10">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div>
                    <span className="font-mono text-xs font-semibold text-amber-800 dark:text-amber-300">
                      {myUnpaidInvoice.nomor}
                    </span>
                    <h3 className="text-lg font-bold text-stone-900 dark:text-stone-100 mt-0.5">
                      Periode {formatDateIndo(myUnpaidInvoice.periode)}
                    </h3>
                    <p className="text-xs text-stone-600 dark:text-stone-400 mt-1">
                      Jatuh tempo: <span className="font-semibold text-red-600">{formatDateIndo(myUnpaidInvoice.jatuh_tempo)}</span>
                      {myUnpaidInvoice.denda > 0 && ` (termasuk denda ${formatRupiah(myUnpaidInvoice.denda)})`}
                    </p>
                  </div>
                  <div className="flex flex-col items-start sm:items-end gap-2">
                    <div className="text-xs text-stone-500">Sisa Kewajiban</div>
                    <div className="text-2xl font-extrabold text-stone-900 dark:text-stone-100">
                      {formatRupiah((myUnpaidInvoice.nominal_sewa + myUnpaidInvoice.denda) - myUnpaidInvoice.terbayar)}
                    </div>
                    <button
                      onClick={() => handleOpenPayModal(myUnpaidInvoice.id)}
                      className="rounded-xl bg-emerald-600 px-4 py-2 text-xs font-semibold text-white shadow-xs hover:bg-emerald-700 transition-colors"
                    >
                      Bayar Online (Mayar) &rarr;
                    </button>
                  </div>
                </div>
              </div>
            ) : (
              <div className="py-6 text-center text-xs text-stone-500">
                <CheckCircle2 className="mx-auto h-8 w-8 text-emerald-500 mb-2" />
                Tidak ada tagihan yang tertunggak. Semua tagihan Anda saat ini sudah lunas!
              </div>
            )}
          </div>

          {/* Laporan Kerusakan Penyewa */}
          <div className="rounded-2xl border border-stone-200/90 bg-white p-6 shadow-xs dark:border-stone-800 dark:bg-stone-900">
            <div className="flex items-center justify-between pb-4 border-b border-stone-100 dark:border-stone-800">
              <div>
                <h2 className="text-base font-semibold text-stone-900 dark:text-stone-100 flex items-center gap-2">
                  <Wrench className="h-5 w-5 text-stone-600" />
                  Laporan Kerusakan Anda ({myDamageReports.length})
                </h2>
                <p className="text-xs text-stone-500">Maksimal 3 laporan terbuka dalam satu waktu (BR-11)</p>
              </div>
              <Link
                href="/kerusakan"
                className="rounded-xl bg-stone-900 px-3.5 py-1.5 text-xs font-semibold text-white dark:bg-stone-100 dark:text-stone-900"
              >
                + Buat Laporan Baru
              </Link>
            </div>

            <div className="mt-4 grid gap-3">
              {myDamageReports.length > 0 ? (
                myDamageReports.map((r) => (
                  <div key={r.id} className="flex items-center justify-between rounded-xl border border-stone-100 p-3 text-xs dark:border-stone-800">
                    <div>
                      <div className="font-semibold text-stone-900 dark:text-stone-100">{r.judul}</div>
                      <div className="text-[11px] text-stone-500">Kategori: {r.kategori} · Nomor: {r.nomor}</div>
                    </div>
                    <span className="rounded-md bg-stone-100 px-2 py-0.5 text-[10px] font-medium capitalize text-stone-700 dark:bg-stone-800 dark:text-stone-300">
                      {r.status.replace('_', ' ')}
                    </span>
                  </div>
                ))
              ) : (
                <p className="text-xs text-stone-500 py-4 text-center">Belum ada laporan kerusakan yang diajukan.</p>
              )}
            </div>
          </div>

        </div>
      )}

      {/* MODAL BAYAR TAGIHAN */}
      {payModalInvoiceId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-stone-900/60 p-4 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-2xl border border-stone-200 bg-white p-6 shadow-2xl dark:border-stone-800 dark:bg-stone-900">
            <h3 className="text-base font-bold text-stone-900 dark:text-stone-100">
              {currentUser.peran === 'penyewa' ? 'Pembayaran Online Tagihan' : 'Catat Pembayaran Tagihan'}
            </h3>
            
            {payError && (
              <div className="mt-3 rounded-xl bg-red-50 p-2.5 text-xs text-red-700 dark:bg-red-950/40 dark:text-red-300">
                {payError}
              </div>
            )}

            {paySuccess && (
              <div className="mt-3 rounded-xl bg-emerald-50 p-2.5 text-xs text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300">
                {paySuccess}
              </div>
            )}

            <div className="mt-4 space-y-3 text-xs">
              <div>
                <label className="block text-stone-500 mb-1">Jumlah Bayar (Rupiah)</label>
                <input
                  type="number"
                  value={payAmount}
                  onChange={(e) => setPayAmount(Number(e.target.value))}
                  className="w-full rounded-xl border border-stone-200 p-2.5 text-sm font-semibold text-stone-900 dark:border-stone-700 dark:bg-stone-800 dark:text-stone-100"
                />
                <p className="mt-1 text-[11px] text-stone-400">
                  Minimal Rp100.000 kecuali jika melunasi sisa tagihan (BR-08).
                </p>
              </div>

              <div>
                <label className="block text-stone-500 mb-1">Metode Pembayaran</label>
                {currentUser.peran === 'penyewa' ? (
                  <div className="rounded-xl border border-stone-200 p-2.5 font-medium text-stone-800 dark:border-stone-700 dark:bg-stone-800 dark:text-stone-200">
                    Mayar (Payment Gateway Otomatis)
                  </div>
                ) : (
                  <select
                    value={payMethod}
                    onChange={(e) => setPayMethod(e.target.value as any)}
                    className="w-full rounded-xl border border-stone-200 p-2.5 text-xs text-stone-900 dark:border-stone-700 dark:bg-stone-800 dark:text-stone-100"
                  >
                    <option value="transfer">Transfer Bank (+ Lampirkan Bukti)</option>
                    <option value="tunai">Tunai di Lokasi</option>
                  </select>
                )}
              </div>

              {payMethod === 'transfer' && (
                <div>
                  <label className="block text-stone-500 mb-1">Path / Nama Foto Bukti Transfer</label>
                  <input
                    type="text"
                    value={payProofPath}
                    onChange={(e) => setPayProofPath(e.target.value)}
                    className="w-full rounded-xl border border-stone-200 p-2 text-xs font-mono dark:border-stone-700 dark:bg-stone-800 dark:text-stone-100"
                  />
                </div>
              )}
            </div>

            <div className="mt-6 flex justify-end gap-2">
              <button
                onClick={() => setPayModalInvoiceId(null)}
                className="rounded-xl border border-stone-200 px-3.5 py-1.5 text-xs font-medium text-stone-600 dark:border-stone-700 dark:text-stone-300"
              >
                Batal
              </button>
              <button
                onClick={handleSavePayment}
                className="rounded-xl bg-emerald-600 px-4 py-1.5 text-xs font-semibold text-white hover:bg-emerald-700"
              >
                Simpan Pembayaran
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
