'use client';

import { useState } from 'react';
import { useGriyaStore } from '@/lib/use-store';
import { maskNIK, formatDateIndo } from '@/lib/formatters';
import { TenantIdentity, Profile } from '@/lib/types';
import { Users, ShieldAlert, CheckCircle2, XCircle, Search, UserCheck, Eye, EyeOff } from 'lucide-react';

export default function PenyewaPage() {
  const { currentUser, state, store } = useGriyaStore();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  
  // Modal Verifikasi (Pengelola)
  const [verifTarget, setVerifTarget] = useState<{ profile: Profile; identity?: TenantIdentity } | null>(null);
  const [rejectReason, setRejectReason] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  // BR-10: Penyewa ditolak
  if (currentUser.peran === 'penyewa') {
    return (
      <div className="mx-auto max-w-lg px-4 py-16 text-center">
        <ShieldAlert className="mx-auto h-12 w-12 text-red-500 mb-3" />
        <h2 className="text-xl font-bold text-stone-900 dark:text-stone-100">Akses Ditolak</h2>
        <p className="mt-2 text-sm text-stone-500">
          Data identitas dan verifikasi penyewa bersifat rahasia dan hanya dapat diakses oleh staf Pengelola dan Pemilik (BR-10).
        </p>
      </div>
    );
  }

  const isManager = currentUser.peran === 'pengelola';
  const isOwner = currentUser.peran === 'pemilik';

  const tenantProfiles = state.profiles.filter(p => p.peran === 'penyewa');

  const filteredTenants = tenantProfiles.filter(p => {
    const ident = state.identities.find(i => i.penyewa_id === p.id);
    const matchesSearch = p.nama_lengkap.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          p.email.toLowerCase().includes(searchTerm.toLowerCase());
    if (!matchesSearch) return false;

    if (selectedStatus !== 'all') {
      const status = ident ? ident.status_verifikasi : 'belum_unggah';
      if (status !== selectedStatus) return false;
    }

    return true;
  });

  const handleVerify = (approved: boolean) => {
    if (!verifTarget) return;
    try {
      setErrorMsg('');
      store.verifyIdentity(verifTarget.profile.id, approved, approved ? undefined : rejectReason);
      setSuccessMsg(
        approved 
          ? `Identitas ${verifTarget.profile.nama_lengkap} berhasil diverifikasi!` 
          : `Identitas ${verifTarget.profile.nama_lengkap} ditolak.`
      );
      setVerifTarget(null);
      setRejectReason('');
      setTimeout(() => setSuccessMsg(''), 3000);
    } catch (err: unknown) {
      if (err instanceof Error) {
        setErrorMsg(err.message);
      } else {
        setErrorMsg('Gagal memverifikasi identitas');
      }
    }
  };

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8 space-y-6">
      
      {/* Header Halaman */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-stone-200/80 pb-6 dark:border-stone-800">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-stone-900 dark:text-stone-100 sm:text-3xl flex items-center gap-2.5">
            <Users className="h-7 w-7 text-stone-800 dark:text-stone-200" />
            Daftar Penyewa & Verifikasi
          </h1>
          <p className="mt-1 text-sm text-stone-500 dark:text-stone-400">
            {isOwner ? 'Mode Pemilik: NIK disamarkan (hanya 4 digit terakhir), foto KTP dirahasiakan (BR-10)' : 'Mode Pengelola: Akses penuh verifikasi dokumen KTP & kontak darurat (BR-03, BR-10)'}
          </p>
        </div>

        {/* Filter & Search */}
        <div className="flex flex-wrap items-center gap-2">
          <div className="relative">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-stone-400" />
            <input
              type="text"
              placeholder="Cari nama / email..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="rounded-xl border border-stone-200 bg-white pl-9 pr-3 py-1.5 text-xs text-stone-800 placeholder-stone-400 dark:border-stone-800 dark:bg-stone-900 dark:text-stone-200"
            />
          </div>

          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="rounded-xl border border-stone-200 bg-white px-3 py-1.5 text-xs font-medium text-stone-700 dark:border-stone-800 dark:bg-stone-900 dark:text-stone-300"
          >
            <option value="all">Semua Status Verifikasi</option>
            <option value="terverifikasi">Terverifikasi</option>
            <option value="belum">Menunggu Verifikasi</option>
            <option value="ditolak">Ditolak</option>
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

      {/* Tabel Penyewa */}
      <div className="overflow-hidden rounded-2xl border border-stone-200/90 bg-white shadow-xs dark:border-stone-800 dark:bg-stone-900">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="border-b border-stone-200/80 bg-stone-50/70 font-semibold text-stone-600 dark:border-stone-800 dark:bg-stone-800/40 dark:text-stone-300">
              <tr>
                <th className="py-3.5 px-4">Nama Lengkap</th>
                <th className="py-3.5 px-3">Kontak</th>
                <th className="py-3.5 px-3">Unit Aktif</th>
                <th className="py-3.5 px-3">Nomor Induk Kependudukan (NIK)</th>
                <th className="py-3.5 px-3">Status Verifikasi</th>
                <th className="py-3.5 px-4 text-right">Tindakan</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-100 dark:divide-stone-800/60 text-stone-800 dark:text-stone-200">
              {filteredTenants.map((p) => {
                const ident = state.identities.find(i => i.penyewa_id === p.id);
                const activeContract = state.contracts.find(c => c.penyewa_id === p.id && c.status === 'aktif');
                const unit = activeContract ? state.units.find(u => u.id === activeContract.unit_id) : null;
                const draftContract = state.contracts.find(c => c.penyewa_id === p.id && c.status === 'draf');

                return (
                  <tr key={p.id} className="hover:bg-stone-50/70 dark:hover:bg-stone-800/30 transition-colors">
                    <td className="py-3 px-4 font-semibold text-stone-900 dark:text-stone-100">
                      <div>{p.nama_lengkap}</div>
                      <div className="text-[11px] font-normal text-stone-400">{p.email}</div>
                    </td>
                    <td className="py-3 px-3">
                      {p.no_hp || '-'}
                    </td>
                    <td className="py-3 px-3">
                      {unit ? (
                        <span className="font-semibold text-emerald-700 dark:text-emerald-400">
                          {unit.kode} (Aktif)
                        </span>
                      ) : draftContract ? (
                        <span className="text-amber-600 dark:text-amber-400 font-medium">
                          Draf {draftContract.nomor}
                        </span>
                      ) : (
                        <span className="text-stone-400 italic">Belum ada kontrak</span>
                      )}
                    </td>
                    <td className="py-3 px-3 font-mono">
                      {ident ? (
                        isOwner ? maskNIK(ident.nik) : ident.nik
                      ) : (
                        <span className="text-stone-400 italic">Belum diisi</span>
                      )}
                    </td>
                    <td className="py-3 px-3">
                      {ident ? (
                        <span className={`inline-flex rounded-full px-2 py-0.5 text-[10px] font-semibold capitalize ${
                          ident.status_verifikasi === 'terverifikasi'
                            ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-300'
                            : ident.status_verifikasi === 'ditolak'
                            ? 'bg-red-100 text-red-800 dark:bg-red-950/40 dark:text-red-300'
                            : 'bg-amber-100 text-amber-800 dark:bg-amber-950/40 dark:text-amber-300'
                        }`}>
                          {ident.status_verifikasi}
                        </span>
                      ) : (
                        <span className="text-[10px] text-stone-400">Belum Unggah</span>
                      )}
                    </td>
                    <td className="py-3 px-4 text-right">
                      {isManager && ident && (
                        <button
                          onClick={() => {
                            setVerifTarget({ profile: p, identity: ident });
                            setErrorMsg('');
                          }}
                          className="rounded-lg bg-stone-900 px-2.5 py-1 text-xs font-semibold text-white hover:bg-emerald-700 dark:bg-stone-100 dark:text-stone-900 transition-colors"
                        >
                          Verifikasi
                        </button>
                      )}
                      {isOwner && (
                        <span className="text-[11px] text-stone-400 italic">
                          Hanya Baca
                        </span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* MODAL VERIFIKASI IDENTITAS (Hanya Pengelola - BR-03, BR-10) */}
      {verifTarget && verifTarget.identity && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-stone-900/60 p-4 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-2xl border border-stone-200 bg-white p-6 shadow-2xl dark:border-stone-800 dark:bg-stone-900">
            <h3 className="text-base font-bold text-stone-900 dark:text-stone-100 flex items-center gap-2">
              <UserCheck className="h-5 w-5 text-emerald-600" />
              Verifikasi Identitas Penyewa
            </h3>
            
            <div className="mt-4 space-y-3 text-xs">
              <div className="rounded-xl border border-stone-100 bg-stone-50 p-3 dark:border-stone-800 dark:bg-stone-800/40 space-y-1.5">
                <div><span className="text-stone-400">Nama:</span> <span className="font-semibold">{verifTarget.profile.nama_lengkap}</span></div>
                <div><span className="text-stone-400">NIK:</span> <span className="font-mono font-medium">{verifTarget.identity.nik}</span></div>
                <div><span className="text-stone-400">Alamat KTP:</span> {verifTarget.identity.alamat_asal}</div>
                <div><span className="text-stone-400">Kontak Darurat:</span> {verifTarget.identity.kontak_darurat_nama} ({verifTarget.identity.kontak_darurat_hp})</div>
                <div><span className="text-stone-400">Path File Foto:</span> <code className="text-emerald-600 font-mono">{verifTarget.identity.foto_ktp_path}</code></div>
              </div>

              <div>
                <label className="block text-stone-500 mb-1">Alasan Penolakan (Wajib jika menolak verifikasi)</label>
                <textarea
                  rows={2}
                  value={rejectReason}
                  onChange={(e) => setRejectReason(e.target.value)}
                  placeholder="Contoh: Foto KTP buram dan tidak terbaca jelas"
                  className="w-full rounded-xl border border-stone-200 p-2.5 text-xs text-stone-900 dark:border-stone-700 dark:bg-stone-800 dark:text-stone-100"
                />
              </div>
            </div>

            <div className="mt-6 flex justify-end gap-2">
              <button
                onClick={() => setVerifTarget(null)}
                className="rounded-xl border border-stone-200 px-3 py-1.5 text-xs font-medium text-stone-600 dark:border-stone-700 dark:text-stone-300"
              >
                Batal
              </button>
              <button
                onClick={() => handleVerify(false)}
                className="rounded-xl bg-red-600 px-3.5 py-1.5 text-xs font-semibold text-white hover:bg-red-700"
              >
                Tolak
              </button>
              <button
                onClick={() => handleVerify(true)}
                className="rounded-xl bg-emerald-600 px-4 py-1.5 text-xs font-semibold text-white hover:bg-emerald-700"
              >
                Setujui & Verifikasi
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
