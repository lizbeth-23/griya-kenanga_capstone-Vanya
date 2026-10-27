'use client';

import { useState } from 'react';
import { useGriyaStore } from '@/lib/use-store';
import { maskNIK, formatDateIndo } from '@/lib/formatters';
import { TenantIdentity, Profile } from '@/lib/types';
import { Users, ShieldAlert, CheckCircle2, XCircle, Search, UserCheck, Eye, EyeOff } from 'lucide-react';
import AuthGuard from '@/components/AuthGuard';

export default function PenyewaPage() {
  const { currentUser, state, store } = useGriyaStore();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  
  // Modal Verifikasi (Pengelola)
  const [verifTarget, setVerifTarget] = useState<{ profile: Profile; identity?: TenantIdentity } | null>(null);
  const [rejectReason, setRejectReason] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  // PROTEKSI ROUTE: Belum login
  if (!currentUser) {
    return <AuthGuard moduleName="verifikasi data penyewa" />;
  }

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
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-[#DCE5D8] pb-6 dark:border-[#2C382A]">
        <div>
          <h1 className="text-2xl font-extrabold tracking-tight text-[#222520] dark:text-[#ECEAE4] sm:text-3xl flex items-center gap-2.5">
            <Users className="h-7 w-7 text-[#3B5336] dark:text-[#95B08A]" />
            Daftar Penyewa &amp; Verifikasi
          </h1>
          <p className="mt-1 text-sm text-[#5D6B58] dark:text-[#A7B8A3]">
            {isOwner ? 'Mode Pemilik: NIK disamarkan (hanya 4 digit terakhir), foto KTP dirahasiakan (BR-10)' : 'Mode Pengelola: Akses penuh verifikasi dokumen KTP & kontak darurat (BR-03, BR-10)'}
          </p>
        </div>

        {/* Filter & Search */}
        <div className="flex flex-wrap items-center gap-2">
          <div className="relative">
            <Search className="absolute left-3.5 top-3 h-4 w-4 text-[#7F9979]" />
            <input
              type="text"
              placeholder="Cari nama / email..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="rounded-2xl border border-[#DCE5D8] bg-[#F4F7F2] pl-10 pr-3.5 py-2 text-xs text-[#222520] placeholder-[#7F9979] focus:bg-white focus:border-[#3B5336] focus:outline-none dark:border-[#2C382A] dark:bg-[#182117] dark:text-[#ECEAE4]"
            />
          </div>

          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="rounded-2xl border border-[#DCE5D8] bg-[#F4F7F2] px-3.5 py-2 text-xs font-bold text-[#2D4129] dark:border-[#2C382A] dark:bg-[#182117] dark:text-[#D5E6D2]"
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

      {/* Tabel Penyewa */}
      <div className="overflow-hidden rounded-2xl border border-[#DCE5D8] bg-white shadow-xs dark:border-[#2C382A] dark:bg-[#1E261D]">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="border-b border-[#DCE5D8] bg-[#E8EFE5]/60 font-bold text-[#4F604A] dark:border-[#2C382A] dark:bg-[#182317] dark:text-[#D5E6D2]">
              <tr>
                <th className="py-3.5 px-4">Nama Lengkap</th>
                <th className="py-3.5 px-3">Kontak</th>
                <th className="py-3.5 px-3">Unit Aktif</th>
                <th className="py-3.5 px-3">Nomor Induk Kependudukan (NIK)</th>
                <th className="py-3.5 px-3">Status Verifikasi</th>
                <th className="py-3.5 px-4 text-right">Tindakan</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E8EFE5] dark:divide-[#2C382A]/70 text-[#222520] dark:text-[#ECEAE4]">
              {filteredTenants.map((p) => {
                const ident = state.identities.find(i => i.penyewa_id === p.id);
                const activeContract = state.contracts.find(c => c.penyewa_id === p.id && c.status === 'aktif');
                const unit = activeContract ? state.units.find(u => u.id === activeContract.unit_id) : null;
                const draftContract = state.contracts.find(c => c.penyewa_id === p.id && c.status === 'draf');

                return (
                  <tr key={p.id} className="hover:bg-[#F4F7F2] dark:hover:bg-[#253023]/40 transition-colors">
                    <td className="py-3.5 px-4 font-bold text-[#222520] dark:text-[#ECEAE4]">
                      <div>{p.nama_lengkap}</div>
                      <div className="text-[11px] font-normal text-[#5D6B58] dark:text-[#A7B8A3]">{p.email}</div>
                    </td>
                    <td className="py-3.5 px-3 font-medium">
                      {p.no_hp || '-'}
                    </td>
                    <td className="py-3.5 px-3">
                      {unit ? (
                        <span className="font-bold text-[#3B5336] dark:text-[#95B08A]">
                          {unit.kode} (Aktif)
                        </span>
                      ) : draftContract ? (
                        <span className="text-amber-700 dark:text-amber-400 font-bold">
                          Draf {draftContract.nomor}
                        </span>
                      ) : (
                        <span className="text-[#7F9979] italic">Belum ada kontrak</span>
                      )}
                    </td>
                    <td className="py-3.5 px-3 font-mono font-medium">
                      {ident ? (
                        isOwner ? maskNIK(ident.nik) : ident.nik
                      ) : (
                        <span className="text-[#7F9979] italic">Belum diisi</span>
                      )}
                    </td>
                    <td className="py-3.5 px-3">
                      {ident ? (
                        <span className={`inline-flex rounded-full px-2.5 py-0.5 text-[10px] font-bold capitalize ${
                          ident.status_verifikasi === 'terverifikasi'
                            ? 'bg-[#E8EFE5] text-[#2D4129] border border-[#95B08A]/50 dark:bg-[#172216] dark:text-[#95B08A]'
                            : ident.status_verifikasi === 'ditolak'
                            ? 'bg-[#FDF0EE] text-[#A63A2E] border border-[#F3C5BF]'
                            : 'bg-[#FEF7EC] text-[#9A6715] border border-[#F6DEB8]'
                        }`}>
                          {ident.status_verifikasi}
                        </span>
                      ) : (
                        <span className="text-[10px] text-[#5D6B58] dark:text-[#A7B8A3]">Belum Unggah</span>
                      )}
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      {isManager && ident && (
                        <button
                          onClick={() => {
                            setVerifTarget({ profile: p, identity: ident });
                            setErrorMsg('');
                          }}
                          className="rounded-full bg-[#3B5336] px-3.5 py-1 text-xs font-bold text-white hover:bg-[#2D4129] active:scale-95 transition-all shadow-2xs"
                        >
                          Verifikasi
                        </button>
                      )}
                      {isOwner && (
                        <span className="text-[11px] text-[#5D6B58] dark:text-[#A7B8A3] italic">
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
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#171D16]/75 p-4 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="w-full max-w-md rounded-[28px] border border-[#DCE5D8] bg-white p-6 sm:p-7 shadow-2xl dark:border-[#2C382A] dark:bg-[#1E261D]">
            <h3 className="text-base font-extrabold text-[#222520] dark:text-[#ECEAE4] flex items-center gap-2">
              <UserCheck className="h-5 w-5 text-[#3B5336] dark:text-[#95B08A]" />
              Verifikasi Identitas Penyewa
            </h3>
            
            <div className="mt-4 space-y-3.5 text-xs">
              <div className="rounded-2xl border border-[#E8EFE5] bg-[#F4F7F2] p-3.5 dark:border-[#2C382A] dark:bg-[#172016] space-y-1.5">
                <div><span className="text-[#5D6B58] dark:text-[#A7B8A3]">Nama:</span> <span className="font-bold text-[#222520] dark:text-[#ECEAE4]">{verifTarget.profile.nama_lengkap}</span></div>
                <div><span className="text-[#5D6B58] dark:text-[#A7B8A3]">NIK:</span> <span className="font-mono font-bold">{verifTarget.identity.nik}</span></div>
                <div><span className="text-[#5D6B58] dark:text-[#A7B8A3]">Alamat KTP:</span> {verifTarget.identity.alamat_asal}</div>
                <div><span className="text-[#5D6B58] dark:text-[#A7B8A3]">Kontak Darurat:</span> {verifTarget.identity.kontak_darurat_nama} ({verifTarget.identity.kontak_darurat_hp})</div>
                <div><span className="text-[#5D6B58] dark:text-[#A7B8A3]">Path File Foto:</span> <code className="text-[#3B5336] dark:text-[#95B08A] font-bold font-mono">{verifTarget.identity.foto_ktp_path}</code></div>
              </div>

              <div>
                <label className="block text-[#4F604A] dark:text-[#A7B8A3] mb-1 font-semibold">Alasan Penolakan (Wajib jika menolak verifikasi)</label>
                <textarea
                  rows={2}
                  value={rejectReason}
                  onChange={(e) => setRejectReason(e.target.value)}
                  placeholder="Contoh: Foto KTP buram dan tidak terbaca jelas"
                  className="w-full rounded-2xl bg-[#E8EFE5]/70 p-3 text-xs text-[#222520] placeholder-[#7F9979] border border-transparent focus:border-[#3B5336] focus:bg-white focus:outline-none dark:bg-[#161F15] dark:text-white"
                />
              </div>
            </div>

            <div className="mt-6 flex justify-end gap-2">
              <button
                onClick={() => setVerifTarget(null)}
                className="rounded-full border border-[#DCE5D8] px-4 py-2 text-xs font-semibold text-[#5D6B58] hover:bg-[#E8EFE5] dark:border-[#2A3728] dark:text-[#A7B8A3] dark:hover:bg-[#1E281C]"
              >
                Batal
              </button>
              <button
                onClick={() => handleVerify(false)}
                className="rounded-full bg-red-600 px-4 py-2 text-xs font-bold text-white hover:bg-red-700 shadow-xs"
              >
                Tolak
              </button>
              <button
                onClick={() => handleVerify(true)}
                className="rounded-full bg-[#3B5336] px-5 py-2 text-xs font-bold text-white hover:bg-[#2D4129] active:scale-95 shadow-md"
              >
                Setujui &amp; Verifikasi
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
