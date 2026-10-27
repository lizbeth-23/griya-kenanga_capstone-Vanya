'use client';

import { useState } from 'react';
import { useGriyaStore } from '@/lib/use-store';
import { formatRupiah, formatDateIndo } from '@/lib/formatters';
import { Invoice, InvoiceStatus, Payment } from '@/lib/types';
import { Receipt, ShieldAlert, CheckCircle2, Plus, Calendar, AlertTriangle, X, FileText, Ban } from 'lucide-react';
import { REFERENCE_DATE } from '@/lib/store';
import AuthGuard from '@/components/AuthGuard';

export default function TagihanPage() {
  const { currentUser, state, store } = useGriyaStore();
  const [selectedPeriode, setSelectedPeriode] = useState<string>('2026-10-01');
  const [selectedFilter, setSelectedFilter] = useState<string>('all');
  
  // Side Panel Catat Pembayaran (Default INV-202610-0010 sesuai Wireframe Page 2)
  const defaultInvoice = state.invoices.find(i => i.nomor === 'INV-202610-0010') || null;
  const [activePayInvoice, setActivePayInvoice] = useState<Invoice | null>(defaultInvoice);
  const [payAmount, setPayAmount] = useState<number>(defaultInvoice ? 950000 : 0);
  const [payMethod, setPayMethod] = useState<'tunai' | 'transfer'>('transfer');
  const [payProof, setPayProof] = useState<string>('/uploads/bukti/transfer_staf.jpg');

  // Modal Detail & Riwayat Pembayaran
  const [detailInvoice, setDetailInvoice] = useState<Invoice | null>(null);
  const [cancelPayTarget, setCancelPayTarget] = useState<Payment | null>(null);
  const [cancelPayReason, setCancelPayReason] = useState<string>('');

  // Modal Batal Tagihan
  const [cancelInvTarget, setCancelInvTarget] = useState<Invoice | null>(null);
  const [cancelInvReason, setCancelInvReason] = useState<string>('');

  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  // PROTEKSI ROUTE: Belum login
  if (!currentUser) {
    return <AuthGuard moduleName="tagihan dan pembayaran" />;
  }

  // BR-10: Penyewa ditolak
  if (currentUser.peran === 'penyewa') {
    return (
      <div className="mx-auto max-w-lg px-4 py-16 text-center">
        <ShieldAlert className="mx-auto h-12 w-12 text-red-500 mb-3" />
        <h2 className="text-xl font-bold text-stone-900 dark:text-stone-100">Akses Ditolak</h2>
        <p className="mt-2 text-sm text-stone-500">
          Halaman pembuatan tagihan dan pencatatan pembayaran hanya dapat diakses oleh staf Pengelola dan Pemilik (BR-10).
        </p>
      </div>
    );
  }

  const isManager = currentUser.peran === 'pengelola';
  const isOwner = currentUser.peran === 'pemilik';

  // Tagihan pada periode terpilih
  const invoicesOnPeriod = state.invoices.filter(i => i.periode === selectedPeriode);

  const countSemua = invoicesOnPeriod.length;
  const countBelumBayar = invoicesOnPeriod.filter(i => i.status === 'belum_bayar').length;
  const countSebagian = invoicesOnPeriod.filter(i => i.status === 'sebagian').length;
  const countLunas = invoicesOnPeriod.filter(i => i.status === 'lunas').length;

  const filteredInvoices = invoicesOnPeriod.filter(i => {
    if (selectedFilter === 'all') return true;
    return i.status === selectedFilter;
  });

  const handleGenerateNextMonth = () => {
    try {
      setErrorMsg('');
      const res = store.generateMonthlyInvoices('2026-11-01');
      if (res.createdCount > 0) {
        setSuccessMsg(`Berhasil membuat ${res.createdCount} tagihan baru untuk periode November 2026!`);
        setSelectedPeriode('2026-11-01');
      } else {
        setSuccessMsg('Semua kontrak aktif sudah memiliki tagihan untuk periode November 2026 (Anti-dobel / Idempotent BR-06).');
      }
      setTimeout(() => setSuccessMsg(''), 4000);
    } catch (err: unknown) {
      if (err instanceof Error) {
        setErrorMsg(err.message);
      } else {
        setErrorMsg('Gagal membuat tagihan bulanan');
      }
    }
  };

  const handleOpenPayment = (inv: Invoice) => {
    let denda = inv.denda;
    if (REFERENCE_DATE > inv.jatuh_tempo) {
      const d1 = new Date(REFERENCE_DATE).getTime();
      const d2 = new Date(inv.jatuh_tempo).getTime();
      const diffDays = Math.max(0, Math.ceil((d1 - d2) / (1000 * 60 * 60 * 24)));
      denda = Math.min(200000, Math.max(inv.denda, diffDays * 20000));
    }
    const sisa = (inv.nominal_sewa + denda) - inv.terbayar;

    setActivePayInvoice(inv);
    setPayAmount(sisa);
    setPayMethod('transfer');
    setErrorMsg('');
  };

  const handleSavePayment = () => {
    if (!activePayInvoice) return;
    try {
      setErrorMsg('');
      store.recordPayment({
        tagihan_id: activePayInvoice.id,
        jumlah: payAmount,
        metode: payMethod,
        tanggal_bayar: REFERENCE_DATE,
        bukti_path: payMethod === 'transfer' ? payProof : undefined
      });
      setSuccessMsg(`Pembayaran Rp${payAmount.toLocaleString('id-ID')} untuk tagihan ${activePayInvoice.nomor} berhasil dicatat!`);
      setActivePayInvoice(null);
      setTimeout(() => setSuccessMsg(''), 3000);
    } catch (err: unknown) {
      if (err instanceof Error) {
        setErrorMsg(err.message);
      } else {
        setErrorMsg('Gagal mencatat pembayaran');
      }
    }
  };

  const handleCancelPayment = () => {
    if (!cancelPayTarget) return;
    try {
      setErrorMsg('');
      store.cancelPayment(cancelPayTarget.id, cancelPayReason);
      setSuccessMsg(`Pembayaran Rp${cancelPayTarget.jumlah.toLocaleString('id-ID')} berhasil dibatalkan.`);
      setCancelPayTarget(null);
      setCancelPayReason('');
      if (detailInvoice) {
        const updated = state.invoices.find(i => i.id === detailInvoice.id);
        setDetailInvoice(updated || null);
      }
      setTimeout(() => setSuccessMsg(''), 3000);
    } catch (err: unknown) {
      if (err instanceof Error) {
        setErrorMsg(err.message);
      } else {
        setErrorMsg('Gagal membatalkan pembayaran');
      }
    }
  };

  const handleCancelInvoice = () => {
    if (!cancelInvTarget) return;
    try {
      setErrorMsg('');
      store.cancelInvoice(cancelInvTarget.id, cancelInvReason);
      setSuccessMsg(`Tagihan ${cancelInvTarget.nomor} berhasil dibatalkan`);
      setCancelInvTarget(null);
      setCancelInvReason('');
      setTimeout(() => setSuccessMsg(''), 3000);
    } catch (err: unknown) {
      if (err instanceof Error) {
        setErrorMsg(err.message);
      } else {
        setErrorMsg('Gagal membatalkan tagihan');
      }
    }
  };

  return (
    <div className="p-6 sm:p-8 max-w-[1400px] mx-auto space-y-6">
      
      {/* Header Halaman Sesuai Wireframe Page 2 */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-4 border-b border-[#DCE5D8] dark:border-[#2C382A]">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-[#222520] dark:text-[#ECEAE4]">
            Tagihan
          </h1>
          <p className="mt-0.5 text-xs text-[#5D6B58] dark:text-[#A7B8A3]">
            Periode Oktober 2026 · jatuh tempo 10 Okt 2026
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          {/* Pilihan Periode Bulan */}
          <div className="flex items-center gap-1.5 rounded-lg border border-[#DCE5D8] bg-white px-3 py-1.5 text-xs text-[#222520] dark:border-[#2C382A] dark:bg-[#1E261D] dark:text-[#ECEAE4]">
            <span className="text-[#5D6B58] dark:text-[#A7B8A3]">Periode:</span>
            <select
              value={selectedPeriode}
              onChange={(e) => setSelectedPeriode(e.target.value)}
              className="bg-transparent font-medium focus:outline-none cursor-pointer"
            >
              <option value="2026-10-01">Okt 2026</option>
              <option value="2026-11-01">Nov 2026</option>
              <option value="2026-09-01">Sep 2026</option>
              <option value="2026-08-01">Agu 2026</option>
            </select>
          </div>

          {/* Tombol Buat Tagihan November (Pengelola - BR-06) */}
          {isManager && (
            <button
              onClick={handleGenerateNextMonth}
              className="rounded-lg bg-[#2E6B47] px-4 py-1.5 text-xs font-semibold text-white hover:bg-[#255739] transition-colors"
            >
              Buat tagihan November
            </button>
          )}
        </div>
      </div>

      {/* Alert Messages */}
      {errorMsg && (
        <div className="rounded-lg border border-red-200 bg-red-50 p-3 text-xs text-red-700 dark:border-red-900/50 dark:bg-red-950/30 dark:text-red-300 flex items-center gap-2">
          <ShieldAlert className="h-4 w-4 shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}

      {successMsg && (
        <div className="rounded-lg border border-[#95B08A]/40 bg-[#E8EFE5] p-3 text-xs font-medium text-[#2D4129] dark:border-[#3B5336] dark:bg-[#1E261D] dark:text-[#95B08A] flex items-center gap-2">
          <CheckCircle2 className="h-4 w-4 shrink-0 text-[#3B5336] dark:text-[#95B08A]" />
          <span>{successMsg}</span>
        </div>
      )}

      {/* Filter Tabs (Semua, Belum Bayar, Sebagian, Lunas) Sesuai Wireframe Page 2 */}
      <div className="flex flex-wrap gap-2 text-xs">
        <button
          onClick={() => setSelectedFilter('all')}
          className={`rounded-full px-3.5 py-1 text-xs font-medium transition-colors ${
            selectedFilter === 'all'
              ? 'bg-[#1E251F] text-white'
              : 'border border-[#DCE5D8] bg-white text-[#222520] hover:bg-stone-50 dark:border-[#2C382A] dark:bg-[#1E261D] dark:text-[#ECEAE4]'
          }`}
        >
          Semua ({countSemua})
        </button>
        <button
          onClick={() => setSelectedFilter('belum_bayar')}
          className={`rounded-full px-3.5 py-1 text-xs font-medium transition-colors ${
            selectedFilter === 'belum_bayar'
              ? 'bg-[#1E251F] text-white'
              : 'border border-[#DCE5D8] bg-white text-[#222520] hover:bg-stone-50 dark:border-[#2C382A] dark:bg-[#1E261D] dark:text-[#ECEAE4]'
          }`}
        >
          Belum bayar ({countBelumBayar})
        </button>
        <button
          onClick={() => setSelectedFilter('sebagian')}
          className={`rounded-full px-3.5 py-1 text-xs font-medium transition-colors ${
            selectedFilter === 'sebagian'
              ? 'bg-[#1E251F] text-white'
              : 'border border-[#DCE5D8] bg-white text-[#222520] hover:bg-stone-50 dark:border-[#2C382A] dark:bg-[#1E261D] dark:text-[#ECEAE4]'
          }`}
        >
          Sebagian ({countSebagian})
        </button>
        <button
          onClick={() => setSelectedFilter('lunas')}
          className={`rounded-full px-3.5 py-1 text-xs font-medium transition-colors ${
            selectedFilter === 'lunas'
              ? 'bg-[#1E251F] text-white'
              : 'border border-[#DCE5D8] bg-white text-[#222520] hover:bg-stone-50 dark:border-[#2C382A] dark:bg-[#1E261D] dark:text-[#ECEAE4]'
          }`}
        >
          Lunas ({countLunas})
        </button>
      </div>

      {/* Grid: Tabel di Kiri, Side Panel Catat Pembayaran di Kanan Sesuai Wireframe Page 2 */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        
        {/* Tabel Tagihan */}
        <div className={`${activePayInvoice ? 'lg:col-span-8' : 'lg:col-span-12'} rounded-lg border border-[#DCE5D8] bg-white shadow-2xs dark:border-[#2C382A] dark:bg-[#1E261D] overflow-hidden transition-all`}>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="border-b border-[#DCE5D8] bg-white text-[#5D6B58] dark:border-[#2C382A] dark:bg-[#1E261D] dark:text-[#A7B8A3]">
                <tr>
                  <th className="py-3 px-3 font-semibold">Nomor</th>
                  <th className="py-3 px-2 font-semibold">Unit</th>
                  <th className="py-3 px-3 font-semibold">Penyewa</th>
                  <th className="py-3 px-3 font-semibold">Sewa</th>
                  <th className="py-3 px-2 font-semibold">Denda</th>
                  <th className="py-3 px-3 font-semibold">Terbayar</th>
                  <th className="py-3 px-2 font-semibold">Status</th>
                  <th className="py-3 px-3 font-semibold text-center"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E8EFE5] dark:divide-[#2C382A]/70 text-[#222520] dark:text-[#ECEAE4]">
                {filteredInvoices.map((inv) => {
                  const contract = state.contracts.find(c => c.id === inv.kontrak_id);
                  const unit = contract ? state.units.find(u => u.id === contract.unit_id) : null;
                  const tenant = contract ? state.profiles.find(p => p.id === contract.penyewa_id) : null;

                  // Hitung denda dinamis jika lewat jatuh tempo
                  let denda = inv.denda;
                  if (inv.status !== 'lunas' && REFERENCE_DATE > inv.jatuh_tempo) {
                    const d1 = new Date(REFERENCE_DATE).getTime();
                    const d2 = new Date(inv.jatuh_tempo).getTime();
                    const diffDays = Math.max(0, Math.ceil((d1 - d2) / (1000 * 60 * 60 * 24)));
                    denda = Math.min(200000, Math.max(inv.denda, diffDays * 20000));
                  }

                  const isSelected = activePayInvoice?.id === inv.id;

                  return (
                    <tr 
                      key={inv.id} 
                      className={`hover:bg-stone-50 dark:hover:bg-[#253023]/40 transition-colors ${
                        isSelected ? 'bg-emerald-50/50 dark:bg-[#253023]/60' : ''
                      }`}
                    >
                      <td className="py-3 px-3 font-mono text-xs text-[#222520] dark:text-[#ECEAE4]">
                        {inv.nomor}
                      </td>
                      <td className="py-3 px-2 font-medium text-xs text-[#222520] dark:text-[#ECEAE4]">
                        {unit?.kode || '-'}
                      </td>
                      <td className="py-3 px-3 text-xs text-[#222520] dark:text-[#ECEAE4]">
                        {tenant?.nama_lengkap || '-'}
                      </td>
                      <td className="py-3 px-3 text-xs">
                        {formatRupiah(inv.nominal_sewa)}
                      </td>
                      <td className="py-3 px-2 text-xs">
                        {denda > 0 ? (
                          <span className="text-[#C62828] dark:text-red-400 font-medium">
                            {formatRupiah(denda)}
                          </span>
                        ) : (
                          <span className="text-stone-400">-</span>
                        )}
                      </td>
                      <td className="py-3 px-3 text-xs">
                        {formatRupiah(inv.terbayar)}
                      </td>
                      <td className="py-3 px-2 text-xs">
                        <span className={`inline-block px-2.5 py-0.5 rounded-full text-[11px] font-medium ${
                          inv.status === 'lunas'
                            ? 'bg-[#E8F5E9] text-[#2E7D32] border border-[#C8E6C9]'
                            : inv.status === 'sebagian'
                            ? 'bg-[#FEF3C7] text-[#92400E] border border-[#FDE68A]'
                            : inv.status === 'dibatalkan'
                            ? 'bg-stone-100 text-stone-600 border border-stone-200'
                            : 'bg-[#FEE2E2] text-[#991B1B] border border-[#FECACA]'
                        }`}>
                          {inv.status === 'lunas' 
                            ? 'lunas' 
                            : inv.status === 'sebagian' 
                            ? 'sebagian' 
                            : inv.status === 'dibatalkan'
                            ? 'dibatalkan'
                            : 'belum bayar'}
                        </span>
                      </td>
                      <td className="py-3 px-3 text-center whitespace-nowrap">
                        {inv.status === 'lunas' ? (
                          <button
                            onClick={() => {
                              setDetailInvoice(inv);
                              setErrorMsg('');
                            }}
                            className="rounded border border-[#DCE5D8] bg-white px-2.5 py-1 text-xs text-[#222520] hover:bg-stone-50 dark:border-[#2C382A] dark:bg-[#1E261D] dark:text-[#ECEAE4]"
                          >
                            Detail
                          </button>
                        ) : (
                          <button
                            onClick={() => handleOpenPayment(inv)}
                            className="rounded border border-[#DCE5D8] bg-white px-2.5 py-1 text-xs text-[#222520] hover:bg-stone-50 dark:border-[#2C382A] dark:bg-[#1E261D] dark:text-[#ECEAE4]"
                          >
                            Catat bayar
                          </button>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* SIDE PANEL: CATAT PEMBAYARAN (Sesuai Wireframe Page 2 Sisi Kanan) */}
        {activePayInvoice && (
          <div className="lg:col-span-4 rounded-lg border border-[#DCE5D8] bg-white p-5 shadow-2xs dark:border-[#2C382A] dark:bg-[#1E261D]">
            <div className="flex items-center justify-between pb-3 border-b border-[#DCE5D8] dark:border-[#2C382A]">
              <h3 className="text-sm font-bold text-[#222520] dark:text-[#ECEAE4]">
                Catat pembayaran
              </h3>
              <button 
                onClick={() => setActivePayInvoice(null)}
                className="text-stone-400 hover:text-stone-600 dark:hover:text-stone-200"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {(() => {
              const contract = state.contracts.find(c => c.id === activePayInvoice.kontrak_id);
              const unit = contract ? state.units.find(u => u.id === contract.unit_id) : null;
              const tenant = contract ? state.profiles.find(p => p.id === contract.penyewa_id) : null;
              
              let denda = activePayInvoice.denda;
              let hariTelat = 0;
              if (REFERENCE_DATE > activePayInvoice.jatuh_tempo) {
                const d1 = new Date(REFERENCE_DATE).getTime();
                const d2 = new Date(activePayInvoice.jatuh_tempo).getTime();
                hariTelat = Math.max(0, Math.ceil((d1 - d2) / (1000 * 60 * 60 * 24)));
                denda = Math.min(200000, Math.max(activePayInvoice.denda, hariTelat * 20000));
              }
              const sisa = (activePayInvoice.nominal_sewa + denda) - activePayInvoice.terbayar;

              return (
                <div className="mt-4 space-y-3 text-xs">
                  <div className="space-y-1.5 text-stone-700 dark:text-stone-300">
                    <div className="flex justify-between">
                      <span className="text-[#5D6B58] dark:text-[#A7B8A3]">Tagihan</span>
                      <span className="font-mono font-medium text-[#222520] dark:text-[#ECEAE4]">{activePayInvoice.nomor}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-[#5D6B58] dark:text-[#A7B8A3]">Unit / penyewa</span>
                      <span className="font-medium text-[#222520] dark:text-[#ECEAE4]">{unit?.kode} · {tenant?.nama_lengkap}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-[#5D6B58] dark:text-[#A7B8A3]">Sewa</span>
                      <span>{formatRupiah(activePayInvoice.nominal_sewa)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-[#5D6B58] dark:text-[#A7B8A3]">Sudah dibayar</span>
                      <span>{formatRupiah(activePayInvoice.terbayar)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-[#5D6B58] dark:text-[#A7B8A3]">Denda per 15 Okt</span>
                      <span>{denda > 0 ? `${formatRupiah(denda)} (${hariTelat} hari)` : '-'}</span>
                    </div>
                    <div className="flex justify-between font-bold text-[#222520] dark:text-[#ECEAE4] pt-1 border-t border-[#E8EFE5] dark:border-[#2C382A]">
                      <span>Sisa</span>
                      <span>{formatRupiah(sisa)}</span>
                    </div>
                  </div>

                  <div className="pt-2">
                    <label className="block text-xs font-medium text-[#5D6B58] dark:text-[#A7B8A3] mb-1">Jumlah dibayar</label>
                    <input
                      type="number"
                      value={payAmount}
                      onChange={(e) => setPayAmount(Number(e.target.value))}
                      className="w-full rounded border border-[#DCE5D8] bg-white p-2 text-xs font-semibold text-[#222520] focus:border-[#2E6B47] focus:outline-none dark:border-[#2C382A] dark:bg-[#1E261D] dark:text-[#ECEAE4]"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-[#5D6B58] dark:text-[#A7B8A3] mb-1">Metode</label>
                    <div className="flex gap-2">
                      <button
                        type="button"
                        onClick={() => setPayMethod('tunai')}
                        className={`rounded-full px-4 py-1 text-xs font-medium transition-colors ${
                          payMethod === 'tunai'
                            ? 'bg-[#1E251F] text-white'
                            : 'border border-[#DCE5D8] bg-white text-[#222520] hover:bg-stone-50 dark:border-[#2C382A] dark:bg-[#1E261D] dark:text-[#ECEAE4]'
                        }`}
                      >
                        Tunai
                      </button>
                      <button
                        type="button"
                        onClick={() => setPayMethod('transfer')}
                        className={`rounded-full px-4 py-1 text-xs font-medium transition-colors ${
                          payMethod === 'transfer'
                            ? 'bg-[#1E251F] text-white'
                            : 'border border-[#DCE5D8] bg-white text-[#222520] hover:bg-stone-50 dark:border-[#2C382A] dark:bg-[#1E261D] dark:text-[#ECEAE4]'
                        }`}
                      >
                        Transfer
                      </button>
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-[#5D6B58] dark:text-[#A7B8A3] mb-1">Bukti transfer (wajib)</label>
                    <div className="border border-dashed border-[#DCE5D8] rounded-lg p-4 text-center text-xs text-[#5D6B58] dark:border-[#2C382A] dark:text-[#A7B8A3] bg-stone-50/50 dark:bg-[#171D16]">
                      <span>unggah foto bukti</span>
                    </div>
                  </div>

                  <p className="text-[11px] text-[#5D6B58] dark:text-[#A7B8A3] leading-relaxed">
                    Minimal Rp100.000 kecuali melunasi sisa. Jumlah tidak boleh melebihi sisa.
                  </p>

                  <div className="flex gap-2 pt-2">
                    <button
                      type="button"
                      onClick={handleSavePayment}
                      className="rounded bg-[#2E6B47] px-4 py-2 text-xs font-semibold text-white hover:bg-[#255739] transition-colors"
                    >
                      Simpan pembayaran
                    </button>
                    <button
                      type="button"
                      onClick={() => setActivePayInvoice(null)}
                      className="rounded border border-[#DCE5D8] bg-white px-4 py-2 text-xs font-medium text-[#222520] hover:bg-stone-50 dark:border-[#2C382A] dark:bg-[#1E261D] dark:text-[#ECEAE4]"
                    >
                      Batal
                    </button>
                  </div>
                </div>
              );
            })()}
          </div>
        )}

      </div>



      {/* MODAL DETAIL & RIWAYAT PEMBAYARAN */}
      {detailInvoice && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-stone-900/60 p-4 backdrop-blur-sm">
          <div className="w-full max-w-lg rounded-[28px] border border-[#DCE5D8] bg-white p-6 shadow-2xl dark:border-[#2C382A] dark:bg-[#1E261D] max-h-[85vh] flex flex-col">
            <div className="flex items-center justify-between pb-3 border-b border-[#DCE5D8] dark:border-[#2C382A]">
              <h3 className="text-base font-bold text-stone-900 dark:text-stone-100">
                Detail Tagihan {detailInvoice.nomor}
              </h3>
              <button 
                onClick={() => setDetailInvoice(null)}
                className="h-8 w-8 rounded-full flex items-center justify-center text-stone-400 hover:bg-[#F4F7F2] hover:text-stone-700 dark:hover:bg-[#2C382A] transition-colors"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="overflow-y-auto py-3 space-y-4 flex-1 text-xs">
              <div className="grid grid-cols-2 gap-2 rounded-2xl border border-[#DCE5D8] bg-[#F4F7F2] p-4 dark:border-[#2C382A] dark:bg-[#171D16]">
                <div><span className="text-[#5D6B58] dark:text-stone-400">Periode:</span> {formatDateIndo(detailInvoice.periode)}</div>
                <div><span className="text-[#5D6B58] dark:text-stone-400">Jatuh Tempo:</span> {formatDateIndo(detailInvoice.jatuh_tempo)}</div>
                <div><span className="text-[#5D6B58] dark:text-stone-400">Nominal Sewa:</span> {formatRupiah(detailInvoice.nominal_sewa)}</div>
                <div><span className="text-[#5D6B58] dark:text-stone-400">Denda:</span> {formatRupiah(detailInvoice.denda)}</div>
                <div><span className="text-[#5D6B58] dark:text-stone-400">Total Terbayar:</span> {formatRupiah(detailInvoice.terbayar)}</div>
                <div><span className="text-[#5D6B58] dark:text-stone-400">Status:</span> <span className="font-bold capitalize text-[#2D4129] dark:text-[#95B08A]">{detailInvoice.status}</span></div>
              </div>

              <div>
                <h4 className="font-bold text-stone-900 dark:text-stone-100 mb-2">Riwayat Pembayaran Masuk</h4>
                {(() => {
                  const pays = state.payments.filter(p => p.tagihan_id === detailInvoice.id);
                  if (pays.length === 0) {
                    return <p className="text-stone-400 italic">Belum ada pembayaran dicatat.</p>;
                  }
                  return (
                    <div className="space-y-2">
                      {pays.map((p) => (
                        <div key={p.id} className="flex items-center justify-between rounded-2xl border border-[#DCE5D8] p-3 dark:border-[#2C382A] bg-white dark:bg-[#171D16]">
                          <div>
                            <div className="font-bold text-stone-900 dark:text-stone-100">
                              {formatRupiah(p.jumlah)} · <span className="uppercase text-[10px] text-[#5D6B58]">{p.metode}</span>
                            </div>
                            <div className="text-[11px] text-stone-400">
                              Tanggal: {formatDateIndo(p.tanggal_bayar)}
                              {p.referensi_mayar && ` · Ref: ${p.referensi_mayar}`}
                            </div>
                            {p.alasan_batal && (
                              <div className="text-[10px] text-red-600 mt-0.5">
                                Dibatalkan: {p.alasan_batal}
                              </div>
                            )}
                          </div>
                          <div className="flex items-center gap-2">
                            <span className={`rounded-full px-2.5 py-0.5 text-[10px] font-bold border ${
                              p.status === 'sah' 
                                ? 'bg-[#E8EFE5] text-[#2D4129] border-[#95B08A]/30 dark:bg-[#2C382A] dark:text-[#95B08A]' 
                                : 'bg-red-50 text-red-800 border-red-200'
                            }`}>
                              {p.status}
                            </span>
                            {/* Tombol Batalkan Pembayaran (Khusus Pemilik - BR-09) */}
                            {isOwner && p.status === 'sah' && (
                              <button
                                onClick={() => setCancelPayTarget(p)}
                                className="rounded-full border border-red-200 px-2.5 py-0.5 text-red-600 hover:bg-red-50 text-[10px] font-semibold transition-colors"
                                title="Batalkan Pembayaran (BR-09)"
                              >
                                Batal
                              </button>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  );
                })()}
              </div>
            </div>

            <div className="pt-3 border-t border-[#DCE5D8] dark:border-[#2C382A] flex justify-end">
              <button
                onClick={() => setDetailInvoice(null)}
                className="rounded-full bg-[#3B5336] px-5 py-2 text-xs font-bold text-white hover:bg-[#2D4129] active:scale-95 transition-all shadow-sm"
              >
                Tutup
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL BATALKAN PEMBAYARAN (Khusus Pemilik - BR-09) */}
      {cancelPayTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-stone-900/60 p-4 backdrop-blur-sm">
          <div className="w-full max-w-sm rounded-[28px] border border-[#DCE5D8] bg-white p-6 shadow-2xl dark:border-[#2C382A] dark:bg-[#1E261D]">
            <h3 className="text-sm font-bold text-red-600">
              Batalkan Pembayaran (BR-09)
            </h3>
            <p className="mt-1 text-xs text-[#5D6B58] dark:text-stone-400">
              Koreksi pembayaran Rp{cancelPayTarget.jumlah.toLocaleString('id-ID')}. Status tagihan akan dihitung ulang secara otomatis.
            </p>

            <div className="mt-4">
              <label className="block text-xs font-semibold text-[#5D6B58] dark:text-stone-300 mb-1.5">Alasan Pembatalan (Wajib)</label>
              <textarea
                rows={2}
                required
                value={cancelPayReason}
                onChange={(e) => setCancelPayReason(e.target.value)}
                placeholder="Contoh: Salah input nominal oleh staf"
                className="w-full rounded-2xl border border-[#DCE5D8] bg-[#E8EFE5]/40 p-2.5 text-xs text-stone-900 focus:bg-white focus:border-[#3B5336] focus:ring-2 focus:ring-[#3B5336]/20 focus:outline-none dark:border-[#2C382A] dark:bg-[#2C382A] dark:text-stone-100"
              />
            </div>

            <div className="mt-5 flex justify-end gap-2.5">
              <button
                onClick={() => setCancelPayTarget(null)}
                className="rounded-full border border-[#DCE5D8] px-4 py-2 text-xs font-semibold text-stone-600 hover:bg-[#F4F7F2] dark:border-[#2C382A] dark:text-stone-300 transition-colors"
              >
                Batal
              </button>
              <button
                onClick={handleCancelPayment}
                className="rounded-full bg-[#C25E5E] px-4 py-2 text-xs font-bold text-white hover:bg-[#A84A4A] active:scale-95 transition-all shadow-sm"
              >
                Konfirmasi Batal
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL BATALKAN TAGIHAN KOSONG (Khusus Pemilik - BR-09) */}
      {cancelInvTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-stone-900/60 p-4 backdrop-blur-sm">
          <div className="w-full max-w-sm rounded-[28px] border border-[#DCE5D8] bg-white p-6 shadow-2xl dark:border-[#2C382A] dark:bg-[#1E261D]">
            <h3 className="text-sm font-bold text-red-600">
              Batalkan Tagihan {cancelInvTarget.nomor}
            </h3>
            <p className="mt-1 text-xs text-[#5D6B58] dark:text-stone-400">
              BR-09: Tagihan hanya bisa dibatalkan Pemilik bila belum ada pembayaran sama sekali.
            </p>

            <div className="mt-4">
              <label className="block text-xs font-semibold text-[#5D6B58] dark:text-stone-300 mb-1.5">Alasan Pembatalan (Wajib)</label>
              <textarea
                rows={2}
                required
                value={cancelInvReason}
                onChange={(e) => setCancelInvReason(e.target.value)}
                placeholder="Contoh: Pembatalan kontrak sebelum awal periode"
                className="w-full rounded-2xl border border-[#DCE5D8] bg-[#E8EFE5]/40 p-2.5 text-xs text-stone-900 focus:bg-white focus:border-[#3B5336] focus:ring-2 focus:ring-[#3B5336]/20 focus:outline-none dark:border-[#2C382A] dark:bg-[#2C382A] dark:text-stone-100"
              />
            </div>

            <div className="mt-5 flex justify-end gap-2.5">
              <button
                onClick={() => setCancelInvTarget(null)}
                className="rounded-full border border-[#DCE5D8] px-4 py-2 text-xs font-semibold text-stone-600 hover:bg-[#F4F7F2] dark:border-[#2C382A] dark:text-stone-300 transition-colors"
              >
                Batal
              </button>
              <button
                onClick={handleCancelInvoice}
                className="rounded-full bg-[#C25E5E] px-4 py-2 text-xs font-bold text-white hover:bg-[#A84A4A] active:scale-95 transition-all shadow-sm"
              >
                Konfirmasi Batal
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
