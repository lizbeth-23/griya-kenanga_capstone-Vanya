# Test Plan - Griya Kenanga Residence
**Aplikasi Manajemen Properti (Capstone 05)**
Tanggal Acuan Data: 15 Oktober 2026

Dokumen ini berisi draf dan hasil pengujian aturan bisnis (Business Rules / BR) dan User Stories (US) pada aplikasi Griya Kenanga Residence, mencakup uji fungsionalitas, uji hak akses 3 peran (*Penyewa*, *Pengelola*, *Pemilik*), kasus batas (*boundary cases*), serta uji integritas konkuren (*concurrency/race conditions*).

---

## 1. Matriks Hak Akses Peran

| Modul / Data | Penyewa | Pengelola (Staf) | Pemilik (Owner) | Aturan Terkait |
| :--- | :---: | :---: | :---: | :--- |
| **Identitas & KTP** | Akses penuh milik sendiri | Akses penuh semua penyewa (verifikasi/tolak) | NIK tersamar (hanya 4 digit terakhir), tanpa foto KTP | BR-10 |
| **Unit** | Hanya unit kontrak miliknya | Lihat 24 unit, ubah status operasional | Lihat 24 unit, ubah harga sewa bulanan | BR-04, BR-10 |
| **Kontrak** | Hanya kontrak miliknya | Buat draf, aktifkan, selesaikan kontrak | Lihat semua, akhiri kontrak lebih awal (wajib alasan) | BR-01 – BR-05 |
| **Tagihan & Denda** | Hanya tagihan miliknya | Buat tagihan bulanan serentak, lihat semua | Lihat semua, batalkan tagihan kosong | BR-06, BR-07, BR-09 |
| **Pembayaran** | Bayar tagihan miliknya (online/simulasi) | Catat pembayaran tunai & transfer (+bukti) | Lihat semua, batalkan pembayaran salah input (alasan) | BR-08, BR-09 |
| **Laporan Kerusakan** | Buat laporan (maks 3 terbuka), tutup milik sendiri | Input estimasi, proses (≤ Rp1 jt), tandai selesai, tutup jika >3 hari | Lihat semua, setujui/tolak estimasi biaya > Rp1 jt | BR-11, BR-12 |
| **Laporan Finansial** | Ditolak | Ditolak | Akses penuh (pendapatan, hunian, tunggakan) | BR-10 |
| **Audit Log** | Ditolak | Ditolak | Akses penuh (baca saja) | BR-09, BR-10 |
| **Kelola Akun** | Profil sendiri | Profil sendiri | Ubah peran akun lain (tidak bisa ubah akun sendiri) | BR-10 |

---

## 2. Tabel Test Cases (Minimal 15 Test Cases Sesuai PRD & BR)

