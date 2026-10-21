export type UserRole = 'penyewa' | 'pengelola' | 'pemilik';
export type UnitStatus = 'tersedia' | 'perbaikan' | 'nonaktif';
export type ContractStatus = 'draf' | 'aktif' | 'selesai' | 'diakhiri' | 'dibatalkan';
export type InvoiceStatus = 'belum_bayar' | 'sebagian' | 'lunas' | 'dibatalkan';
export type PaymentMethod = 'tunai' | 'transfer' | 'mayar';
export type PaymentStatus = 'sah' | 'dibatalkan';
export type VerificationStatus = 'belum' | 'terverifikasi' | 'ditolak';
export type DamageCategory = 'listrik' | 'air' | 'ac' | 'bangunan' | 'perabot' | 'lainnya';
export type DamageStatus = 'dilaporkan' | 'diproses' | 'menunggu_persetujuan' | 'selesai' | 'ditutup' | 'ditolak';

export interface Profile {
  id: string;
  nama_lengkap: string;
  email: string;
  no_hp?: string;
  peran: UserRole;
  aktif: boolean;
  dibuat_pada: string;
}

export interface TenantIdentity {
  penyewa_id: string;
  nik: string; // 16 digits
  alamat_asal: string;
  foto_ktp_path: string;
  kontak_darurat_nama: string;
  kontak_darurat_hp: string;
  status_verifikasi: VerificationStatus;
  alasan_tolak?: string;
  diverifikasi_oleh?: string;
  diverifikasi_pada?: string;
  diperbarui_pada: string;
}

export interface PropertyUnit {
  id: string;
  kode: string;
  lantai: number; // 1..3
  tipe: 'standar' | 'ac' | 'studio';
  luas_m2: number;
  harga_sewa_bulanan: number;
  status: UnitStatus;
  keterangan?: string;
  dibuat_pada: string;
  // Field join pembantu
  penyewa_aktif?: string;
  kontrak_id_aktif?: string;
}

export interface Contract {
  id: string;
  nomor: string; // KTR-YYYY-XXXX
  unit_id: string;
  penyewa_id: string;
  tanggal_mulai: string; // YYYY-MM-01
  durasi_bulan: 1 | 3 | 6 | 12;
  tanggal_selesai: string;
  harga_sewa_bulanan: number;
  status: ContractStatus;
  tanggal_berakhir_aktual?: string;
  alasan_berakhir?: string;
  dibuat_oleh?: string;
  diaktifkan_pada?: string;
  dibuat_pada: string;
  // Field join
  unit_kode?: string;
  penyewa_nama?: string;
  penyewa_email?: string;
}

export interface Invoice {
  id: string;
  nomor: string; // INV-YYYYMM-XXXX
  kontrak_id: string;
  periode: string; // YYYY-MM-01
  jatuh_tempo: string; // YYYY-MM-10
  nominal_sewa: number;
  denda: number;
  terbayar: number;
  status: InvoiceStatus;
  alasan_batal?: string;
  mayar_invoice_id?: string;
  mayar_link?: string;
  dibuat_oleh?: string;
  dibuat_pada: string;
  // Field join
  unit_kode?: string;
  penyewa_nama?: string;
  sisa_kewajiban?: number;
}

export interface Payment {
  id: string;
  tagihan_id: string;
  jumlah: number;
  metode: PaymentMethod;
  tanggal_bayar: string;
  bukti_path?: string;
  referensi_mayar?: string;
  status: PaymentStatus;
  alasan_batal?: string;
  dicatat_oleh?: string;
  dibatalkan_oleh?: string;
  dibatalkan_pada?: string;
  dibuat_pada: string;
  // Field join
  tagihan_nomor?: string;
  unit_kode?: string;
  penyewa_nama?: string;
}

export interface DamageReport {
  id: string;
  nomor: string; // LK-YYYY-XXXX
  kontrak_id: string;
  unit_id: string;
  pelapor_id: string;
  kategori: DamageCategory;
  judul: string;
  deskripsi: string;
  foto_paths: string[];
  status: DamageStatus;
  estimasi_biaya: number;
  biaya_aktual: number;
  catatan?: string;
  alasan_tolak?: string;
  disetujui_oleh?: string;
  disetujui_pada?: string;
  selesai_pada?: string;
  ditutup_pada?: string;
  dibuat_pada: string;
  diperbarui_pada: string;
  // Field join
  unit_kode?: string;
  pelapor_nama?: string;
}

export interface AuditLogItem {
  id: number;
  pelaku_id?: string;
  pelaku_nama?: string;
  peran?: UserRole;
  aksi: string;
  tabel: string;
  data_id: string;
  sebelum?: Record<string, unknown> | null;
  sesudah?: Record<string, unknown> | null;
  dibuat_pada: string;
}
