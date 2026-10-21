'use client';

import { useState } from 'react';
import { useGriyaStore } from '@/lib/use-store';
import { formatRupiah, formatDateIndo } from '@/lib/formatters';
import { Contract, ContractStatus } from '@/lib/types';
import { KeyRound, ShieldAlert, CheckCircle2, AlertCircle, Plus, X, Search, FileCheck } from 'lucide-react';
import { REFERENCE_DATE } from '@/lib/store';

export default function KontrakPage() {
  const { currentUser, state, store } = useGriyaStore();
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState('');

  // Modal Buat Kontrak Baru
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [formUnitId, setFormUnitId] = useState('');
  const [formTenantId, setFormTenantId] = useState('');
  const [formStartDate, setFormStartDate] = useState('2026-11-01');
  const [formDuration, setFormDuration] = useState<1 | 3 | 6 | 12>(6);

  // Modal Akhiri Dini (Pemilik)
  const [terminateContract, setTerminateContract] = useState<Contract | null>(null);
  const [terminateReason, setTerminateReason] = useState('');

  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  // BR-10: Penyewa ditolak
  if (currentUser.peran === 'penyewa') {
    return (
      <div className="mx-auto max-w-lg px-4 py-16 text-center">
        <ShieldAlert className="mx-auto h-12 w-12 text-red-500 mb-3" />
        <h2 className="text-xl font-bold text-stone-900 dark:text-stone-100">Akses Ditolak</h2>
        <p className="mt-2 text-sm text-stone-500">
          Pengelolaan kontrak sewa hanya dapat dilakukan oleh Pengelola dan Pemilik (BR-10).
        </p>
      </div>
    );
  }

  const isManager = currentUser.peran === 'pengelola';
  const isOwner = currentUser.peran === 'pemilik';

  const filteredContracts = state.contracts.filter((c) => {
    if (selectedStatus !== 'all' && c.status !== selectedStatus) return false;
    const unit = state.units.find(u => u.id === c.unit_id);
    const tenant = state.profiles.find(p => p.id === c.penyewa_id);
    const term = searchTerm.toLowerCase();
    const match = c.nomor.toLowerCase().includes(term) ||
                  (unit && unit.kode.toLowerCase().includes(term)) ||
                  (tenant && tenant.nama_lengkap.toLowerCase().includes(term));
    return match;
  });

  const handleCreateContract = (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setErrorMsg('');
      const created = store.createContract({
        unit_id: formUnitId,
        penyewa_id: formTenantId,
        tanggal_mulai: formStartDate,
        durasi_bulan: formDuration
      });
      setSuccessMsg(`Draf Kontrak ${created.nomor} berhasil dibuat!`);
      setCreateModalOpen(false);
      setTimeout(() => setSuccessMsg(''), 4000);
    } catch (err: unknown) {
      if (err instanceof Error) {
        setErrorMsg(err.message);
      } else {
        setErrorMsg('Gagal membuat kontrak baru');
      }
    }
  };

  const handleActivate = (contractId: string) => {
    try {
      setErrorMsg('');
      store.activateContract(contractId);
      setSuccessMsg('Kontrak berhasil diaktifkan!');
      setTimeout(() => setSuccessMsg(''), 3000);
    } catch (err: unknown) {
      if (err instanceof Error) {
        setErrorMsg(err.message);
      } else {
        setErrorMsg('Gagal mengaktifkan kontrak');
      }
    }
  };

  const handleComplete = (contractId: string) => {
    try {
      setErrorMsg('');
      store.completeContract(contractId);
      setSuccessMsg('Kontrak berhasil diselesaikan!');
      setTimeout(() => setSuccessMsg(''), 3000);
    } catch (err: unknown) {
      if (err instanceof Error) {
        setErrorMsg(err.message);
      } else {
        setErrorMsg('Gagal menyelesaikan kontrak');
      }
    }
  };

  const handleTerminateEarly = () => {
    if (!terminateContract) return;
    try {
      setErrorMsg('');
      store.terminateContractEarly(terminateContract.id, terminateReason);
      setSuccessMsg(`Kontrak ${terminateContract.nomor} berhasil diakhiri lebih awal`);
      setTerminateContract(null);
      setTerminateReason('');
      setTimeout(() => setSuccessMsg(''), 3000);
    } catch (err: unknown) {
      if (err instanceof Error) {
        setErrorMsg(err.message);
      } else {
        setErrorMsg('Gagal mengakhiri kontrak');
      }
    }
  };

  const handleCancelDraft = (contractId: string) => {
    try {
      setErrorMsg('');
      store.cancelDraftContract(contractId);
      setSuccessMsg('Draf kontrak berhasil dibatalkan');
      setTimeout(() => setSuccessMsg(''), 3000);
    } catch (err: unknown) {
      if (err instanceof Error) {
        setErrorMsg(err.message);
      } else {
        setErrorMsg('Gagal membatalkan draf kontrak');
      }
    }
  };

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8 space-y-6">
      
      {/* Header Halaman */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-stone-200/80 pb-6 dark:border-stone-800">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-stone-900 dark:text-stone-100 sm:text-3xl flex items-center gap-2.5">
            <KeyRound className="h-7 w-7 text-stone-800 dark:text-stone-200" />
            Manajemen Kontrak Sewa
          </h1>
          <p className="mt-1 text-sm text-stone-500 dark:text-stone-400">
            Griya Kenanga Residence · Total {state.contracts.length} Kontrak Tercatat
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-stone-400" />
            <input
              type="text"
              placeholder="Cari nomor / unit / nama..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="rounded-xl border border-stone-200 bg-white pl-9 pr-3 py-1.5 text-xs text-stone-800 dark:border-stone-800 dark:bg-stone-900 dark:text-stone-200"
            />
          </div>

          {/* Filter Status */}
          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="rounded-xl border border-stone-200 bg-white px-3 py-1.5 text-xs font-medium text-stone-700 dark:border-stone-800 dark:bg-stone-900 dark:text-stone-300"
          >
            <option value="all">Semua Status</option>
            <option value="aktif">Aktif (19)</option>
            <option value="draf">Draf (2)</option>
            <option value="selesai">Selesai (1)</option>
            <option value="diakhiri">Diakhiri (1)</option>
            <option value="dibatalkan">Dibatalkan</option>
          </select>

          {/* Tombol Buat Kontrak (Pengelola) */}
          {isManager && (
            <button
              onClick={() => {
                setCreateModalOpen(true);
                setErrorMsg('');
              }}
              className="flex items-center gap-1.5 rounded-xl bg-stone-900 px-3.5 py-1.5 text-xs font-semibold text-white hover:bg-emerald-700 dark:bg-stone-100 dark:text-stone-900 transition-colors"
            >
              <Plus className="h-4 w-4" />
              Buat Kontrak Baru
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

      {/* Tabel Kontrak */}
      <div className="overflow-hidden rounded-2xl border border-stone-200/90 bg-white shadow-xs dark:border-stone-800 dark:bg-stone-900">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="border-b border-stone-200/80 bg-stone-50/70 font-semibold text-stone-600 dark:border-stone-800 dark:bg-stone-800/40 dark:text-stone-300">
              <tr>
                <th className="py-3.5 px-4">Nomor Kontrak</th>
                <th className="py-3.5 px-3">Unit</th>
                <th className="py-3.5 px-3">Penyewa</th>
                <th className="py-3.5 px-3">Periode Sewa</th>
                <th className="py-3.5 px-3">Harga Dikunci</th>
                <th className="py-3.5 px-3">Status</th>
                <th className="py-3.5 px-4 text-right">Aksi Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-100 dark:divide-stone-800/60 text-stone-800 dark:text-stone-200">
              {filteredContracts.map((ktr) => {
                const unit = state.units.find(u => u.id === ktr.unit_id);
                const tenant = state.profiles.find(p => p.id === ktr.penyewa_id);
                const ident = state.identities.find(i => i.penyewa_id === ktr.penyewa_id);

                return (
                  <tr key={ktr.id} className="hover:bg-stone-50/70 dark:hover:bg-stone-800/30 transition-colors">
                    <td className="py-3 px-4 font-mono font-bold text-stone-900 dark:text-stone-100">
                      {ktr.nomor}
                    </td>
                    <td className="py-3 px-3 font-semibold text-stone-900 dark:text-stone-100">
                      {unit?.kode} <span className="text-[10px] font-normal text-stone-400 capitalize">({unit?.tipe})</span>
                    </td>
                    <td className="py-3 px-3">
                      <div className="font-semibold text-stone-900 dark:text-stone-100">{tenant?.nama_lengkap}</div>
                      <div className="text-[10px] text-stone-400">
                        {ident ? `KTP: ${ident.status_verifikasi}` : 'KTP: Belum Unggah'}
                      </div>
                    </td>
                    <td className="py-3 px-3">
                      <div>{formatDateIndo(ktr.tanggal_mulai)} s.d {formatDateIndo(ktr.tanggal_selesai)}</div>
                      <div className="text-[10px] text-stone-400">{ktr.durasi_bulan} Bulan</div>
                    </td>
                    <td className="py-3 px-3 font-medium">
                      {formatRupiah(ktr.harga_sewa_bulanan)}/bln
                    </td>
                    <td className="py-3 px-3">
                      <span className={`inline-flex rounded-full px-2 py-0.5 text-[10px] font-semibold capitalize ${
                        ktr.status === 'aktif'
                          ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-300'
                          : ktr.status === 'draf'
                          ? 'bg-amber-100 text-amber-800 dark:bg-amber-950/40 dark:text-amber-300'
                          : ktr.status === 'selesai'
                          ? 'bg-blue-100 text-blue-800 dark:bg-blue-950/40 dark:text-blue-300'
                          : 'bg-stone-100 text-stone-700 dark:bg-stone-800 dark:text-stone-300'
                      }`}>
                        {ktr.status}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-right space-x-1.5">
                      {/* Aksi untuk Draf */}
                      {ktr.status === 'draf' && isManager && (
                        <>
                          <button
                            onClick={() => handleActivate(ktr.id)}
                            className="rounded-lg bg-emerald-600 px-2 py-1 text-[11px] font-semibold text-white hover:bg-emerald-700"
                            title="Aktifkan Kontrak (BR-03)"
                          >
                            Aktifkan
                          </button>
                          <button
                            onClick={() => handleCancelDraft(ktr.id)}
                            className="rounded-lg border border-stone-200 px-2 py-1 text-[11px] text-stone-600 hover:bg-stone-100 dark:border-stone-700 dark:text-stone-300"
                          >
                            Batal
                          </button>
                        </>
                      )}

                      {/* Aksi untuk Aktif */}
                      {ktr.status === 'aktif' && isManager && (
                        <button
                          onClick={() => handleComplete(ktr.id)}
                          className="rounded-lg border border-stone-200 bg-white px-2 py-1 text-[11px] font-medium text-stone-700 hover:bg-stone-50 dark:border-stone-700 dark:bg-stone-800 dark:text-stone-200"
                          title="Selesaikan Kontrak (BR-05)"
                        >
                          Selesaikan
                        </button>
                      )}

                      {/* Pengakhiran dini khusus Pemilik (BR-05) */}
                      {ktr.status === 'aktif' && isOwner && (
                        <button
                          onClick={() => {
                            setTerminateContract(ktr);
                            setErrorMsg('');
                          }}
                          className="rounded-lg bg-red-600 px-2 py-1 text-[11px] font-semibold text-white hover:bg-red-700"
                          title="Akhiri Dini dengan Alasan (BR-05)"
                        >
                          Akhiri Dini
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

      {/* MODAL BUAT KONTRAK BARU (Pengelola) */}
      {createModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-stone-900/60 p-4 backdrop-blur-sm">
          <div className="w-full max-w-lg rounded-2xl border border-stone-200 bg-white p-6 shadow-2xl dark:border-stone-800 dark:bg-stone-900">
            <div className="flex items-center justify-between pb-3 border-b border-stone-100 dark:border-stone-800">
              <h3 className="text-base font-bold text-stone-900 dark:text-stone-100">
                Buat Kontrak Sewa Baru
              </h3>
              <button onClick={() => setCreateModalOpen(false)}>
                <X className="h-5 w-5 text-stone-400" />
              </button>
            </div>

            <form onSubmit={handleCreateContract} className="mt-4 space-y-4 text-xs">
              
              {/* Pilihan Unit */}
              <div>
                <label className="block text-stone-500 mb-1">Pilih Unit Hunian (Hanya Berstatus Tersedia - BR-04)</label>
                <select
                  required
                  value={formUnitId}
                  onChange={(e) => setFormUnitId(e.target.value)}
                  className="w-full rounded-xl border border-stone-200 p-2.5 text-xs text-stone-900 dark:border-stone-700 dark:bg-stone-800 dark:text-stone-100"
                >
                  <option value="">-- Pilih Unit --</option>
                  {state.units.filter(u => u.status === 'tersedia').map((u) => (
                    <option key={u.id} value={u.id}>
                      Unit {u.kode} (Lt {u.lantai} · {u.tipe} · {formatRupiah(u.harga_sewa_bulanan)}/bln)
                    </option>
                  ))}
                </select>
              </div>

              {/* Pilihan Penyewa */}
              <div>
                <label className="block text-stone-500 mb-1">Pilih Calon Penyewa</label>
                <select
                  required
                  value={formTenantId}
                  onChange={(e) => setFormTenantId(e.target.value)}
                  className="w-full rounded-xl border border-stone-200 p-2.5 text-xs text-stone-900 dark:border-stone-700 dark:bg-stone-800 dark:text-stone-100"
                >
                  <option value="">-- Pilih Penyewa --</option>
                  {state.profiles.filter(p => p.peran === 'penyewa').map((p) => {
                    const ident = state.identities.find(i => i.penyewa_id === p.id);
                    return (
                      <option key={p.id} value={p.id}>
                        {p.nama_lengkap} ({p.email}) - KTP: {ident?.status_verifikasi || 'Belum'}
                      </option>
                    );
                  })}
                </select>
              </div>

              {/* Tanggal Mulai (Wajib Tanggal 1 - BR-02) */}
              <div>
                <label className="block text-stone-500 mb-1">Tanggal Mulai (Selalu Tanggal 1 - BR-02)</label>
                <input
                  type="date"
                  required
                  value={formStartDate}
                  onChange={(e) => setFormStartDate(e.target.value)}
                  className="w-full rounded-xl border border-stone-200 p-2.5 text-xs text-stone-900 dark:border-stone-700 dark:bg-stone-800 dark:text-stone-100"
                />
              </div>

              {/* Durasi Bulan (1, 3, 6, 12 - BR-02) */}
              <div>
                <label className="block text-stone-500 mb-1">Durasi Sewa (Bulan)</label>
                <div className="grid grid-cols-4 gap-2">
                  {([1, 3, 6, 12] as const).map((dur) => (
                    <button
                      type="button"
                      key={dur}
                      onClick={() => setFormDuration(dur)}
                      className={`rounded-xl border p-2 text-center font-semibold transition-all ${
                        formDuration === dur
                          ? 'border-emerald-600 bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300'
                          : 'border-stone-200 text-stone-600 dark:border-stone-700 dark:text-stone-300'
                      }`}
                    >
                      {dur} Bulan
                    </button>
                  ))}
                </div>
              </div>

              <div className="rounded-xl border border-stone-100 bg-stone-50 p-2.5 text-[11px] text-stone-500 dark:border-stone-800 dark:bg-stone-800/40">
                • BR-01: Sistem memvalidasi tidak ada irisan kontrak draf/aktif pada unit yang sama.
                <br />
                • BR-04: Harga sewa akan dikunci dan tidak terpengaruh jika harga unit berubah.
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setCreateModalOpen(false)}
                  className="rounded-xl border border-stone-200 px-3.5 py-1.5 text-xs font-medium text-stone-600 dark:border-stone-700 dark:text-stone-300"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="rounded-xl bg-stone-900 px-4 py-1.5 text-xs font-semibold text-white hover:bg-emerald-700 dark:bg-stone-100 dark:text-stone-900"
                >
                  Buat Draf Kontrak
                </button>
              </div>

            </form>
          </div>
        </div>
      )}

      {/* MODAL AKHIRI KONTRAK LEBIH AWAL (Hanya Pemilik - BR-05) */}
      {terminateContract && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-stone-900/60 p-4 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-2xl border border-stone-200 bg-white p-6 shadow-2xl dark:border-stone-800 dark:bg-stone-900">
            <h3 className="text-base font-bold text-red-600 dark:text-red-400">
              Pengakhiran Kontrak Lebih Awal (BR-05)
            </h3>
            <p className="mt-1 text-xs text-stone-500">
              Pengakhiran kontrak {terminateContract.nomor} berlaku hingga akhir bulan berjalan ({REFERENCE_DATE}) dan dicatat di audit log.
            </p>

            <div className="mt-4">
              <label className="block text-stone-500 text-xs mb-1">Alasan Pengakhiran (Wajib Diisi)</label>
              <textarea
                rows={3}
                required
                value={terminateReason}
                onChange={(e) => setTerminateReason(e.target.value)}
                placeholder="Contoh: Penyewa pindah tugas kerja ke luar pulau"
                className="w-full rounded-xl border border-stone-200 p-2.5 text-xs text-stone-900 dark:border-stone-700 dark:bg-stone-800 dark:text-stone-100"
              />
            </div>

            <div className="mt-5 flex justify-end gap-2">
              <button
                onClick={() => setTerminateContract(null)}
                className="rounded-xl border border-stone-200 px-3 py-1.5 text-xs font-medium text-stone-600 dark:border-stone-700 dark:text-stone-300"
              >
                Batal
              </button>
              <button
                onClick={handleTerminateEarly}
                className="rounded-xl bg-red-600 px-3.5 py-1.5 text-xs font-semibold text-white hover:bg-red-700"
              >
                Konfirmasi Akhiri Kontrak
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
