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
    <div className="p-6 sm:p-8 max-w-[1400px] mx-auto space-y-6">

      {/* ============================================================== */}
      {/* TAMPILAN OPERASIONAL STAF (PENGELOLA & PEMILIK)                 */}
      {/* ============================================================== */}
      {isStaff ? (
        <div className="space-y-6 animate-in fade-in duration-200">

          {/* Header Info Sesuai Wireframe Page 1 */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-4 border-b border-[#DCE5D8] dark:border-[#2C382A]">
            <div>
              <h1 className="text-2xl font-bold tracking-tight text-[#222520] dark:text-[#ECEAE4]">
                Beranda
              </h1>
              <p className="mt-0.5 text-xs text-[#5D6B58] dark:text-[#A7B8A3]">
                Kamis, 15 Oktober 2026 · ringkasan operasional hari ini
              </p>
            </div>
            <div className="flex items-center gap-2">
              <span className="rounded bg-[#FEF9C3] px-3 py-1 text-xs font-semibold text-[#854D0E] border border-[#FDE047]">
                REFERENSI TAMPILAN, bukan desain wajib
              </span>
            </div>
          </div>

          {/* 4 Kartu Metrik Ringkasan Operasional (Sesuai Wireframe Page 1) */}
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">

            {/* Unit Terisi */}
            <div className="rounded-lg border border-[#DCE5D8] bg-white p-4 shadow-2xs dark:border-[#2C382A] dark:bg-[#1E261D]">
              <div className="text-xs font-normal text-[#5D6B58] dark:text-[#A7B8A3]">
                Unit terisi
              </div>
              <div className="mt-2 text-2xl font-bold tracking-tight text-[#222520] dark:text-[#ECEAE4]">
                {occupiedUnitsCount} / {totalEligibleCount}
              </div>
              <p className="mt-2 text-[11px] text-[#5D6B58] dark:text-[#A7B8A3] leading-relaxed">
                1 unit perbaikan (B-205), 1 nonaktif tidak dihitung
              </p>
            </div>

            {/* Tagihan Oktober Lunas */}
            <div className="rounded-lg border border-[#DCE5D8] bg-white p-4 shadow-2xs dark:border-[#2C382A] dark:bg-[#1E261D]">
              <div className="text-xs font-normal text-[#5D6B58] dark:text-[#A7B8A3]">
                Tagihan Oktober lunas
              </div>
              <div className="mt-2 text-2xl font-bold tracking-tight text-[#2E7D32] dark:text-[#4ADE80]">
                {oktLunasCount} / {totalOktInvoices}
              </div>
              <p className="mt-2 text-[11px] text-[#5D6B58] dark:text-[#A7B8A3] leading-relaxed">
                jatuh tempo 10 Oktober 2026
              </p>
            </div>

            {/* Tagihan Lewat Jatuh Tempo */}
            <div className="rounded-lg border border-[#DCE5D8] bg-white p-4 shadow-2xs dark:border-[#2C382A] dark:bg-[#1E261D]">
              <div className="text-xs font-normal text-[#5D6B58] dark:text-[#A7B8A3]">
                Tagihan lewat jatuh tempo
              </div>
              <div className="mt-2 text-2xl font-bold tracking-tight text-[#C62828] dark:text-red-400">
                {overdueInvoices.length}
              </div>
              <p className="mt-2 text-[11px] text-[#5D6B58] dark:text-[#A7B8A3] leading-relaxed">
                denda Rp20.000 per hari, maks Rp200.000
              </p>
            </div>

            {/* Laporan Kerusakan Terbuka */}
            <div className="rounded-lg border border-[#DCE5D8] bg-white p-4 shadow-2xs dark:border-[#2C382A] dark:bg-[#1E261D]">
              <div className="text-xs font-normal text-[#5D6B58] dark:text-[#A7B8A3]">
                Laporan kerusakan terbuka
              </div>
              <div className="mt-2 text-2xl font-bold tracking-tight text-[#222520] dark:text-[#ECEAE4]">
                {openDamageReports.length}
              </div>
              <p className="mt-2 text-[11px] text-[#5D6B58] dark:text-[#A7B8A3] leading-relaxed">
                1 menunggu persetujuan Pemilik
              </p>
            </div>

          </div>

          {/* Grid Konten 2 Kolom Sesuai Wireframe Page 1: Kiri (Tagihan Overdue), Kanan (Kerusakan & Kontrak) */}
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">

            {/* Kolom Kiri: Tabel Tagihan Lewat Jatuh Tempo (7 Kolom Grid) */}
            <div className="lg:col-span-7">
              <div className="rounded-lg border border-[#DCE5D8] bg-white shadow-2xs dark:border-[#2C382A] dark:bg-[#1E261D] overflow-hidden">
                <div className="px-5 py-4 border-b border-[#DCE5D8] dark:border-[#2C382A]">
                  <h2 className="text-sm font-bold text-[#222520] dark:text-[#ECEAE4]">
                    Tagihan lewat jatuh tempo
                  </h2>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead className="border-b border-[#DCE5D8] bg-white text-[#5D6B58] dark:border-[#2C382A] dark:bg-[#1E261D] dark:text-[#A7B8A3]">
                      <tr>
                        <th className="py-3 px-4 font-semibold">Nomor</th>
                        <th className="py-3 px-2 font-semibold">Unit</th>
                        <th className="py-3 px-3 font-semibold">Penyewa</th>
                        <th className="py-3 px-3 font-semibold">Sisa + denda hari ini</th>
                        <th className="py-3 px-2 font-semibold">Status</th>
                        <th className="py-3 px-3 font-semibold text-center"></th>
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
                          <tr key={inv.id} className="hover:bg-stone-50/80 dark:hover:bg-[#253023]/40 transition-colors">
                            <td className="py-3 px-4 font-mono text-xs text-[#222520] dark:text-[#ECEAE4]">
                              {inv.nomor}
                            </td>
                            <td className="py-3 px-2 text-xs font-medium text-[#222520] dark:text-[#ECEAE4]">
                              {unit?.kode || '-'}
                            </td>
                            <td className="py-3 px-3 text-xs text-[#222520] dark:text-[#ECEAE4]">
                              {tenant?.nama_lengkap || '-'}
                            </td>
                            <td className="py-3 px-3 text-xs">
                              <div className="font-medium text-[#222520] dark:text-[#ECEAE4]">
                                {formatRupiah(sisa)}
                              </div>
                              {denda > 0 && (
                                <div className="text-[11px] text-[#5D6B58] dark:text-[#A7B8A3]">
                                  denda {formatRupiah(denda)}
                                </div>
                              )}
                            </td>
                            <td className="py-3 px-2 text-xs">
                              <span className={`inline-block px-2.5 py-0.5 rounded-full text-[11px] font-medium ${inv.status === 'sebagian'
                                  ? 'bg-[#FEF3C7] text-[#92400E] border border-[#FDE68A]'
                                  : 'bg-[#FEE2E2] text-[#991B1B] border border-[#FECACA]'
                                }`}>
                                {inv.status === 'sebagian' ? 'sebagian' : 'belum bayar'}
                              </span>
                            </td>
                            <td className="py-3 px-3 text-center">
                              <button
                                onClick={() => handleOpenPayModal(inv.id)}
                                className="rounded border border-[#DCE5D8] bg-white px-2.5 py-1 text-xs text-[#222520] hover:bg-[#F5F2EB] active:scale-95 transition-all shadow-2xs dark:border-[#2C382A] dark:bg-[#1E261D] dark:text-[#ECEAE4]"
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

            {/* Kolom Kanan Sesuai Wireframe Page 1: Laporan Terbuka & Kontrak Perlu Tindakan */}
            <div className="lg:col-span-5 space-y-6">

              {/* Laporan Kerusakan Terbuka */}
              <div className="rounded-lg border border-[#DCE5D8] bg-white shadow-2xs dark:border-[#2C382A] dark:bg-[#1E261D] overflow-hidden">
                <div className="px-5 py-4 border-b border-[#DCE5D8] dark:border-[#2C382A]">
                  <h3 className="text-sm font-bold text-[#222520] dark:text-[#ECEAE4]">
                    Laporan kerusakan terbuka
                  </h3>
                </div>
                <div className="divide-y divide-[#E8EFE5] dark:divide-[#2C382A]/70">
                  {openDamageReports.slice(0, 5).map((rep) => {
                    const unit = state.units.find(u => u.id === rep.unit_id);
                    return (
                      <Link
                        key={rep.id}
                        href="/kerusakan"
                        className="flex items-center justify-between p-3.5 hover:bg-stone-50 dark:hover:bg-[#253023]/40 transition-colors"
                      >
                        <div className="min-w-0 pr-3">
                          <div className="text-xs font-mono text-[#5D6B58] dark:text-[#A7B8A3]">
                            {rep.nomor}
                          </div>
                          <div className="text-xs font-medium text-[#222520] dark:text-[#ECEAE4] mt-0.5 truncate">
                            {unit?.kode} · {rep.judul}
                          </div>
                        </div>
                        <div className="shrink-0">
                          <span className={`inline-block px-2.5 py-0.5 rounded-full text-[11px] font-medium ${rep.status === 'menunggu_persetujuan'
                              ? 'bg-[#FEF3C7] text-[#92400E] border border-[#FDE68A]'
                              : rep.status === 'diproses'
                                ? 'bg-[#F1F5F9] text-[#475569] border border-[#CBD5E1]'
                                : 'bg-[#E0F2FE] text-[#0369A1] border border-[#BAE6FD]'
                            }`}>
                            {rep.status === 'menunggu_persetujuan'
                              ? 'menunggu persetujuan'
                              : rep.status === 'diproses'
                                ? 'diproses'
                                : 'dilaporkan'}
                          </span>
                        </div>
                      </Link>
                    );
                  })}
                </div>
              </div>

              {/* Kontrak Perlu Tindakan */}
              <div className="rounded-lg border border-[#DCE5D8] bg-white shadow-2xs dark:border-[#2C382A] dark:bg-[#1E261D] overflow-hidden">
                <div className="px-5 py-4 border-b border-[#DCE5D8] dark:border-[#2C382A]">
                  <h3 className="text-sm font-bold text-[#222520] dark:text-[#ECEAE4]">
                    Kontrak perlu tindakan
                  </h3>
                </div>
                <div className="divide-y divide-[#E8EFE5] dark:divide-[#2C382A]/70">
                  {actionRequiredContracts.slice(0, 5).map((ktr) => {
                    const unit = state.units.find(u => u.id === ktr.unit_id);
                    const tenant = state.profiles.find(p => p.id === ktr.penyewa_id);
                    const isDraft = ktr.status === 'draf';

                    let actionLabel = 'Berakhir 31 Okt 2026';
                    if (isDraft) {
                      actionLabel = ktr.id === 'ktr-0022'
                        ? 'identitas belum diverifikasi'
                        : 'menunggu kontrak lama selesai';
                    } else if (ktr.tanggal_selesai) {
                      actionLabel = `Berakhir ${formatDateIndo(ktr.tanggal_selesai)}`;
                    }

                    return (
                      <div
                        key={ktr.id}
                        className="flex items-center justify-between p-3.5 hover:bg-stone-50 dark:hover:bg-[#253023]/40 transition-colors"
                      >
                        <div className="min-w-0 pr-3">
                          <div className="text-xs font-medium text-[#222520] dark:text-[#ECEAE4]">
                            {ktr.nomor} · {unit?.kode} {isDraft ? '(draf)' : ''}
                          </div>
                          <div className="text-xs text-[#5D6B58] dark:text-[#A7B8A3] mt-0.5">
                            {tenant?.nama_lengkap}
                          </div>
                        </div>
                        <div className="shrink-0 text-right">
                          <span className="text-xs text-[#222520] dark:text-[#ECEAE4]">
                            {actionLabel}
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

            </div>

          </div>

          <div className="pt-4">
            <p className="text-xs text-[#5D6B58] dark:text-[#A7B8A3]">
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
                <span className={`rounded-full px-3 py-1 text-xs font-bold ${myContract?.status === 'aktif'
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
                      <span className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-bold capitalize ${myIdentity.status_verifikasi === 'terverifikasi'
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
