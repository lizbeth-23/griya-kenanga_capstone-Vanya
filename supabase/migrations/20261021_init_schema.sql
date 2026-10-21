-- ====================================================================
-- DATABASE SCHEMA: GRIYA KENANGA RESIDENCE (CAPSTONE 05)
-- PostgreSQL / Supabase
-- Target Date: 15 October 2026
-- ====================================================================

-- 1. ENUM TYPES
CREATE TYPE user_role AS ENUM ('penyewa', 'pengelola', 'pemilik');
CREATE TYPE unit_status AS ENUM ('tersedia', 'perbaikan', 'nonaktif');
CREATE TYPE contract_status AS ENUM ('draf', 'aktif', 'selesai', 'diakhiri', 'dibatalkan');
CREATE TYPE invoice_status AS ENUM ('belum_bayar', 'sebagian', 'lunas', 'dibatalkan');
CREATE TYPE payment_method AS ENUM ('tunai', 'transfer', 'mayar');
CREATE TYPE payment_status AS ENUM ('sah', 'dibatalkan');
CREATE TYPE verification_status AS ENUM ('belum', 'terverifikasi', 'ditolak');
CREATE TYPE damage_category AS ENUM ('listrik', 'air', 'ac', 'bangunan', 'perabot', 'lainnya');
CREATE TYPE damage_status AS ENUM ('dilaporkan', 'diproses', 'menunggu_persetujuan', 'selesai', 'ditutup', 'ditolak');

-- 2. TABEL PROFILES (Terhubung 1:1 ke auth.users)
CREATE TABLE IF NOT EXISTS profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  nama_lengkap TEXT NOT NULL CHECK (char_length(trim(nama_lengkap)) >= 3),
  email TEXT NOT NULL UNIQUE,
  no_hp TEXT CHECK (no_hp IS NULL OR no_hp ~ '^08[0-9]{8,11}$'),
  peran user_role NOT NULL DEFAULT 'penyewa',
  aktif BOOLEAN NOT NULL DEFAULT true,
  dibuat_pada TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 3. TABEL IDENTITAS_PENYEWA (Data Rahasia)
