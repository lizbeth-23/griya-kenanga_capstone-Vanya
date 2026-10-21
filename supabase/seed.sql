-- ====================================================================
-- SEED DATA: GRIYA KENANGA RESIDENCE (CAPSTONE 05)
-- Ref Date: 15 October 2026
-- Password: Latihan#2026
-- ====================================================================

-- 1. SEED UNIT (24 Unit: 8 Standar di Lt 1, 8 AC di Lt 2, 8 Studio di Lt 3)
INSERT INTO unit (id, kode, lantai, tipe, luas_m2, harga_sewa_bulanan, status, keterangan) VALUES
-- Lantai 1 (Standar)
('10000000-0000-0000-0000-000000000101', 'A-101', 1, 'standar', 15.0, 1350000, 'tersedia', 'Kamar mandi dalam, kasur single, lemari'),
('10000000-0000-0000-0000-000000000102', 'A-102', 1, 'standar', 16.0, 1450000, 'tersedia', 'Kamar mandi dalam, jendela luar'),
('10000000-0000-0000-0000-000000000103', 'A-103', 1, 'standar', 16.0, 1450000, 'tersedia', 'Kamar mandi dalam, meja belajar'),
('10000000-0000-0000-0000-000000000104', 'A-104', 1, 'standar', 15.0, 1350000, 'tersedia', 'Dekat taman dalam'),
('10000000-0000-0000-0000-000000000105', 'A-105', 1, 'standar', 16.0, 1450000, 'tersedia', 'Sirkulasi udara bagus'),
('10000000-0000-0000-0000-000000000106', 'A-106', 1, 'standar', 15.0, 1350000, 'tersedia', 'Kosong pasca kontrak Gilang diakhiri dini 30 Sep'),
('10000000-0000-0000-0000-000000000107', 'A-107', 1, 'standar', 15.0, 1350000, 'tersedia', 'Posisi ujung barat'),
('10000000-0000-0000-0000-000000000108', 'A-108', 1, 'standar', 15.0, 1350000, 'nonaktif', 'Unit sedang dialihfungsikan sebagai gudang operasional sementara'),

-- Lantai 2 (Kamar ber-AC)
('10000000-0000-0000-0000-000000000201', 'B-201', 2, 'ac', 18.0, 1900000, 'tersedia', 'Kamar ber-AC, water heater, balkon'),
('10000000-0000-0000-0000-000000000202', 'B-202', 2, 'ac', 17.5, 1850000, 'tersedia', 'Kamar ber-AC, view utara'),
('10000000-0000-0000-0000-000000000203', 'B-203', 2, 'ac', 17.5, 1850000, 'tersedia', 'Kamar ber-AC, smart lock'),
('10000000-0000-0000-0000-000000000204', 'B-204', 2, 'ac', 17.5, 1850000, 'tersedia', 'Kamar ber-AC, dekat tangga'),
('10000000-0000-0000-0000-000000000205', 'B-205', 2, 'ac', 18.0, 1900000, 'perbaikan', 'Perbaikan kebocoran plafon dan pengecatan ulang'),
('10000000-0000-0000-0000-000000000206', 'B-206', 2, 'ac', 17.0, 1750000, 'tersedia', 'Kamar ber-AC ekonomis'),
('10000000-0000-0000-0000-000000000207', 'B-207', 2, 'ac', 17.5, 1850000, 'tersedia', 'Kamar ber-AC, jendela besar'),
('10000000-0000-0000-0000-000000000208', 'B-208', 2, 'ac', 19.0, 2000000, 'tersedia', 'Kamar ber-AC luas, kasur queen'),

-- Lantai 3 (Studio Luas)
('10000000-0000-0000-0000-000000000301', 'C-301', 3, 'studio', 26.0, 2800000, 'tersedia', 'Studio lengkap kitchen sink & kulkas mini'),
('10000000-0000-0000-0000-000000000302', 'C-302', 3, 'studio', 25.0, 2750000, 'tersedia', 'Studio view lereng Gunung Merapi'),
('10000000-0000-0000-0000-000000000303', 'C-303', 3, 'studio', 25.0, 2750000, 'tersedia', 'Studio modern minimalis, microwave'),
('10000000-0000-0000-0000-000000000304', 'C-304', 3, 'studio', 25.0, 2750000, 'tersedia', 'Studio luas, meja kerja ergonomis'),
('10000000-0000-0000-0000-000000000305', 'C-305', 3, 'studio', 24.5, 2650000, 'tersedia', 'Studio nyaman dengan smart TV'),
('10000000-0000-0000-0000-000000000306', 'C-306', 3, 'studio', 25.0, 2750000, 'tersedia', 'Studio sudut dengan pencahayaan alami'),
('10000000-0000-0000-0000-000000000307', 'C-307', 3, 'studio', 25.0, 2750000, 'tersedia', 'Studio siap huni 1 Nov 2026'),
('10000000-0000-0000-0000-000000000308', 'C-308', 3, 'studio', 25.0, 2750000, 'tersedia', 'Studio kosong siap sewa')
ON CONFLICT (kode) DO UPDATE SET
  harga_sewa_bulanan = EXCLUDED.harga_sewa_bulanan,
  status = EXCLUDED.status,
  keterangan = EXCLUDED.keterangan;

-- 2. SEED NOMOR_URUT TERAKHIR
INSERT INTO nomor_urut (jenis, periode, terakhir) VALUES
('KTR', '2026', 23),
('INV', '202610', 19),
('INV', '202609', 19),
('INV', '202608', 19),
('LK', '2026', 13)
ON CONFLICT (jenis, periode) DO UPDATE SET terakhir = EXCLUDED.terakhir;
