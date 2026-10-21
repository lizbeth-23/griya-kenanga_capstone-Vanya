# Griya Kenanga Residence
**Aplikasi Manajemen Properti Kos & Studio Sewa 24 Unit**  
*Capstone Project 05 · Bootcamp AI Web Programming*

---

## 🏢 Tentang Proyek
Griya Kenanga Residence adalah aplikasi web manajemen properti internal modern yang dirancang untuk mengelola 24 unit hunian kos dan studio di Sleman, Yogyakarta:
- **Blok A Lantai 1**: 8 Kamar Standar (A-101 s.d A-108)
- **Blok B Lantai 2**: 8 Kamar Ber-AC (B-201 s.d B-208)
- **Blok C Lantai 3**: 8 Studio Luas (C-301 s.d C-308)

Aplikasi ini menggantikan proses manual pencatatan Excel, WhatsApp chat, dan buku kas fisik dengan sistem berbasis aturan bisnis ketat (**BR-01** s/d **BR-12**) yang dijaga hingga ke level database dengan Supabase PostgreSQL, RLS, row-level locking `FOR UPDATE`, serta audit trail menyeluruh.

---

## 👥 Akun Uji & Tiga Peran Pengguna
Seluruh akun uji menggunakan kata sandi latihan yang sama: `Latihan#2026`.

| Peran | Akun Email | Nama Pengguna | Hak Akses Utama |
| :--- | :--- | :--- | :--- |
| **Pemilik (Owner)** | `ratna@griyakenanga.test` | Ratna Kusumawardani | Akses laporan pendapatan, tunggakan, okupansi, audit log, ubah harga unit, akhiri kontrak dini, pembatalan pembayaran/tagihan, setujui biaya kerusakan > Rp1.000.000, kelola peran akun. |
| **Pengelola 1** | `bayu@griyakenanga.test` | Bayu Prasetyo | Operasional harian: ubah status unit, verifikasi KTP penyewa, buat draf & aktivasi kontrak, buat tagihan bulanan serentak, catat bayar tunai/transfer (+bukti), proses perbaikan kerusakan. |
| **Pengelola 2** | `sinta@griyakenanga.test` | Sinta Dewi | Pengelola kedua untuk menguji operasi bersamaan (*concurrency / race condition test*). |
| **Penyewa (Contoh 1)** | `dimas@griyakenanga.test` | Dimas Saputra (Unit A-104) | Lihat kontrak & tagihan miliknya, bayar online (Mayar), lapor kerusakan (maks 3 terbuka). |
| **Penyewa (Contoh 2)** | `hana@griyakenanga.test` | Hana Puspita (Unit A-107) | Kasus batas denda keterlambatan mencapai batas maksimal Rp200.000. |
| **Penyewa (Contoh 3)** | `fajar@griyakenanga.test` | Fajar Nugroho (Unit C-307) | Kasus uji aktivasi kontrak draf ditolak sebelum verifikasi identitas KTP. |
| **Penyewa (Contoh 4)** | `cahya@griyakenanga.test` | Cahya Ramadhan (Unit A-103) | Kasus uji perpanjangan kontrak draf menunggu kontrak lama selesai (BR-01, BR-03). |

*Catatan: Tersedia **Quick Account Switcher** di sudut kanan atas Navbar untuk berpindah antar 25 akun uji secara instan tanpa perlu repot login ulang.*

---

## ⚡ Teknologi yang Digunakan
- **Frontend**: Next.js (App Router), TypeScript, Tailwind CSS, Lucide Icons, Canvas Confetti
- **Backend & Database**: Supabase (PostgreSQL 15, Supabase Auth, Row Level Security / RLS, PL/pgSQL Stored Procedures dengan `FOR UPDATE`, Supabase Storage)
- **Deployment**: Netlify (Internal app dengan meta tag `<meta name="robots" content="noindex, nofollow" />`)

---

## 🛠️ Cara Menjalankan Proyek di Lokal

### 1. Prasyarat
- Node.js versi 18 ke atas
- npm atau pnpm

### 2. Instalasi Dependensi
```bash
npm install
```

### 3. Konfigurasi Lingkungan (.env.local)
Salin contoh file `.env.example` menjadi `.env.local`:
```bash
cp .env.example .env.local
```
Isi variabel dengan kredensial proyek Supabase Anda:
```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here
```
*(Catatan: Aplikasi dilengkapi dengan hybrid fallback engine, sehingga bila API key belum diisi, demo interaktif langsung siap dicoba dengan data acuan 15 Oktober 2026).*

### 4. Eksekusi Skema Database di Supabase
Buka **SQL Editor** pada Supabase Dashboard Anda, lalu jalankan secara berurutan:
1. `supabase/migrations/20261021_init_schema.sql` (Tabel, Constraint, Database Functions dengan FOR UPDATE, dan RLS Policies).
2. `supabase/seed.sql` (Data awal 24 unit dan penghitung nomor urut dokumen).

### 5. Menjalankan Server Pengembangan
```bash
npm run dev
```
Buka browser di `http://localhost:3000`.

---

## 🧪 Dokumentasi Test Plan & Verifikasi
Dokumentasi pengujian komprehensif 20 test case yang merujuk pada aturan bisnis (**BR-01** s/d **BR-12**) dan kriteria selesai tersedia di:
- [`docs/test-plan.md`](file:///docs/test-plan.md)

---

## 🌟 Fitur Nilai Tambah (Bobot 25%)
1. **Ekspor Laporan Pendapatan ke CSV**: Pemilik dapat mengunduh rekapan laporan pendapatan, penerimaan, dan tunggakan per unit dalam satu klik.
2. **Pencarian & Filter Multi-Kriteria**: Pencarian instan dan tab status (Semua, Belum Bayar, Sebagian, Lunas) di modul Unit, Penyewa, Kontrak, Tagihan, dan Kerusakan.
3. **Simulasi Bayar Online & Quick Role Switcher**: Kemudahan bagi mentor dan penilai untuk menguji alur 3 peran secara berdampingan tanpa kendala session.
