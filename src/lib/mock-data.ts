import { Profile, TenantIdentity, PropertyUnit, Contract, Invoice, Payment, DamageReport, AuditLogItem } from './types';

export const INITIAL_PROFILES: Profile[] = [
  {
    id: 'user-pemilik-01',
    nama_lengkap: 'Ratna Kusumawardani',
    email: 'ratna@griyakenanga.test',
    no_hp: '081234567001',
    peran: 'pemilik',
    aktif: true,
    dibuat_pada: '2026-01-01T08:00:00Z'
  },
  {
    id: 'user-pengelola-01',
    nama_lengkap: 'Bayu Prasetyo',
    email: 'bayu@griyakenanga.test',
    no_hp: '081234567002',
    peran: 'pengelola',
    aktif: true,
    dibuat_pada: '2026-01-01T08:00:00Z'
  },
  {
    id: 'user-pengelola-02',
    nama_lengkap: 'Sinta Dewi',
    email: 'sinta@griyakenanga.test',
    no_hp: '081234567003',
    peran: 'pengelola',
    aktif: true,
    dibuat_pada: '2026-01-01T08:00:00Z'
  },
  {
    id: 'user-penyewa-dimas',
    nama_lengkap: 'Dimas Saputra',
    email: 'dimas@griyakenanga.test',
    no_hp: '081234567004',
    peran: 'penyewa',
    aktif: true,
    dibuat_pada: '2026-02-01T08:00:00Z'
  },
  {
    id: 'user-penyewa-hana',
    nama_lengkap: 'Hana Puspita',
    email: 'hana@griyakenanga.test',
    no_hp: '081234567005',
    peran: 'penyewa',
    aktif: true,
    dibuat_pada: '2026-02-01T08:00:00Z'
  },
  {
    id: 'user-penyewa-fajar',
    nama_lengkap: 'Fajar Nugroho',
    email: 'fajar@griyakenanga.test',
    no_hp: '081234567006',
    peran: 'penyewa',
    aktif: true,
    dibuat_pada: '2026-09-25T08:00:00Z'
  },
  {
    id: 'user-penyewa-cahya',
    nama_lengkap: 'Cahya Ramadhan',
    email: 'cahya@griyakenanga.test',
    no_hp: '081234567007',
    peran: 'penyewa',
    aktif: true,
    dibuat_pada: '2026-01-10T08:00:00Z'
  },
  {
    id: 'user-penyewa-oki',
    nama_lengkap: 'Oki Firmansyah',
    email: 'oki@griyakenanga.test',
    no_hp: '081234567008',
    peran: 'penyewa',
    aktif: true,
    dibuat_pada: '2026-01-10T08:00:00Z'
  },
  {
    id: 'user-penyewa-kevin',
    nama_lengkap: 'Kevin Wijaya',
    email: 'kevin@griyakenanga.test',
    no_hp: '081234567009',
    peran: 'penyewa',
    aktif: true,
    dibuat_pada: '2026-01-10T08:00:00Z'
  },
  {
    id: 'user-penyewa-laras',
    nama_lengkap: 'Laras Anggraini',
    email: 'laras@griyakenanga.test',
    no_hp: '081234567010',
    peran: 'penyewa',
    aktif: true,
    dibuat_pada: '2026-01-10T08:00:00Z'
  },
  {
    id: 'user-penyewa-teguh',
    nama_lengkap: 'Teguh Santoso',
    email: 'teguh@griyakenanga.test',
    no_hp: '081234567011',
    peran: 'penyewa',
    aktif: true,
    dibuat_pada: '2026-01-10T08:00:00Z'
  },
  {
    id: 'user-penyewa-aditya',
    nama_lengkap: 'Aditya Pratama',
    email: 'aditya@griyakenanga.test',
    no_hp: '081234567012',
    peran: 'penyewa',
    aktif: true,
    dibuat_pada: '2026-01-10T08:00:00Z'
  },
  {
    id: 'user-penyewa-bella',
    nama_lengkap: 'Bella Safitri',
    email: 'bella@griyakenanga.test',
    no_hp: '081234567013',
    peran: 'penyewa',
    aktif: true,
    dibuat_pada: '2026-01-10T08:00:00Z'
  },
  {
    id: 'user-penyewa-eka',
    nama_lengkap: 'Eka Wulandari',
    email: 'eka@griyakenanga.test',
    no_hp: '081234567014',
    peran: 'penyewa',
    aktif: true,
    dibuat_pada: '2026-01-10T08:00:00Z'
  },
  {
    id: 'user-penyewa-gilang',
    nama_lengkap: 'Gilang Ramadhan',
    email: 'gilang@griyakenanga.test',
    no_hp: '081234567015',
    peran: 'penyewa',
    aktif: false,
    dibuat_pada: '2026-01-10T08:00:00Z'
  },
  {
    id: 'user-penyewa-indra',
    nama_lengkap: 'Indra Kurniawan',
    email: 'indra@griyakenanga.test',
    no_hp: '081234567016',
    peran: 'penyewa',
    aktif: true,
    dibuat_pada: '2026-01-10T08:00:00Z'
  },
  {
    id: 'user-penyewa-jihan',
    nama_lengkap: 'Jihan Aulia',
    email: 'jihan@griyakenanga.test',
    no_hp: '081234567017',
    peran: 'penyewa',
    aktif: true,
    dibuat_pada: '2026-01-10T08:00:00Z'
  },
  {
    id: 'user-penyewa-rizki',
    nama_lengkap: 'Muhammad Rizki',
    email: 'rizki@griyakenanga.test',
    no_hp: '081234567018',
    peran: 'penyewa',
    aktif: true,
    dibuat_pada: '2026-01-10T08:00:00Z'
  },
  {
    id: 'user-penyewa-nadia',
    nama_lengkap: 'Nadia Salsabila',
    email: 'nadia@griyakenanga.test',
    no_hp: '081234567019',
    peran: 'penyewa',
    aktif: true,
    dibuat_pada: '2026-01-10T08:00:00Z'
  },
  {
    id: 'user-penyewa-putri',
    nama_lengkap: 'Putri Lestari',
    email: 'putri@griyakenanga.test',
    no_hp: '081234567020',
    peran: 'penyewa',
    aktif: true,
    dibuat_pada: '2026-01-10T08:00:00Z'
  },
  {
    id: 'user-penyewa-raka',
    nama_lengkap: 'Raka Aditama',
    email: 'raka@griyakenanga.test',
    no_hp: '081234567021',
    peran: 'penyewa',
    aktif: true,
    dibuat_pada: '2026-01-10T08:00:00Z'
  },
  {
    id: 'user-penyewa-salma',
    nama_lengkap: 'Salma Nuraini',
    email: 'salma@griyakenanga.test',
    no_hp: '081234567022',
    peran: 'penyewa',
    aktif: true,
    dibuat_pada: '2026-01-10T08:00:00Z'
  },
  {
    id: 'user-penyewa-vina',
    nama_lengkap: 'Vina Rahmawati',
    email: 'vina@griyakenanga.test',
    no_hp: '081234567023',
    peran: 'penyewa',
    aktif: true,
    dibuat_pada: '2026-01-10T08:00:00Z'
  },
  {
    id: 'user-penyewa-wahyu',
    nama_lengkap: 'Wahyu Hidayat',
    email: 'wahyu@griyakenanga.test',
    no_hp: '081234567024',
    peran: 'penyewa',
    aktif: true,
    dibuat_pada: '2026-01-10T08:00:00Z'
  },
  {
    id: 'user-penyewa-zaki',
    nama_lengkap: 'Zaki Pratama',
    email: 'zaki@griyakenanga.test',
    no_hp: '081234567025',
    peran: 'penyewa',
    aktif: true,
    dibuat_pada: '2026-01-10T08:00:00Z'
  }
];