CREATE TABLE IF NOT EXISTS identitas_penyewa (
  penyewa_id UUID PRIMARY KEY REFERENCES profiles(id) ON DELETE CASCADE,
  nik CHAR(16) NOT NULL UNIQUE CHECK (nik ~ '^[0-9]{16}$'),
  alamat_asal TEXT NOT NULL,
  foto_ktp_path TEXT NOT NULL,
  kontak_darurat_nama TEXT NOT NULL,
  kontak_darurat_hp TEXT NOT NULL CHECK (kontak_darurat_hp ~ '^08[0-9]{8,11}$'),
  status_verifikasi verification_status NOT NULL DEFAULT 'belum',
  alasan_tolak TEXT,
  diverifikasi_oleh UUID REFERENCES profiles(id),
  diverifikasi_pada TIMESTAMPTZ,
  diperbarui_pada TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 4. TABEL UNIT (24 Kamar & Studio)
CREATE TABLE IF NOT EXISTS unit (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  kode TEXT NOT NULL UNIQUE,
  lantai SMALLINT NOT NULL CHECK (lantai BETWEEN 1 AND 3),
  tipe TEXT NOT NULL,
  luas_m2 NUMERIC(5,1) NOT NULL CHECK (luas_m2 > 0),
  harga_sewa_bulanan INTEGER NOT NULL CHECK (harga_sewa_bulanan > 0),
  status unit_status NOT NULL DEFAULT 'tersedia',
  keterangan TEXT,
  dibuat_pada TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 5. TABEL NOMOR_URUT (Penghitung Atomik Anti Bentrok)
CREATE TABLE IF NOT EXISTS nomor_urut (
  jenis TEXT NOT NULL,
  periode TEXT NOT NULL,
  terakhir INTEGER NOT NULL DEFAULT 0 CHECK (terakhir >= 0),
  PRIMARY KEY (jenis, periode)
);

-- 6. TABEL KONTRAK
CREATE TABLE IF NOT EXISTS kontrak (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nomor TEXT NOT NULL UNIQUE,
  unit_id UUID NOT NULL REFERENCES unit(id),
  penyewa_id UUID NOT NULL REFERENCES profiles(id),
  tanggal_mulai DATE NOT NULL CHECK (EXTRACT(DAY FROM tanggal_mulai) = 1),
  durasi_bulan SMALLINT NOT NULL CHECK (durasi_bulan IN (1, 3, 6, 12)),
  tanggal_selesai DATE NOT NULL,
  harga_sewa_bulanan INTEGER NOT NULL CHECK (harga_sewa_bulanan > 0),
  status contract_status NOT NULL DEFAULT 'draf',
  tanggal_berakhir_aktual DATE,
  alasan_berakhir TEXT,
  dibuat_oleh UUID REFERENCES profiles(id),
  diaktifkan_pada TIMESTAMPTZ,
  dibuat_pada TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 7. TABEL TAGIHAN
CREATE TABLE IF NOT EXISTS tagihan (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nomor TEXT NOT NULL UNIQUE,
  kontrak_id UUID NOT NULL REFERENCES kontrak(id),
  periode DATE NOT NULL CHECK (EXTRACT(DAY FROM periode) = 1),
  jatuh_tempo DATE NOT NULL,
  nominal_sewa INTEGER NOT NULL CHECK (nominal_sewa > 0),
  denda INTEGER NOT NULL DEFAULT 0 CHECK (denda BETWEEN 0 AND 200000),
  terbayar INTEGER NOT NULL DEFAULT 0 CHECK (terbayar >= 0),
  status invoice_status NOT NULL DEFAULT 'belum_bayar',
  alasan_batal TEXT,
  mayar_invoice_id TEXT,
  mayar_link TEXT,
  dibuat_oleh UUID REFERENCES profiles(id),
  dibuat_pada TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT uq_kontrak_periode UNIQUE (kontrak_id, periode)
);

-- 8. TABEL PEMBAYARAN
CREATE TABLE IF NOT EXISTS pembayaran (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tagihan_id UUID NOT NULL REFERENCES tagihan(id),
  jumlah INTEGER NOT NULL CHECK (jumlah > 0),
  metode payment_method NOT NULL,
  tanggal_bayar DATE NOT NULL DEFAULT CURRENT_DATE,
  bukti_path TEXT,
  referensi_mayar TEXT UNIQUE,
  status payment_status NOT NULL DEFAULT 'sah',
  alasan_batal TEXT,
  dicatat_oleh UUID REFERENCES profiles(id),
  dibatalkan_oleh UUID REFERENCES profiles(id),
  dibatalkan_pada TIMESTAMPTZ,
  dibuat_pada TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 9. TABEL LAPORAN_KERUSAKAN
CREATE TABLE IF NOT EXISTS laporan_kerusakan (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nomor TEXT NOT NULL UNIQUE,
  kontrak_id UUID NOT NULL REFERENCES kontrak(id),
  unit_id UUID NOT NULL REFERENCES unit(id),
  pelapor_id UUID NOT NULL REFERENCES profiles(id),
  kategori damage_category NOT NULL,
  judul TEXT NOT NULL CHECK (char_length(trim(judul)) BETWEEN 5 AND 80),
  deskripsi TEXT NOT NULL,
  foto_paths TEXT[] NOT NULL DEFAULT '{}',
  status damage_status NOT NULL DEFAULT 'dilaporkan',
  estimasi_biaya INTEGER NOT NULL DEFAULT 0 CHECK (estimasi_biaya >= 0),
  biaya_aktual INTEGER NOT NULL DEFAULT 0 CHECK (biaya_aktual >= 0),
  catatan TEXT,
  alasan_tolak TEXT,
  disetujui_oleh UUID REFERENCES profiles(id),
  disetujui_pada TIMESTAMPTZ,
  selesai_pada TIMESTAMPTZ,
  ditutup_pada TIMESTAMPTZ,
  dibuat_pada TIMESTAMPTZ NOT NULL DEFAULT now(),
  diperbarui_pada TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 10. TABEL AUDIT_LOG
CREATE TABLE IF NOT EXISTS audit_log (
  id BIGSERIAL PRIMARY KEY,
  pelaku_id UUID REFERENCES profiles(id),
  peran user_role,
  aksi TEXT NOT NULL,
  tabel TEXT NOT NULL,
  data_id TEXT NOT NULL,
  sebelum JSONB,
  sesudah JSONB,
  dibuat_pada TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ====================================================================
-- DATABASE FUNCTIONS / STORED PROCEDURES (Row Locking & Concurrency Safe)
-- ====================================================================

-- A. Generator Nomor Dokumen Berurutan (Anti Bentrok dengan SELECT FOR UPDATE)
CREATE OR REPLACE FUNCTION get_next_document_number(p_jenis TEXT, p_periode TEXT)
RETURNS TEXT AS $$
DECLARE
  v_next_val INT;
  v_prefix TEXT;
  v_res TEXT;
BEGIN
  -- Kunci baris nomor_urut secara eksklusif
  INSERT INTO nomor_urut (jenis, periode, terakhir)
  VALUES (p_jenis, p_periode, 0)
  ON CONFLICT (jenis, periode) DO NOTHING;

  SELECT terakhir + 1 INTO v_next_val
  FROM nomor_urut
  WHERE jenis = p_jenis AND periode = p_periode
  FOR UPDATE;

  UPDATE nomor_urut
  SET terakhir = v_next_val
  WHERE jenis = p_jenis AND periode = p_periode;

  IF p_jenis = 'INV' THEN
    v_res := 'INV-' || p_periode || '-' || LPAD(v_next_val::TEXT, 4, '0');
  ELSE
    v_res := p_jenis || '-' || p_periode || '-' || LPAD(v_next_val::TEXT, 4, '0');
  END IF;

  RETURN v_res;
END;
$$ LANGUAGE plpgsql;

-- B. Pembuatan Kontrak Baru dengan Proteksi Overlap (BR-01, BR-02, BR-04)
CREATE OR REPLACE FUNCTION create_contract_safe(
  p_unit_id UUID,
  p_penyewa_id UUID,
  p_tanggal_mulai DATE,
  p_durasi_bulan SMALLINT,
  p_dibuat_oleh UUID
)
RETURNS UUID AS $$
DECLARE
  v_unit_status unit_status;
  v_harga INTEGER;
  v_tanggal_selesai DATE;
  v_overlap_count INT;
  v_active_tenant_count INT;
  v_new_id UUID;
  v_nomor TEXT;
  v_tahun TEXT;
BEGIN
  -- Kunci baris unit
  SELECT status, harga_sewa_bulanan INTO v_unit_status, v_harga
  FROM unit WHERE id = p_unit_id FOR UPDATE;

  IF v_unit_status != 'tersedia' THEN
    RAISE EXCEPTION 'Unit tidak berstatus tersedia (Status: %)', v_unit_status;
  END IF;

  -- Tanggal selesai = hari terakhir bulan ke-(mulai + durasi - 1)
  v_tanggal_selesai := (p_tanggal_mulai + (p_durasi_bulan || ' month')::INTERVAL - '1 day'::INTERVAL)::DATE;

  -- Periksa apakah unit sudah punya kontrak draf/aktif yang beririsan (BR-01)
  SELECT COUNT(*) INTO v_overlap_count
  FROM kontrak
  WHERE unit_id = p_unit_id
    AND status IN ('draf', 'aktif')
    AND (tanggal_mulai <= v_tanggal_selesai AND tanggal_selesai >= p_tanggal_mulai);

  IF v_overlap_count > 0 THEN
    RAISE EXCEPTION 'Unit sudah memiliki kontrak beririsan pada periode tersebut';
  END IF;

  -- Nomor kontrak
  v_tahun := TO_CHAR(p_tanggal_mulai, 'YYYY');
  v_nomor := get_next_document_number('KTR', v_tahun);

  INSERT INTO kontrak (
    nomor, unit_id, penyewa_id, tanggal_mulai, durasi_bulan,
    tanggal_selesai, harga_sewa_bulanan, status, dibuat_oleh
  ) VALUES (
    v_nomor, p_unit_id, p_penyewa_id, p_tanggal_mulai, p_durasi_bulan,
    v_tanggal_selesai, v_harga, 'draf', p_dibuat_oleh
  ) RETURNING id INTO v_new_id;

  -- Audit Log
  INSERT INTO audit_log (pelaku_id, peran, aksi, tabel, data_id, sesudah)
  VALUES (p_dibuat_oleh, 'pengelola', 'kontrak:buat_draf', 'kontrak', v_new_id::TEXT, json_build_object('nomor', v_nomor, 'unit_id', p_unit_id));

  RETURN v_new_id;
END;
$$ LANGUAGE plpgsql;

-- C. Aktivasi Kontrak (BR-03: Identitas wajib terverifikasi & max 1 kontrak aktif per penyewa)
CREATE OR REPLACE FUNCTION activate_contract_safe(
  p_kontrak_id UUID,
  p_pelaku_id UUID
)
RETURNS BOOLEAN AS $$
DECLARE
  v_kontrak RECORD;
  v_verif_status verification_status;
  v_active_count INT;
BEGIN
  SELECT * INTO v_kontrak FROM kontrak WHERE id = p_kontrak_id FOR UPDATE;

  IF NOT FOUND OR v_kontrak.status != 'draf' THEN
    RAISE EXCEPTION 'Kontrak tidak ditemukan atau bukan berstatus draf';
  END IF;

  -- Cek verifikasi identitas penyewa
  SELECT status_verifikasi INTO v_verif_status
  FROM identitas_penyewa WHERE penyewa_id = v_kontrak.penyewa_id;

  IF v_verif_status IS NULL OR v_verif_status != 'terverifikasi' THEN
    RAISE EXCEPTION 'Identitas penyewa belum diverifikasi oleh Pengelola';
  END IF;

  -- Cek apakah penyewa sudah punya kontrak aktif lain
  SELECT COUNT(*) INTO v_active_count
  FROM kontrak
  WHERE penyewa_id = v_kontrak.penyewa_id AND status = 'aktif';

  IF v_active_count > 0 THEN
    RAISE EXCEPTION 'Penyewa masih memiliki kontrak aktif lain';
  END IF;

  UPDATE kontrak
  SET status = 'aktif', diaktifkan_pada = now()
  WHERE id = p_kontrak_id;

  -- Audit Log
  INSERT INTO audit_log (pelaku_id, peran, aksi, tabel, data_id, sebelum, sesudah)
  VALUES (p_pelaku_id, 'pengelola', 'status:kontrak:draf->aktif', 'kontrak', p_kontrak_id::TEXT,
    json_build_object('status', 'draf'),
    json_build_object('status', 'aktif', 'nomor', v_kontrak.nomor)
  );

  RETURN true;
END;
$$ LANGUAGE plpgsql;

-- D. Pencatatan Pembayaran Aman dengan Perhitungan Denda Otomatis (BR-07, BR-08)
CREATE OR REPLACE FUNCTION record_payment_safe(
  p_tagihan_id UUID,
  p_jumlah INTEGER,
  p_metode payment_method,
  p_bukti_path TEXT,
  p_referensi_mayar TEXT,
  p_pelaku_id UUID,
  p_tanggal_bayar DATE DEFAULT CURRENT_DATE
)
RETURNS UUID AS $$
DECLARE
  v_tagihan RECORD;
  v_denda_baru INTEGER;
  v_hari_terlambat INTEGER;
  v_total_kewajiban INTEGER;
  v_sisa_harus_bayar INTEGER;
  v_terbayar_baru INTEGER;
  v_status_baru invoice_status;
  v_payment_id UUID;
BEGIN
  -- Kunci baris tagihan
  SELECT * INTO v_tagihan FROM tagihan WHERE id = p_tagihan_id FOR UPDATE;

  IF NOT FOUND OR v_tagihan.status IN ('lunas', 'dibatalkan') THEN
    RAISE EXCEPTION 'Tagihan sudah lunas atau dibatalkan';
  END IF;

  -- Hitung denda jika bayar setelah jatuh tempo (tanggal 10)
  v_denda_baru := v_tagihan.denda;
  IF p_tanggal_bayar > v_tagihan.jatuh_tempo THEN
    v_hari_terlambat := (p_tanggal_bayar - v_tagihan.jatuh_tempo);
    v_denda_baru := LEAST(200000, GREATEST(v_tagihan.denda, v_hari_terlambat * 20000));
  END IF;

  v_total_kewajiban := v_tagihan.nominal_sewa + v_denda_baru;
  v_sisa_harus_bayar := v_total_kewajiban - v_tagihan.terbayar;

  -- Validasi jumlah pembayaran
  IF p_jumlah > v_sisa_harus_bayar THEN
    RAISE EXCEPTION 'Jumlah bayar (Rp%) melebihi sisa kewajiban (Rp%)', p_jumlah, v_sisa_harus_bayar;
  END IF;

  IF p_jumlah < 100000 AND p_jumlah != v_sisa_harus_bayar THEN
    RAISE EXCEPTION 'Minimal cicilan adalah Rp100.000 kecuali jika melunasi sisa tagihan';
  END IF;

  -- Insert pembayaran
  INSERT INTO pembayaran (
    tagihan_id, jumlah, metode, tanggal_bayar, bukti_path, referensi_mayar, dicatat_oleh
  ) VALUES (
    p_tagihan_id, p_jumlah, p_metode, p_tanggal_bayar, p_bukti_path, p_referensi_mayar, p_pelaku_id
  ) RETURNING id INTO v_payment_id;

  v_terbayar_baru := v_tagihan.terbayar + p_jumlah;
  IF v_terbayar_baru >= v_total_kewajiban THEN
    v_status_baru := 'lunas';
  ELSE
    v_status_baru := 'sebagian';
  END IF;

  UPDATE tagihan
  SET denda = v_denda_baru,
      terbayar = v_terbayar_baru,
      status = v_status_baru
  WHERE id = p_tagihan_id;

  -- Catat Audit Log
  INSERT INTO audit_log (pelaku_id, peran, aksi, tabel, data_id, sesudah)
  VALUES (p_pelaku_id, 'pengelola', 'pembayaran:catat', 'pembayaran', v_payment_id::TEXT,
    json_build_object('tagihan_id', p_tagihan_id, 'jumlah', p_jumlah, 'status_tagihan', v_status_baru)
  );

  RETURN v_payment_id;
END;
$$ LANGUAGE plpgsql;

-- E. Pembatalan Pembayaran oleh Pemilik (BR-09)
CREATE OR REPLACE FUNCTION cancel_payment_safe(
  p_pembayaran_id UUID,
  p_alasan TEXT,
  p_pemilik_id UUID
)
RETURNS BOOLEAN AS $$
DECLARE
  v_bayar RECORD;
  v_tagihan RECORD;
  v_terbayar_baru INTEGER;
  v_status_baru invoice_status;
BEGIN
  SELECT * INTO v_bayar FROM pembayaran WHERE id = p_pembayaran_id FOR UPDATE;

  IF NOT FOUND OR v_bayar.status = 'dibatalkan' THEN
    RAISE EXCEPTION 'Pembayaran sudah dibatalkan atau tidak ditemukan';
  END IF;

  SELECT * INTO v_tagihan FROM tagihan WHERE id = v_bayar.tagihan_id FOR UPDATE;

  UPDATE pembayaran
  SET status = 'dibatalkan',
      alasan_batal = p_alasan,
      dibatalkan_oleh = p_pemilik_id,
      dibatalkan_pada = now()
  WHERE id = p_pembayaran_id;

  v_terbayar_baru := GREATEST(0, v_tagihan.terbayar - v_bayar.jumlah);
  IF v_terbayar_baru = 0 THEN
    v_status_baru := 'belum_bayar';
  ELSIF v_terbayar_baru < (v_tagihan.nominal_sewa + v_tagihan.denda) THEN
    v_status_baru := 'sebagian';
  ELSE
    v_status_baru := 'lunas';
  END IF;

  UPDATE tagihan
  SET terbayar = v_terbayar_baru,
      status = v_status_baru
  WHERE id = v_bayar.tagihan_id;

  -- Audit Log
  INSERT INTO audit_log (pelaku_id, peran, aksi, tabel, data_id, sebelum, sesudah)
  VALUES (p_pemilik_id, 'pemilik', 'pembayaran:dibatalkan', 'pembayaran', p_pembayaran_id::TEXT,
    json_build_object('status', 'sah', 'jumlah', v_bayar.jumlah),
    json_build_object('status', 'dibatalkan', 'alasan', p_alasan)
  );

  RETURN true;
END;
$$ LANGUAGE plpgsql;

-- ====================================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- ====================================================================

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE identitas_penyewa ENABLE ROW LEVEL SECURITY;
ALTER TABLE unit ENABLE ROW LEVEL SECURITY;
ALTER TABLE kontrak ENABLE ROW LEVEL SECURITY;
ALTER TABLE tagihan ENABLE ROW LEVEL SECURITY;
ALTER TABLE pembayaran ENABLE ROW LEVEL SECURITY;
ALTER TABLE laporan_kerusakan ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_log ENABLE ROW LEVEL SECURITY;

-- Profiles: Semua user login bisa melihat profil umum; Pemilik bisa mengupdate peran orang lain
CREATE POLICY "Profiles viewable by authenticated users"
ON profiles FOR SELECT TO authenticated
USING (true);

CREATE POLICY "Profiles updatable by Pemilik or self"
ON profiles FOR UPDATE TO authenticated
USING (auth.uid() = id OR (SELECT peran FROM profiles WHERE id = auth.uid()) = 'pemilik');

-- Identitas Penyewa: Hanya penyewa ybs dan Pengelola yang boleh melihat isi lengkap (BR-10)
CREATE POLICY "Identitas penyewa viewable by self and Pengelola"
ON identitas_penyewa FOR SELECT TO authenticated
USING (
  auth.uid() = penyewa_id OR 
  (SELECT peran FROM profiles WHERE id = auth.uid()) = 'pengelola'
);

CREATE POLICY "Identitas penyewa insert/update by self"
ON identitas_penyewa FOR ALL TO authenticated
USING (auth.uid() = penyewa_id);

-- Unit: Semua orang terautentikasi bisa melihat unit; Pengelola bisa ubah status, Pemilik bisa ubah harga (BR-04, BR-10)
CREATE POLICY "Unit viewable by authenticated users"
ON unit FOR SELECT TO authenticated
USING (true);

CREATE POLICY "Unit updatable by Pengelola or Pemilik"
ON unit FOR UPDATE TO authenticated
USING ((SELECT peran FROM profiles WHERE id = auth.uid()) IN ('pengelola', 'pemilik'));

-- Kontrak: Penyewa hanya melihat miliknya; Pengelola & Pemilik melihat semua (BR-10)
CREATE POLICY "Kontrak viewable by tenant or staff"
ON kontrak FOR SELECT TO authenticated
USING (
  penyewa_id = auth.uid() OR
  (SELECT peran FROM profiles WHERE id = auth.uid()) IN ('pengelola', 'pemilik')
);

CREATE POLICY "Kontrak manageable by staff"
ON kontrak FOR ALL TO authenticated
USING ((SELECT peran FROM profiles WHERE id = auth.uid()) IN ('pengelola', 'pemilik'));

-- Tagihan: Penyewa hanya miliknya; Pengelola & Pemilik melihat semua
CREATE POLICY "Tagihan viewable by tenant or staff"
ON tagihan FOR SELECT TO authenticated
USING (
  kontrak_id IN (SELECT id FROM kontrak WHERE penyewa_id = auth.uid()) OR
  (SELECT peran FROM profiles WHERE id = auth.uid()) IN ('pengelola', 'pemilik')
);

-- Pembayaran: Penyewa hanya miliknya; Staf melihat semua
CREATE POLICY "Pembayaran viewable by tenant or staff"
ON pembayaran FOR SELECT TO authenticated
USING (
  tagihan_id IN (
    SELECT t.id FROM tagihan t
    JOIN kontrak k ON t.kontrak_id = k.id
    WHERE k.penyewa_id = auth.uid()
  ) OR
  (SELECT peran FROM profiles WHERE id = auth.uid()) IN ('pengelola', 'pemilik')
);

-- Laporan Kerusakan: Penyewa melihat miliknya; Staf melihat semua (BR-11, BR-12)
CREATE POLICY "Kerusakan viewable by tenant or staff"
ON laporan_kerusakan FOR SELECT TO authenticated
USING (
  pelapor_id = auth.uid() OR
  (SELECT peran FROM profiles WHERE id = auth.uid()) IN ('pengelola', 'pemilik')
);

-- Audit Log: HANYA Pemilik yang bisa membaca (BR-09, BR-10)
CREATE POLICY "Audit Log viewable ONLY by Pemilik"
ON audit_log FOR SELECT TO authenticated
USING ((SELECT peran FROM profiles WHERE id = auth.uid()) = 'pemilik');