| Kode | Rujukan BR / US | Akun Penguji | Langkah Pengujian | Hasil yang Diharapkan | Hasil Sebenarnya | Status |
| :--- | :--- | :--- | :--- | :--- | :--- | :---: |
| **TC-01** | BR-01 / US-03 | Pengelola (`bayu@`) | Mencoba membuat kontrak baru di Unit A-103 yang beririsan periode dengan kontrak aktif Cahya Ramadhan | Ditolak oleh sistem/database dengan pesan "Unit sudah memiliki kontrak pada periode tersebut" | Ditolak dengan pesan validasi yang jelas | **Lulus** |
| **TC-02** | BR-02 / US-03 | Pengelola (`sinta@`) | Membuat kontrak dengan tanggal mulai bukan tanggal 1 atau durasi selain 1, 3, 6, 12 bulan | Ditolak dengan validasi tanggal mulai harus tanggal 1 dan durasi valid | Ditolak, form mewajibkan tanggal 1 dan pilihan durasi baku | **Lulus** |
| **TC-03** | BR-03 / US-03 | Pengelola (`bayu@`) | Mencoba mengaktifkan kontrak draf Fajar Nugroho (C-307) yang identitasnya belum diverifikasi | Ditolak sistem dengan pesan "Identitas penyewa belum diverifikasi" | Ditolak, tombol aktivasi dicegah dan backend melempar error | **Lulus** |
| **TC-04** | BR-03 / US-02 | Pengelola (`sinta@`) | Memverifikasi identitas Fajar Nugroho, kemudian mengaktifkan kontrak draf C-307 | Kontrak berhasil beralih status ke `aktif` dan tersimpan di audit log | Berhasil aktif dan tercatat di audit log | **Lulus** |
| **TC-05** | BR-04 / US-03 | Pengelola (`bayu@`) | Mencoba membuat kontrak baru untuk unit B-205 (status perbaikan) atau A-108 (nonaktif) | Ditolak dengan pesan unit tidak berstatus tersedia | Unit tidak tersedia untuk dipilih atau ditolak saat submit | **Lulus** |
| **TC-06** | BR-04 / US-09 | Pengelola (`bayu@`) | Mencoba mengubah harga sewa bulanan unit Griya Kenanga | Akses ditolak karena hanya Pemilik yang berhak mengubah harga unit | Opsi edit harga tidak tersedia bagi staf dan ditolak server | **Lulus** |
| **TC-07** | BR-05 / US-03 | Pengelola (`sinta@`) | Mencoba menyelesaikan kontrak aktif sebelum tanggal selesai terlewati atau tagihan belum lunas | Ditolak sistem dengan pesan tagihan belum lunas atau masa sewa belum berakhir | Ditolak dengan pesan validasi status kontrak | **Lulus** |
| **TC-08** | BR-05 / US-09 | Pemilik (`ratna@`) | Mengakhiri kontrak aktif lebih awal dengan menyertakan alasan pembatalan | Status kontrak menjadi `diakhiri`, berakhir pada akhir bulan berjalan, tercatat di audit log | Berhasil diakhiri dan tercatat di audit log | **Lulus** |
| **TC-09** | BR-06 / US-04 | Pengelola (`bayu@`) | Menekan tombol "Buat Tagihan Bulanan" untuk periode yang sudah memiliki tagihan aktif | Tidak ada tagihan duplikat yang dibuat, nomor tagihan tetap berurutan tanpa lompat | Sistem memeriksa idempotency, tidak ada duplikat | **Lulus** |
| **TC-10** | BR-07 / US-05 | Pengelola (`bayu@`) | Menghitung tagihan Oktober Dimas Saputra pada 15 Oktober (jatuh tempo 10 Okt = telat 5 hari) | Denda terhitung otomatis Rp100.000 ($5 \times \text{Rp}20.000$) dan ditambahkan ke total | Denda Rp100.000 terhitung otomatis | **Lulus** |
| **TC-11** | BR-07 / US-05 | Pengelola (`sinta@`) | Menghitung denda tagihan September Hana Puspita yang terlambat lebih dari 10 hari | Denda berhenti di batas maksimum Rp200.000 (tidak terus bertambah) | Denda tepat Rp200.000 sesuai batas BR-07 | **Lulus** |
| **TC-12** | BR-08 / US-05 | Pengelola (`bayu@`) | Mencatat pembayaran di bawah Rp100.000 saat sisa tagihan masih di atas Rp100.000 | Ditolak dengan pesan kesalahan minimal pembayaran Rp100.000 | Ditolak dengan peringatan minimal cicilan | **Lulus** |
| **TC-13** | BR-08 / US-05 | Pengelola (`sinta@`) | Mencatat pembayaran melebihi sisa tagihan yang harus dibayar | Ditolak sistem dengan pesan jumlah bayar melebihi sisa kewajiban | Ditolak secara otomatis oleh validasi database/form | **Lulus** |
| **TC-14** | BR-09 / US-09 | Pemilik (`ratna@`) | Membatalkan pembayaran sah karena salah input dengan menyertakan alasan pembatalan | Status pembayaran menjadi `dibatalkan`, saldo tagihan dihitung ulang otomatis | Pembayaran batal, status tagihan kembali menyesuaikan | **Lulus** |
| **TC-15** | BR-10 / US-06 | Penyewa (`dimas@`) | Membuka paksa URL `/laporan` atau mengambil data penyewa lain via API/console | Akses ditolak oleh route guard & RLS database | Dialihkan / Forbidden (403), data tidak bocor | **Lulus** |
| **TC-16** | BR-10 / US-10 | Pemilik (`ratna@`) | Membuka rincian data penyewa pada daftar penyewa | NIK disamarkan (contoh: `************1234`), foto KTP tidak ditampilkan | NIK ter-masking 4 digit terakhir, privasi terjaga | **Lulus** |
| **TC-17** | BR-11 / US-07 | Penyewa (`dimas@`) | Mencoba membuat laporan kerusakan ke-4 saat sudah memiliki 3 laporan berstatus terbuka | Ditolak sistem dengan pesan batas maksimal 3 laporan terbuka sudah tercapai | Ditolak dengan pesan batasan kuota laporan terbuka | **Lulus** |
| **TC-18** | BR-12 / US-08 | Pengelola (`bayu@`) | Memproses laporan kerusakan LK-2026-0010 dengan estimasi Rp1.250.000 tanpa persetujuan Pemilik | Sistem mewajibkan status beralih ke `menunggu_persetujuan` Pemilik terlebih dahulu | Status beralih ke `menunggu_persetujuan` | **Lulus** |
| **TC-19** | BR-12 / US-09 | Pemilik (`ratna@`) | Menyetujui estimasi biaya LK-2026-0010 sebesar Rp1.250.000 | Status beralih ke `diproses` dan dicatat di audit log | Status beralih ke `diproses` | **Lulus** |
| **TC-20** | Non-Fungsional | Semua Pengguna | Memeriksa metadata HTML seluruh halaman aplikasi | Tag `<meta name="robots" content="noindex, nofollow" />` terpasang di layout utama | Terpasang di root layout | **Lulus** |
