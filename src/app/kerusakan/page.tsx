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
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8 space-y-6">
      
      {/* Header Halaman */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-stone-200/80 pb-6 dark:border-stone-800">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-stone-900 dark:text-stone-100 sm:text-3xl flex items-center gap-2.5">
            <Wrench className="h-7 w-7 text-stone-800 dark:text-stone-200" />
            Laporan Kerusakan & Perbaikan Unit
          </h1>
          <p className="mt-1 text-sm text-stone-500 dark:text-stone-400">
            Alur pelacakan komplain perbaikan unit kos & studio Griya Kenanga Residence (BR-11, BR-12)
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* Filter Status */}
          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="rounded-xl border border-stone-200 bg-white px-3 py-1.5 text-xs font-medium text-stone-700 dark:border-stone-800 dark:bg-stone-900 dark:text-stone-300"
          >
            <option value="all">Semua Status</option>
            <option value="dilaporkan">Dilaporkan</option>
            <option value="menunggu_persetujuan">Menunggu Persetujuan</option>
            <option value="diproses">Diproses</option>
            <option value="selesai">Selesai</option>
            <option value="ditutup">Ditutup</option>
          </select>

          {/* Tombol Buat Laporan (Khusus Penyewa) */}
          {isTenant && (
            <button
              onClick={() => {
                setCreateModalOpen(true);
                setErrorMsg('');
              }}
              className="flex items-center gap-1.5 rounded-xl bg-stone-900 px-3.5 py-1.5 text-xs font-semibold text-white hover:bg-emerald-700 dark:bg-stone-100 dark:text-stone-900 transition-colors"
            >
              <Plus className="h-4 w-4" />
              Buat Laporan Baru
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

      {/* Layout 2 Kolom: Kiri Daftar Laporan, Kanan Tampilan Detail Sesuai Wireframe Page 3 */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
        
        {/* Kolom Kiri: List Laporan (4 Kolom) */}
        <div className="lg:col-span-4 space-y-3">
          <div className="text-xs font-semibold uppercase text-stone-400">
            Daftar Laporan ({visibleReports.length})
          </div>

          <div className="space-y-2.5 max-h-[700px] overflow-y-auto pr-1">
            {visibleReports.map((rep) => {
              const unit = state.units.find(u => u.id === rep.unit_id);
              const isSelected = selectedReport?.id === rep.id;

              return (
                <div
                  key={rep.id}
                  onClick={() => setSelectedReportId(rep.id)}
                  className={`rounded-2xl border p-4 cursor-pointer transition-all ${
                    isSelected
                      ? 'border-emerald-600 bg-emerald-50/40 shadow-xs dark:bg-emerald-950/20'
                      : 'border-stone-200/90 bg-white hover:border-stone-300 dark:border-stone-800 dark:bg-stone-900'
                  }`}
                >
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-mono text-stone-500 font-semibold">{rep.nomor}</span>
                    <span className={`rounded-md px-2 py-0.5 text-[10px] font-semibold capitalize ${
                      rep.status === 'menunggu_persetujuan'
                        ? 'bg-amber-100 text-amber-800 dark:bg-amber-950/40 dark:text-amber-300'
                        : rep.status === 'diproses'
                        ? 'bg-blue-100 text-blue-800 dark:bg-blue-950/40 dark:text-blue-300'
                        : rep.status === 'selesai'
                        ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-300'
                        : 'bg-stone-100 text-stone-700 dark:bg-stone-800 dark:text-stone-300'
                    }`}>
                      {rep.status.replace('_', ' ')}
                    </span>
                  </div>

                  <div className="mt-2 text-sm font-bold text-stone-900 dark:text-stone-100">
                    {rep.judul}
                  </div>

                  <div className="mt-1 text-xs text-stone-500">
                    Unit {unit?.kode} · Kategori: <span className="capitalize">{rep.kategori}</span>
                  </div>

                  {rep.estimasi_biaya > 0 && (
                    <div className="mt-2 text-[11px] font-medium text-stone-600 dark:text-stone-400">
                      Estimasi: {formatRupiah(rep.estimasi_biaya)}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Kolom Kanan: Detail Laporan Sesuai Wireframe Page 3 (8 Kolom) */}
        {selectedReport ? (
          <div className="lg:col-span-8 rounded-2xl border border-stone-200/90 bg-white p-6 shadow-xs dark:border-stone-800 dark:bg-stone-900 space-y-6">
            
            {/* Header Detail */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-stone-100 pb-4 dark:border-stone-800">
              <div>
                <span className="text-xs text-stone-400">Kerusakan / {selectedReport.nomor}</span>
                <h2 className="text-xl font-extrabold text-stone-900 dark:text-stone-100 mt-0.5">
                  {selectedReport.judul}
                </h2>
                {(() => {
                  const unit = state.units.find(u => u.id === selectedReport.unit_id);
                  const reporter = state.profiles.find(p => p.id === selectedReport.pelapor_id);
                  return (
                    <p className="text-xs text-stone-500 mt-1">
                      Unit {unit?.kode} · Dilaporkan {reporter?.nama_lengkap} · {formatDateIndo(selectedReport.dibuat_pada)}
                    </p>
                  );
                })()}
              </div>

              <span className={`inline-flex w-fit rounded-full px-3 py-1 text-xs font-semibold capitalize ${
                selectedReport.status === 'menunggu_persetujuan'
                  ? 'bg-amber-100 text-amber-800 dark:bg-amber-950/40 dark:text-amber-300'
                  : selectedReport.status === 'diproses'
                  ? 'bg-blue-100 text-blue-800 dark:bg-blue-950/40 dark:text-blue-300'
                  : selectedReport.status === 'selesai'
                  ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-300'
                  : 'bg-stone-100 text-stone-700 dark:bg-stone-800 dark:text-stone-300'
              }`}>
                {selectedReport.status.replace('_', ' ')}
              </span>
            </div>

            {/* Stepper Status (Dilaporkan -> Menunggu Persetujuan -> Diproses -> Selesai -> Ditutup) Sesuai Wireframe Page 3 */}
            <div className="rounded-2xl border border-stone-100 bg-stone-50/70 p-4 dark:border-stone-800 dark:bg-stone-800/30">
              <div className="flex items-center justify-between text-center text-xs">
                {[
                  { step: 1, label: 'Dilaporkan' },
                  { step: 2, label: 'Persetujuan' },
                  { step: 3, label: 'Diproses' },
                  { step: 4, label: 'Selesai' },
                  { step: 5, label: 'Ditutup' }
                ].map((s) => {
                  const currentIdx = getStepIndex(selectedReport.status);
                  const isDone = currentIdx >= s.step;
                  const isCurrent = currentIdx === s.step;

                  return (
                    <div key={s.step} className="flex-1 flex flex-col items-center">
                      <div className={`flex h-7 w-7 items-center justify-center rounded-full text-xs font-bold transition-all ${
                        isCurrent
                          ? 'bg-emerald-600 text-white ring-4 ring-emerald-100 dark:ring-emerald-950'
                          : isDone
                          ? 'bg-stone-800 text-white dark:bg-stone-200 dark:text-stone-900'
                          : 'bg-stone-200 text-stone-500 dark:bg-stone-700'
                      }`}>
                        {s.step}
                      </div>
                      <span className={`mt-1.5 text-[11px] font-medium hidden sm:block ${
                        isCurrent ? 'text-emerald-700 dark:text-emerald-400 font-bold' : 'text-stone-500'
                      }`}>
                        {s.label}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Konten Grid: Detail Kerusakan & Tindakan Peran */}
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
              
              {/* Kolom Kiri Detail Laporan */}
              <div className="space-y-3 text-xs">
                <h3 className="font-bold text-stone-900 dark:text-stone-100">Detail Laporan</h3>
                <div className="rounded-xl border border-stone-100 bg-stone-50/60 p-3 dark:border-stone-800 dark:bg-stone-800/40 space-y-2">
                  <div><span className="text-stone-400">Nomor:</span> <span className="font-mono font-medium">{selectedReport.nomor}</span></div>
                  <div><span className="text-stone-400">Kategori:</span> <span className="capitalize">{selectedReport.kategori}</span></div>
                  <div><span className="text-stone-400">Deskripsi:</span> {selectedReport.deskripsi}</div>
                  {selectedReport.catatan && (
                    <div><span className="text-stone-400">Catatan Pengelola:</span> {selectedReport.catatan}</div>
                  )}
                  {selectedReport.estimasi_biaya > 0 && (
                    <div>
                      <span className="text-stone-400">Estimasi Biaya:</span>{' '}
                      <span className="font-bold text-stone-900 dark:text-stone-100">
                        {formatRupiah(selectedReport.estimasi_biaya)}
                      </span>
                      {selectedReport.estimasi_biaya > 1000000 && (
                        <span className="text-[10px] text-red-600 ml-1 font-medium">
                          (Wajib disetujui Pemilik - BR-12)
                        </span>
                      )}
                    </div>
                  )}
                  {selectedReport.biaya_aktual > 0 && (
                    <div>
                      <span className="text-stone-400">Biaya Aktual Selesai:</span>{' '}
                      <span className="font-bold text-emerald-700 dark:text-emerald-400">
                        {formatRupiah(selectedReport.biaya_aktual)}
                      </span>
                    </div>
                  )}
                </div>

                {/* Foto Kerusakan (1 sampai 3 foto) */}
                <div>
                  <span className="text-[11px] font-semibold text-stone-500 block mb-1.5">
                    Lampiran Foto Kerusakan ({selectedReport.foto_paths.length} foto)
                  </span>
                  <div className="grid grid-cols-2 gap-2">
                    {selectedReport.foto_paths.map((p, idx) => (
                      <div key={idx} className="flex flex-col items-center justify-center rounded-xl border border-dashed border-stone-300 bg-stone-50 p-4 text-center dark:border-stone-700 dark:bg-stone-800/30">
                        <Camera className="h-5 w-5 text-stone-400 mb-1" />
                        <span className="font-mono text-[10px] text-stone-500 truncate w-full">{p}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Kolom Kanan: Tindakan Sesuai Peran & Riwayat */}
              <div className="space-y-4">
                
                {/* Kotak Tindakan Khusus Pemilik (Sesuai Wireframe Page 3) */}
                {selectedReport.status === 'menunggu_persetujuan' && isOwner && (
                  <div className="rounded-2xl border border-amber-300 bg-amber-50/50 p-4 dark:border-amber-900/60 dark:bg-amber-950/20">
                    <h4 className="text-xs font-bold text-amber-900 dark:text-amber-300">
                      Tindakan Persetujuan Pemilik
                    </h4>
                    <p className="mt-1 text-[11px] text-amber-800/80 dark:text-amber-400">
                      Biaya di atas Rp1.000.000 ({formatRupiah(selectedReport.estimasi_biaya)}) wajib disetujui Pemilik sebelum dikerjakan.
                    </p>
                    <div className="mt-3 flex gap-2">
                      <button
                        onClick={() => {
                          setApproveReport(selectedReport);
                          setErrorMsg('');
                        }}
                        className="rounded-xl bg-emerald-700 px-3 py-1.5 text-xs font-semibold text-white hover:bg-emerald-800"
                      >
                        Setujui Biaya
                      </button>
                      <button
                        onClick={() => {
                          setApproveReport(selectedReport);
                          setErrorMsg('');
                        }}
                        className="rounded-xl border border-red-300 bg-white px-3 py-1.5 text-xs font-semibold text-red-600 hover:bg-red-50 dark:bg-stone-900"
                      >
                        Tolak dengan Alasan
                      </button>
                    </div>
                  </div>
                )}

                {/* Kotak Tindakan Pengelola */}
                {isManager && (
                  <div className="rounded-2xl border border-stone-200 bg-stone-50/50 p-4 dark:border-stone-800 dark:bg-stone-800/20 space-y-2">
                    <h4 className="text-xs font-bold text-stone-900 dark:text-stone-100">
                      Tindakan Pengelola
                    </h4>
                    
                    {/* Saat Status Dilaporkan */}
                    {selectedReport.status === 'dilaporkan' && (
                      <button
                        onClick={() => {
                          setProcessReport(selectedReport);
                          setEstimasiBiaya(selectedReport.estimasi_biaya || 200000);
                          setErrorMsg('');
                        }}
                        className="w-full rounded-xl bg-stone-900 py-2 text-xs font-semibold text-white hover:bg-emerald-700 dark:bg-stone-100 dark:text-stone-900"
                      >
                        Isi Estimasi & Proses Perbaikan &rarr;
                      </button>
                    )}

                    {/* Saat Status Diproses */}
                    {selectedReport.status === 'diproses' && (
                      <button
                        onClick={() => {
                          setFinishReport(selectedReport);
                          setBiayaAktual(selectedReport.estimasi_biaya || 0);
                          setErrorMsg('');
                        }}
                        className="w-full rounded-xl bg-emerald-700 py-2 text-xs font-semibold text-white hover:bg-emerald-800"
                      >
                        Tandai Selesai Dikerjakan &rarr;
                      </button>
                    )}

                    {/* Saat Status Selesai (Boleh ditutup jika >3 hari) */}
                    {selectedReport.status === 'selesai' && (
                      <div>
                        <button
                          onClick={() => handleCloseReport(selectedReport.id)}
                          className="w-full rounded-xl border border-stone-300 py-2 text-xs font-medium text-stone-800 hover:bg-stone-100 dark:border-stone-700 dark:text-stone-200"
                        >
                          Tutup Laporan (Validasi 3 Hari BR-12)
                        </button>
                        <p className="mt-1 text-[10px] text-stone-400">
                          Catatan: Pengelola baru boleh menutup bila 3 hari setelah selesai belum ditutup penyewa.
                        </p>
                      </div>
                    )}
                  </div>
                )}

                {/* Kotak Tindakan Penyewa Pelapor (Tutup Laporan saat Selesai) */}
                {isTenant && selectedReport.status === 'selesai' && (
                  <div className="rounded-2xl border border-emerald-200 bg-emerald-50/50 p-4 dark:border-emerald-900/40 dark:bg-emerald-950/20">
                    <h4 className="text-xs font-bold text-emerald-900 dark:text-emerald-300">
                      Perbaikan Selesai
                    </h4>
                    <p className="mt-1 text-[11px] text-emerald-800/80 dark:text-emerald-400">
                      Staf telah menyelesaikan perbaikan unit Anda. Silakan periksa hasilnya dan tekan tombol tutup di bawah.
                    </p>
                    <button
                      onClick={() => handleCloseReport(selectedReport.id)}
                      className="mt-3 w-full rounded-xl bg-emerald-700 py-2 text-xs font-semibold text-white hover:bg-emerald-800"
                    >
                      Konfirmasi & Tutup Laporan
                    </button>
                  </div>
                )}

                {/* Riwayat Audit Log Terkait */}
                <div className="rounded-2xl border border-stone-100 bg-stone-50/40 p-3.5 dark:border-stone-800 dark:bg-stone-800/20">
                  <h4 className="text-[11px] font-bold uppercase text-stone-400 mb-2">Riwayat Audit Laporan</h4>
                  <div className="space-y-2 text-[11px]">
                    <div className="flex justify-between text-stone-600 dark:text-stone-400">
                      <span>Dibuat:</span>
                      <span>{formatDateTimeIndo(selectedReport.dibuat_pada)}</span>
                    </div>
                    {selectedReport.selesai_pada && (
                      <div className="flex justify-between text-emerald-600">
                        <span>Selesai:</span>
                        <span>{formatDateTimeIndo(selectedReport.selesai_pada)}</span>
                      </div>
                    )}
                    {selectedReport.ditutup_pada && (
                      <div className="flex justify-between text-stone-500">
                        <span>Ditutup:</span>
                        <span>{formatDateTimeIndo(selectedReport.ditutup_pada)}</span>
                      </div>
                    )}
                  </div>
                </div>

              </div>

            </div>

          </div>
        ) : (
          <div className="lg:col-span-8 flex items-center justify-center rounded-2xl border border-stone-200 bg-white p-12 text-stone-400">
            Pilih laporan dari daftar di sebelah kiri untuk melihat detail.
          </div>
        )}

      </div>

      {/* MODAL BUAT LAPORAN KERUSAKAN (Penyewa - BR-11) */}
      {createModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-stone-900/60 p-4 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-2xl border border-stone-200 bg-white p-6 shadow-2xl dark:border-stone-800 dark:bg-stone-900">
            <h3 className="text-base font-bold text-stone-900 dark:text-stone-100">
              Ajukan Laporan Kerusakan Unit
            </h3>
            <p className="mt-1 text-xs text-stone-500">
              BR-11: Laporan hanya untuk unit kontrak aktif Anda. Wajib lampirkan 1 sampai 3 foto. Maksimal 3 laporan terbuka.
            </p>

            <form onSubmit={handleCreateReport} className="mt-4 space-y-3 text-xs">
              <div>
                <label className="block text-stone-500 mb-1">Kategori Masalah</label>
                <select
                  value={newKategori}
                  onChange={(e) => setNewKategori(e.target.value as any)}
                  className="w-full rounded-xl border border-stone-200 p-2 text-xs text-stone-900 dark:border-stone-700 dark:bg-stone-800 dark:text-stone-100"
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
                <label className="block text-stone-500 mb-1">Judul Masalah (5 - 80 Karakter)</label>
                <input
                  type="text"
                  required
                  minLength={5}
                  maxLength={80}
                  value={newJudul}
                  onChange={(e) => setNewJudul(e.target.value)}
                  placeholder="Contoh: Kran shower bocor tidak bisa ditutup rapat"
                  className="w-full rounded-xl border border-stone-200 p-2 text-xs text-stone-900 dark:border-stone-700 dark:bg-stone-800 dark:text-stone-100"
                />
              </div>

              <div>
                <label className="block text-stone-500 mb-1">Deskripsi Lengkap Kerusakan</label>
                <textarea
                  rows={3}
                  required
                  value={newDeskripsi}
                  onChange={(e) => setNewDeskripsi(e.target.value)}
                  placeholder="Jelaskan detail kendala yang dialami..."
                  className="w-full rounded-xl border border-stone-200 p-2 text-xs text-stone-900 dark:border-stone-700 dark:bg-stone-800 dark:text-stone-100"
                />
              </div>

              <div>
                <label className="block text-stone-500 mb-1">Foto Kerusakan (Path di Bucket Privat - BR-11)</label>
                <input
                  type="text"
                  required
                  value={newFotoPath}
                  onChange={(e) => setNewFotoPath(e.target.value)}
                  className="w-full rounded-xl border border-stone-200 p-2 text-xs font-mono dark:border-stone-700 dark:bg-stone-800 dark:text-stone-100"
                />
              </div>

              <div className="mt-5 flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setCreateModalOpen(false)}
                  className="rounded-xl border border-stone-200 px-3.5 py-1.5 text-xs font-medium text-stone-600 dark:border-stone-700"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="rounded-xl bg-stone-900 px-4 py-1.5 text-xs font-semibold text-white hover:bg-emerald-700 dark:bg-stone-100 dark:text-stone-900"
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
          <div className="w-full max-w-sm rounded-2xl border border-stone-200 bg-white p-5 shadow-2xl dark:border-stone-800 dark:bg-stone-900">
            <h3 className="text-sm font-bold text-stone-900 dark:text-stone-100">
              Estimasi Biaya Perbaikan (BR-12)
            </h3>
            <p className="mt-1 text-xs text-stone-500">
              Jika estimasi &gt; Rp1.000.000, sistem otomatis mengalihkan status ke persetujuan Pemilik.
            </p>

            <div className="mt-4 space-y-3 text-xs">
              <div>
                <label className="block text-stone-500 mb-1">Perkiraan Biaya (Rupiah)</label>
                <input
                  type="number"
                  step="50000"
                  value={estimasiBiaya}
                  onChange={(e) => setEstimasiBiaya(Number(e.target.value))}
                  className="w-full rounded-xl border border-stone-200 p-2 text-sm font-bold text-stone-900 dark:border-stone-700 dark:bg-stone-800 dark:text-stone-100"
                />
              </div>

              <div>
                <label className="block text-stone-500 mb-1">Catatan Analisis Pengelola</label>
                <textarea
                  rows={2}
                  value={catatanPengelola}
                  onChange={(e) => setCatatanPengelola(e.target.value)}
                  placeholder="Contoh: Perlu penggantian sparepart baru"
                  className="w-full rounded-xl border border-stone-200 p-2 text-xs text-stone-900 dark:border-stone-700 dark:bg-stone-800 dark:text-stone-100"
                />
              </div>
            </div>

            <div className="mt-5 flex justify-end gap-2">
              <button
                onClick={() => setProcessReport(null)}
                className="rounded-xl border border-stone-200 px-3 py-1.5 text-xs font-medium text-stone-600 dark:border-stone-700"
              >
                Batal
              </button>
              <button
                onClick={handleProcess}
                className="rounded-xl bg-stone-900 px-3.5 py-1.5 text-xs font-semibold text-white hover:bg-emerald-700 dark:bg-stone-100 dark:text-stone-900"
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
          <div className="w-full max-w-sm rounded-2xl border border-stone-200 bg-white p-5 shadow-2xl dark:border-stone-800 dark:bg-stone-900">
            <h3 className="text-sm font-bold text-stone-900 dark:text-stone-100">
              Persetujuan Biaya Perbaikan (BR-12)
            </h3>
            <p className="mt-1 text-xs text-stone-500">
              Estimasi: {formatRupiah(approveReport.estimasi_biaya)} untuk {approveReport.nomor}.
            </p>

            <div className="mt-3">
              <label className="block text-xs text-stone-500 mb-1">Alasan Penolakan (Wajib jika ditolak)</label>
              <textarea
                rows={2}
                value={rejectReason}
                onChange={(e) => setRejectReason(e.target.value)}
                placeholder="Contoh: Biaya terlalu tinggi, cari alternatif teknisi"
                className="w-full rounded-xl border border-stone-200 p-2 text-xs text-stone-900 dark:border-stone-700 dark:bg-stone-800 dark:text-stone-100"
              />
            </div>

            <div className="mt-5 flex justify-end gap-2">
              <button
                onClick={() => setApproveReport(null)}
                className="rounded-xl border border-stone-200 px-3 py-1.5 text-xs font-medium text-stone-600 dark:border-stone-700"
              >
                Batal
              </button>
              <button
                onClick={() => handleApprove(false)}
                className="rounded-xl bg-red-600 px-3.5 py-1.5 text-xs font-semibold text-white hover:bg-red-700"
              >
                Tolak
              </button>
              <button
                onClick={() => handleApprove(true)}
                className="rounded-xl bg-emerald-700 px-3.5 py-1.5 text-xs font-semibold text-white hover:bg-emerald-800"
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
          <div className="w-full max-w-sm rounded-2xl border border-stone-200 bg-white p-5 shadow-2xl dark:border-stone-800 dark:bg-stone-900">
            <h3 className="text-sm font-bold text-stone-900 dark:text-stone-100">
              Tandai Perbaikan Selesai
            </h3>
            <p className="mt-1 text-xs text-stone-500">
              BR-12: Biaya aktual sebenarnya wajib diisi saat pekerjaan selesai.
            </p>

            <div className="mt-4">
              <label className="block text-xs text-stone-500 mb-1">Biaya Aktual Akhir (Rupiah)</label>
              <input
                type="number"
                value={biayaAktual}
                onChange={(e) => setBiayaAktual(Number(e.target.value))}
                className="w-full rounded-xl border border-stone-200 p-2 text-sm font-bold text-stone-900 dark:border-stone-700 dark:bg-stone-800 dark:text-stone-100"
              />
            </div>

            <div className="mt-5 flex justify-end gap-2">
              <button
                onClick={() => setFinishReport(null)}
                className="rounded-xl border border-stone-200 px-3 py-1.5 text-xs font-medium text-stone-600 dark:border-stone-700"
              >
                Batal
              </button>
              <button
                onClick={handleMarkFinish}
                className="rounded-xl bg-emerald-700 px-3.5 py-1.5 text-xs font-semibold text-white hover:bg-emerald-800"
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
