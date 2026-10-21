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
  
  // Modal Catat Pembayaran
  const [activePayInvoice, setActivePayInvoice] = useState<Invoice | null>(null);
  const [payAmount, setPayAmount] = useState<number>(0);
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
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8 space-y-6">
      
      {/* Header Halaman */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-stone-200/80 pb-6 dark:border-stone-800">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-stone-900 dark:text-stone-100 sm:text-3xl flex items-center gap-2.5">
            <Receipt className="h-7 w-7 text-stone-800 dark:text-stone-200" />
            Tagihan & Pembayaran Sewa
          </h1>
          <p className="mt-1 text-sm text-stone-500 dark:text-stone-400">
            Jatuh tempo setiap tanggal 10 · Denda keterlambatan Rp20.000/hari (maks Rp200.000) (BR-06, BR-07)
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          {/* Pilihan Periode Bulan */}
          <div className="flex items-center gap-2">
            <span className="text-xs text-stone-400">Periode:</span>
            <select
              value={selectedPeriode}
              onChange={(e) => setSelectedPeriode(e.target.value)}
              className="rounded-xl border border-stone-200 bg-white px-3 py-1.5 text-xs font-semibold text-stone-900 dark:border-stone-800 dark:bg-stone-900 dark:text-stone-100"
            >
              <option value="2026-11-01">Nov 2026</option>
              <option value="2026-10-01">Okt 2026</option>
              <option value="2026-09-01">Sep 2026</option>
              <option value="2026-08-01">Agu 2026</option>
            </select>
          </div>

          {/* Tombol Buat Tagihan November (Pengelola - BR-06) */}
          {isManager && (
            <button
              onClick={handleGenerateNextMonth}
              className="flex items-center gap-1.5 rounded-xl bg-stone-900 px-3.5 py-1.5 text-xs font-semibold text-white hover:bg-emerald-700 dark:bg-stone-100 dark:text-stone-900 transition-colors"
            >
              <Plus className="h-4 w-4" />
              Buat Tagihan November
            </button>
          )}
        </div>
      </div>

      {/* Alert Messages */}
      {errorMsg && (
        <div className="rounded-xl border border-red-200 bg-red-50 p-3 text-xs text-red-700 dark:border-red-900/50 dark:bg-red-950/30 dark:text-red-300 flex items-center gap-2">
          <ShieldAlert className="h-4 w-4 shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}

      {successMsg && (
        <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-3 text-xs text-emerald-700 dark:border-emerald-900/50 dark:bg-emerald-950/30 dark:text-emerald-300 flex items-center gap-2">
          <CheckCircle2 className="h-4 w-4 shrink-0" />
          <span>{successMsg}</span>
        </div>
      )}

      {/* Filter Tabs (Semua, Belum Bayar, Sebagian, Lunas) Sesuai Wireframe Page 2 */}
      <div className="flex flex-wrap gap-2">
        <button
          onClick={() => setSelectedFilter('all')}
          className={`rounded-xl px-3 py-1.5 text-xs font-medium transition-all ${
            selectedFilter === 'all'
              ? 'bg-stone-900 text-white dark:bg-stone-100 dark:text-stone-900'
              : 'bg-white border border-stone-200 text-stone-600 dark:bg-stone-900 dark:border-stone-800 dark:text-stone-300'
          }`}
        >
          Semua ({countSemua})
        </button>
        <button
          onClick={() => setSelectedFilter('belum_bayar')}
          className={`rounded-xl px-3 py-1.5 text-xs font-medium transition-all ${
            selectedFilter === 'belum_bayar'
              ? 'bg-red-600 text-white'
              : 'bg-white border border-stone-200 text-stone-600 dark:bg-stone-900 dark:border-stone-800 dark:text-stone-300'
          }`}
        >
          Belum Bayar ({countBelumBayar})
        </button>
        <button
          onClick={() => setSelectedFilter('sebagian')}
          className={`rounded-xl px-3 py-1.5 text-xs font-medium transition-all ${
            selectedFilter === 'sebagian'
              ? 'bg-amber-600 text-white'
              : 'bg-white border border-stone-200 text-stone-600 dark:bg-stone-900 dark:border-stone-800 dark:text-stone-300'
          }`}
        >
          Sebagian ({countSebagian})
        </button>
        <button
          onClick={() => setSelectedFilter('lunas')}
          className={`rounded-xl px-3 py-1.5 text-xs font-medium transition-all ${
            selectedFilter === 'lunas'
              ? 'bg-emerald-600 text-white'
              : 'bg-white border border-stone-200 text-stone-600 dark:bg-stone-900 dark:border-stone-800 dark:text-stone-300'
          }`}
        >
          Lunas ({countLunas})
        </button>
      </div>

      {/* Tabel Tagihan (Sesuai Wireframe Page 2) */}
      <div className="overflow-hidden rounded-2xl border border-stone-200/90 bg-white shadow-xs dark:border-stone-800 dark:bg-stone-900">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="border-b border-stone-200/80 bg-stone-50/70 font-semibold text-stone-600 dark:border-stone-800 dark:bg-stone-800/40 dark:text-stone-300">
              <tr>
                <th className="py-3.5 px-4">Nomor</th>
                <th className="py-3.5 px-3">Unit</th>
                <th className="py-3.5 px-3">Penyewa</th>
                <th className="py-3.5 px-3">Sewa</th>
                <th className="py-3.5 px-3">Denda</th>
                <th className="py-3.5 px-3">Terbayar</th>
                <th className="py-3.5 px-3">Status</th>
                <th className="py-3.5 px-4 text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-100 dark:divide-stone-800/60 text-stone-800 dark:text-stone-200">
              {filteredInvoices.map((inv) => {
                const contract = state.contracts.find(c => c.id === inv.kontrak_id);
                const unit = contract ? state.units.find(u => u.id === contract.unit_id) : null;
                const tenant = contract ? state.profiles.find(p => p.id === contract.penyewa_id) : null;

                // Hitung denda dinamis jika belum lunas
                let denda = inv.denda;
                if (inv.status !== 'lunas' && REFERENCE_DATE > inv.jatuh_tempo) {
                  const d1 = new Date(REFERENCE_DATE).getTime();
                  const d2 = new Date(inv.jatuh_tempo).getTime();
                  const diffDays = Math.max(0, Math.ceil((d1 - d2) / (1000 * 60 * 60 * 24)));
                  denda = Math.min(200000, Math.max(inv.denda, diffDays * 20000));
                }

                return (
                  <tr key={inv.id} className="hover:bg-stone-50/70 dark:hover:bg-stone-800/30 transition-colors">
                    <td className="py-3 px-4 font-mono font-bold text-stone-900 dark:text-stone-100">
                      {inv.nomor}
                    </td>
                    <td className="py-3 px-3 font-semibold text-stone-900 dark:text-stone-100">
                      {unit?.kode || '-'}
                    </td>
                    <td className="py-3 px-3 font-medium">
                      {tenant?.nama_lengkap || '-'}
                    </td>
                    <td className="py-3 px-3">
                      {formatRupiah(inv.nominal_sewa)}
                    </td>
                    <td className="py-3 px-3">
                      {denda > 0 ? (
                        <span className="font-semibold text-red-600 dark:text-red-400">
                          {formatRupiah(denda)}
                        </span>
                      ) : (
                        <span className="text-stone-400">-</span>
                      )}
                    </td>
                    <td className="py-3 px-3 font-semibold text-stone-900 dark:text-stone-100">
                      {formatRupiah(inv.terbayar)}
                    </td>
                    <td className="py-3 px-3">
                      <span className={`inline-flex rounded-full px-2 py-0.5 text-[10px] font-semibold capitalize ${
                        inv.status === 'lunas'
                          ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-300'
                          : inv.status === 'sebagian'
                          ? 'bg-amber-100 text-amber-800 dark:bg-amber-950/40 dark:text-amber-300'
                          : inv.status === 'dibatalkan'
                          ? 'bg-stone-200 text-stone-600 dark:bg-stone-800 dark:text-stone-400'
                          : 'bg-red-100 text-red-800 dark:bg-red-950/40 dark:text-red-300'
                      }`}>
                        {inv.status.replace('_', ' ')}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-right space-x-1.5">
                      {/* Tombol Detail */}
                      <button
                        onClick={() => {
                          setDetailInvoice(inv);
                          setErrorMsg('');
                        }}
                        className="rounded-lg border border-stone-200 bg-white px-2 py-1 text-[11px] font-medium text-stone-700 hover:bg-stone-50 dark:border-stone-700 dark:bg-stone-800 dark:text-stone-300"
                      >
                        Detail
                      </button>

                      {/* Tombol Catat Bayar (Pengelola saat status belum lunas) */}
                      {isManager && inv.status !== 'lunas' && inv.status !== 'dibatalkan' && (
                        <button
                          onClick={() => handleOpenPayment(inv)}
                          className="rounded-lg bg-stone-900 px-2.5 py-1 text-[11px] font-semibold text-white hover:bg-emerald-700 dark:bg-stone-100 dark:text-stone-900 transition-colors"
                        >
                          Catat bayar
                        </button>
                      )}

                      {/* Tombol Batalkan Tagihan (Khusus Pemilik jika belum ada bayar - BR-09) */}
                      {isOwner && inv.status === 'belum_bayar' && inv.terbayar === 0 && (
                        <button
                          onClick={() => {
                            setCancelInvTarget(inv);
                            setErrorMsg('');
                          }}
                          className="rounded-lg border border-red-200 px-2 py-1 text-[11px] font-medium text-red-600 hover:bg-red-50 dark:border-red-900/50 dark:text-red-400"
                          title="Batalkan Tagihan Kosong (BR-09)"
                        >
                          Batal
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

      {/* MODAL CATAT PEMBAYARAN (Sesuai Wireframe Page 2 Sisi Kanan) */}
      {activePayInvoice && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-stone-900/60 p-4 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-2xl border border-stone-200 bg-white p-6 shadow-2xl dark:border-stone-800 dark:bg-stone-900">
            <div className="flex items-center justify-between pb-3 border-b border-stone-100 dark:border-stone-800">
              <h3 className="text-base font-bold text-stone-900 dark:text-stone-100">
                Catat Pembayaran
              </h3>
              <button onClick={() => setActivePayInvoice(null)}>
                <X className="h-5 w-5 text-stone-400" />
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
                  <div className="rounded-xl border border-stone-100 bg-stone-50 p-3 dark:border-stone-800 dark:bg-stone-800/40 space-y-1.5">
                    <div className="flex justify-between">
                      <span className="text-stone-400">Tagihan:</span>
                      <span className="font-mono font-semibold">{activePayInvoice.nomor}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-stone-400">Unit / Penyewa:</span>
                      <span className="font-semibold">{unit?.kode} · {tenant?.nama_lengkap}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-stone-400">Sewa:</span>
                      <span>{formatRupiah(activePayInvoice.nominal_sewa)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-stone-400">Sudah dibayar:</span>
                      <span>{formatRupiah(activePayInvoice.terbayar)}</span>
                    </div>
                    <div className="flex justify-between text-red-600 dark:text-red-400 font-medium">
                      <span>Denda per 15 Okt ({hariTelat} hari):</span>
                      <span>{formatRupiah(denda)}</span>
                    </div>
                    <div className="flex justify-between border-t border-stone-200/80 pt-1 text-sm font-bold text-stone-900 dark:text-stone-100">
                      <span>Sisa Kewajiban:</span>
                      <span>{formatRupiah(sisa)}</span>
                    </div>
                  </div>

                  <div>
                    <label className="block text-stone-500 mb-1">Jumlah Dibayar (Rupiah)</label>
                    <input
                      type="number"
                      value={payAmount}
                      onChange={(e) => setPayAmount(Number(e.target.value))}
                      className="w-full rounded-xl border border-stone-200 p-2 text-sm font-bold text-stone-900 dark:border-stone-700 dark:bg-stone-800 dark:text-stone-100"
                    />
                    <p className="mt-1 text-[11px] text-stone-400">
                      Minimal Rp100.000 kecuali melunasi sisa. Jumlah tidak boleh melebihi sisa (BR-08).
                    </p>
                  </div>

                  <div>
                    <label className="block text-stone-500 mb-1">Metode Pembayaran</label>
                    <div className="grid grid-cols-2 gap-2">
                      <button
                        type="button"
                        onClick={() => setPayMethod('tunai')}
                        className={`rounded-xl border p-2 text-center font-medium transition-all ${
                          payMethod === 'tunai'
                            ? 'border-emerald-600 bg-emerald-50 text-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-300'
                            : 'border-stone-200 text-stone-600 dark:border-stone-700'
                        }`}
                      >
                        Tunai
                      </button>
                      <button
                        type="button"
                        onClick={() => setPayMethod('transfer')}
                        className={`rounded-xl border p-2 text-center font-medium transition-all ${
                          payMethod === 'transfer'
                            ? 'border-emerald-600 bg-emerald-50 text-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-300'
                            : 'border-stone-200 text-stone-600 dark:border-stone-700'
                        }`}
                      >
                        Transfer
                      </button>
                    </div>
                  </div>

                  {payMethod === 'transfer' && (
                    <div>
                      <label className="block text-stone-500 mb-1">Bukti Transfer (Wajib untuk transfer - BR-08)</label>
                      <input
                        type="text"
                        value={payProof}
                        onChange={(e) => setPayProof(e.target.value)}
                        placeholder="Path file bukti di bucket privat"
                        className="w-full rounded-xl border border-stone-200 p-2 text-xs font-mono dark:border-stone-700 dark:bg-stone-800 dark:text-stone-100"
                      />
                    </div>
                  )}

                  <div className="mt-5 flex justify-end gap-2 pt-2">
                    <button
                      type="button"
                      onClick={() => setActivePayInvoice(null)}
                      className="rounded-xl border border-stone-200 px-3.5 py-1.5 text-xs font-medium text-stone-600 dark:border-stone-700 dark:text-stone-300"
                    >
                      Batal
                    </button>
                    <button
                      type="button"
                      onClick={handleSavePayment}
                      className="rounded-xl bg-emerald-700 px-4 py-1.5 text-xs font-semibold text-white hover:bg-emerald-800"
                    >
                      Simpan Pembayaran
                    </button>
                  </div>
                </div>
              );
            })()}
          </div>
        </div>
      )}

      {/* MODAL DETAIL & RIWAYAT PEMBAYARAN */}
      {detailInvoice && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-stone-900/60 p-4 backdrop-blur-sm">
          <div className="w-full max-w-lg rounded-2xl border border-stone-200 bg-white p-6 shadow-2xl dark:border-stone-800 dark:bg-stone-900 max-h-[85vh] flex flex-col">
            <div className="flex items-center justify-between pb-3 border-b border-stone-100 dark:border-stone-800">
              <h3 className="text-base font-bold text-stone-900 dark:text-stone-100">
                Detail Tagihan {detailInvoice.nomor}
              </h3>
              <button onClick={() => setDetailInvoice(null)}>
                <X className="h-5 w-5 text-stone-400" />
              </button>
            </div>

            <div className="overflow-y-auto py-3 space-y-4 flex-1 text-xs">
              <div className="grid grid-cols-2 gap-2 rounded-xl bg-stone-50 p-3 dark:bg-stone-800/40">
                <div><span className="text-stone-400">Periode:</span> {formatDateIndo(detailInvoice.periode)}</div>
                <div><span className="text-stone-400">Jatuh Tempo:</span> {formatDateIndo(detailInvoice.jatuh_tempo)}</div>
                <div><span className="text-stone-400">Nominal Sewa:</span> {formatRupiah(detailInvoice.nominal_sewa)}</div>
                <div><span className="text-stone-400">Denda:</span> {formatRupiah(detailInvoice.denda)}</div>
                <div><span className="text-stone-400">Total Terbayar:</span> {formatRupiah(detailInvoice.terbayar)}</div>
                <div><span className="text-stone-400">Status:</span> <span className="font-semibold capitalize">{detailInvoice.status}</span></div>
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
                        <div key={p.id} className="flex items-center justify-between rounded-xl border border-stone-200 p-2.5 dark:border-stone-800">
                          <div>
                            <div className="font-semibold text-stone-900 dark:text-stone-100">
                              {formatRupiah(p.jumlah)} · <span className="uppercase text-[10px] text-stone-500">{p.metode}</span>
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
                            <span className={`rounded-md px-1.5 py-0.5 text-[10px] font-semibold ${
                              p.status === 'sah' ? 'bg-emerald-100 text-emerald-800' : 'bg-red-100 text-red-800'
                            }`}>
                              {p.status}
                            </span>
                            {/* Tombol Batalkan Pembayaran (Khusus Pemilik - BR-09) */}
                            {isOwner && p.status === 'sah' && (
                              <button
                                onClick={() => setCancelPayTarget(p)}
                                className="rounded-md border border-red-200 p-1 text-red-600 hover:bg-red-50 text-[10px]"
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

            <div className="pt-3 border-t border-stone-100 dark:border-stone-800 flex justify-end">
              <button
                onClick={() => setDetailInvoice(null)}
                className="rounded-xl bg-stone-900 px-4 py-1.5 text-xs font-semibold text-white dark:bg-stone-100 dark:text-stone-900"
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
          <div className="w-full max-w-sm rounded-2xl border border-stone-200 bg-white p-5 shadow-2xl dark:border-stone-800 dark:bg-stone-900">
            <h3 className="text-sm font-bold text-red-600">
              Batalkan Pembayaran (BR-09)
            </h3>
            <p className="mt-1 text-xs text-stone-500">
              Koreksi pembayaran Rp{cancelPayTarget.jumlah.toLocaleString('id-ID')}. Status tagihan akan dihitung ulang secara otomatis.
            </p>

            <div className="mt-4">
              <label className="block text-stone-500 text-xs mb-1">Alasan Pembatalan (Wajib)</label>
              <textarea
                rows={2}
                required
                value={cancelPayReason}
                onChange={(e) => setCancelPayReason(e.target.value)}
                placeholder="Contoh: Salah input nominal oleh staf"
                className="w-full rounded-xl border border-stone-200 p-2 text-xs text-stone-900 dark:border-stone-700 dark:bg-stone-800 dark:text-stone-100"
              />
            </div>

            <div className="mt-5 flex justify-end gap-2">
              <button
                onClick={() => setCancelPayTarget(null)}
                className="rounded-xl border border-stone-200 px-3 py-1.5 text-xs font-medium text-stone-600 dark:border-stone-700"
              >
                Batal
              </button>
              <button
                onClick={handleCancelPayment}
                className="rounded-xl bg-red-600 px-3.5 py-1.5 text-xs font-semibold text-white hover:bg-red-700"
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
          <div className="w-full max-w-sm rounded-2xl border border-stone-200 bg-white p-5 shadow-2xl dark:border-stone-800 dark:bg-stone-900">
            <h3 className="text-sm font-bold text-red-600">
              Batalkan Tagihan {cancelInvTarget.nomor}
            </h3>
            <p className="mt-1 text-xs text-stone-500">
              BR-09: Tagihan hanya bisa dibatalkan Pemilik bila belum ada pembayaran sama sekali.
            </p>

            <div className="mt-4">
              <label className="block text-stone-500 text-xs mb-1">Alasan Pembatalan (Wajib)</label>
              <textarea
                rows={2}
                required
                value={cancelInvReason}
                onChange={(e) => setCancelInvReason(e.target.value)}
                placeholder="Contoh: Pembatalan kontrak sebelum awal periode"
                className="w-full rounded-xl border border-stone-200 p-2 text-xs text-stone-900 dark:border-stone-700 dark:bg-stone-800 dark:text-stone-100"
              />
            </div>

            <div className="mt-5 flex justify-end gap-2">
              <button
                onClick={() => setCancelInvTarget(null)}
                className="rounded-xl border border-stone-200 px-3 py-1.5 text-xs font-medium text-stone-600 dark:border-stone-700"
              >
                Batal
              </button>
              <button
                onClick={handleCancelInvoice}
                className="rounded-xl bg-red-600 px-3.5 py-1.5 text-xs font-semibold text-white hover:bg-red-700"
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
