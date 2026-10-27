'use client';

import { useState } from 'react';
import { useGriyaStore } from '@/lib/use-store';
import { formatRupiah, formatDateIndo } from '@/lib/formatters';
import { PropertyUnit, UnitStatus } from '@/lib/types';
import { Building2, Edit2, ShieldAlert, CheckCircle2, Lock, Sparkles, Filter } from 'lucide-react';
import AuthGuard from '@/components/AuthGuard';

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

  // PROTEKSI ROUTE: Belum login
  if (!currentUser) {
    return <AuthGuard moduleName="unit hunian" />;
  }

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
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-[#DCE5D8] pb-6 dark:border-[#2C382A]">
        <div>
          <h1 className="text-2xl font-extrabold tracking-tight text-[#222520] dark:text-[#ECEAE4] sm:text-3xl flex items-center gap-2.5">
            <Building2 className="h-7 w-7 text-[#3B5336] dark:text-[#95B08A]" />
            Daftar 24 Unit Hunian
          </h1>
          <p className="mt-1 text-sm text-[#5D6B58] dark:text-[#A7B8A3]">
            Griya Kenanga Residence · Blok A (Lt 1 Standar), Blok B (Lt 2 AC), Blok C (Lt 3 Studio)
          </p>
        </div>

        {/* Filter Controls */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Filter Lantai */}
          <div className="flex rounded-2xl border border-[#DCE5D8] bg-[#F4F7F2] p-1 text-xs dark:border-[#2C382A] dark:bg-[#182117]">
            {(['all', 1, 2, 3] as const).map((floor) => (
              <button
                key={floor}
                onClick={() => setSelectedFloor(floor)}
                className={`rounded-xl px-3 py-1 font-bold transition-all ${
                  selectedFloor === floor
                    ? 'bg-[#3B5336] text-white shadow-2xs'
                    : 'text-[#5D6B58] hover:text-[#222520] dark:text-[#A7B8A3] dark:hover:text-[#ECEAE4]'
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
            className="rounded-2xl border border-[#DCE5D8] bg-[#F4F7F2] px-3.5 py-1.5 text-xs font-bold text-[#2D4129] dark:border-[#2C382A] dark:bg-[#182117] dark:text-[#D5E6D2]"
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
        <div className="rounded-2xl border border-[#F3C5BF] bg-[#FDF0EE] p-3.5 text-xs text-[#A63A2E] dark:border-red-900/50 dark:bg-red-950/30 dark:text-red-300 flex items-center gap-2">
          <ShieldAlert className="h-4 w-4 shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}

      {successMsg && (
        <div className="rounded-2xl border border-[#95B08A]/50 bg-[#E8EFE5] p-3.5 text-xs font-bold text-[#2D4129] dark:border-emerald-900/50 dark:bg-emerald-950/30 dark:text-emerald-300 flex items-center gap-2">
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
                  ? 'border-[#F6DEB8] bg-[#FEF7EC]/70 dark:border-amber-900/40 dark:bg-amber-950/20'
                  : unit.status === 'nonaktif'
                  ? 'border-stone-300 bg-stone-100/60 dark:border-stone-800 dark:bg-stone-900/40 opacity-75'
                  : activeContract
                  ? 'border-[#DCE5D8] bg-white dark:border-[#2C382A] dark:bg-[#1E261D]'
                  : 'border-[#95B08A]/60 bg-[#E8EFE5]/40 dark:border-[#3B5336] dark:bg-[#182317]'
              }`}
            >
              <div>
                {/* Header Kartu: Kode & Badge Status */}
                <div className="flex items-center justify-between">
                  <div className="text-xl font-extrabold tracking-tight text-[#222520] dark:text-[#ECEAE4]">
                    {unit.kode}
                  </div>
                  <span className={`inline-flex rounded-full px-2.5 py-0.5 text-[10px] font-bold capitalize ${
                    unit.status === 'tersedia'
                      ? 'bg-[#E8EFE5] text-[#2D4129] border border-[#95B08A]/50 dark:bg-[#172216] dark:text-[#95B08A]'
                      : unit.status === 'perbaikan'
                      ? 'bg-[#FEF7EC] text-[#9A6715] border border-[#F6DEB8]'
                      : 'bg-stone-200 text-stone-700 dark:bg-stone-800 dark:text-stone-400'
                  }`}>
                    {unit.status}
                  </span>
                </div>

                {/* Spesifikasi Unit */}
                <div className="mt-2 text-xs text-[#5D6B58] dark:text-[#A7B8A3] capitalize font-medium">
                  Lantai {unit.lantai} · Tipe {unit.tipe} · {unit.luas_m2} m²
                </div>

                {/* Status Penghuni Saat Ini */}
                <div className="mt-4 rounded-xl border border-[#E8EFE5] bg-[#F4F7F2] p-2.5 text-xs dark:border-[#2C382A] dark:bg-[#172016]">
                  <span className="text-[10px] uppercase font-bold text-[#5D6B58] dark:text-[#A7B8A3]">Penyewa Aktif</span>
                  <div className="font-bold text-[#222520] dark:text-[#ECEAE4] mt-0.5">
                    {tenant ? tenant.nama_lengkap : <span className="text-[#7F9979] font-normal italic">Kosong / Siap Sewa</span>}
                  </div>
                  {activeContract && (
                    <div className="text-[11px] text-[#5D6B58] dark:text-[#A7B8A3] mt-1 font-medium">
                      Hingga: {formatDateIndo(activeContract.tanggal_selesai)}
                    </div>
                  )}
                  {hasDraft && (
                    <div className="text-[10px] text-amber-700 dark:text-amber-400 font-bold mt-1">
                      • Memiliki draf kontrak baru
                    </div>
                  )}
                </div>

                {/* Keterangan Unit */}
                {unit.keterangan && (
                  <p className="mt-2 text-[11px] text-[#5D6B58] dark:text-[#A7B8A3] italic">
                    {unit.keterangan}
                  </p>
                )}
              </div>

              {/* Bagian Bawah: Harga Sewa & Tombol Aksi Sesuai Peran */}
              <div className="mt-5 pt-3.5 border-t border-[#E8EFE5] dark:border-[#2C382A] flex items-end justify-between">
                <div>
                  <span className="text-[10px] uppercase font-bold text-[#5D6B58] dark:text-[#A7B8A3] block">Harga Sewa Standar</span>
                  <div className="text-sm font-extrabold text-[#222520] dark:text-[#ECEAE4]">
                    {formatRupiah(unit.harga_sewa_bulanan)}
                    <span className="text-[10px] font-normal text-[#5D6B58]">/bln</span>
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
                    className="rounded-full border border-[#DCE5D8] bg-[#E8EFE5] px-3 py-1 text-[11px] font-bold text-[#2D4129] hover:bg-[#DCE7D9] transition-all"
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
                      className="rounded-full bg-[#3B5336] px-3 py-1 text-[11px] font-bold text-white hover:bg-[#2D4129] active:scale-95 transition-all shadow-2xs"
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
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#171D16]/75 p-4 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="w-full max-w-sm rounded-[28px] border border-[#DCE5D8] bg-white p-6 shadow-2xl dark:border-[#2C382A] dark:bg-[#1E261D]">
            <h3 className="text-base font-extrabold text-[#222520] dark:text-[#ECEAE4]">
              Ubah Status Unit {editStatusUnit.kode}
            </h3>
            <p className="mt-1 text-xs text-[#5D6B58] dark:text-[#A7B8A3] leading-relaxed">
              BR-04: Unit yang masih memiliki kontrak aktif atau draf tidak dapat diubah ke status nonaktif.
            </p>

            <div className="mt-4 space-y-2">
              {(['tersedia', 'perbaikan', 'nonaktif'] as const).map((s) => (
                <label
                  key={s}
                  className={`flex items-center justify-between rounded-2xl border p-3 text-xs font-bold cursor-pointer transition-all ${
                    newStatus === s
                      ? 'border-[#3B5336] bg-[#E8EFE5] text-[#2D4129] dark:bg-[#172216] dark:text-[#D5E6D2]'
                      : 'border-[#E8EFE5] text-[#5D6B58] dark:border-[#2A3728] dark:text-[#A7B8A3]'
                  }`}
                >
                  <span className="capitalize">{s}</span>
                  <input
                    type="radio"
                    name="status_unit"
                    value={s}
                    checked={newStatus === s}
                    onChange={() => setNewStatus(s)}
                    className="accent-[#3B5336]"
                  />
                </label>
              ))}
            </div>

            <div className="mt-6 flex justify-end gap-2">
              <button
                onClick={() => setEditStatusUnit(null)}
                className="rounded-full border border-[#DCE5D8] px-4 py-2 text-xs font-semibold text-[#5D6B58] hover:bg-[#E8EFE5] dark:border-[#2A3728] dark:text-[#A7B8A3] dark:hover:bg-[#1E281C]"
              >
                Batal
              </button>
              <button
                onClick={handleUpdateStatus}
                className="rounded-full bg-[#3B5336] px-5 py-2 text-xs font-bold text-white hover:bg-[#2D4129] active:scale-95 shadow-md"
              >
                Simpan Status
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL UBAH HARGA UNIT (HANYA Pemilik - BR-04) */}
      {editPriceUnit && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#171D16]/75 p-4 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="w-full max-w-sm rounded-[28px] border border-[#DCE5D8] bg-white p-6 shadow-2xl dark:border-[#2C382A] dark:bg-[#1E261D]">
            <h3 className="text-base font-extrabold text-[#222520] dark:text-[#ECEAE4]">
              Ubah Harga Unit {editPriceUnit.kode}
            </h3>
            <p className="mt-1 text-xs text-[#5D6B58] dark:text-[#A7B8A3] leading-relaxed">
              Harga ini berlaku untuk kontrak baru berikutnya. Harga pada kontrak yang sudah berjalan tidak ikut berubah (BR-04).
            </p>

            <div className="mt-4">
              <label className="block text-xs font-semibold text-[#4F604A] dark:text-[#A7B8A3] mb-1">Harga Sewa Bulanan (Rp)</label>
              <input
                type="number"
                step="50000"
                value={newPrice}
                onChange={(e) => setNewPrice(Number(e.target.value))}
                className="w-full rounded-2xl bg-[#E8EFE5]/70 p-3 text-sm font-bold text-[#222520] border border-transparent focus:border-[#3B5336] focus:bg-white focus:outline-none dark:bg-[#161F15] dark:text-white"
              />
            </div>

            <div className="mt-6 flex justify-end gap-2">
              <button
                onClick={() => setEditPriceUnit(null)}
                className="rounded-full border border-[#DCE5D8] px-4 py-2 text-xs font-semibold text-[#5D6B58] hover:bg-[#E8EFE5] dark:border-[#2A3728] dark:text-[#A7B8A3] dark:hover:bg-[#1E281C]"
              >
                Batal
              </button>
              <button
                onClick={handleUpdatePrice}
                className="rounded-full bg-[#3B5336] px-5 py-2 text-xs font-bold text-white hover:bg-[#2D4129] active:scale-95 shadow-md"
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