export const INITIAL_IDENTITIES: TenantIdentity[] = [
  {
    penyewa_id: 'user-penyewa-dimas',
    nik: '3404071205980004',
    alamat_asal: 'Jl. Gejayan No. 45, Sleman, DIY',
    foto_ktp_path: '/uploads/ktp/dimas.jpg',
    kontak_darurat_nama: 'Budi Saputra (Ayah)',
    kontak_darurat_hp: '081234567801',
    status_verifikasi: 'terverifikasi',
    diverifikasi_oleh: 'user-pengelola-01',
    diverifikasi_pada: '2026-02-02T10:00:00Z',
    diperbarui_pada: '2026-02-02T10:00:00Z'
  },
  {
    penyewa_id: 'user-penyewa-hana',
    nik: '3404072508990005',
    alamat_asal: 'Jl. Kaliurang KM 5, Sleman, DIY',
    foto_ktp_path: '/uploads/ktp/hana.jpg',
    kontak_darurat_nama: 'Sri Puspita (Ibu)',
    kontak_darurat_hp: '081234567802',
    status_verifikasi: 'terverifikasi',
    diverifikasi_oleh: 'user-pengelola-01',
    diverifikasi_pada: '2026-02-02T10:30:00Z',
    diperbarui_pada: '2026-02-02T10:30:00Z'
  },
  {
    penyewa_id: 'user-penyewa-fajar',
    nik: '3404071903000006',
    alamat_asal: 'Jl. Bantul No. 12, Bantul, DIY',
    foto_ktp_path: '/uploads/ktp/fajar.jpg',
    kontak_darurat_nama: 'Agus Nugroho (Paman)',
    kontak_darurat_hp: '081234567803',
    status_verifikasi: 'belum', // Kasus uji BR-03
    diperbarui_pada: '2026-09-25T08:00:00Z'
  },
  {
    penyewa_id: 'user-penyewa-cahya',
    nik: '3404071111970007',
    alamat_asal: 'Jl. Solo KM 9, Sleman, DIY',
    foto_ktp_path: '/uploads/ktp/cahya.jpg',
    kontak_darurat_nama: 'Santoso Ramadhan (Ayah)',
    kontak_darurat_hp: '081234567804',
    status_verifikasi: 'terverifikasi',
    diverifikasi_oleh: 'user-pengelola-02',
    diverifikasi_pada: '2026-01-11T09:00:00Z',
    diperbarui_pada: '2026-01-11T09:00:00Z'
  },
  {
    penyewa_id: 'user-penyewa-gilang',
    nik: '3404071509980008',
    alamat_asal: 'Jl. Magelang No. 3, Sleman',
    foto_ktp_path: '/uploads/ktp/gilang.jpg',
    kontak_darurat_nama: 'Herman (Kakak)',
    kontak_darurat_hp: '081234567805',
    status_verifikasi: 'ditolak',
    alasan_tolak: 'Foto KTP buram dan tidak terbaca jelas',
    diverifikasi_oleh: 'user-pengelola-01',
    diverifikasi_pada: '2026-01-12T10:00:00Z',
    diperbarui_pada: '2026-01-12T10:00:00Z'
  }
];

