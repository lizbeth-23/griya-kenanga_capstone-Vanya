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
import MayarQrisModal from '@/components/MayarQrisModal';
import { Invoice } from '@/lib/types';

export default function HomePage() {
  const { currentUser, state, store } = useGriyaStore();
  const [payModalInvoiceId, setPayModalInvoiceId] = useState<string | null>(null);
  const [qrisModalInvoice, setQrisModalInvoice] = useState<Invoice | null>(null);
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

    if (currentUser.peran === 'penyewa') {
      setQrisModalInvoice(inv);
      return;
    }

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
    setPayMethod('transfer');
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
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-[#DCE5D8] pb-6 dark:border-[#2C382A]">
            <div>
              <h1 className="text-2xl font-extrabold tracking-tight text-[#222520] dark:text-[#ECEAE4] sm:text-3xl">
                Beranda Operasional
              </h1>
              <p className="mt-1 text-sm text-[#5D6B58] dark:text-[#A7B8A3]">
                Kamis, 15 Oktober 2026 · Ringkasan aktivitas dan tugas harian Griya Kenanga Residence
              </p>
            </div>
            <div className="flex items-center gap-2">
              <span className="inline-flex items-center gap-2 rounded-full border border-[#DCE5D8] bg-white px-3.5 py-1.5 text-xs font-bold text-[#2D4129] shadow-2xs dark:border-[#2C382A] dark:bg-[#1E261D] dark:text-[#D5E6D2]">
                <span className="h-2 w-2 rounded-full bg-[#3B5336] animate-pulse"></span>
                Login: {currentUser.nama_lengkap} ({currentUser.peran})
              </span>
            </div>
          </div>

          {/* 4 Kartu Metrik Ringkasan Operasional (Sesuai Wireframe) */}
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            
            {/* Unit Terisi */}
            <div className="rounded-2xl border border-[#DCE5D8] bg-white p-5 shadow-xs dark:border-[#2C382A] dark:bg-[#1E261D]">
              <div className="flex items-center justify-between text-[#5D6B58] dark:text-[#A7B8A3]">
                <span className="text-xs font-bold uppercase tracking-wider">Unit Terisi</span>
                <Building2 className="h-4 w-4 text-[#3B5336] dark:text-[#95B08A]" />
              </div>
              <div className="mt-2 text-3xl font-extrabold tracking-tight text-[#222520] dark:text-[#ECEAE4]">
                {occupiedUnitsCount} <span className="text-base font-normal text-[#7F9979]">/ {totalEligibleCount}</span>
              </div>
              <p className="mt-2 text-[11px] text-[#5D6B58] dark:text-[#A7B8A3]">
                1 unit perbaikan (B-205), 1 nonaktif (A-108) tidak dihitung
              </p>
            </div>

            {/* Tagihan Oktober Lunas */}
            <div className="rounded-2xl border border-[#DCE5D8] bg-white p-5 shadow-xs dark:border-[#2C382A] dark:bg-[#1E261D]">
              <div className="flex items-center justify-between text-[#5D6B58] dark:text-[#A7B8A3]">
                <span className="text-xs font-bold uppercase tracking-wider">Tagihan Oktober Lunas</span>
                <CheckCircle2 className="h-4 w-4 text-[#3B5336] dark:text-[#95B08A]" />
              </div>
              <div className="mt-2 text-3xl font-extrabold tracking-tight text-[#222520] dark:text-[#ECEAE4]">
                {oktLunasCount} <span className="text-base font-normal text-[#7F9979]">/ {totalOktInvoices}</span>
              </div>
              <p className="mt-2 text-[11px] text-[#5D6B58] dark:text-[#A7B8A3]">
                Jatuh tempo 10 Oktober 2026
              </p>
            </div>

            {/* Tagihan Lewat Jatuh Tempo */}
            <div className="rounded-2xl border border-[#F3C5BF] bg-[#FDF0EE]/80 p-5 shadow-xs dark:border-red-950/50 dark:bg-red-950/20">
              <div className="flex items-center justify-between text-[#A63A2E] dark:text-red-400">
                <span className="text-xs font-bold uppercase tracking-wider">Lewat Jatuh Tempo</span>
                <AlertCircle className="h-4 w-4" />
              </div>
              <div className="mt-2 text-3xl font-extrabold tracking-tight text-[#A63A2E] dark:text-red-400">
                {overdueInvoices.length}
              </div>
              <p className="mt-2 text-[11px] text-[#A63A2E]/90 dark:text-red-400/90 font-medium">
                Denda Rp20.000/hari, maks Rp200.000
              </p>
            </div>

            {/* Laporan Kerusakan Terbuka */}
            <div className="rounded-2xl border border-[#F6DEB8] bg-[#FEF7EC]/80 p-5 shadow-xs dark:border-amber-950/50 dark:bg-amber-950/20">
              <div className="flex items-center justify-between text-[#9A6715] dark:text-amber-400">
                <span className="text-xs font-bold uppercase tracking-wider">Kerusakan Terbuka</span>
                <Wrench className="h-4 w-4" />
              </div>
              <div className="mt-2 text-3xl font-extrabold tracking-tight text-[#9A6715] dark:text-amber-400">
                {openDamageReports.length}
              </div>
              <p className="mt-2 text-[11px] text-[#9A6715]/90 dark:text-amber-400/90 font-medium">
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
                  <h2 className="text-base font-bold text-[#222520] dark:text-[#ECEAE4] flex items-center gap-2">
                    <AlertTriangle className="h-4 w-4 text-red-500" />
                    Tagihan Lewat Jatuh Tempo ({overdueInvoices.length})
                  </h2>
                  <p className="text-xs text-[#5D6B58] dark:text-[#A7B8A3]">
                    Per 15 Oktober 2026, denda otomatis terakumulasi
                  </p>
                </div>
                <Link
                  href="/tagihan"
                  className="text-xs font-bold text-[#3B5336] hover:text-[#2D4129] dark:text-[#95B08A] flex items-center gap-1 hover:underline"
                >
                  Lihat Semua Tagihan &rarr;
                </Link>
              </div>

              <div className="overflow-hidden rounded-2xl border border-[#DCE5D8] bg-white shadow-xs dark:border-[#2C382A] dark:bg-[#1E261D]">
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead className="border-b border-[#DCE5D8] bg-[#E8EFE5]/60 font-bold text-[#4F604A] dark:border-[#2C382A] dark:bg-[#182317] dark:text-[#D5E6D2]">
                      <tr>
                        <th className="py-3 px-3.5">Nomor</th>
                        <th className="py-3 px-3">Unit</th>
                        <th className="py-3 px-3">Penyewa</th>
                        <th className="py-3 px-3">Sisa + Denda Hari Ini</th>
                        <th className="py-3 px-3">Status</th>
                        <th className="py-3 px-3 text-right">Aksi</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#E8EFE5] dark:divide-[#2C382A]/70 text-[#222520] dark:text-[#ECEAE4]">
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
                          <tr key={inv.id} className="hover:bg-[#F4F7F2] dark:hover:bg-[#253023]/40 transition-colors">
                            <td className="py-3 px-3.5 font-mono font-medium text-[#222520] dark:text-[#ECEAE4]">
                              {inv.nomor}
                            </td>
                            <td className="py-3 px-3 font-bold text-[#222520] dark:text-[#ECEAE4]">
                              {unit?.kode || '-'}
                            </td>
                            <td className="py-3 px-3 font-medium">
                              {tenant?.nama_lengkap || '-'}
                            </td>
                            <td className="py-3 px-3">
                              <div className="font-bold text-[#222520] dark:text-[#ECEAE4]">
                                {formatRupiah(sisa)}
                              </div>
                              <div className="text-[10px] text-red-600 dark:text-red-400 font-medium">
                                denda {formatRupiah(denda)}
                              </div>
                            </td>
                            <td className="py-3 px-3">
                              <span className={`inline-flex rounded-full px-2 py-0.5 text-[10px] font-bold ${
                                inv.status === 'sebagian'
                                  ? 'bg-[#FEF7EC] text-[#9A6715] border border-[#F6DEB8]'
                                  : 'bg-[#FDF0EE] text-[#A63A2E] border border-[#F3C5BF]'
                              }`}>
                                {inv.status === 'sebagian' ? 'Sebagian' : 'Belum Bayar'}
                              </span>
                            </td>
                            <td className="py-3 px-3 text-right">
                              <button
                                onClick={() => handleOpenPayModal(inv.id)}
                                className="rounded-full bg-[#3B5336] px-3.5 py-1 text-xs font-bold text-white hover:bg-[#2D4129] active:scale-95 transition-all shadow-2xs"
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
              <div className="rounded-2xl border border-[#DCE5D8] bg-white p-5 shadow-xs dark:border-[#2C382A] dark:bg-[#1E261D]">
                <div className="flex items-center justify-between pb-3 border-b border-[#E8EFE5] dark:border-[#2C382A]">
                  <h3 className="text-sm font-bold text-[#222520] dark:text-[#ECEAE4] flex items-center gap-2">
                    <Wrench className="h-4 w-4 text-[#3B5336] dark:text-[#95B08A]" />
                    Laporan Kerusakan Terbuka
                  </h3>
                  <Link href="/kerusakan" className="text-[11px] font-bold text-[#3B5336] dark:text-[#95B08A] hover:underline">
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
                        className="block rounded-xl border border-[#E8EFE5] p-2.5 hover:border-[#95B08A] hover:bg-[#F4F7F2] dark:border-[#2C382A] dark:hover:bg-[#253023]/40 transition-all"
                      >
                        <div className="flex items-center justify-between text-xs">
                          <span className="font-mono text-[11px] text-[#5D6B58] dark:text-[#A7B8A3]">{rep.nomor}</span>
                          <span className={`rounded-full px-2 py-0.5 text-[10px] font-bold capitalize ${
                            rep.status === 'menunggu_persetujuan'
                              ? 'bg-[#FEF7EC] text-[#9A6715] border border-[#F6DEB8]'
                              : rep.status === 'diproses'
                              ? 'bg-[#EBF3F5] text-[#265F6B] border border-[#C5DFE4]'
                              : 'bg-[#E8EFE5] text-[#2D4129] border border-[#95B08A]/40'
                          }`}>
                            {rep.status.replace('_', ' ')}
                          </span>
                        </div>
                        <div className="mt-1 font-bold text-xs text-[#222520] dark:text-[#ECEAE4]">
                          {unit?.kode} · {rep.judul}
                        </div>
                      </Link>
                    );
                  })}
                </div>
              </div>

              {/* Kontrak Perlu Tindakan */}
              <div className="rounded-2xl border border-[#DCE5D8] bg-white p-5 shadow-xs dark:border-[#2C382A] dark:bg-[#1E261D]">
                <div className="flex items-center justify-between pb-3 border-b border-[#E8EFE5] dark:border-[#2C382A]">
                  <h3 className="text-sm font-bold text-[#222520] dark:text-[#ECEAE4] flex items-center gap-2">
                    <KeyRound className="h-4 w-4 text-[#3B5336] dark:text-[#95B08A]" />
                    Kontrak Perlu Tindakan
                  </h3>
                  <Link href="/kontrak" className="text-[11px] font-bold text-[#3B5336] dark:text-[#95B08A] hover:underline">
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
                        className="rounded-xl border border-[#E8EFE5] p-2.5 text-xs dark:border-[#2C382A] hover:bg-[#F4F7F2] dark:hover:bg-[#253023]/40 transition-colors"
                      >
                        <div className="flex items-center justify-between font-bold text-[#222520] dark:text-[#ECEAE4]">
                          <span>{ktr.nomor} · {unit?.kode} {isDraft ? '(draf)' : ''}</span>
                        </div>
                        <div className="text-[11px] text-[#5D6B58] dark:text-[#A7B8A3]">{tenant?.nama_lengkap}</div>
                        <div className="mt-1 text-[11px] font-bold text-amber-700 dark:text-amber-400">
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
            <p className="text-xs text-[#5D6B58] dark:text-[#A7B8A3] italic">
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
          <div className="border-b border-[#DCE5D8] pb-6 dark:border-[#2C382A]">
            <h1 className="text-2xl font-extrabold tracking-tight text-[#222520] dark:text-[#ECEAE4] sm:text-3xl">
              Halo, {currentUser.nama_lengkap}!
            </h1>
            <p className="mt-1 text-sm text-[#5D6B58] dark:text-[#A7B8A3]">
              Selamat datang di portal hunian Griya Kenanga Residence. Pantau kontrak, tagihan, dan ajukan perbaikan unit dengan mudah.
            </p>
          </div>

          {/* Kartu Status Kontrak & Unit */}
          <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
            
            {/* Info Unit & Kontrak */}
            <div className="rounded-2xl border border-[#DCE5D8] bg-white p-6 shadow-xs dark:border-[#2C382A] dark:bg-[#1E261D] md:col-span-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-wider text-[#5D6B58] dark:text-[#A7B8A3]">Unit Sewa Anda</span>
                <span className={`rounded-full px-3 py-1 text-xs font-bold ${
                  myContract?.status === 'aktif' 
                    ? 'bg-[#E8EFE5] text-[#2D4129] border border-[#95B08A]/40 dark:bg-[#172216] dark:text-[#95B08A]' 
                    : 'bg-[#FEF7EC] text-[#9A6715] border border-[#F6DEB8]'
                }`}>
                  {myContract?.status === 'aktif' ? 'Kontrak Aktif' : 'Belum Ada Kontrak Aktif'}
                </span>
              </div>
              
              {myContract && myUnit ? (
                <div className="mt-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div>
                    <div className="text-3xl font-extrabold text-[#222520] dark:text-[#ECEAE4]">
                      Unit {myUnit.kode}
                    </div>
                    <div className="text-xs text-[#5D6B58] dark:text-[#A7B8A3] mt-1 capitalize font-medium">
                      Lantai {myUnit.lantai} · Tipe {myUnit.tipe} · {myUnit.luas_m2} m²
                    </div>
                    <div className="mt-3 text-xs text-[#4F604A] dark:text-[#D5E6D2]">
                      Nomor Kontrak: <span className="font-mono font-bold">{myContract.nomor}</span>
                      <br />
                      Masa Sewa: {formatDateIndo(myContract.tanggal_mulai)} s.d {formatDateIndo(myContract.tanggal_selesai)}
                    </div>
                  </div>
                  <div className="text-left sm:text-right sm:border-l sm:pl-6 border-[#E8EFE5] dark:border-[#2C382A]">
                    <span className="text-xs font-medium text-[#5D6B58] dark:text-[#A7B8A3]">Biaya Sewa Terkunci</span>
                    <div className="text-2xl font-extrabold text-[#3B5336] dark:text-[#95B08A]">
                      {formatRupiah(myContract.harga_sewa_bulanan)}
                      <span className="text-xs font-normal text-[#5D6B58]">/bln</span>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="mt-4 text-sm text-[#5D6B58] dark:text-[#A7B8A3]">
                  Anda belum memiliki kontrak aktif. Silakan hubungi staf pengelola di lokasi untuk pemesanan unit.
                </div>
              )}
            </div>

            {/* Status Verifikasi Identitas */}
            <div className="rounded-2xl border border-[#DCE5D8] bg-white p-6 shadow-xs dark:border-[#2C382A] dark:bg-[#1E261D]">
              <span className="text-xs font-bold uppercase tracking-wider text-[#5D6B58] dark:text-[#A7B8A3]">Identitas KTP</span>
              <div className="mt-4">
                {myIdentity ? (
                  <div className="space-y-3">
                    <div className="flex items-center gap-2">
                      <span className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-bold capitalize ${
                        myIdentity.status_verifikasi === 'terverifikasi'
                          ? 'bg-[#E8EFE5] text-[#2D4129] border border-[#95B08A]/40'
                          : myIdentity.status_verifikasi === 'ditolak'
                          ? 'bg-[#FDF0EE] text-[#A63A2E] border border-[#F3C5BF]'
                          : 'bg-[#FEF7EC] text-[#9A6715] border border-[#F6DEB8]'
                      }`}>
                        {myIdentity.status_verifikasi}
                      </span>
                    </div>
                    <div className="text-xs text-[#222520] dark:text-[#ECEAE4]">
                      NIK: <span className="font-mono font-bold">{maskNIK(myIdentity.nik)}</span>
                      <br />
                      Kontak Darurat: {myIdentity.kontak_darurat_nama}
                    </div>
                    {myIdentity.alasan_tolak && (
                      <div className="rounded-xl bg-[#FDF0EE] border border-[#F3C5BF] p-2 text-[11px] text-[#A63A2E]">
                        Alasan Tolak: {myIdentity.alasan_tolak}
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="text-xs text-[#5D6B58] space-y-2">
                    <p>Identitas KTP belum diunggah. Diperlukan untuk aktivasi kontrak sewa.</p>
                  </div>
                )}
              </div>
            </div>

          </div>

          {/* Tagihan & Pembayaran Online */}
          <div className="rounded-2xl border border-[#DCE5D8] bg-white p-6 shadow-xs dark:border-[#2C382A] dark:bg-[#1E261D]">
            <div className="flex items-center justify-between pb-4 border-b border-[#E8EFE5] dark:border-[#2C382A]">
              <h2 className="text-base font-bold text-[#222520] dark:text-[#ECEAE4] flex items-center gap-2">
                <Receipt className="h-5 w-5 text-[#3B5336] dark:text-[#95B08A]" />
                Tagihan Sewa Anda
              </h2>
            </div>

            {myUnpaidInvoice ? (
              <div className="mt-5 rounded-2xl border border-[#F6DEB8] bg-[#FEF7EC]/80 p-5 dark:border-amber-950/40 dark:bg-amber-950/20">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div>
                    <span className="font-mono text-xs font-bold text-[#9A6715] dark:text-amber-300">
                      {myUnpaidInvoice.nomor}
                    </span>
                    <h3 className="text-lg font-extrabold text-[#222520] dark:text-[#ECEAE4] mt-0.5">
                      Periode {formatDateIndo(myUnpaidInvoice.periode)}
                    </h3>
                    <p className="text-xs text-[#5D6B58] dark:text-[#A7B8A3] mt-1">
                      Jatuh tempo: <span className="font-bold text-red-600">{formatDateIndo(myUnpaidInvoice.jatuh_tempo)}</span>
                      {myUnpaidInvoice.denda > 0 && ` (termasuk denda ${formatRupiah(myUnpaidInvoice.denda)})`}
                    </p>
                  </div>
                  <div className="flex flex-col items-start sm:items-end gap-2">
                    <div className="text-xs font-medium text-[#5D6B58]">Sisa Kewajiban</div>
                    <div className="text-2xl font-extrabold text-[#222520] dark:text-[#ECEAE4]">
                      {formatRupiah((myUnpaidInvoice.nominal_sewa + myUnpaidInvoice.denda) - myUnpaidInvoice.terbayar)}
                    </div>
                    <button
                      onClick={() => handleOpenPayModal(myUnpaidInvoice.id)}
                      className="rounded-full bg-[#3B5336] px-5 py-2 text-xs font-bold text-white shadow-md hover:bg-[#2D4129] active:scale-95 transition-all"
                    >
                      Bayar Online (Mayar) &rarr;
                    </button>
                  </div>
                </div>
              </div>
            ) : (
              <div className="py-6 text-center text-xs text-[#5D6B58] dark:text-[#A7B8A3]">
                <CheckCircle2 className="mx-auto h-8 w-8 text-[#3B5336] dark:text-[#95B08A] mb-2" />
                Tidak ada tagihan yang tertunggak. Semua tagihan Anda saat ini sudah lunas!
              </div>
            )}
          </div>

          {/* Laporan Kerusakan Penyewa */}
          <div className="rounded-2xl border border-[#DCE5D8] bg-white p-6 shadow-xs dark:border-[#2C382A] dark:bg-[#1E261D]">
            <div className="flex items-center justify-between pb-4 border-b border-[#E8EFE5] dark:border-[#2C382A]">
              <div>
                <h2 className="text-base font-bold text-[#222520] dark:text-[#ECEAE4] flex items-center gap-2">
                  <Wrench className="h-5 w-5 text-[#3B5336] dark:text-[#95B08A]" />
                  Laporan Kerusakan Anda ({myDamageReports.length})
                </h2>
                <p className="text-xs text-[#5D6B58] dark:text-[#A7B8A3]">Maksimal 3 laporan terbuka dalam satu waktu (BR-11)</p>
              </div>
              <Link
                href="/kerusakan"
                className="rounded-full bg-[#3B5336] px-4 py-2 text-xs font-bold text-white hover:bg-[#2D4129] active:scale-95 transition-all shadow-2xs"
              >
                + Buat Laporan Baru
              </Link>
            </div>

            <div className="mt-4 grid gap-3">
              {myDamageReports.length > 0 ? (
                myDamageReports.map((r) => (
                  <div key={r.id} className="flex items-center justify-between rounded-xl border border-[#E8EFE5] p-3 text-xs dark:border-[#2C382A] hover:bg-[#F4F7F2] dark:hover:bg-[#253023]/40 transition-colors">
                    <div>
                      <div className="font-bold text-[#222520] dark:text-[#ECEAE4]">{r.judul}</div>
                      <div className="text-[11px] text-[#5D6B58] dark:text-[#A7B8A3]">Kategori: {r.kategori} · Nomor: {r.nomor}</div>
                    </div>
                    <span className="rounded-full bg-[#E8EFE5] px-2.5 py-0.5 text-[10px] font-bold capitalize text-[#2D4129] border border-[#95B08A]/40 dark:bg-[#1C261A] dark:text-[#D5E6D2]">
                      {r.status.replace('_', ' ')}
                    </span>
                  </div>
                ))
              ) : (
                <p className="text-xs text-[#5D6B58] dark:text-[#A7B8A3] py-4 text-center">Belum ada laporan kerusakan yang diajukan.</p>
              )}
            </div>
          </div>

        </div>
      )}

      {/* MODAL BAYAR TAGIHAN */}
      {payModalInvoiceId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#171D16]/75 p-4 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="w-full max-w-md rounded-[28px] border border-[#DCE5D8] bg-white p-6 sm:p-7 shadow-2xl dark:border-[#2C382A] dark:bg-[#1E261D]">
            <h3 className="text-base font-extrabold text-[#222520] dark:text-[#ECEAE4]">
              {currentUser.peran === 'penyewa' ? 'Pembayaran Online Tagihan' : 'Catat Pembayaran Tagihan'}
            </h3>
            
            {payError && (
              <div className="mt-3 rounded-2xl bg-[#FDF0EE] border border-[#F3C5BF] p-3 text-xs text-[#A63A2E] dark:bg-red-950/40 dark:text-red-300">
                {payError}
              </div>
            )}

            {paySuccess && (
              <div className="mt-3 rounded-2xl bg-[#E8EFE5] border border-[#95B08A]/40 p-3 text-xs font-semibold text-[#2D4129] dark:bg-emerald-950/40 dark:text-emerald-300">
                {paySuccess}
              </div>
            )}

            <div className="mt-4 space-y-3.5 text-xs">
              <div>
                <label className="block text-[#4F604A] dark:text-[#A7B8A3] mb-1 font-semibold">Jumlah Bayar (Rupiah)</label>
                <input
                  type="number"
                  value={payAmount}
                  onChange={(e) => setPayAmount(Number(e.target.value))}
                  className="w-full rounded-2xl bg-[#E8EFE5]/70 p-3 text-sm font-bold text-[#222520] border border-transparent focus:border-[#3B5336] focus:bg-white focus:outline-none dark:bg-[#161F15] dark:text-white"
                />
                <p className="mt-1 text-[11px] text-[#5D6B58] dark:text-[#A7B8A3]">
                  Minimal Rp100.000 kecuali jika melunasi sisa tagihan (BR-08).
                </p>
              </div>

              <div>
                <label className="block text-[#4F604A] dark:text-[#A7B8A3] mb-1 font-semibold">Metode Pembayaran</label>
                {currentUser.peran === 'penyewa' ? (
                  <div className="rounded-2xl border border-[#DCE5D8] bg-[#F4F7F2] p-3 font-bold text-[#2D4129] dark:border-[#2C382A] dark:bg-[#182317] dark:text-[#D5E6D2]">
                    Mayar (Payment Gateway Otomatis)
                  </div>
                ) : (
                  <select
                    value={payMethod}
                    onChange={(e) => setPayMethod(e.target.value as any)}
                    className="w-full rounded-2xl bg-[#E8EFE5]/70 p-3 text-xs font-bold text-[#222520] border border-transparent focus:border-[#3B5336] focus:bg-white focus:outline-none dark:bg-[#161F15] dark:text-white"
                  >
                    <option value="transfer">Transfer Bank (+ Lampirkan Bukti)</option>
                    <option value="tunai">Tunai di Lokasi</option>
                  </select>
                )}
              </div>

              {payMethod === 'transfer' && (
                <div>
                  <label className="block text-[#4F604A] dark:text-[#A7B8A3] mb-1 font-semibold">Path / Nama Foto Bukti Transfer</label>
                  <input
                    type="text"
                    value={payProofPath}
                    onChange={(e) => setPayProofPath(e.target.value)}
                    className="w-full rounded-2xl bg-[#E8EFE5]/70 p-3 text-xs font-mono text-[#222520] border border-transparent focus:border-[#3B5336] focus:bg-white focus:outline-none dark:bg-[#161F15] dark:text-white"
                  />
                </div>
              )}
            </div>

            <div className="mt-6 flex justify-end gap-2">
              <button
                onClick={() => setPayModalInvoiceId(null)}
                className="rounded-full border border-[#DCE5D8] px-4 py-2 text-xs font-semibold text-[#5D6B58] hover:bg-[#E8EFE5] dark:border-[#2A3728] dark:text-[#A7B8A3] dark:hover:bg-[#1E281C]"
              >
                Batal
              </button>
              <button
                onClick={handleSavePayment}
                className="rounded-full bg-[#3B5336] px-5 py-2 text-xs font-bold text-white hover:bg-[#2D4129] active:scale-95 shadow-md"
              >
                Simpan Pembayaran
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL BAYAR QRIS MAYAR UNTUK PENYEWA */}
      <MayarQrisModal
        isOpen={!!qrisModalInvoice}
        invoice={qrisModalInvoice}
        onClose={() => setQrisModalInvoice(null)}
        onSuccess={() => {
          // Tagihan terbayar dan otomatis diperbarui oleh store
        }}
      />

    </div>
  );
}
