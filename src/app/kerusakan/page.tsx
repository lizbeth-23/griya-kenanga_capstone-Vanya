'use client';

import { useState } from 'react';
import { useGriyaStore } from '@/lib/use-store';
import { formatRupiah, formatDateIndo, formatDateTimeIndo } from '@/lib/formatters';
import { DamageReport, DamageCategory } from '@/lib/types';
import { Wrench, ShieldAlert, CheckCircle2, Plus, X, AlertTriangle, ArrowRight, Camera } from 'lucide-react';
import { REFERENCE_DATE } from '@/lib/store';
import AuthGuard from '@/components/AuthGuard';

export default function KerusakanPage() {
  const { currentUser, state, store } = useGriyaStore();
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [selectedReportId, setSelectedReportId] = useState<string>('lk-0010'); // Default detail LK-0010 sesuai Wireframe Page 3

  // Modal Buat Laporan (Penyewa)
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [newKategori, setNewKategori] = useState<DamageCategory>('bangunan');
  const [newJudul, setNewJudul] = useState('');
  const [newDeskripsi, setNewDeskripsi] = useState('');
  const [newFotoPath, setNewFotoPath] = useState('/uploads/damage/foto_rusak_1.jpg');

  // Modal Proses (Pengelola)
  const [processReport, setProcessReport] = useState<DamageReport | null>(null);
  const [estimasiBiaya, setEstimasiBiaya] = useState<number>(0);
  const [catatanPengelola, setCatatanPengelola] = useState('');

  // Modal Tandai Selesai (Pengelola)
  const [finishReport, setFinishReport] = useState<DamageReport | null>(null);
  const [biayaAktual, setBiayaAktual] = useState<number>(0);

  // Modal Persetujuan Pemilik
  const [approveReport, setApproveReport] = useState<DamageReport | null>(null);
  const [rejectReason, setRejectReason] = useState('');

  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  // PROTEKSI ROUTE: Belum login
  if (!currentUser) {
    return <AuthGuard moduleName="laporan kerusakan unit" />;
  }

  const isTenant = currentUser.peran === 'penyewa';
  const isManager = currentUser.peran === 'pengelola';
  const isOwner = currentUser.peran === 'pemilik';

  const visibleReports = state.damageReports.filter((r) => {
    if (isTenant && r.pelapor_id !== currentUser.id) return false;
    if (selectedStatus !== 'all' && r.status !== selectedStatus) return false;
    return true;
  });

  const selectedReport = state.damageReports.find(r => r.id === selectedReportId) || visibleReports[0];

  const handleCreateReport = (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setErrorMsg('');
      const rep = store.reportDamage({
        kategori: newKategori,
        judul: newJudul,
        deskripsi: newDeskripsi,
        foto_paths: [newFotoPath]
      });
      setSuccessMsg(`Laporan kerusakan ${rep.nomor} berhasil dikirimkan!`);
      setCreateModalOpen(false);
      setSelectedReportId(rep.id);
      setNewJudul('');
      setNewDeskripsi('');
      setTimeout(() => setSuccessMsg(''), 4000);
    } catch (err: unknown) {
      if (err instanceof Error) {
        setErrorMsg(err.message);
      } else {
        setErrorMsg('Gagal membuat laporan kerusakan');
      }
    }
  };

  const handleProcess = () => {
    if (!processReport) return;
    try {
      setErrorMsg('');
      store.processDamageReport(processReport.id, estimasiBiaya, catatanPengelola);
      setSuccessMsg(
        estimasiBiaya > 1000000
          ? `Laporan ${processReport.nomor} dialihkan ke status 'Menunggu Persetujuan Pemilik' (estimasi di atas Rp1.000.000 - BR-12)`
          : `Laporan ${processReport.nomor} sedang diproses perbaikannya`
      );
      setProcessReport(null);
      setTimeout(() => setSuccessMsg(''), 4000);
    } catch (err: unknown) {
      if (err instanceof Error) {
        setErrorMsg(err.message);
      } else {
        setErrorMsg('Gagal memproses laporan');
      }
    }
  };

  const handleApprove = (approved: boolean) => {
    if (!approveReport) return;
    try {
      setErrorMsg('');
      store.approveDamageReport(approveReport.id, approved, approved ? undefined : rejectReason);
      setSuccessMsg(
        approved 
          ? `Estimasi biaya disetujui! Laporan beralih ke status 'diproses'.` 
          : `Persetujuan biaya ditolak.`
      );
      setApproveReport(null);
      setRejectReason('');
      setTimeout(() => setSuccessMsg(''), 4000);
    } catch (err: unknown) {
      if (err instanceof Error) {
        setErrorMsg(err.message);
      } else {
        setErrorMsg('Gagal memproses persetujuan');
      }
    }
  };

  const handleMarkFinish = () => {
    if (!finishReport) return;
    try {
      setErrorMsg('');
      store.markDamageRepaired(finishReport.id, biayaAktual);
      setSuccessMsg(`Perbaikan laporan ${finishReport.nomor} telah selesai dengan biaya Rp${biayaAktual.toLocaleString('id-ID')}`);
      setFinishReport(null);
      setTimeout(() => setSuccessMsg(''), 3000);
    } catch (err: unknown) {
      if (err instanceof Error) {
        setErrorMsg(err.message);
      } else {
        setErrorMsg('Gagal menandai laporan selesai');
      }
    }
  };

  const handleCloseReport = (reportId: string) => {
    try {
      setErrorMsg('');
      store.closeDamageReport(reportId);
      setSuccessMsg('Laporan perbaikan kerusakan telah resmi ditutup!');
      setTimeout(() => setSuccessMsg(''), 3000);
    } catch (err: unknown) {
      if (err instanceof Error) {
        setErrorMsg(err.message);
      } else {
        setErrorMsg('Gagal menutup laporan');
      }
    }
  };

  // Helper Stepper Langkah
  const getStepIndex = (status: string) => {
    switch (status) {
      case 'dilaporkan': return 1;
      case 'menunggu_persetujuan': return 2;
      case 'diproses': return 3;
      case 'selesai': return 4;
      case 'ditutup': return 5;
      default: return 1;
    }
  };

  return (
    <div className="p-6 sm:p-8 max-w-[1400px] mx-auto space-y-6">
      
      {/* Top Bar: Selector Laporan & Referensi Tampilan */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-[#DCE5D8] dark:border-[#2C382A]">
        <div className="flex items-center gap-2 text-xs">
          <span className="text-[#5D6B58] dark:text-[#A7B8A3]">Pilih Laporan:</span>
          <select
            value={selectedReportId}
            onChange={(e) => setSelectedReportId(e.target.value)}
            className="rounded border border-[#DCE5D8] bg-white px-3 py-1.5 text-xs font-semibold text-[#222520] focus:outline-none dark:border-[#2C382A] dark:bg-[#1E261D] dark:text-[#ECEAE4]"
          >
            {visibleReports.map((rep) => {
              const u = state.units.find(unit => unit.id === rep.unit_id);
              return (
                <option key={rep.id} value={rep.id}>
                  {rep.nomor} - {u?.kode} ({rep.judul})
                </option>
              );
            })}
          </select>
        </div>

        <div className="flex items-center gap-2">
          {/* Tombol Buat Laporan (Penyewa) */}
          {isTenant && (
            <button
              onClick={() => {
                setCreateModalOpen(true);
                setErrorMsg('');
              }}
              className="rounded-lg bg-[#2E6B47] px-3.5 py-1.5 text-xs font-semibold text-white hover:bg-[#255739] transition-colors"
            >
              + Buat Laporan Baru
            </button>
          )}
          <span className="rounded bg-[#FEF9C3] px-2.5 py-1 text-[11px] font-semibold text-[#854D0E] border border-[#FDE047]">
            REFERENSI TAMPILAN, bukan desain wajib
          </span>
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

      {selectedReport && (
        <div className="space-y-6">
          
          {/* Header Sesuai Wireframe Page 3 */}
          <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
            <div>
              <div className="text-xs text-[#5D6B58] dark:text-[#A7B8A3]">
                Kerusakan / {selectedReport.nomor}
              </div>
              <h1 className="text-2xl font-bold tracking-tight text-[#222520] dark:text-[#ECEAE4] mt-0.5">
                {selectedReport.judul}
              </h1>
              {(() => {
                const unit = state.units.find(u => u.id === selectedReport.unit_id);
                const reporter = state.profiles.find(p => p.id === selectedReport.pelapor_id);
                return (
                  <p className="text-xs text-[#5D6B58] dark:text-[#A7B8A3] mt-1">
                    Unit {unit?.kode} · dilaporkan {reporter?.nama_lengkap} · 13 Okt 2026 09.00
                  </p>
                );
              })()}
            </div>

            <div>
              <span className={`inline-block px-3 py-1 rounded-full text-xs font-medium ${
                selectedReport.status === 'menunggu_persetujuan'
                  ? 'bg-[#FEF3C7] text-[#92400E] border border-[#FDE68A]'
                  : selectedReport.status === 'diproses'
                  ? 'bg-[#F1F5F9] text-[#475569] border border-[#CBD5E1]'
                  : selectedReport.status === 'selesai'
                  ? 'bg-[#E8F5E9] text-[#2E7D32] border border-[#C8E6C9]'
                  : selectedReport.status === 'ditutup'
                  ? 'bg-stone-100 text-stone-600 border border-stone-200'
                  : 'bg-[#E0F2FE] text-[#0369A1] border border-[#BAE6FD]'
              }`}>
                {selectedReport.status === 'menunggu_persetujuan'
                  ? 'menunggu persetujuan'
                  : selectedReport.status.replace('_', ' ')}
              </span>
            </div>
          </div>

          {/* Stepper Sesuai Wireframe Page 3 */}
          <div className="rounded-lg border border-[#DCE5D8] bg-white p-6 shadow-2xs dark:border-[#2C382A] dark:bg-[#1E261D]">
            <div className="flex items-center justify-between max-w-3xl mx-auto relative">
              <div className="absolute top-4 left-6 right-6 h-0.5 bg-[#E8EFE5] dark:bg-[#2C382A] z-0" />

              {[
                { step: 1, label: 'Dilaporkan' },
                { step: 2, label: 'Menunggu persetujuan' },
                { step: 3, label: 'Diproses' },
                { step: 4, label: 'Selesai' },
                { step: 5, label: 'Ditutup' }
              ].map((s) => {
                const currentIdx = getStepIndex(selectedReport.status);
                const isCompleted = currentIdx >= s.step;
                const isCurrent = currentIdx === s.step;

                return (
                  <div key={s.step} className="flex flex-col items-center z-10">
                    <div className={`flex h-8 w-8 items-center justify-center rounded-full text-xs font-bold transition-all ${
                      isCompleted
                        ? 'bg-[#2E6B47] text-white'
                        : 'bg-[#E8EFE5] text-[#5D6B58] dark:bg-[#2C382A] dark:text-[#A7B8A3]'
                    }`}>
                      {s.step}
                    </div>
                    <span className={`mt-2 text-xs text-center ${
                      isCurrent 
                        ? 'font-bold text-[#222520] dark:text-[#ECEAE4]' 
                        : isCompleted
                        ? 'font-medium text-[#222520] dark:text-[#ECEAE4]'
                        : 'text-[#5D6B58] dark:text-[#A7B8A3]'
                    }`}>
                      {s.label}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Grid 2 Kolom Sesuai Wireframe Page 3 */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            
            {/* Kolom Kiri: Detail Laporan */}
            <div className="lg:col-span-7 rounded-lg border border-[#DCE5D8] bg-white p-6 shadow-2xs dark:border-[#2C382A] dark:bg-[#1E261D] space-y-4">
              <h2 className="text-sm font-bold text-[#222520] dark:text-[#ECEAE4] pb-3 border-b border-[#DCE5D8] dark:border-[#2C382A]">
                Detail laporan
              </h2>

              {(() => {
                const contract = state.contracts.find(c => c.unit_id === selectedReport.unit_id && c.status === 'aktif');
                return (
                  <div className="space-y-3 text-xs">
                    <div className="grid grid-cols-3 gap-2">
                      <span className="text-[#5D6B58] dark:text-[#A7B8A3]">Nomor</span>
                      <span className="col-span-2 font-mono font-medium text-[#222520] dark:text-[#ECEAE4]">{selectedReport.nomor}</span>
                    </div>
                    <div className="grid grid-cols-3 gap-2">
                      <span className="text-[#5D6B58] dark:text-[#A7B8A3]">Kategori</span>
                      <span className="col-span-2 capitalize font-medium text-[#222520] dark:text-[#ECEAE4]">{selectedReport.kategori}</span>
                    </div>
                    <div className="grid grid-cols-3 gap-2">
                      <span className="text-[#5D6B58] dark:text-[#A7B8A3]">Deskripsi</span>
                      <span className="col-span-2 text-[#222520] dark:text-[#ECEAE4] leading-relaxed">{selectedReport.deskripsi}</span>
                    </div>
                    <div className="grid grid-cols-3 gap-2">
                      <span className="text-[#5D6B58] dark:text-[#A7B8A3]">Catatan Pengelola</span>
                      <span className="col-span-2 text-[#222520] dark:text-[#ECEAE4] leading-relaxed">
                        {selectedReport.catatan || 'Kusen memuai, perlu ganti kusen dan kunci'}
                      </span>
                    </div>
                    <div className="grid grid-cols-3 gap-2">
                      <span className="text-[#5D6B58] dark:text-[#A7B8A3]">Estimasi biaya</span>
                      <span className="col-span-2 font-medium text-[#C62828] dark:text-red-400">
                        {formatRupiah(selectedReport.estimasi_biaya || 1250000)} (di atas batas Rp1.000.000)
                      </span>
                    </div>
                    <div className="grid grid-cols-3 gap-2">
                      <span className="text-[#5D6B58] dark:text-[#A7B8A3]">Kontrak</span>
                      <span className="col-span-2 font-mono text-[#222520] dark:text-[#ECEAE4]">
                        {contract?.nomor || 'KTR-2026-0004'} (aktif)
                      </span>
                    </div>

                    {/* Lampiran Foto Sesuai Wireframe */}
                    <div className="pt-4 border-t border-[#E8EFE5] dark:border-[#2C382A]">
                      <div className="flex gap-4">
                        <div className="h-28 w-28 rounded border border-dashed border-[#DCE5D8] dark:border-[#2C382A] flex flex-col items-center justify-center text-xs text-[#5D6B58] dark:text-[#A7B8A3] bg-stone-50/50 dark:bg-[#171D16]">
                          <Camera className="h-5 w-5 mb-1 text-stone-400" />
                          <span>foto 1</span>
                        </div>
                        <div className="h-28 w-28 rounded border border-dashed border-[#DCE5D8] dark:border-[#2C382A] flex flex-col items-center justify-center text-xs text-[#5D6B58] dark:text-[#A7B8A3] bg-stone-50/50 dark:bg-[#171D16]">
                          <span>maks 3 foto</span>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })()}
            </div>

            {/* Kolom Kanan: Tindakan & Riwayat Sesuai Wireframe Page 3 */}
            <div className="lg:col-span-5 space-y-6">
              
              {/* Card 1: Tindakan Pemilik / Sesuai Peran */}
              <div className="rounded-lg border border-[#DCE5D8] bg-white p-5 shadow-2xs dark:border-[#2C382A] dark:bg-[#1E261D] space-y-4">
                <h3 className="text-sm font-bold text-[#222520] dark:text-[#ECEAE4]">
                  {isOwner ? 'Tindakan Pemilik' : isManager ? 'Tindakan Pengelola' : 'Tindakan Penyewa'}
                </h3>

                <p className="text-xs text-[#5D6B58] dark:text-[#A7B8A3] leading-relaxed">
                  Biaya di atas Rp1.000.000 wajib disetujui Pemilik sebelum dikerjakan.
                </p>

                {/* Tombol Aksi */}
                <div className="flex gap-2.5 pt-1">
                  {selectedReport.status === 'menunggu_persetujuan' && (
                    <>
                      <button
                        onClick={() => {
                          setApproveReport(selectedReport);
                          setErrorMsg('');
                        }}
                        className="rounded bg-[#2E6B47] px-4 py-2 text-xs font-semibold text-white hover:bg-[#255739] transition-colors"
                      >
                        Setujui biaya
                      </button>
                      <button
                        onClick={() => {
                          setApproveReport(selectedReport);
                          setErrorMsg('');
                        }}
                        className="rounded border border-[#C62828] bg-white px-4 py-2 text-xs font-semibold text-[#C62828] hover:bg-red-50 dark:bg-[#1E261D] dark:hover:bg-red-950/20 transition-colors"
                      >
                        Tolak dengan alasan
                      </button>
                    </>
                  )}

                  {selectedReport.status === 'dilaporkan' && isManager && (
                    <button
                      onClick={() => {
                        setProcessReport(selectedReport);
                        setEstimasiBiaya(selectedReport.estimasi_biaya || 1250000);
                        setErrorMsg('');
                      }}
                      className="rounded bg-[#2E6B47] px-4 py-2 text-xs font-semibold text-white hover:bg-[#255739] transition-colors"
                    >
                      Proses &amp; Ajukan Estimasi
                    </button>
                  )}

                  {selectedReport.status === 'diproses' && isManager && (
                    <button
                      onClick={() => {
                        setFinishReport(selectedReport);
                        setBiayaAktual(selectedReport.estimasi_biaya || 0);
                        setErrorMsg('');
                      }}
                      className="rounded bg-[#2E6B47] px-4 py-2 text-xs font-semibold text-white hover:bg-[#255739] transition-colors"
                    >
                      Tandai selesai
                    </button>
                  )}

                  {selectedReport.status === 'selesai' && isTenant && (
                    <button
                      onClick={() => handleCloseReport(selectedReport.id)}
                      className="rounded bg-[#2E6B47] px-4 py-2 text-xs font-semibold text-white hover:bg-[#255739] transition-colors"
                    >
                      Tutup laporan
                    </button>
                  )}
                </div>

                {/* Box Penjelasan Tombol Sesuai Wireframe Page 3 */}
                <div className="pt-3 border-t border-[#E8EFE5] dark:border-[#2C382A] text-xs text-[#5D6B58] dark:text-[#A7B8A3] space-y-1">
                  <div className="font-medium text-[#222520] dark:text-[#ECEAE4] mb-1">
                    Tombol yang tampil mengikuti peran dan status:
                  </div>
                  <div>· Pengelola: Proses / Minta persetujuan / Tolak (saat dilaporkan), Tandai selesai (saat diproses)</div>
                  <div>· Penyewa pelapor: Tutup laporan (saat selesai)</div>
                  <div>· Pengelola boleh menutup bila 3 hari setelah selesai belum ditutup</div>
                </div>
              </div>

              {/* Card 2: Riwayat Sesuai Wireframe Page 3 */}
              <div className="rounded-lg border border-[#DCE5D8] bg-white p-5 shadow-2xs dark:border-[#2C382A] dark:bg-[#1E261D] space-y-3">
                <h3 className="text-sm font-bold text-[#222520] dark:text-[#ECEAE4]">
                  Riwayat
                </h3>

                <div className="divide-y divide-[#E8EFE5] dark:divide-[#2C382A]/70 text-xs">
                  <div className="py-2.5 flex items-start gap-4">
                    <div className="w-24 shrink-0 text-[#5D6B58] dark:text-[#A7B8A3]">
                      13 Okt 2026<br />09.00
                    </div>
                    <div className="w-24 shrink-0 font-medium text-[#222520] dark:text-[#ECEAE4]">
                      Dimas Saputra
                    </div>
                    <div className="text-[#222520] dark:text-[#ECEAE4]">
                      Membuat laporan
                    </div>
                  </div>

                  <div className="py-2.5 flex items-start gap-4">
                    <div className="w-24 shrink-0 text-[#5D6B58] dark:text-[#A7B8A3]">
                      13 Okt 2026<br />15.00
                    </div>
                    <div className="w-24 shrink-0 font-medium text-[#222520] dark:text-[#ECEAE4]">
                      Bayu Prasetyo
                    </div>
                    <div className="text-[#222520] dark:text-[#ECEAE4]">
                      dilaporkan &rarr; menunggu persetujuan, estimasi Rp1.250.000
                    </div>
                  </div>

                  {selectedReport.status === 'diproses' && (
                    <div className="py-2.5 flex items-start gap-4">
                      <div className="w-24 shrink-0 text-[#5D6B58] dark:text-[#A7B8A3]">
                        14 Okt 2026<br />10.00
                      </div>
                      <div className="w-24 shrink-0 font-medium text-[#222520] dark:text-[#ECEAE4]">
                        Ratna Kusumawardani
                      </div>
                      <div className="text-[#222520] dark:text-[#ECEAE4]">
                        Biaya disetujui Pemilik &rarr; diproses
                      </div>
                    </div>
                  )}
                </div>

                <div className="pt-2 text-[11px] text-[#5D6B58] dark:text-[#A7B8A3]">
                  Sumber: audit log
                </div>
              </div>

            </div>

          </div>

        </div>
      )}

      {/* MODAL BUAT LAPORAN KERUSAKAN (Penyewa - BR-11) */}
      {createModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-stone-900/60 p-4 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-[28px] border border-[#DCE5D8] bg-white p-6 shadow-2xl dark:border-[#2C382A] dark:bg-[#1E261D]">
            <div className="flex items-center justify-between pb-3 border-b border-[#DCE5D8] dark:border-[#2C382A]">
              <h3 className="text-base font-bold text-stone-900 dark:text-stone-100">
                Ajukan Laporan Kerusakan Unit
              </h3>
              <button 
                onClick={() => setCreateModalOpen(false)}
                className="h-8 w-8 rounded-full flex items-center justify-center text-stone-400 hover:bg-[#F4F7F2] hover:text-stone-700 dark:hover:bg-[#2C382A] transition-colors"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <p className="mt-2 text-xs text-[#5D6B58] dark:text-stone-400">
              BR-11: Laporan hanya untuk unit kontrak aktif Anda. Wajib lampirkan 1 sampai 3 foto. Maksimal 3 laporan terbuka.
            </p>

            <form onSubmit={handleCreateReport} className="mt-4 space-y-3.5 text-xs">
              <div>
                <label className="block text-xs font-semibold text-[#5D6B58] dark:text-stone-300 mb-1.5">Kategori Masalah</label>
                <select
                  value={newKategori}
                  onChange={(e) => setNewKategori(e.target.value as any)}
                  className="w-full rounded-2xl border border-[#DCE5D8] bg-[#E8EFE5]/40 p-2.5 text-xs font-bold text-[#2D4129] focus:outline-none focus:ring-2 focus:ring-[#3B5336]/20 dark:border-[#2C382A] dark:bg-[#2C382A] dark:text-[#95B08A]"
                >
                  <option value="bangunan">Bangunan / Pintu / Jendela</option>
                  <option value="listrik">Listrik / Lampu / Stopkontak</option>
                  <option value="air">Air / Kran / Sanitasi</option>
                  <option value="ac">AC / Pendingin Ruangan</option>
                  <option value="perabot">Perabot / Kasur / Lemari</option>
                  <option value="lainnya">Lainnya</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#5D6B58] dark:text-stone-300 mb-1.5">Judul Masalah (5 - 80 Karakter)</label>
                <input
                  type="text"
                  required
                  minLength={5}
                  maxLength={80}
                  value={newJudul}
                  onChange={(e) => setNewJudul(e.target.value)}
                  placeholder="Contoh: Kran shower bocor tidak bisa ditutup rapat"
                  className="w-full rounded-2xl border border-[#DCE5D8] bg-[#E8EFE5]/40 p-2.5 text-xs font-bold text-stone-900 focus:bg-white focus:border-[#3B5336] focus:ring-2 focus:ring-[#3B5336]/20 focus:outline-none dark:border-[#2C382A] dark:bg-[#2C382A] dark:text-stone-100"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#5D6B58] dark:text-stone-300 mb-1.5">Deskripsi Lengkap Kerusakan</label>
                <textarea
                  rows={3}
                  required
                  value={newDeskripsi}
                  onChange={(e) => setNewDeskripsi(e.target.value)}
                  placeholder="Jelaskan detail kendala yang dialami..."
                  className="w-full rounded-2xl border border-[#DCE5D8] bg-[#E8EFE5]/40 p-2.5 text-xs text-stone-900 focus:bg-white focus:border-[#3B5336] focus:ring-2 focus:ring-[#3B5336]/20 focus:outline-none dark:border-[#2C382A] dark:bg-[#2C382A] dark:text-stone-100"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#5D6B58] dark:text-stone-300 mb-1.5">Foto Kerusakan (Path di Bucket Privat - BR-11)</label>
                <input
                  type="text"
                  required
                  value={newFotoPath}
                  onChange={(e) => setNewFotoPath(e.target.value)}
                  className="w-full rounded-2xl border border-[#DCE5D8] bg-[#E8EFE5]/40 p-2.5 text-xs font-mono dark:border-[#2C382A] dark:bg-[#2C382A] dark:text-stone-100 focus:outline-none focus:ring-2 focus:ring-[#3B5336]/20"
                />
              </div>

              <div className="mt-5 flex justify-end gap-2.5 pt-2">
                <button
                  type="button"
                  onClick={() => setCreateModalOpen(false)}
                  className="rounded-full border border-[#DCE5D8] px-4 py-2 text-xs font-semibold text-stone-600 hover:bg-[#F4F7F2] dark:border-[#2C382A] dark:text-stone-300 transition-colors"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="rounded-full bg-[#3B5336] px-5 py-2 text-xs font-bold text-white shadow-sm hover:bg-[#2D4129] active:scale-95 transition-all"
                >
                  Kirim Laporan
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL PROSES ESTIMASI (Pengelola - BR-12) */}
      {processReport && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-stone-900/60 p-4 backdrop-blur-sm">
          <div className="w-full max-w-sm rounded-[28px] border border-[#DCE5D8] bg-white p-6 shadow-2xl dark:border-[#2C382A] dark:bg-[#1E261D]">
            <h3 className="text-sm font-bold text-stone-900 dark:text-stone-100">
              Estimasi Biaya Perbaikan (BR-12)
            </h3>
            <p className="mt-1 text-xs text-[#5D6B58] dark:text-stone-400">
              Jika estimasi &gt; Rp1.000.000, sistem otomatis mengalihkan status ke persetujuan Pemilik.
            </p>

            <div className="mt-4 space-y-3.5 text-xs">
              <div>
                <label className="block text-xs font-semibold text-[#5D6B58] dark:text-stone-300 mb-1.5">Perkiraan Biaya (Rupiah)</label>
                <input
                  type="number"
                  step="50000"
                  value={estimasiBiaya}
                  onChange={(e) => setEstimasiBiaya(Number(e.target.value))}
                  className="w-full rounded-2xl border border-[#DCE5D8] bg-[#E8EFE5]/40 p-2.5 text-sm font-bold text-stone-900 focus:bg-white focus:border-[#3B5336] focus:ring-2 focus:ring-[#3B5336]/20 focus:outline-none dark:border-[#2C382A] dark:bg-[#2C382A] dark:text-stone-100"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#5D6B58] dark:text-stone-300 mb-1.5">Catatan Analisis Pengelola</label>
                <textarea
                  rows={2}
                  value={catatanPengelola}
                  onChange={(e) => setCatatanPengelola(e.target.value)}
                  placeholder="Contoh: Perlu penggantian sparepart baru"
                  className="w-full rounded-2xl border border-[#DCE5D8] bg-[#E8EFE5]/40 p-2.5 text-xs text-stone-900 focus:bg-white focus:border-[#3B5336] focus:ring-2 focus:ring-[#3B5336]/20 focus:outline-none dark:border-[#2C382A] dark:bg-[#2C382A] dark:text-stone-100"
                />
              </div>
            </div>

            <div className="mt-5 flex justify-end gap-2.5">
              <button
                onClick={() => setProcessReport(null)}
                className="rounded-full border border-[#DCE5D8] px-4 py-2 text-xs font-semibold text-stone-600 hover:bg-[#F4F7F2] dark:border-[#2C382A] dark:text-stone-300 transition-colors"
              >
                Batal
              </button>
              <button
                onClick={handleProcess}
                className="rounded-full bg-[#3B5336] px-5 py-2 text-xs font-bold text-white shadow-sm hover:bg-[#2D4129] active:scale-95 transition-all"
              >
                Lanjutkan
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL PERSETUJUAN PEMILIK (BR-12) */}
      {approveReport && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-stone-900/60 p-4 backdrop-blur-sm">
          <div className="w-full max-w-sm rounded-[28px] border border-[#DCE5D8] bg-white p-6 shadow-2xl dark:border-[#2C382A] dark:bg-[#1E261D]">
            <h3 className="text-sm font-bold text-stone-900 dark:text-stone-100">
              Persetujuan Biaya Perbaikan (BR-12)
            </h3>
            <p className="mt-1 text-xs text-[#5D6B58] dark:text-stone-400">
              Estimasi: {formatRupiah(approveReport.estimasi_biaya)} untuk {approveReport.nomor}.
            </p>

            <div className="mt-3.5">
              <label className="block text-xs font-semibold text-[#5D6B58] dark:text-stone-300 mb-1.5">Alasan Penolakan (Wajib jika ditolak)</label>
              <textarea
                rows={2}
                value={rejectReason}
                onChange={(e) => setRejectReason(e.target.value)}
                placeholder="Contoh: Biaya terlalu tinggi, cari alternatif teknisi"
                className="w-full rounded-2xl border border-[#DCE5D8] bg-[#E8EFE5]/40 p-2.5 text-xs text-stone-900 focus:bg-white focus:border-[#3B5336] focus:ring-2 focus:ring-[#3B5336]/20 focus:outline-none dark:border-[#2C382A] dark:bg-[#2C382A] dark:text-stone-100"
              />
            </div>

            <div className="mt-5 flex justify-end gap-2">
              <button
                onClick={() => setApproveReport(null)}
                className="rounded-full border border-[#DCE5D8] px-3.5 py-1.5 text-xs font-semibold text-stone-600 hover:bg-[#F4F7F2] dark:border-[#2C382A] dark:text-stone-300 transition-colors"
              >
                Batal
              </button>
              <button
                onClick={() => handleApprove(false)}
                className="rounded-full bg-[#C25E5E] px-4 py-1.5 text-xs font-bold text-white hover:bg-[#A84A4A] active:scale-95 transition-all shadow-sm"
              >
                Tolak
              </button>
              <button
                onClick={() => handleApprove(true)}
                className="rounded-full bg-[#3B5336] px-4 py-1.5 text-xs font-bold text-white hover:bg-[#2D4129] active:scale-95 transition-all shadow-sm"
              >
                Setujui Biaya
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL TANDAI SELESAI (Pengelola - BR-12) */}
      {finishReport && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-stone-900/60 p-4 backdrop-blur-sm">
          <div className="w-full max-w-sm rounded-[28px] border border-[#DCE5D8] bg-white p-6 shadow-2xl dark:border-[#2C382A] dark:bg-[#1E261D]">
            <h3 className="text-sm font-bold text-stone-900 dark:text-stone-100">
              Tandai Perbaikan Selesai
            </h3>
            <p className="mt-1 text-xs text-[#5D6B58] dark:text-stone-400">
              BR-12: Biaya aktual sebenarnya wajib diisi saat pekerjaan selesai.
            </p>

            <div className="mt-4">
              <label className="block text-xs font-semibold text-[#5D6B58] dark:text-stone-300 mb-1.5">Biaya Aktual Akhir (Rupiah)</label>
              <input
                type="number"
                value={biayaAktual}
                onChange={(e) => setBiayaAktual(Number(e.target.value))}
                className="w-full rounded-2xl border border-[#DCE5D8] bg-[#E8EFE5]/40 p-2.5 text-sm font-bold text-stone-900 focus:bg-white focus:border-[#3B5336] focus:ring-2 focus:ring-[#3B5336]/20 focus:outline-none dark:border-[#2C382A] dark:bg-[#2C382A] dark:text-stone-100"
              />
            </div>

            <div className="mt-5 flex justify-end gap-2.5">
              <button
                onClick={() => setFinishReport(null)}
                className="rounded-full border border-[#DCE5D8] px-4 py-2 text-xs font-semibold text-stone-600 hover:bg-[#F4F7F2] dark:border-[#2C382A] dark:text-stone-300 transition-colors"
              >
                Batal
              </button>
              <button
                onClick={handleMarkFinish}
                className="rounded-full bg-[#3B5336] px-5 py-2 text-xs font-bold text-white shadow-sm hover:bg-[#2D4129] active:scale-95 transition-all"
              >
                Simpan & Tandai Selesai
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