export const INITIAL_UNITS: PropertyUnit[] = [
  // Lantai 1 (Standar)
  { id: 'unit-a101', kode: 'A-101', lantai: 1, tipe: 'standar', luas_m2: 15.0, harga_sewa_bulanan: 1350000, status: 'tersedia', dibuat_pada: '2026-01-01T00:00:00Z' },
  { id: 'unit-a102', kode: 'A-102', lantai: 1, tipe: 'standar', luas_m2: 16.0, harga_sewa_bulanan: 1450000, status: 'tersedia', dibuat_pada: '2026-01-01T00:00:00Z' },
  { id: 'unit-a103', kode: 'A-103', lantai: 1, tipe: 'standar', luas_m2: 16.0, harga_sewa_bulanan: 1450000, status: 'tersedia', dibuat_pada: '2026-01-01T00:00:00Z' },
  { id: 'unit-a104', kode: 'A-104', lantai: 1, tipe: 'standar', luas_m2: 15.0, harga_sewa_bulanan: 1350000, status: 'tersedia', dibuat_pada: '2026-01-01T00:00:00Z' },
  { id: 'unit-a105', kode: 'A-105', lantai: 1, tipe: 'standar', luas_m2: 16.0, harga_sewa_bulanan: 1450000, status: 'tersedia', dibuat_pada: '2026-01-01T00:00:00Z' },
  { id: 'unit-a106', kode: 'A-106', lantai: 1, tipe: 'standar', luas_m2: 15.0, harga_sewa_bulanan: 1350000, status: 'tersedia', keterangan: 'Kosong pasca diakhiri 30 Sep', dibuat_pada: '2026-01-01T00:00:00Z' },
  { id: 'unit-a107', kode: 'A-107', lantai: 1, tipe: 'standar', luas_m2: 15.0, harga_sewa_bulanan: 1350000, status: 'tersedia', dibuat_pada: '2026-01-01T00:00:00Z' },
  { id: 'unit-a108', kode: 'A-108', lantai: 1, tipe: 'standar', luas_m2: 15.0, harga_sewa_bulanan: 1350000, status: 'nonaktif', keterangan: 'Gudang operasional sementara', dibuat_pada: '2026-01-01T00:00:00Z' },

  // Lantai 2 (AC)
  { id: 'unit-b201', kode: 'B-201', lantai: 2, tipe: 'ac', luas_m2: 18.0, harga_sewa_bulanan: 1900000, status: 'tersedia', dibuat_pada: '2026-01-01T00:00:00Z' },
  { id: 'unit-b202', kode: 'B-202', lantai: 2, tipe: 'ac', luas_m2: 17.5, harga_sewa_bulanan: 1850000, status: 'tersedia', dibuat_pada: '2026-01-01T00:00:00Z' },
  { id: 'unit-b203', kode: 'B-203', lantai: 2, tipe: 'ac', luas_m2: 17.5, harga_sewa_bulanan: 1850000, status: 'tersedia', dibuat_pada: '2026-01-01T00:00:00Z' },
  { id: 'unit-b204', kode: 'B-204', lantai: 2, tipe: 'ac', luas_m2: 17.5, harga_sewa_bulanan: 1850000, status: 'tersedia', dibuat_pada: '2026-01-01T00:00:00Z' },
  { id: 'unit-b205', kode: 'B-205', lantai: 2, tipe: 'ac', luas_m2: 18.0, harga_sewa_bulanan: 1900000, status: 'perbaikan', keterangan: 'Perbaikan plafon dan instalasi pipa', dibuat_pada: '2026-01-01T00:00:00Z' },
  { id: 'unit-b206', kode: 'B-206', lantai: 2, tipe: 'ac', luas_m2: 17.0, harga_sewa_bulanan: 1750000, status: 'tersedia', dibuat_pada: '2026-01-01T00:00:00Z' },
  { id: 'unit-b207', kode: 'B-207', lantai: 2, tipe: 'ac', luas_m2: 17.5, harga_sewa_bulanan: 1850000, status: 'tersedia', dibuat_pada: '2026-01-01T00:00:00Z' },
  { id: 'unit-b208', kode: 'B-208', lantai: 2, tipe: 'ac', luas_m2: 19.0, harga_sewa_bulanan: 2000000, status: 'tersedia', dibuat_pada: '2026-01-01T00:00:00Z' },

  // Lantai 3 (Studio)
  { id: 'unit-c301', kode: 'C-301', lantai: 3, tipe: 'studio', luas_m2: 26.0, harga_sewa_bulanan: 2800000, status: 'tersedia', dibuat_pada: '2026-01-01T00:00:00Z' },
  { id: 'unit-c302', kode: 'C-302', lantai: 3, tipe: 'studio', luas_m2: 25.0, harga_sewa_bulanan: 2750000, status: 'tersedia', dibuat_pada: '2026-01-01T00:00:00Z' },
  { id: 'unit-c303', kode: 'C-303', lantai: 3, tipe: 'studio', luas_m2: 25.0, harga_sewa_bulanan: 2750000, status: 'tersedia', dibuat_pada: '2026-01-01T00:00:00Z' },
  { id: 'unit-c304', kode: 'C-304', lantai: 3, tipe: 'studio', luas_m2: 25.0, harga_sewa_bulanan: 2750000, status: 'tersedia', dibuat_pada: '2026-01-01T00:00:00Z' },
  { id: 'unit-c305', kode: 'C-305', lantai: 3, tipe: 'studio', luas_m2: 24.5, harga_sewa_bulanan: 2650000, status: 'tersedia', dibuat_pada: '2026-01-01T00:00:00Z' },
  { id: 'unit-c306', kode: 'C-306', lantai: 3, tipe: 'studio', luas_m2: 25.0, harga_sewa_bulanan: 2750000, status: 'tersedia', dibuat_pada: '2026-01-01T00:00:00Z' },
  { id: 'unit-c307', kode: 'C-307', lantai: 3, tipe: 'studio', luas_m2: 25.0, harga_sewa_bulanan: 2750000, status: 'tersedia', dibuat_pada: '2026-01-01T00:00:00Z' },
  { id: 'unit-c308', kode: 'C-308', lantai: 3, tipe: 'studio', luas_m2: 25.0, harga_sewa_bulanan: 2750000, status: 'tersedia', dibuat_pada: '2026-01-01T00:00:00Z' }
];

