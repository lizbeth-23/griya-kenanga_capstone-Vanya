'use client';

import { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useGriyaStore } from '@/lib/use-store';
import { formatRupiah, formatDateIndo } from '@/lib/formatters';
import { PropertyUnit } from '@/lib/types';
import { 
  Building2, CheckCircle2, ShieldAlert, Sparkles, Filter, 
  DoorClosed, BedDouble, Bath, Wifi, Zap, Wind, UserCheck, 
  Upload, AlertCircle, ArrowRight, X, Clock, HelpCircle
} from 'lucide-react';
import { REFERENCE_DATE } from '@/lib/store';

// Mapping gambar foto kamar per tipe
const ROOM_IMAGES: Record<string, string> = {
  standar: '/images/rooms/kamar-standar.jpg',
  ac: '/images/rooms/kamar-ac.jpg',
  studio: '/images/rooms/kamar-studio.jpg',
};

const ROOM_TYPE_NAMES: Record<string, string> = {
  standar: 'Tipe Standar (Lantai 1)',
  ac: 'Tipe AC & Water Heater (Lantai 2)',
  studio: 'Tipe Studio Eksklusif (Lantai 3)',
};

const ROOM_TYPE_FACILITIES: Record<string, string[]> = {
  standar: [
    'Kamar mandi dalam (shower & kloset)',
    'Kasur single + sprei & bantal',
    'Lemari pakaian 2 pintu & meja belajar',
    'Ventilasi jendela ke ruang terbuka',
    'Listrik token mandiri & WiFi cepat'
  ],
  ac: [
    'Air Conditioner (AC) 1/2 PK hemat daya',
    'Water heater (pemanas air) di kamar mandi dalam',
    'Kasur springbed single besar / queen',
    'Meja kerja minimalis & lemari cermin',
    'Jendela balkon dengan view asri & WiFi cepat'
  ],
  studio: [
    'Kamar ekstra luas + area santai',
    'Kitchenette pribadi (meja dapur & sink)',
    'Kulkas mini 1 pintu hemat listrik',
    'AC 1 PK dingin merata & water heater',
    'Smart TV ready & privasi lantai tertinggi'
  ]
};

