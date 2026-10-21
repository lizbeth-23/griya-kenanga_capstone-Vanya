'use client';

import { useState } from 'react';
import { useGriyaStore } from '@/lib/use-store';
import { formatRupiah, formatDateIndo } from '@/lib/formatters';
import { PropertyUnit, UnitStatus } from '@/lib/types';
import { Building2, Edit2, ShieldAlert, CheckCircle2, Lock, Sparkles, Filter } from 'lucide-react';

export default function UnitPage() {
  const { currentUser, state, store } = useGriyaStore();
  const [selectedFloor, setSelectedFloor] = useState<number | 'all'>('all');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  
  // Modal Edit Status (Pengelola)
  const [editStatusUnit, setEditStatusUnit] = useState<PropertyUnit | null>(null);
  const [newStatus, setNewStatus] = useState<UnitStatus>('tersedia');

  // Modal Edit Harga (Pemilik)
  const [editPriceUnit, setEditPriceUnit] = useState<PropertyUnit | null>(null);
  const [newPrice, setNewPrice] = useState<number>(0);

  const [errorMsg, setErrorMsg] = useState<string>('');
  const [successMsg, setSuccessMsg] = useState<string>('');

  // BR-10: Penyewa tidak boleh akses
  if (currentUser.peran === 'penyewa') {
    return (
      <div className="mx-auto max-w-lg px-4 py-16 text-center">
        <ShieldAlert className="mx-auto h-12 w-12 text-red-500 mb-3" />
        <h2 className="text-xl font-bold text-stone-900 dark:text-stone-100">Akses Ditolak</h2>
        <p className="mt-2 text-sm text-stone-500">
          Halaman daftar dan pengelolaan seluruh unit hanya dapat diakses oleh staf Pengelola dan Pemilik (BR-10).
        </p>
      </div>
    );
  }

  const isOwner = currentUser.peran === 'pemilik';

  const filteredUnits = state.units.filter((u) => {
    if (selectedFloor !== 'all' && u.lantai !== selectedFloor) return false;
    if (selectedStatus !== 'all' && u.status !== selectedStatus) return false;
    return true;
  });

  const handleUpdateStatus = () => {
    if (!editStatusUnit) return;
    try {
      setErrorMsg('');
      store.updateUnitStatus(editStatusUnit.id, newStatus);
      setSuccessMsg(`Status unit ${editStatusUnit.kode} berhasil diubah menjadi ${newStatus}`);
      setEditStatusUnit(null);
      setTimeout(() => setSuccessMsg(''), 3000);
    } catch (err: unknown) {
      if (err instanceof Error) {
        setErrorMsg(err.message);
      } else {
        setErrorMsg('Gagal memperbarui status unit');
      }
    }
  };

  const handleUpdatePrice = () => {
    if (!editPriceUnit) return;
    try {
      setErrorMsg('');
      store.updateUnitPrice(editPriceUnit.id, newPrice);
      setSuccessMsg(`Harga sewa bulanan unit ${editPriceUnit.kode} berhasil diperbarui menjadi ${formatRupiah(newPrice)}`);
      setEditPriceUnit(null);
      setTimeout(() => setSuccessMsg(''), 3000);
    } catch (err: unknown) {
      if (err instanceof Error) {
        setErrorMsg(err.message);
      } else {
        setErrorMsg('Gagal memperbarui harga sewa unit');
      }
    }
  };

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8 space-y-6">
      
      {/* Header Halaman */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-stone-200/80 pb-6 dark:border-stone-800">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-stone-900 dark:text-stone-100 sm:text-3xl flex items-center gap-2.5">
            <Building2 className="h-7 w-7 text-stone-800 dark:text-stone-200" />
            Daftar 24 Unit Hunian
          </h1>
          <p className="mt-1 text-sm text-stone-500 dark:text-stone-400">
            Griya Kenanga Residence · Blok A (Lt 1 Standar), Blok B (Lt 2 AC), Blok C (Lt 3 Studio)
          </p>
        </div>

        {/* Filter Controls */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Filter Lantai */}
          <div className="flex rounded-xl border border-stone-200 bg-white p-1 text-xs dark:border-stone-800 dark:bg-stone-900">
            {(['all', 1, 2, 3] as const).map((floor) => (
              <button
                key={floor}
                onClick={() => setSelectedFloor(floor)}
                className={`rounded-lg px-2.5 py-1 font-medium transition-all ${
                  selectedFloor === floor
                    ? 'bg-stone-900 text-white dark:bg-stone-100 dark:text-stone-900'
                    : 'text-stone-600 hover:text-stone-900 dark:text-stone-400'
                }`}
              >
                {floor === 'all' ? 'Semua Lantai' : `Lt ${floor}`}
              </button>
            ))}
          </div>

          {/* Filter Status */}
          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="rounded-xl border border-stone-200 bg-white px-3 py-1.5 text-xs font-medium text-stone-700 dark:border-stone-800 dark:bg-stone-900 dark:text-stone-300"
          >
            <option value="all">Semua Status</option>
            <option value="tersedia">Tersedia</option>
            <option value="perbaikan">Perbaikan</option>
            <option value="nonaktif">Nonaktif</option>
          </select>
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

      {/* Grid 24 Unit */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {filteredUnits.map((unit) => {
          // Cari kontrak aktif saat ini di unit tsb
          const activeContract = state.contracts.find(c => c.unit_id === unit.id && c.status === 'aktif');
          const tenant = activeContract ? state.profiles.find(p => p.id === activeContract.penyewa_id) : null;
          const hasDraft = state.contracts.some(c => c.unit_id === unit.id && c.status === 'draf');

          return (
            <div
              key={unit.id}
              className={`flex flex-col justify-between rounded-2xl border p-5 shadow-xs transition-all ${
                unit.status === 'perbaikan'
                  ? 'border-amber-200 bg-amber-50/20 dark:border-amber-900/40 dark:bg-amber-950/10'
                  : unit.status === 'nonaktif'
                  ? 'border-stone-300 bg-stone-100/60 dark:border-stone-800 dark:bg-stone-900/40 opacity-75'
                  : activeContract
                  ? 'border-stone-200/90 bg-white dark:border-stone-800 dark:bg-stone-900'
                  : 'border-emerald-200/80 bg-emerald-50/20 dark:border-emerald-900/30 dark:bg-emerald-950/10'
              }`}
            >
              <div>
                {/* Header Kartu: Kode & Badge Status */}
                <div className="flex items-center justify-between">
                  <div className="text-xl font-extrabold tracking-tight text-stone-900 dark:text-stone-100">
                    {unit.kode}
                  </div>
                  <span className={`inline-flex rounded-full px-2 py-0.5 text-[10px] font-semibold capitalize ${
                    unit.status === 'tersedia'
                      ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-300'
                      : unit.status === 'perbaikan'
                      ? 'bg-amber-100 text-amber-800 dark:bg-amber-950/40 dark:text-amber-300'
                      : 'bg-stone-200 text-stone-700 dark:bg-stone-800 dark:text-stone-400'
                  }`}>
                    {unit.status}
                  </span>
                </div>

                {/* Spesifikasi Unit */}
                <div className="mt-2 text-xs text-stone-500 capitalize">
                  Lantai {unit.lantai} · Tipe {unit.tipe} · {unit.luas_m2} m²
                </div>

                {/* Status Penghuni Saat Ini */}
                <div className="mt-4 rounded-xl border border-stone-100 bg-stone-50/80 p-2.5 text-xs dark:border-stone-800 dark:bg-stone-800/40">
                  <span className="text-[10px] uppercase font-semibold text-stone-400">Penyewa Aktif</span>
                  <div className="font-semibold text-stone-900 dark:text-stone-100 mt-0.5">
                    {tenant ? tenant.nama_lengkap : <span className="text-stone-400 font-normal italic">Kosong / Siap Sewa</span>}
                  </div>
                  {activeContract && (
                    <div className="text-[11px] text-stone-500 mt-1">
                      Hingga: {formatDateIndo(activeContract.tanggal_selesai)}
                    </div>
                  )}
                  {hasDraft && (
                    <div className="text-[10px] text-amber-600 dark:text-amber-400 font-medium mt-1">
                      • Memiliki draf kontrak baru
                    </div>
                  )}
                </div>

                {/* Keterangan Unit */}
                {unit.keterangan && (
                  <p className="mt-2 text-[11px] text-stone-500 italic">
                    {unit.keterangan}
                  </p>
                )}
              </div>

              {/* Bagian Bawah: Harga Sewa & Tombol Aksi Sesuai Peran */}
              <div className="mt-5 pt-3 border-t border-stone-100 dark:border-stone-800/80 flex items-end justify-between">
                <div>
                  <span className="text-[10px] uppercase text-stone-400 block">Harga Sewa Standar</span>
                  <div className="text-sm font-bold text-stone-900 dark:text-stone-100">
                    {formatRupiah(unit.harga_sewa_bulanan)}
                    <span className="text-[10px] font-normal text-stone-400">/bln</span>
                  </div>
                </div>

                <div className="flex items-center gap-1.5">
                  {/* Tombol Ubah Status (Pengelola & Pemilik) */}
                  <button
                    onClick={() => {
                      setEditStatusUnit(unit);
                      setNewStatus(unit.status);
                      setErrorMsg('');
                    }}
                    className="rounded-lg border border-stone-200 bg-white px-2 py-1 text-[11px] font-medium text-stone-700 hover:bg-stone-50 dark:border-stone-700 dark:bg-stone-800 dark:text-stone-200"
                    title="Ubah Status Unit"
                  >
                    Status
                  </button>

                  {/* Tombol Ubah Harga Sewa (HANYA Pemilik - BR-04 & BR-10) */}
                  {isOwner && (
                    <button
                      onClick={() => {
                        setEditPriceUnit(unit);
                        setNewPrice(unit.harga_sewa_bulanan);
                        setErrorMsg('');
                      }}
                      className="rounded-lg bg-stone-900 px-2 py-1 text-[11px] font-medium text-white hover:bg-stone-800 dark:bg-stone-100 dark:text-stone-900"
                      title="Ubah Harga Sewa Bulanan"
                    >
                      Ubah Harga
                    </button>
                  )}
                </div>
              </div>

            </div>
          );
        })}
      </div>

      {/* MODAL UBAH STATUS UNIT (Pengelola & Pemilik) */}
      {editStatusUnit && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-stone-900/60 p-4 backdrop-blur-sm">
          <div className="w-full max-w-sm rounded-2xl border border-stone-200 bg-white p-5 shadow-2xl dark:border-stone-800 dark:bg-stone-900">
            <h3 className="text-sm font-bold text-stone-900 dark:text-stone-100">
              Ubah Status Unit {editStatusUnit.kode}
            </h3>
            <p className="mt-1 text-xs text-stone-500">
              BR-04: Unit yang masih memiliki kontrak aktif atau draf tidak dapat diubah ke status nonaktif.
            </p>

            <div className="mt-4 space-y-2">
              {(['tersedia', 'perbaikan', 'nonaktif'] as const).map((s) => (
                <label
                  key={s}
                  className={`flex items-center justify-between rounded-xl border p-2.5 text-xs font-medium cursor-pointer transition-all ${
                    newStatus === s
                      ? 'border-emerald-500/80 bg-emerald-50/50 dark:bg-emerald-950/20'
                      : 'border-stone-200 dark:border-stone-700'
                  }`}
                >
                  <span className="capitalize">{s}</span>
                  <input
                    type="radio"
                    name="status_unit"
                    value={s}
                    checked={newStatus === s}
                    onChange={() => setNewStatus(s)}
                    className="text-emerald-600"
                  />
                </label>
              ))}
            </div>

            <div className="mt-5 flex justify-end gap-2">
              <button
                onClick={() => setEditStatusUnit(null)}
                className="rounded-xl border border-stone-200 px-3 py-1.5 text-xs font-medium text-stone-600 dark:border-stone-700 dark:text-stone-300"
              >
                Batal
              </button>
              <button
                onClick={handleUpdateStatus}
                className="rounded-xl bg-stone-900 px-3.5 py-1.5 text-xs font-semibold text-white dark:bg-stone-100 dark:text-stone-900"
              >
                Simpan Status
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL UBAH HARGA UNIT (HANYA Pemilik - BR-04) */}
      {editPriceUnit && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-stone-900/60 p-4 backdrop-blur-sm">
          <div className="w-full max-w-sm rounded-2xl border border-stone-200 bg-white p-5 shadow-2xl dark:border-stone-800 dark:bg-stone-900">
            <h3 className="text-sm font-bold text-stone-900 dark:text-stone-100">
              Ubah Harga Unit {editPriceUnit.kode}
            </h3>
            <p className="mt-1 text-xs text-stone-500">
              Harga ini berlaku untuk kontrak baru berikutnya. Harga pada kontrak yang sudah berjalan tidak ikut berubah (BR-04).
            </p>

            <div className="mt-4">
              <label className="block text-xs text-stone-500 mb-1">Harga Sewa Bulanan (Rp)</label>
              <input
                type="number"
                step="50000"
                value={newPrice}
                onChange={(e) => setNewPrice(Number(e.target.value))}
                className="w-full rounded-xl border border-stone-200 p-2 text-sm font-semibold text-stone-900 dark:border-stone-700 dark:bg-stone-800 dark:text-stone-100"
              />
            </div>

            <div className="mt-5 flex justify-end gap-2">
              <button
                onClick={() => setEditPriceUnit(null)}
                className="rounded-xl border border-stone-200 px-3 py-1.5 text-xs font-medium text-stone-600 dark:border-stone-700 dark:text-stone-300"
              >
                Batal
              </button>
              <button
                onClick={handleUpdatePrice}
                className="rounded-xl bg-emerald-600 px-3.5 py-1.5 text-xs font-semibold text-white hover:bg-emerald-700"
              >
                Simpan Perubahan
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