export const INITIAL_CONTRACTS: Contract[] = [
  {
    id: 'ktr-0001',
    nomor: 'KTR-2026-0001',
    unit_id: 'unit-a101',
    penyewa_id: 'user-penyewa-aditya',
    tanggal_mulai: '2026-01-01',
    durasi_bulan: 12,
    tanggal_selesai: '2026-12-31',
    harga_sewa_bulanan: 1350000,
    status: 'aktif',
    dibuat_oleh: 'user-pengelola-01',
    diaktifkan_pada: '2026-01-01T08:00:00Z',
    dibuat_pada: '2026-01-01T08:00:00Z'
  },
  {
    id: 'ktr-0002',
    nomor: 'KTR-2026-0002',
    unit_id: 'unit-a102',
    penyewa_id: 'user-penyewa-bella',
    tanggal_mulai: '2026-01-01',
    durasi_bulan: 12,
    tanggal_selesai: '2026-12-31',
    harga_sewa_bulanan: 1450000,
    status: 'aktif',
    dibuat_oleh: 'user-pengelola-01',
    diaktifkan_pada: '2026-01-01T08:00:00Z',
    dibuat_pada: '2026-01-01T08:00:00Z'
  },
  {
    id: 'ktr-0003',
    nomor: 'KTR-2026-0003',
    unit_id: 'unit-a103',
    penyewa_id: 'user-penyewa-cahya',
    tanggal_mulai: '2026-05-01',
    durasi_bulan: 6,
    tanggal_selesai: '2026-10-31', // Berakhir 31 Okt 2026
    harga_sewa_bulanan: 1450000,
    status: 'aktif',
    dibuat_oleh: 'user-pengelola-01',
    diaktifkan_pada: '2026-05-01T08:00:00Z',
    dibuat_pada: '2026-05-01T08:00:00Z'
  },
  {
    id: 'ktr-0004',
    nomor: 'KTR-2026-0004',
    unit_id: 'unit-a104',
    penyewa_id: 'user-penyewa-dimas',
    tanggal_mulai: '2026-02-01',
    durasi_bulan: 12,
    tanggal_selesai: '2027-01-31',
    harga_sewa_bulanan: 1350000,
    status: 'aktif',
    dibuat_oleh: 'user-pengelola-01',
    diaktifkan_pada: '2026-02-01T08:00:00Z',
    dibuat_pada: '2026-02-01T08:00:00Z'
  },
  {
    id: 'ktr-0005',
    nomor: 'KTR-2026-0005',
    unit_id: 'unit-a105',
    penyewa_id: 'user-penyewa-eka',
    tanggal_mulai: '2026-01-01',
    durasi_bulan: 12,
    tanggal_selesai: '2026-12-31',
    harga_sewa_bulanan: 1450000,
    status: 'aktif',
    dibuat_oleh: 'user-pengelola-01',
    diaktifkan_pada: '2026-01-01T08:00:00Z',
    dibuat_pada: '2026-01-01T08:00:00Z'
  },
  {
    id: 'ktr-0006',
    nomor: 'KTR-2026-0006',
    unit_id: 'unit-a106',
    penyewa_id: 'user-penyewa-gilang',
    tanggal_mulai: '2026-01-01',
    durasi_bulan: 12,
    tanggal_selesai: '2026-12-31',
    harga_sewa_bulanan: 1350000,
    status: 'diakhiri', // Diakhiri dini oleh Pemilik 30 Sep
    tanggal_berakhir_aktual: '2026-09-30',
    alasan_berakhir: 'Penyewa pindah tugas luar kota',
    dibuat_oleh: 'user-pengelola-01',
    diaktifkan_pada: '2026-01-01T08:00:00Z',
    dibuat_pada: '2026-01-01T08:00:00Z'
  },
  {
    id: 'ktr-0007',
    nomor: 'KTR-2026-0007',
    unit_id: 'unit-a107',
    penyewa_id: 'user-penyewa-hana',
    tanggal_mulai: '2026-02-01',
    durasi_bulan: 12,
    tanggal_selesai: '2027-01-31',
    harga_sewa_bulanan: 1350000,
    status: 'aktif',
    dibuat_oleh: 'user-pengelola-01',
    diaktifkan_pada: '2026-02-01T08:00:00Z',
    dibuat_pada: '2026-02-01T08:00:00Z'
  },
  {
    id: 'ktr-0008',
    nomor: 'KTR-2026-0008',
    unit_id: 'unit-b201',
    penyewa_id: 'user-penyewa-indra',
    tanggal_mulai: '2026-01-01',
    durasi_bulan: 12,
    tanggal_selesai: '2026-12-31',
    harga_sewa_bulanan: 1900000,
    status: 'aktif',
    dibuat_oleh: 'user-pengelola-01',
    dibuat_pada: '2026-01-01T08:00:00Z'
  },
  {
    id: 'ktr-0009',
    nomor: 'KTR-2026-0009',
    unit_id: 'unit-b202',
    penyewa_id: 'user-penyewa-jihan',
    tanggal_mulai: '2026-01-01',
    durasi_bulan: 12,
    tanggal_selesai: '2026-12-31',
    harga_sewa_bulanan: 1850000,
    status: 'aktif',
    dibuat_oleh: 'user-pengelola-01',
    dibuat_pada: '2026-01-01T08:00:00Z'
  },
  {
    id: 'ktr-0010',
    nomor: 'KTR-2026-0010',
    unit_id: 'unit-b203',
    penyewa_id: 'user-penyewa-kevin',
    tanggal_mulai: '2026-01-01',
    durasi_bulan: 12,
    tanggal_selesai: '2026-12-31',
    harga_sewa_bulanan: 1850000,
    status: 'aktif',
    dibuat_oleh: 'user-pengelola-01',
    dibuat_pada: '2026-01-01T08:00:00Z'
  },
  {
    id: 'ktr-0011',
    nomor: 'KTR-2026-0011',
    unit_id: 'unit-b204',
    penyewa_id: 'user-penyewa-laras',
    tanggal_mulai: '2026-01-01',
    durasi_bulan: 12,
    tanggal_selesai: '2026-12-31',
    harga_sewa_bulanan: 1850000,
    status: 'aktif',
    dibuat_oleh: 'user-pengelola-01',
    dibuat_pada: '2026-01-01T08:00:00Z'
  },
  {
    id: 'ktr-0012',
    nomor: 'KTR-2026-0012',
    unit_id: 'unit-b207',
    penyewa_id: 'user-penyewa-nadia',
    tanggal_mulai: '2026-05-01',
    durasi_bulan: 6,
    tanggal_selesai: '2026-10-31', // Berakhir 31 Okt
    harga_sewa_bulanan: 1850000,
    status: 'aktif',
    dibuat_oleh: 'user-pengelola-01',
    dibuat_pada: '2026-05-01T08:00:00Z'
  },
  {
    id: 'ktr-0013',
    nomor: 'KTR-2026-0013',
    unit_id: 'unit-b208',
    penyewa_id: 'user-penyewa-oki',
    tanggal_mulai: '2026-01-01',
    durasi_bulan: 12,
    tanggal_selesai: '2026-12-31',
    harga_sewa_bulanan: 2000000,
    status: 'aktif',
    dibuat_oleh: 'user-pengelola-01',
    dibuat_pada: '2026-01-01T08:00:00Z'
  },
  {
    id: 'ktr-0014',
    nomor: 'KTR-2026-0014',
    unit_id: 'unit-c301',
    penyewa_id: 'user-penyewa-putri',
    tanggal_mulai: '2026-01-01',
    durasi_bulan: 12,
    tanggal_selesai: '2026-12-31',
    harga_sewa_bulanan: 2800000,
    status: 'aktif',
    dibuat_oleh: 'user-pengelola-01',
    dibuat_pada: '2026-01-01T08:00:00Z'
  },
  {
    id: 'ktr-0015',
    nomor: 'KTR-2026-0015',
    unit_id: 'unit-c302',
    penyewa_id: 'user-penyewa-raka',
    tanggal_mulai: '2026-01-01',
    durasi_bulan: 12,
    tanggal_selesai: '2026-12-31',
    harga_sewa_bulanan: 2750000,
    status: 'aktif',
    dibuat_oleh: 'user-pengelola-01',
    dibuat_pada: '2026-01-01T08:00:00Z'
  },
  {
    id: 'ktr-0016',
    nomor: 'KTR-2026-0016',
    unit_id: 'unit-c303',
    penyewa_id: 'user-penyewa-salma',
    tanggal_mulai: '2026-01-01',
    durasi_bulan: 12,
    tanggal_selesai: '2026-12-31',
    harga_sewa_bulanan: 2750000,
    status: 'aktif',
    dibuat_oleh: 'user-pengelola-01',
    dibuat_pada: '2026-01-01T08:00:00Z'
  },
  {
    id: 'ktr-0017',
    nomor: 'KTR-2026-0017',
    unit_id: 'unit-c304',
    penyewa_id: 'user-penyewa-teguh',
    tanggal_mulai: '2026-01-01',
    durasi_bulan: 12,
    tanggal_selesai: '2026-12-31',
    harga_sewa_bulanan: 2750000,
    status: 'aktif',
    dibuat_oleh: 'user-pengelola-01',
    dibuat_pada: '2026-01-01T08:00:00Z'
  },
  {
    id: 'ktr-0018',
    nomor: 'KTR-2026-0018',
    unit_id: 'unit-c305',
    penyewa_id: 'user-penyewa-vina',
    tanggal_mulai: '2026-01-01',
    durasi_bulan: 12,
    tanggal_selesai: '2026-12-31',
    harga_sewa_bulanan: 2650000,
    status: 'aktif',
    dibuat_oleh: 'user-pengelola-01',
    dibuat_pada: '2026-01-01T08:00:00Z'
  },
  {
    id: 'ktr-0019',
    nomor: 'KTR-2026-0019',
    unit_id: 'unit-c306',
    penyewa_id: 'user-penyewa-wahyu',
    tanggal_mulai: '2026-05-01',
    durasi_bulan: 6,
    tanggal_selesai: '2026-10-31', // Berakhir 31 Okt
    harga_sewa_bulanan: 2750000,
    status: 'aktif',
    dibuat_oleh: 'user-pengelola-01',
    dibuat_pada: '2026-05-01T08:00:00Z'
  },
  {
    id: 'ktr-0020',
    nomor: 'KTR-2026-0020',
    unit_id: 'unit-b206',
    penyewa_id: 'user-penyewa-rizki',
    tanggal_mulai: '2026-01-01',
    durasi_bulan: 12,
    tanggal_selesai: '2026-12-31',
    harga_sewa_bulanan: 1750000,
    status: 'aktif',
    dibuat_oleh: 'user-pengelola-01',
    dibuat_pada: '2026-01-01T08:00:00Z'
  },
  {
    id: 'ktr-0021',
    nomor: 'KTR-2026-0021',
    unit_id: 'unit-c308',
    penyewa_id: 'user-penyewa-zaki',
    tanggal_mulai: '2025-07-01',
    durasi_bulan: 12,
    tanggal_selesai: '2026-06-30',
    harga_sewa_bulanan: 2700000,
    status: 'selesai',
    tanggal_berakhir_aktual: '2026-06-30',
    dibuat_oleh: 'user-pengelola-01',
    dibuat_pada: '2025-07-01T08:00:00Z'
  },
  {
    id: 'ktr-0022',
    nomor: 'KTR-2026-0022',
    unit_id: 'unit-c307',
    penyewa_id: 'user-penyewa-fajar',
    tanggal_mulai: '2026-11-01',
    durasi_bulan: 6,
    tanggal_selesai: '2027-04-30',
    harga_sewa_bulanan: 2750000,
    status: 'draf', // Menunggu verifikasi identitas (BR-03)
    dibuat_oleh: 'user-pengelola-01',
    dibuat_pada: '2026-09-26T08:00:00Z'
  },
  {
    id: 'ktr-0023',
    nomor: 'KTR-2026-0023',
    unit_id: 'unit-a103',
    penyewa_id: 'user-penyewa-cahya',
    tanggal_mulai: '2026-11-01',
    durasi_bulan: 6,
    tanggal_selesai: '2027-04-30',
    harga_sewa_bulanan: 1450000,
    status: 'draf', // Menunggu kontrak aktif KTR-2026-0003 selesai 31 Okt (BR-01, BR-03)
    dibuat_oleh: 'user-pengelola-01',
    dibuat_pada: '2026-10-01T08:00:00Z'
  }
];