export default function SewaKamarPage() {
  const { currentUser, state, store } = useGriyaStore();

  // Filter States
  const [filterFloor, setFilterFloor] = useState<number | 'all'>('all');
  const [filterStatus, setFilterStatus] = useState<'all' | 'tersedia'>('all');
  const [filterType, setFilterType] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');

  // Modal Booking State
  const [selectedUnit, setSelectedUnit] = useState<PropertyUnit | null>(null);
  const [bookingModalOpen, setBookingModalOpen] = useState(false);

  // Form Booking Fields
  const [duration, setDuration] = useState<1 | 3 | 6 | 12>(6);
  const [startDate, setStartDate] = useState('2026-11-01');
  const [nik, setNik] = useState('');
  const [alamatAsal, setAlamatAsal] = useState('');
  const [kontakDaruratNama, setKontakDaruratNama] = useState('');
  const [kontakDaruratHp, setKontakDaruratHp] = useState('');
  const [ktpPreview, setKtpPreview] = useState<string>('');
  const [ktpFileName, setKtpFileName] = useState<string>('');

  // Feedback State
  const [formError, setFormError] = useState('');
  const [bookingSuccess, setBookingSuccess] = useState(false);
  const [submittedContractNo, setSubmittedContractNo] = useState('');

  // Cek kontrak aktif atau draf per unit
  const getUnitOccupancy = (unitId: string) => {
    const contracts = state.contracts.filter(c => c.unit_id === unitId);
    const activeContract = contracts.find(c => c.status === 'aktif');
    const draftContract = contracts.find(c => c.status === 'draf');

    if (activeContract) {
      return { isOccupied: true, statusText: 'Terisi (Ada Penghuni)', badgeType: 'occupied' };
    }
    if (draftContract) {
      return { isOccupied: true, statusText: 'Sedang Diajukan', badgeType: 'draft' };
    }
    return { isOccupied: false, statusText: 'Tersedia Siap Huni', badgeType: 'available' };
  };

  // Statistik Ketersediaan Kamar
  const totalUnits = state.units.length;
  const availableUnits = state.units.filter(u => {
    if (u.status !== 'tersedia') return false;
    const occ = getUnitOccupancy(u.id);
    return !occ.isOccupied;
  }).length;
  const occupiedUnits = state.units.filter(u => getUnitOccupancy(u.id).isOccupied).length;
  const maintenanceUnits = state.units.filter(u => u.status === 'perbaikan').length;

  // Filter Units
  const filteredUnits = state.units.filter(u => {
    const occ = getUnitOccupancy(u.id);

    if (filterFloor !== 'all' && u.lantai !== filterFloor) return false;
    if (filterType !== 'all' && u.tipe !== filterType) return false;
    if (filterStatus === 'tersedia' && (u.status !== 'tersedia' || occ.isOccupied)) return false;
    
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchKode = u.kode.toLowerCase().includes(q);
      const matchTipe = u.tipe.toLowerCase().includes(q);
      if (!matchKode && !matchTipe) return false;
    }

    return true;
  });

  // Handle Foto KTP Upload
  const handleKtpFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setKtpFileName(file.name);
      const reader = new FileReader();
      reader.onloadend = () => {
        setKtpPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  // Gunakan Foto KTP Contoh Demo
  const handleUseDemoKtp = () => {
    setKtpPreview('/3d-house-interior.jpg');
    setKtpFileName('ktp-identitas-resmi.jpg');
    if (!nik) setNik('3271020101990001');
    if (!alamatAsal) setAlamatAsal('Jl. Cempaka Putih Timur No. 12, Jakarta Pusat');
    if (!kontakDaruratNama) setKontakDaruratNama('Siti Aminah (Ibu Kandung)');
    if (!kontakDaruratHp) setKontakDaruratHp('081298765432');
  };

  // Buka Modal Booking
  const handleOpenBooking = (unit: PropertyUnit) => {
    const occ = getUnitOccupancy(unit.id);
    if (unit.status !== 'tersedia' || occ.isOccupied) {
      alert(`Kamar ${unit.kode} tidak dapat disewa karena sudah terisi atau sedang dalam perbaikan.`);
      return;
    }

    setSelectedUnit(unit);
    setFormError('');
    setBookingSuccess(false);

    // Pre-fill jika penyewa sudah punya data identitas
    if (currentUser) {
      const existingIdent = state.identities.find(i => i.penyewa_id === currentUser.id);
      if (existingIdent) {
        setNik(existingIdent.nik || '');
        setAlamatAsal(existingIdent.alamat_asal || '');
        setKontakDaruratNama(existingIdent.kontak_darurat_nama || '');
        setKontakDaruratHp(existingIdent.kontak_darurat_hp || '');
        setKtpPreview(existingIdent.foto_ktp_path || '');
        setKtpFileName('ktp-tersimpan.jpg');
      }
    }

    setBookingModalOpen(true);
  };

  // Submit Booking Form
  const handleSubmitBooking = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedUnit) return;

    if (!currentUser) {
      setFormError('Silakan masuk (login) ke akun penyewa Anda terlebih dahulu untuk mengajukan sewa kamar.');
      return;
    }

    if (currentUser.peran !== 'penyewa') {
      setFormError('Pengajuan sewa kamar online hanya dapat dilakukan oleh akun dengan peran Penyewa.');
      return;
    }

    if (!ktpPreview) {
      setFormError('Foto KTP wajib diunggah sebagai bukti identitas resmi.');
      return;
    }

    try {
      setFormError('');
      const res = store.applyRental({
        unit_id: selectedUnit.id,
        tanggal_mulai: startDate,
        durasi_bulan: duration,
        nik,
        alamat_asal: alamatAsal,
        foto_ktp_path: ktpPreview,
        kontak_darurat_nama: kontakDaruratNama,
        kontak_darurat_hp: kontakDaruratHp,
      });

      setSubmittedContractNo(res.contract.nomor);
      setBookingSuccess(true);
    } catch (err: unknown) {
      if (err instanceof Error) {
        setFormError(err.message);
      } else {
        setFormError('Terjadi kesalahan saat mengajukan sewa kamar');
      }
    }
  };

  return (
    <div className="p-6 sm:p-8 max-w-[1400px] mx-auto space-y-8">
      
      {/* Header Halaman */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#DCE5D8] dark:border-[#2C382A]">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-[#222520] dark:text-[#ECEAE4] flex items-center gap-3">
            <Building2 className="h-7 w-7 text-[#2E6B47]" />
            Katalog &amp; Ketersediaan Kamar Kos
          </h1>
          <p className="mt-1 text-xs sm:text-sm text-[#5D6B58] dark:text-[#A7B8A3]">
            Pilih kamar kos impian Anda di Griya Kenanga Residence, cek ketersediaan real-time, dan ajukan sewa dengan verifikasi identitas KTP online.
          </p>
        </div>

        {currentUser?.peran === 'penyewa' && (
          <Link
            href="/"
            className="inline-flex items-center gap-1.5 rounded-lg border border-[#DCE5D8] bg-white px-3.5 py-2 text-xs font-semibold text-[#2E6B47] hover:bg-[#F5F2EB] dark:border-[#2C382A] dark:bg-[#1E261D] dark:text-[#95B08A] transition-colors"
          >
            Kembali ke Beranda Saya
            <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        )}
      </div>

      {/* Ringkasan Status Ketersediaan Kamar */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="rounded-xl border border-[#DCE5D8] bg-white p-4 shadow-2xs dark:border-[#2C382A] dark:bg-[#1E261D]">
          <span className="text-xs text-[#5D6B58] dark:text-[#A7B8A3] font-medium">Total Kamar</span>
          <div className="text-2xl font-extrabold text-[#222520] dark:text-[#ECEAE4] mt-1">
            {totalUnits} Unit
          </div>
          <span className="text-[11px] text-[#5D6B58] mt-0.5 block">Lantai 1, 2, dan 3</span>
        </div>

        <div className="rounded-xl border border-[#A7CCA5] bg-[#E8EFE5]/50 p-4 shadow-2xs dark:border-[#2E6B47] dark:bg-[#172216]">
          <span className="text-xs text-[#2E6B47] dark:text-[#95B08A] font-bold flex items-center gap-1.5">
            <span className="h-2 w-2 rounded-full bg-[#2E6B47] animate-pulse"></span>
            Tersedia Siap Huni
          </span>
          <div className="text-2xl font-extrabold text-[#2E6B47] dark:text-[#95B08A] mt-1">
            {availableUnits} Unit
          </div>
          <span className="text-[11px] text-[#4F604A] dark:text-[#A7B8A3] mt-0.5 block">Bisa langsung disewa</span>
        </div>

        <div className="rounded-xl border border-[#DCE5D8] bg-white p-4 shadow-2xs dark:border-[#2C382A] dark:bg-[#1E261D]">
          <span className="text-xs text-stone-500 font-medium">Sudah Terisi</span>
          <div className="text-2xl font-extrabold text-stone-700 dark:text-stone-300 mt-1">
            {occupiedUnits} Unit
          </div>
          <span className="text-[11px] text-stone-400 mt-0.5 block">Ditempati penghuni aktif</span>
        </div>

        <div className="rounded-xl border border-amber-200 bg-amber-50/50 p-4 shadow-2xs dark:border-amber-900/40 dark:bg-amber-950/20">
          <span className="text-xs text-amber-800 dark:text-amber-300 font-medium">Dalam Perbaikan</span>
          <div className="text-2xl font-extrabold text-amber-800 dark:text-amber-300 mt-1">
            {maintenanceUnits} Unit
          </div>
          <span className="text-[11px] text-amber-700/80 dark:text-amber-400/80 mt-0.5 block">Sedang renovasi (B-205)</span>
        </div>
      </div>

      {/* Bar Filter & Pencarian */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 rounded-xl border border-[#DCE5D8] bg-white p-4 shadow-2xs dark:border-[#2C382A] dark:bg-[#1E261D]">
        
        {/* Filter Lantai & Status */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Status Ketersediaan */}
          <div className="flex rounded-lg border border-[#DCE5D8] bg-[#F5F2EB] p-1 text-xs font-semibold dark:border-[#2C382A] dark:bg-[#171D16]">
            <button
              onClick={() => setFilterStatus('all')}
              className={`rounded-md px-3 py-1.5 transition-all ${
                filterStatus === 'all'
                  ? 'bg-[#1E251F] text-white shadow-xs'
                  : 'text-[#5D6B58] hover:text-[#222520] dark:text-[#A7B8A3]'
              }`}
            >
              Semua Kamar
            </button>
            <button
              onClick={() => setFilterStatus('tersedia')}
              className={`rounded-md px-3 py-1.5 transition-all ${
                filterStatus === 'tersedia'
                  ? 'bg-[#2E6B47] text-white shadow-xs'
                  : 'text-[#5D6B58] hover:text-[#222520] dark:text-[#A7B8A3]'
              }`}
            >
              Tersedia Saja ({availableUnits})
            </button>
          </div>

          {/* Filter Lantai */}
          <select
            value={filterFloor}
            onChange={(e) => setFilterFloor(e.target.value === 'all' ? 'all' : Number(e.target.value))}
            className="rounded-lg border border-[#DCE5D8] bg-white px-3 py-1.5 text-xs font-medium text-[#222520] focus:outline-none dark:border-[#2C382A] dark:bg-[#171D16] dark:text-[#ECEAE4]"
          >
            <option value="all">Semua Lantai</option>
            <option value={1}>Lantai 1 · Standar</option>
            <option value={2}>Lantai 2 · AC</option>
            <option value={3}>Lantai 3 · Studio</option>
          </select>

          {/* Filter Tipe */}
          <select
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
            className="rounded-lg border border-[#DCE5D8] bg-white px-3 py-1.5 text-xs font-medium text-[#222520] focus:outline-none dark:border-[#2C382A] dark:bg-[#171D16] dark:text-[#ECEAE4]"
          >
            <option value="all">Semua Tipe Kamar</option>
            <option value="standar">Tipe Standar</option>
            <option value="ac">Tipe AC &amp; Water Heater</option>
            <option value="studio">Tipe Studio Eksklusif</option>
          </select>
        </div>

        {/* Search Box */}
        <div className="relative min-w-[200px]">
          <input
            type="text"
            placeholder="Cari kode kamar (misal: A-101)..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full rounded-lg border border-[#DCE5D8] bg-[#F5F2EB]/60 px-3 py-1.5 text-xs text-[#222520] placeholder-[#5D6B58]/60 focus:bg-white focus:outline-none focus:ring-1 focus:ring-[#2E6B47] dark:border-[#2C382A] dark:bg-[#171D16] dark:text-[#ECEAE4]"
          />
        </div>
      </div>

      {/* Grid Katalog Kamar */}
      {filteredUnits.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-[#DCE5D8] p-12 text-center dark:border-[#2C382A]">
          <DoorClosed className="mx-auto h-12 w-12 text-[#5D6B58] opacity-50" />
          <h3 className="mt-3 text-base font-bold text-[#222520] dark:text-[#ECEAE4]">
            Tidak ada kamar yang cocok
          </h3>
          <p className="mt-1 text-xs text-[#5D6B58] dark:text-[#A7B8A3]">
            Coba ubah filter atau kata kunci pencarian Anda untuk melihat unit lainnya.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredUnits.map((unit) => {
            const occ = getUnitOccupancy(unit.id);
            const isAvailable = unit.status === 'tersedia' && !occ.isOccupied;
            const roomImage = ROOM_IMAGES[unit.tipe] || '/images/rooms/kamar-standar.jpg';
            const facilities = ROOM_TYPE_FACILITIES[unit.tipe] || [];

            return (
              <div
                key={unit.id}
                className={`rounded-2xl border bg-white overflow-hidden shadow-2xs transition-all flex flex-col justify-between dark:bg-[#1E261D] ${
                  isAvailable
                    ? 'border-[#DCE5D8] hover:border-[#2E6B47] hover:shadow-md dark:border-[#2C382A]'
                    : 'border-stone-200 opacity-90 dark:border-stone-800'
                }`}
              >
                <div>
                  {/* Foto Kamar dengan Label Status */}
                  <div className="relative h-48 w-full bg-stone-100 overflow-hidden">
                    <Image
                      src={roomImage}
                      alt={`Foto Kamar ${unit.kode}`}
                      fill
                      className="object-cover transition-transform duration-500 hover:scale-105"
                      sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                    />

                    {/* Badge Status Ketersediaan Real-Time */}
                    <div className="absolute top-3 left-3">
                      {isAvailable ? (
                        <span className="inline-flex items-center gap-1.5 rounded-full bg-[#2E6B47] text-white px-3 py-1 text-xs font-bold shadow-md">
                          <span className="h-1.5 w-1.5 rounded-full bg-white animate-pulse"></span>
                          Tersedia Siap Huni
                        </span>
                      ) : unit.status === 'perbaikan' ? (
                        <span className="inline-flex items-center rounded-full bg-amber-500 text-white px-3 py-1 text-xs font-bold shadow-md">
                          Dalam Perbaikan
                        </span>
                      ) : unit.status === 'nonaktif' ? (
                        <span className="inline-flex items-center rounded-full bg-red-600 text-white px-3 py-1 text-xs font-bold shadow-md">
                          Nonaktif
                        </span>
                      ) : (
                        <span className="inline-flex items-center rounded-full bg-stone-800/80 backdrop-blur-xs text-white px-3 py-1 text-xs font-medium shadow-md">
                          {occ.statusText}
                        </span>
                      )}
                    </div>

                    {/* Badge Tipe Kamar */}
                    <div className="absolute bottom-3 right-3">
                      <span className="rounded-md bg-white/90 backdrop-blur-xs text-[#222520] px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider shadow-xs dark:bg-stone-900/90 dark:text-stone-100">
                        Lantai {unit.lantai} · {unit.tipe.toUpperCase()}
                      </span>
                    </div>
                  </div>

                  {/* Konten Kartu */}
                  <div className="p-5 space-y-4">
                    <div className="flex items-start justify-between">
                      <div>
                        <h2 className="text-xl font-extrabold text-[#222520] dark:text-[#ECEAE4]">
                          Unit {unit.kode}
                        </h2>
                        <span className="text-xs text-[#5D6B58] dark:text-[#A7B8A3] font-medium">
                          {ROOM_TYPE_NAMES[unit.tipe]} · Luas {unit.luas_m2} m²
                        </span>
                      </div>
                      <div className="text-right">
                        <span className="text-base sm:text-lg font-bold text-[#2E6B47] dark:text-[#95B08A]">
                          {formatRupiah(unit.harga_sewa_bulanan)}
                        </span>
                        <span className="text-[10px] text-[#5D6B58] block">/ bulan</span>
                      </div>
                    </div>

                    {/* Fasilitas Kamar */}
                    <div className="space-y-1.5 pt-1 border-t border-[#DCE5D8]/70 dark:border-[#2C382A]">
                      <span className="text-[11px] font-bold text-[#5D6B58] uppercase tracking-wider block mb-1">
                        Fasilitas Kamar:
                      </span>
                      {facilities.slice(0, 3).map((f, i) => (
                        <div key={i} className="flex items-center gap-2 text-xs text-stone-700 dark:text-stone-300">
                          <CheckCircle2 className="h-3.5 w-3.5 text-[#2E6B47] shrink-0" />
                          <span className="truncate">{f}</span>
                        </div>
                      ))}
                      <div className="text-[11px] text-[#2E6B47] font-semibold pt-0.5">
                        + Kamar mandi dalam &amp; Listrik token mandiri
                      </div>
                    </div>
                  </div>
                </div>

                {/* Tombol Aksi */}
                <div className="p-5 pt-0">
                  {isAvailable ? (
                    <button
                      onClick={() => handleOpenBooking(unit)}
                      className="w-full rounded-xl bg-[#2E6B47] py-2.5 px-4 text-xs font-bold text-white shadow-xs hover:bg-[#255739] active:scale-98 transition-all flex items-center justify-center gap-2"
                    >
                      Pilih &amp; Sewa Kamar Ini
                      <ArrowRight className="h-4 w-4" />
                    </button>
                  ) : (
                    <button
                      disabled
                      className="w-full rounded-xl bg-stone-100 py-2.5 px-4 text-xs font-semibold text-stone-400 border border-stone-200 cursor-not-allowed dark:bg-stone-800/40 dark:border-stone-800 dark:text-stone-500"
                    >
                      Kamar Tidak Tersedia ({occ.statusText})
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* ===================================================================== */}
      {/* MODAL FORM PENYEWAAN & UNGGAH FOTO KTP                               */}
      {/* ===================================================================== */}
      {bookingModalOpen && selectedUnit && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-xs animate-in fade-in duration-200 overflow-y-auto">
          <div className="w-full max-w-2xl rounded-2xl bg-white p-6 sm:p-8 shadow-2xl dark:bg-[#1E261D] max-h-[90vh] overflow-y-auto space-y-6">
            
            {/* Modal Header */}
            <div className="flex items-center justify-between pb-4 border-b border-[#DCE5D8] dark:border-[#2C382A]">
              <div>
                <h3 className="text-lg font-bold text-[#222520] dark:text-[#ECEAE4]">
                  Formulir Pengajuan Sewa Kamar
                </h3>
                <p className="text-xs text-[#5D6B58] dark:text-[#A7B8A3] mt-0.5">
                  Lengkapi data identitas resmi dan foto KTP untuk verifikasi pengelola.
                </p>
              </div>
              <button
                onClick={() => setBookingModalOpen(false)}
                className="h-8 w-8 rounded-full flex items-center justify-center text-stone-400 hover:bg-stone-100 hover:text-stone-700 dark:hover:bg-stone-800 transition-colors"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {/* Jika Berhasil Mengajukan */}
            {bookingSuccess ? (
              <div className="py-8 text-center space-y-4">
                <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-[#E8EFE5] text-[#2E6B47] dark:bg-[#172216]">
                  <CheckCircle2 className="h-9 w-9" />
                </div>
                <h4 className="text-xl font-bold text-[#222520] dark:text-[#ECEAE4]">
                  Pengajuan Sewa Kamar Berhasil Terkirim!
                </h4>
                <p className="text-xs sm:text-sm text-[#5D6B58] dark:text-[#A7B8A3] max-w-md mx-auto leading-relaxed">
                  Data pengajuan sewa untuk <strong className="text-[#222520] dark:text-white">Unit {selectedUnit.kode}</strong> (Nomor Kontrak: <span className="font-mono font-bold text-[#2E6B47]">{submittedContractNo}</span>) dan foto KTP Anda telah masuk ke sistem pengelola.
                </p>

                <div className="rounded-xl border border-[#DCE5D8] bg-[#F5F2EB]/50 p-4 text-left text-xs space-y-2 dark:border-[#2C382A] dark:bg-[#171D16] max-w-md mx-auto">
                  <div className="font-bold text-[#222520] dark:text-[#ECEAE4] flex items-center gap-1.5">
                    <Clock className="h-4 w-4 text-[#2E6B47]" />
                    Tahapan Selanjutnya:
                  </div>
                  <ol className="list-decimal pl-4 space-y-1 text-stone-600 dark:text-stone-300">
                    <li>Pengelola meninjau dan memverifikasi keabsahan foto KTP Anda.</li>
                    <li>Setelah terverifikasi, kontrak sewa Anda akan diaktifkan secara resmi.</li>
                    <li>Status pengajuan dan tagihan pertama dapat dipantau langsung di Beranda Anda.</li>
                  </ol>
                </div>

                <div className="pt-4 flex items-center justify-center gap-3">
                  <Link
                    href="/"
                    onClick={() => setBookingModalOpen(false)}
                    className="rounded-xl bg-[#2E6B47] px-6 py-2.5 text-xs font-bold text-white shadow-xs hover:bg-[#255739] transition-all"
                  >
                    Buka Beranda Saya
                  </Link>
                </div>
              </div>
            ) : (
              /* Form Pengajuan */
              <form onSubmit={handleSubmitBooking} className="space-y-6 text-xs">
                
                {/* Rincian Kamar Terpilih */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 rounded-xl border border-[#DCE5D8] bg-[#F5F2EB]/70 p-4 dark:border-[#2C382A] dark:bg-[#171D16]">
                  <div className="flex items-center gap-3">
                    <div className="relative h-14 w-14 rounded-lg overflow-hidden shrink-0 border border-stone-200">
                      <Image
                        src={ROOM_IMAGES[selectedUnit.tipe] || '/images/rooms/kamar-standar.jpg'}
                        alt="Foto Unit"
                        fill
                        className="object-cover"
                      />
                    </div>
                    <div>
                      <div className="text-base font-extrabold text-[#222520] dark:text-[#ECEAE4]">
                        Unit {selectedUnit.kode}
                      </div>
                      <div className="text-[11px] text-[#5D6B58] dark:text-[#A7B8A3]">
                        {ROOM_TYPE_NAMES[selectedUnit.tipe]} · Lantai {selectedUnit.lantai} ({selectedUnit.luas_m2} m²)
                      </div>
                    </div>
                  </div>
                  <div className="text-left sm:text-right border-t sm:border-t-0 pt-2 sm:pt-0 border-stone-200">
                    <div className="text-xs text-[#5D6B58]">Biaya Sewa</div>
                    <div className="text-base font-bold text-[#2E6B47] dark:text-[#95B08A]">
                      {formatRupiah(selectedUnit.harga_sewa_bulanan)}
                      <span className="text-[10px] text-stone-500 font-normal">/bln</span>
                    </div>
                  </div>
                </div>

                {formError && (
                  <div className="rounded-xl border border-red-200 bg-red-50 p-3 text-red-700 dark:border-red-900/50 dark:bg-red-950/30 dark:text-red-300 flex items-start gap-2">
                    <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
                    <span>{formError}</span>
                  </div>
                )}

                {/* Sesi 1: Durasi Sewa & Tanggal Mulai (BR-01, BR-02) */}
                <div className="space-y-3">
                  <h4 className="font-bold text-[#222520] dark:text-[#ECEAE4] border-b border-stone-100 pb-1.5 flex items-center gap-1.5">
                    <Clock className="h-4 w-4 text-[#2E6B47]" />
                    1. Periode &amp; Durasi Sewa
                  </h4>
                  
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-[11px] font-semibold text-[#5D6B58] dark:text-[#A7B8A3] mb-1">
                        Pilihan Durasi Sewa (Bulan)
                      </label>
                      <div className="grid grid-cols-4 gap-2">
                        {([1, 3, 6, 12] as const).map((dur) => (
                          <button
                            key={dur}
                            type="button"
                            onClick={() => setDuration(dur)}
                            className={`rounded-lg py-2 text-xs font-bold transition-all ${
                              duration === dur
                                ? 'bg-[#2E6B47] text-white shadow-xs'
                                : 'bg-[#F5F2EB] text-[#222520] hover:bg-stone-200 dark:bg-stone-800 dark:text-stone-200'
                            }`}
                          >
                            {dur} Bln
                          </button>
                        ))}
                      </div>
                    </div>

                    <div>
                      <label className="block text-[11px] font-semibold text-[#5D6B58] dark:text-[#A7B8A3] mb-1">
                        Tanggal Mulai Sewa (Wajib Tanggal 1 - BR-02)
                      </label>
                      <select
                        value={startDate}
                        onChange={(e) => setStartDate(e.target.value)}
                        className="w-full rounded-lg border border-[#DCE5D8] bg-white p-2 text-xs text-[#222520] focus:outline-none focus:ring-1 focus:ring-[#2E6B47] dark:border-[#2C382A] dark:bg-[#171D16] dark:text-[#ECEAE4]"
                      >
                        <option value="2026-11-01">1 November 2026</option>
                        <option value="2026-12-01">1 Desember 2026</option>
                        <option value="2027-01-01">1 Januari 2027</option>
                      </select>
                    </div>
                  </div>
                </div>

                {/* Sesi 2: Data Identitas Penyewa */}
                <div className="space-y-3">
                  <h4 className="font-bold text-[#222520] dark:text-[#ECEAE4] border-b border-stone-100 pb-1.5 flex items-center gap-1.5">
                    <UserCheck className="h-4 w-4 text-[#2E6B47]" />
                    2. Data Identitas Sesuai KTP
                  </h4>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[11px] font-semibold text-[#5D6B58] dark:text-[#A7B8A3] mb-1">
                        Nomor Induk Kependudukan (NIK - 16 Digit) *
                      </label>
                      <input
                        type="text"
                        maxLength={16}
                        required
                        placeholder="Contoh: 3271020101990001"
                        value={nik}
                        onChange={(e) => setNik(e.target.value.replace(/\D/g, ''))}
                        className="w-full rounded-lg border border-[#DCE5D8] bg-white p-2 text-xs font-mono text-[#222520] focus:outline-none focus:ring-1 focus:ring-[#2E6B47] dark:border-[#2C382A] dark:bg-[#171D16] dark:text-[#ECEAE4]"
                      />
                      <span className="text-[10px] text-stone-400 mt-0.5 block">
                        {nik.length}/16 digit angka
                      </span>
                    </div>

                    <div>
                      <label className="block text-[11px] font-semibold text-[#5D6B58] dark:text-[#A7B8A3] mb-1">
                        Alamat Asal Sesuai KTP *
                      </label>
                      <input
                        type="text"
                        required
                        placeholder="Alamat asal lengkap..."
                        value={alamatAsal}
                        onChange={(e) => setAlamatAsal(e.target.value)}
                        className="w-full rounded-lg border border-[#DCE5D8] bg-white p-2 text-xs text-[#222520] focus:outline-none focus:ring-1 focus:ring-[#2E6B47] dark:border-[#2C382A] dark:bg-[#171D16] dark:text-[#ECEAE4]"
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] font-semibold text-[#5D6B58] dark:text-[#A7B8A3] mb-1">
                        Nama Kontak Darurat (Keluarga) *
                      </label>
                      <input
                        type="text"
                        required
                        placeholder="Nama orang tua / wali..."
                        value={kontakDaruratNama}
                        onChange={(e) => setKontakDaruratNama(e.target.value)}
                        className="w-full rounded-lg border border-[#DCE5D8] bg-white p-2 text-xs text-[#222520] focus:outline-none focus:ring-1 focus:ring-[#2E6B47] dark:border-[#2C382A] dark:bg-[#171D16] dark:text-[#ECEAE4]"
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] font-semibold text-[#5D6B58] dark:text-[#A7B8A3] mb-1">
                        No. HP Kontak Darurat *
                      </label>
                      <input
                        type="text"
                        required
                        placeholder="081234567890"
                        value={kontakDaruratHp}
                        onChange={(e) => setKontakDaruratHp(e.target.value)}
                        className="w-full rounded-lg border border-[#DCE5D8] bg-white p-2 text-xs text-[#222520] focus:outline-none focus:ring-1 focus:ring-[#2E6B47] dark:border-[#2C382A] dark:bg-[#171D16] dark:text-[#ECEAE4]"
                      />
                    </div>
                  </div>
                </div>

                {/* Sesi 3: Unggah Foto KTP */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between border-b border-stone-100 pb-1.5">
                    <h4 className="font-bold text-[#222520] dark:text-[#ECEAE4] flex items-center gap-1.5">
                      <Upload className="h-4 w-4 text-[#2E6B47]" />
                      3. Unggah Dokumen Foto KTP Asli *
                    </h4>
                    <button
                      type="button"
                      onClick={handleUseDemoKtp}
                      className="text-[11px] text-[#2E6B47] font-semibold hover:underline"
                    >
                      + Isi Otomatis Data &amp; KTP Demo
                    </button>
                  </div>

                  <div className="rounded-xl border border-dashed border-[#DCE5D8] bg-[#F5F2EB]/40 p-4 dark:border-[#2C382A] dark:bg-[#171D16] text-center space-y-3">
                    {ktpPreview ? (
                      <div className="space-y-2">
                        <div className="relative mx-auto h-40 max-w-sm rounded-lg overflow-hidden border border-stone-300 shadow-sm">
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img
                            src={ktpPreview}
                            alt="Pratinjau KTP"
                            className="h-full w-full object-cover"
                          />
                        </div>
                        <div className="flex items-center justify-center gap-2 text-xs text-[#2E6B47] font-medium">
                          <CheckCircle2 className="h-4 w-4" />
                          <span>{ktpFileName || 'Foto KTP Terpilih'}</span>
                          <button
                            type="button"
                            onClick={() => {
                              setKtpPreview('');
                              setKtpFileName('');
                            }}
                            className="text-red-500 hover:underline text-[11px] ml-2"
                          >
                            Ganti Foto
                          </button>
                        </div>
                      </div>
                    ) : (
                      <label className="flex flex-col items-center justify-center cursor-pointer py-4">
                        <Upload className="h-8 w-8 text-[#5D6B58] mb-2" />
                        <span className="text-xs font-bold text-[#222520] dark:text-stone-200">
                          Klik untuk memilih file Foto KTP
                        </span>
                        <span className="text-[11px] text-[#5D6B58] mt-0.5">
                          Format JPG, PNG, atau WEBP (Maks 5 MB)
                        </span>
                        <input
                          type="file"
                          accept="image/*"
                          onChange={handleKtpFileChange}
                          className="hidden"
                        />
                      </label>
                    )}
                  </div>
                </div>

                {/* Sesi 4: Ringkasan Total & Tombol Submit */}
                <div className="rounded-xl border border-[#DCE5D8] bg-[#E8EFE5]/40 p-4 text-xs dark:border-[#2C382A] dark:bg-[#172216] space-y-2">
                  <div className="flex justify-between font-medium">
                    <span className="text-stone-600 dark:text-stone-400">Total Durasi Sewa:</span>
                    <span className="font-bold text-[#222520] dark:text-white">{duration} Bulan</span>
                  </div>
                  <div className="flex justify-between font-medium">
                    <span className="text-stone-600 dark:text-stone-400">Harga Sewa Bulanan (Terkunci):</span>
                    <span className="font-bold text-[#2E6B47]">{formatRupiah(selectedUnit.harga_sewa_bulanan)}/bln</span>
                  </div>
                  <div className="border-t border-[#DCE5D8] pt-2 flex justify-between text-sm font-extrabold text-[#222520] dark:text-white">
                    <span>Estimasi Total Sewa:</span>
                    <span className="text-[#2E6B47]">{formatRupiah(selectedUnit.harga_sewa_bulanan * duration)}</span>
                  </div>
                  <p className="text-[10px] text-stone-500 dark:text-stone-400 pt-1 leading-relaxed">
                    * Pembayaran tagihan dilakukan secara bulanan. Tagihan pertama akan diterbitkan setelah verifikasi foto KTP disetujui oleh pengelola.
                  </p>
                </div>

                <div className="flex items-center justify-end gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => setBookingModalOpen(false)}
                    className="rounded-xl border border-[#DCE5D8] px-4 py-2.5 text-xs font-semibold text-[#5D6B58] hover:bg-stone-100 dark:border-[#2C382A] dark:text-[#A7B8A3]"
                  >
                    Batal
                  </button>
                  <button
                    type="submit"
                    className="rounded-xl bg-[#2E6B47] px-6 py-2.5 text-xs font-bold text-white shadow-sm hover:bg-[#255739] transition-all"
                  >
                    Kirim Pengajuan Sewa &amp; KTP
                  </button>
                </div>
              </form>
            )}

          </div>
        </div>
      )}

    </div>
  );
}
