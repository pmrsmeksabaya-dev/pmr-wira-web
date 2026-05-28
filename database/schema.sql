-- ============================================
-- TABLE: pendaftaran_pmr
-- ============================================
CREATE TABLE IF NOT EXISTS pendaftaran_pmr (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  nama_lengkap TEXT NOT NULL,
  nisn TEXT NOT NULL,
  kelas TEXT NOT NULL,
  jurusan TEXT NOT NULL,
  jenis_kelamin TEXT NOT NULL,
  tempat_lahir TEXT NOT NULL,
  tanggal_lahir DATE NOT NULL,
  alamat TEXT NOT NULL,
  no_hp TEXT NOT NULL,
  email TEXT NOT NULL,
  alasan_masuk_pmr TEXT NOT NULL,
  pengalaman_organisasi TEXT DEFAULT '',
  izin_orangtua BOOLEAN DEFAULT false,
  status TEXT DEFAULT 'pending'
);

-- ============================================
-- TABLE: app_admins
-- ============================================
CREATE TABLE IF NOT EXISTS app_admins (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  nama TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- ROW LEVEL SECURITY
-- ============================================
ALTER TABLE pendaftaran_pmr ENABLE ROW LEVEL SECURITY;
ALTER TABLE app_admins ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Publik_bisa_insert_pendaftaran"
ON pendaftaran_pmr FOR INSERT
WITH CHECK (true);

CREATE POLICY "Admin_bisa_kelola_pendaftaran"
ON pendaftaran_pmr FOR ALL
USING (auth.uid() IN (SELECT user_id FROM app_admins));

CREATE POLICY "Admin_bisa_lihat_admin"
ON app_admins FOR SELECT
USING (auth.uid() IN (SELECT user_id FROM app_admins));