export const INITIAL_INVOICES: Invoice[] = [
  // Periode Oktober 2026 (Jatuh Tempo: 10 Okt 2026)
  {
    id: 'inv-202610-0001',
    nomor: 'INV-202610-0001',
    kontrak_id: 'ktr-0001',
    periode: '2026-10-01',
    jatuh_tempo: '2026-10-10',
    nominal_sewa: 1350000,
    denda: 0,
    terbayar: 1350000,
    status: 'lunas',
    dibuat_oleh: 'user-pengelola-01',
    dibuat_pada: '2026-10-01T08:00:00Z'
  },
  {
    id: 'inv-202610-0002',
    nomor: 'INV-202610-0002',
    kontrak_id: 'ktr-0002',
    periode: '2026-10-01',
    jatuh_tempo: '2026-10-10',
    nominal_sewa: 1450000,
    denda: 20000, // Bayar 11 Okt telat 1 hari
    terbayar: 1470000,
    status: 'lunas',
    dibuat_oleh: 'user-pengelola-01',
    dibuat_pada: '2026-10-01T08:00:00Z'
  },
  {
    id: 'inv-202610-0003',
    nomor: 'INV-202610-0003',
    kontrak_id: 'ktr-0003',
    periode: '2026-10-01',
    jatuh_tempo: '2026-10-10',
    nominal_sewa: 1450000,
    denda: 0,
    terbayar: 1450000,
    status: 'lunas',
    dibuat_oleh: 'user-pengelola-01',
    dibuat_pada: '2026-10-01T08:00:00Z'
  },
  {
    id: 'inv-202610-0004',
    nomor: 'INV-202610-0004',
    kontrak_id: 'ktr-0004',
    periode: '2026-10-01',
    jatuh_tempo: '2026-10-10',
    nominal_sewa: 1350000,
    denda: 100000, // Telat 5 hari per 15 Okt (5 x 20.000)
    terbayar: 0,
    status: 'belum_bayar',
    dibuat_oleh: 'user-pengelola-01',
    dibuat_pada: '2026-10-01T08:00:00Z'
  },
  {
    id: 'inv-202610-0005',
    nomor: 'INV-202610-0005',
    kontrak_id: 'ktr-0005',
    periode: '2026-10-01',
    jatuh_tempo: '2026-10-10',
    nominal_sewa: 1450000,
    denda: 0,
    terbayar: 1450000,
    status: 'lunas',
    dibuat_oleh: 'user-pengelola-01',
    dibuat_pada: '2026-10-01T08:00:00Z'
  },
  {
    id: 'inv-202610-0006',
    nomor: 'INV-202610-0006',
    kontrak_id: 'ktr-0007', // Hana
    periode: '2026-10-01',
    jatuh_tempo: '2026-10-10',
    nominal_sewa: 1350000,
    denda: 100000, // Telat 5 hari
    terbayar: 0,
    status: 'belum_bayar',
    dibuat_oleh: 'user-pengelola-01',
    dibuat_pada: '2026-10-01T08:00:00Z'
  },
  {
    id: 'inv-202610-0007',
    nomor: 'INV-202610-0007',
    kontrak_id: 'ktr-0008',
    periode: '2026-10-01',
    jatuh_tempo: '2026-10-10',
    nominal_sewa: 1900000,
    denda: 0,
    terbayar: 1900000,
    status: 'lunas',
    dibuat_oleh: 'user-pengelola-01',
    dibuat_pada: '2026-10-01T08:00:00Z'
  },
  {
    id: 'inv-202610-0008',
    nomor: 'INV-202610-0008',
    kontrak_id: 'ktr-0009',
    periode: '2026-10-01',
    jatuh_tempo: '2026-10-10',
    nominal_sewa: 1850000,
    denda: 0,
    terbayar: 1850000,
    status: 'lunas',
    dibuat_oleh: 'user-pengelola-01',
    dibuat_pada: '2026-10-01T08:00:00Z'
  },
  {
    id: 'inv-202610-0009',
    nomor: 'INV-202610-0009',
    kontrak_id: 'ktr-0010', // Kevin
    periode: '2026-10-01',
    jatuh_tempo: '2026-10-10',
    nominal_sewa: 1850000,
    denda: 100000,
    terbayar: 0,
    status: 'belum_bayar',
    dibuat_oleh: 'user-pengelola-01',
    dibuat_pada: '2026-10-01T08:00:00Z'
  },
  {
    id: 'inv-202610-0010',
    nomor: 'INV-202610-0010',
    kontrak_id: 'ktr-0011', // Laras
    periode: '2026-10-01',
    jatuh_tempo: '2026-10-10',
    nominal_sewa: 1850000,
    denda: 100000,
    terbayar: 1000000,
    status: 'sebagian',
    dibuat_oleh: 'user-pengelola-01',
    dibuat_pada: '2026-10-01T08:00:00Z'
  },
  {
    id: 'inv-202610-0011',
    nomor: 'INV-202610-0011',
    kontrak_id: 'ktr-0020',
    periode: '2026-10-01',
    jatuh_tempo: '2026-10-10',
    nominal_sewa: 1750000,
    denda: 0,
    terbayar: 1750000,
    status: 'lunas',
    dibuat_oleh: 'user-pengelola-01',
    dibuat_pada: '2026-10-01T08:00:00Z'
  },
  {
    id: 'inv-202610-0012',
    nomor: 'INV-202610-0012',
    kontrak_id: 'ktr-0012',
    periode: '2026-10-01',
    jatuh_tempo: '2026-10-10',
    nominal_sewa: 1850000,
    denda: 0,
    terbayar: 1850000,
    status: 'lunas',
    dibuat_oleh: 'user-pengelola-01',
    dibuat_pada: '2026-10-01T08:00:00Z'
  },
  {
    id: 'inv-202610-0013',
    nomor: 'INV-202610-0013',
    kontrak_id: 'ktr-0013', // Oki
    periode: '2026-10-01',
    jatuh_tempo: '2026-10-10',
    nominal_sewa: 2000000,
    denda: 100000,
    terbayar: 0,
    status: 'belum_bayar',
    dibuat_oleh: 'user-pengelola-01',
    dibuat_pada: '2026-10-01T08:00:00Z'
  },
  {
    id: 'inv-202610-0014',
    nomor: 'INV-202610-0014',
    kontrak_id: 'ktr-0014',
    periode: '2026-10-01',
    jatuh_tempo: '2026-10-10',
    nominal_sewa: 2800000,
    denda: 0,
    terbayar: 2800000,
    status: 'lunas',
    dibuat_oleh: 'user-pengelola-01',
    dibuat_pada: '2026-10-01T08:00:00Z'
  },
  {
    id: 'inv-202610-0015',
    nomor: 'INV-202610-0015',
    kontrak_id: 'ktr-0015',
    periode: '2026-10-01',
    jatuh_tempo: '2026-10-10',
    nominal_sewa: 2750000,
    denda: 0,
    terbayar: 2750000,
    status: 'lunas',
    dibuat_oleh: 'user-pengelola-01',
    dibuat_pada: '2026-10-01T08:00:00Z'
  },
  {
    id: 'inv-202610-0016',
    nomor: 'INV-202610-0016',
    kontrak_id: 'ktr-0016',
    periode: '2026-10-01',
    jatuh_tempo: '2026-10-10',
    nominal_sewa: 2750000,
    denda: 0,
    terbayar: 2750000,
    status: 'lunas',
    dibuat_oleh: 'user-pengelola-01',
    dibuat_pada: '2026-10-01T08:00:00Z'
  },
  {
    id: 'inv-202610-0017',
    nomor: 'INV-202610-0017',
    kontrak_id: 'ktr-0017', // Teguh
    periode: '2026-10-01',
    jatuh_tempo: '2026-10-10',
    nominal_sewa: 2750000,
    denda: 100000,
    terbayar: 2000000,
    status: 'sebagian',
    dibuat_oleh: 'user-pengelola-01',
    dibuat_pada: '2026-10-01T08:00:00Z'
  },
  {
    id: 'inv-202610-0018',
    nomor: 'INV-202610-0018',
    kontrak_id: 'ktr-0018',
    periode: '2026-10-01',
    jatuh_tempo: '2026-10-10',
    nominal_sewa: 2650000,
    denda: 0,
    terbayar: 2650000,
    status: 'lunas',
    dibuat_oleh: 'user-pengelola-01',
    dibuat_pada: '2026-10-01T08:00:00Z'
  },
  {
    id: 'inv-202610-0019',
    nomor: 'INV-202610-0019',
    kontrak_id: 'ktr-0019',
    periode: '2026-10-01',
    jatuh_tempo: '2026-10-10',
    nominal_sewa: 2750000,
    denda: 0,
    terbayar: 2750000,
    status: 'lunas',
    dibuat_oleh: 'user-pengelola-01',
    dibuat_pada: '2026-10-01T08:00:00Z'
  },

  // Tagihan September Kasus Batas: Hana Puspita (Sebagian dengan Denda Maksimal Rp200.000)
  {
    id: 'inv-202609-0006',
    nomor: 'INV-202609-0006',
    kontrak_id: 'ktr-0007',
    periode: '2026-09-01',
    jatuh_tempo: '2026-09-10',
    nominal_sewa: 1350000,
    denda: 200000, // Mencapai batas Rp200.000 (BR-07)
    terbayar: 1000000,
    status: 'sebagian',
    dibuat_oleh: 'user-pengelola-01',
    dibuat_pada: '2026-09-01T08:00:00Z'
  }
];

