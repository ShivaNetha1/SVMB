-- ============================================================
-- Sri Venkateshwara Marriage Bureau — Supabase Schema
-- Run this ENTIRE file in Supabase SQL Editor (one shot)
-- ============================================================

-- 1. CLIENTS TABLE
CREATE TABLE clients (
  id                  UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  unique_code         TEXT UNIQUE NOT NULL,
  id_number           INTEGER NOT NULL,
  bureau_type         TEXT NOT NULL DEFAULT 'own',
  source_bureau       TEXT DEFAULT 'SVMB',

  -- Personal Details
  first_name          TEXT NOT NULL,
  last_name           TEXT,
  dob                 DATE NOT NULL,
  birth_time          TEXT,
  place_of_birth      TEXT,
  rashi               TEXT,
  height              TEXT NOT NULL,
  education           TEXT NOT NULL,
  religion            TEXT,
  caste               TEXT,
  gender              TEXT,

  -- Contact Details
  address             TEXT NOT NULL,
  phone               TEXT,

  -- Family Details
  father_name         TEXT,
  father_occupation   TEXT,
  mother_name         TEXT,
  mother_occupation   TEXT,
  siblings            TEXT,

  -- Media
  photo_url           TEXT,

  -- Bureau / Status Fields
  payment_status      TEXT NOT NULL DEFAULT 'Not Paid',
  profile_status      TEXT NOT NULL DEFAULT 'Active',
  match_status        TEXT NOT NULL DEFAULT 'Unmatched',
  notes               TEXT,

  -- Timestamps
  created_at          TIMESTAMPTZ DEFAULT NOW(),
  updated_at          TIMESTAMPTZ DEFAULT NOW()
);

-- 2. MATCHES TABLE
CREATE TABLE matches (
  id                  UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  male_client_id      UUID REFERENCES clients(id) ON DELETE SET NULL,
  female_client_id    UUID REFERENCES clients(id) ON DELETE SET NULL,
  suggested_date      DATE,
  male_response       TEXT DEFAULT 'Pending',
  female_response     TEXT DEFAULT 'Pending',
  meeting_date        DATE,
  outcome             TEXT DEFAULT 'Pending',
  notes               TEXT,
  created_at          TIMESTAMPTZ DEFAULT NOW()
);

-- 3. PAYMENTS TABLE
CREATE TABLE payments (
  id                  UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  client_id           UUID REFERENCES clients(id) ON DELETE CASCADE,
  amount              NUMERIC,
  paid_date           DATE,
  payment_mode        TEXT,
  receipt_note        TEXT,
  created_at          TIMESTAMPTZ DEFAULT NOW()
);

-- 4. ACTIVITY LOG TABLE
CREATE TABLE activity_log (
  id                  UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  event_type          TEXT,
  client_id           UUID REFERENCES clients(id) ON DELETE SET NULL,
  telegram_message    TEXT,
  details             TEXT,
  created_at          TIMESTAMPTZ DEFAULT NOW()
);

-- 5. PENDING PHOTOS TABLE
CREATE TABLE pending_photos (
  id                  UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  chat_id             TEXT,
  client_id           UUID REFERENCES clients(id) ON DELETE CASCADE,
  expires_at          TIMESTAMPTZ,
  created_at          TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- AUTO-UPDATE updated_at TRIGGER
-- ============================================================

CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER set_updated_at
  BEFORE UPDATE ON clients
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- ============================================================
-- ROW LEVEL SECURITY (RLS)
-- ============================================================

-- Enable RLS on all tables
ALTER TABLE clients ENABLE ROW LEVEL SECURITY;
ALTER TABLE matches ENABLE ROW LEVEL SECURITY;
ALTER TABLE payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE activity_log ENABLE ROW LEVEL SECURITY;
ALTER TABLE pending_photos ENABLE ROW LEVEL SECURITY;

-- Policies: Only authenticated users can do anything
CREATE POLICY "Authenticated users can SELECT clients"
  ON clients FOR SELECT TO authenticated USING (true);
CREATE POLICY "Authenticated users can INSERT clients"
  ON clients FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Authenticated users can UPDATE clients"
  ON clients FOR UPDATE TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Authenticated users can DELETE clients"
  ON clients FOR DELETE TO authenticated USING (true);

CREATE POLICY "Authenticated users can SELECT matches"
  ON matches FOR SELECT TO authenticated USING (true);
CREATE POLICY "Authenticated users can INSERT matches"
  ON matches FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Authenticated users can UPDATE matches"
  ON matches FOR UPDATE TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Authenticated users can DELETE matches"
  ON matches FOR DELETE TO authenticated USING (true);

CREATE POLICY "Authenticated users can SELECT payments"
  ON payments FOR SELECT TO authenticated USING (true);
CREATE POLICY "Authenticated users can INSERT payments"
  ON payments FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Authenticated users can UPDATE payments"
  ON payments FOR UPDATE TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Authenticated users can DELETE payments"
  ON payments FOR DELETE TO authenticated USING (true);

CREATE POLICY "Authenticated users can SELECT activity_log"
  ON activity_log FOR SELECT TO authenticated USING (true);
CREATE POLICY "Authenticated users can INSERT activity_log"
  ON activity_log FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Authenticated users can UPDATE activity_log"
  ON activity_log FOR UPDATE TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Authenticated users can DELETE activity_log"
  ON activity_log FOR DELETE TO authenticated USING (true);

CREATE POLICY "Authenticated users can SELECT pending_photos"
  ON pending_photos FOR SELECT TO authenticated USING (true);
CREATE POLICY "Authenticated users can INSERT pending_photos"
  ON pending_photos FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Authenticated users can UPDATE pending_photos"
  ON pending_photos FOR UPDATE TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Authenticated users can DELETE pending_photos"
  ON pending_photos FOR DELETE TO authenticated USING (true);

-- ============================================================
-- STORAGE BUCKET (run this separately if the above errors)
-- Note: Storage bucket creation via SQL may not work in all
-- Supabase versions. Create it from Dashboard → Storage if needed.
-- ============================================================

INSERT INTO storage.buckets (id, name, public)
VALUES ('profile-photos', 'profile-photos', true)
ON CONFLICT (id) DO NOTHING;

-- Storage policy: authenticated users can upload
CREATE POLICY "Authenticated users can upload photos"
  ON storage.objects FOR INSERT TO authenticated
  WITH CHECK (bucket_id = 'profile-photos');

CREATE POLICY "Authenticated users can update photos"
  ON storage.objects FOR UPDATE TO authenticated
  USING (bucket_id = 'profile-photos');

CREATE POLICY "Anyone can view photos"
  ON storage.objects FOR SELECT TO public
  USING (bucket_id = 'profile-photos');

CREATE POLICY "Authenticated users can delete photos"
  ON storage.objects FOR DELETE TO authenticated
  USING (bucket_id = 'profile-photos');