export const INITIAL_PAYMENTS: Payment[] = [
  {
    id: 'pay-0001',
    tagihan_id: 'inv-202610-0001',
    jumlah: 1350000,
    metode: 'transfer',
    tanggal_bayar: '2026-10-05',
    bukti_path: '/uploads/bukti/tf_0001.jpg',
    status: 'sah',
    dicatat_oleh: 'user-pengelola-01',
    dibuat_pada: '2026-10-05T09:00:00Z'
  },
  {
    id: 'pay-0002',
    tagihan_id: 'inv-202610-0002',
    jumlah: 1470000,
    metode: 'tunai',
    tanggal_bayar: '2026-10-11', // Denda 20rb
    status: 'sah',
    dicatat_oleh: 'user-pengelola-01',
    dibuat_pada: '2026-10-11T14:00:00Z'
  },
  {
    id: 'pay-0003',
    tagihan_id: 'inv-202610-0010',
    jumlah: 1000000,
    metode: 'transfer',
    tanggal_bayar: '2026-10-08',
    bukti_path: '/uploads/bukti/tf_laras_1.jpg',
    status: 'sah',
    dicatat_oleh: 'user-pengelola-02',
    dibuat_pada: '2026-10-08T11:00:00Z'
  },
  {
    id: 'pay-0004',
    tagihan_id: 'inv-202610-0017',
    jumlah: 2000000,
    metode: 'transfer',
    tanggal_bayar: '2026-10-09',
    bukti_path: '/uploads/bukti/tf_teguh_1.jpg',
    status: 'sah',
    dicatat_oleh: 'user-pengelola-01',
    dibuat_pada: '2026-10-09T16:00:00Z'
  },
  {
    id: 'pay-0005',
    tagihan_id: 'inv-202610-0018',
    jumlah: 2650000,
    metode: 'mayar',
    tanggal_bayar: '2026-10-10',
    referensi_mayar: 'MYR-INV-99882211',
    status: 'sah',
    dibuat_pada: '2026-10-10T12:00:00Z'
  },
  {
    id: 'pay-0006',
    tagihan_id: 'inv-202610-0010',
    jumlah: 500000,
    metode: 'tunai',
    tanggal_bayar: '2026-10-12',
    status: 'dibatalkan', // Dibatalkan oleh Pemilik karena salah ketik jumlah
    alasan_batal: 'Salah input nominal oleh staf pengelola',
    dicatat_oleh: 'user-pengelola-01',
    dibatalkan_oleh: 'user-pemilik-01',
    dibatalkan_pada: '2026-10-12T15:00:00Z',
    dibuat_pada: '2026-10-12T13:00:00Z'
  }
];

export const INITIAL_DAMAGE_REPORTS: DamageReport[] = [
  {
    id: 'lk-0010',
    nomor: 'LK-2026-0010',
    kontrak_id: 'ktr-0004', // Dimas (A-104)
    unit_id: 'unit-a104',
    pelapor_id: 'user-penyewa-dimas',
    kategori: 'bangunan',
    judul: 'Pintu kamar sulit dikunci',
    deskripsi: 'Kunci pintu harus didorong keras agar bisa terkunci.',
    foto_paths: ['/uploads/damage/pintu1.jpg'],
    status: 'menunggu_persetujuan', // Di atas Rp1.000.000 (BR-12)
    estimasi_biaya: 1250000,
    biaya_aktual: 0,
    catatan: 'Kusen memuai, perlu ganti kusen dan kunci',
    dibuat_pada: '2026-10-13T09:00:00Z',
    diperbarui_pada: '2026-10-13T15:00:00Z'
  },
  {
    id: 'lk-0008',
    nomor: 'LK-2026-0008',
    kontrak_id: 'ktr-0004', // Dimas
    unit_id: 'unit-a104',
    pelapor_id: 'user-penyewa-dimas',
    kategori: 'listrik',
    judul: 'Lampu kamar berkedip',
    deskripsi: 'Fitting lampu utama kendor dan berkedip saat saklar dinyalakan.',
    foto_paths: ['/uploads/damage/lampu.jpg'],
    status: 'diproses',
    estimasi_biaya: 150000,
    biaya_aktual: 0,
    catatan: 'Akan diganti lampu LED baru',
    dibuat_pada: '2026-10-11T10:00:00Z',
    diperbarui_pada: '2026-10-11T11:00:00Z'
  },
  {
    id: 'lk-0009',
    nomor: 'LK-2026-0009',
    kontrak_id: 'ktr-0004', // Dimas (Laporan ke-3 terbuka milik Dimas)
    unit_id: 'unit-a104',
    pelapor_id: 'user-penyewa-dimas',
    kategori: 'air',
    judul: 'Saluran wastafel mampet',
    deskripsi: 'Air wastafel mengalir sangat lambat sejak kemarin.',
    foto_paths: ['/uploads/damage/wastafel.jpg'],
    status: 'dilaporkan',
    estimasi_biaya: 0,
    biaya_aktual: 0,
    dibuat_pada: '2026-10-14T08:00:00Z',
    diperbarui_pada: '2026-10-14T08:00:00Z'
  },
  {
    id: 'lk-0011',
    nomor: 'LK-2026-0011',
    kontrak_id: 'ktr-0010', // Kevin
    unit_id: 'unit-b203',
    pelapor_id: 'user-penyewa-kevin',
    kategori: 'ac',
    judul: 'Remote AC hilang fungsi',
    deskripsi: 'Layar remote AC mati meskipun baterai sudah diganti baru.',
    foto_paths: ['/uploads/damage/remote.jpg'],
    status: 'dilaporkan',
    estimasi_biaya: 0,
    biaya_aktual: 0,
    dibuat_pada: '2026-10-14T11:00:00Z',
    diperbarui_pada: '2026-10-14T11:00:00Z'
  },
  {
    id: 'lk-0012',
    nomor: 'LK-2026-0012',
    kontrak_id: 'ktr-0013', // Oki
    unit_id: 'unit-b208',
    pelapor_id: 'user-penyewa-oki',
    kategori: 'perabot',
    judul: 'Kasur ambles',
    deskripsi: 'Springbed bagian tengah patah pegasnya.',
    foto_paths: ['/uploads/damage/kasur.jpg'],
    status: 'diproses',
    estimasi_biaya: 1000000, // Tepat Rp1.000.000 -> Boleh diproses tanpa persetujuan (BR-12)
    biaya_aktual: 0,
    catatan: 'Penggantian kasur standar perabot kos',
    dibuat_pada: '2026-10-12T14:00:00Z',
    diperbarui_pada: '2026-10-12T16:00:00Z'
  },
  {
    id: 'lk-0005',
    nomor: 'LK-2026-0005',
    kontrak_id: 'ktr-0001',
    unit_id: 'unit-a101',
    pelapor_id: 'user-penyewa-aditya',
    kategori: 'air',
    judul: 'Kran shower bocor',
    deskripsi: 'Kran menetes terus menerus.',
    foto_paths: ['/uploads/damage/shower.jpg'],
    status: 'selesai',
    estimasi_biaya: 200000,
    biaya_aktual: 180000,
    selesai_pada: '2026-10-10T10:00:00Z', // Selesai 10 Okt (>3 hari per 15 Okt -> Pengelola boleh menutup) (BR-12)
    dibuat_pada: '2026-10-08T09:00:00Z',
    diperbarui_pada: '2026-10-10T10:00:00Z'
  },
  {
    id: 'lk-0006',
    nomor: 'LK-2026-0006',
    kontrak_id: 'ktr-0002',
    unit_id: 'unit-a102',
    pelapor_id: 'user-penyewa-bella',
    kategori: 'listrik',
    judul: 'Stopkontak meja longgar',
    deskripsi: 'Colokan charger sering copot sendiri.',
    foto_paths: ['/uploads/damage/colokan.jpg'],
    status: 'selesai',
    estimasi_biaya: 100000,
    biaya_aktual: 85000,
    selesai_pada: '2026-10-14T16:00:00Z', // Selesai 14 Okt (<3 hari -> Hanya pelapor yang boleh menutup) (BR-12)
    dibuat_pada: '2026-10-12T09:00:00Z',
    diperbarui_pada: '2026-10-14T16:00:00Z'
  }
];

export const INITIAL_AUDIT_LOGS: AuditLogItem[] = [
  {
    id: 1,
    pelaku_id: 'user-pengelola-01',
    pelaku_nama: 'Bayu Prasetyo',
    peran: 'pengelola',
    aksi: 'identitas:verifikasi:terverifikasi',
    tabel: 'identitas_penyewa',
    data_id: 'user-penyewa-dimas',
    sesudah: { status_verifikasi: 'terverifikasi', catatan: 'Dokumen KTP asli valid' },
    dibuat_pada: '2026-02-02T10:00:00Z'
  },
  {
    id: 2,
    pelaku_id: 'user-pemilik-01',
    pelaku_nama: 'Ratna Kusumawardani',
    peran: 'pemilik',
    aksi: 'kontrak:diakhiri',
    tabel: 'kontrak',
    data_id: 'ktr-0006',
    sebelum: { status: 'aktif' },
    sesudah: { status: 'diakhiri', alasan: 'Penyewa pindah tugas luar kota' },
    dibuat_pada: '2026-09-30T16:00:00Z'
  },
  {
    id: 3,
    pelaku_id: 'user-pengelola-01',
    pelaku_nama: 'Bayu Prasetyo',
    peran: 'pengelola',
    aksi: 'tagihan:buat_bulanan',
    tabel: 'tagihan',
    data_id: 'periode:2026-10-01',
    sesudah: { total_dibuat: 19, periode: '2026-10' },
    dibuat_pada: '2026-10-01T08:00:00Z'
  },
  {
    id: 4,
    pelaku_id: 'user-pengelola-01',
    pelaku_nama: 'Bayu Prasetyo',
    peran: 'pengelola',
    aksi: 'status:kerusakan:dilaporkan->menunggu_persetujuan',
    tabel: 'laporan_kerusakan',
    data_id: 'lk-0010',
    sebelum: { status: 'dilaporkan' },
    sesudah: { status: 'menunggu_persetujuan', estimasi: 1250000 },
    dibuat_pada: '2026-10-13T15:00:00Z'
  },
  {
    id: 5,
    pelaku_id: 'user-pemilik-01',
    pelaku_nama: 'Ratna Kusumawardani',
    peran: 'pemilik',
    aksi: 'pembayaran:dibatalkan',
    tabel: 'pembayaran',
    data_id: 'pay-0006',
    sebelum: { status: 'sah', jumlah: 500000 },
    sesudah: { status: 'dibatalkan', alasan: 'Salah input nominal oleh staf pengelola' },
    dibuat_pada: '2026-10-12T15:00:00Z'
  }
];
