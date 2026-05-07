-- ============================================================
-- L'Estrange Fitness — Supabase Schema
-- Safe to re-run: uses IF NOT EXISTS / OR REPLACE / IF EXISTS
-- Run in: Supabase Dashboard → SQL Editor → New query
-- ============================================================

-- ── Tables ────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS profiles (
  id          UUID REFERENCES auth.users ON DELETE CASCADE PRIMARY KEY,
  role        TEXT NOT NULL CHECK (role IN ('pt', 'client')),
  full_name   TEXT NOT NULL,
  email       TEXT NOT NULL,
  phone       TEXT,
  created_at  TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS client_profiles (
  id          UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id     UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  pt_id       UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  goal        TEXT,
  start_date  DATE,
  notes       TEXT,
  photo_url   TEXT,
  created_at  TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS sessions (
  id          UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  client_id   UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  pt_id       UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  date        DATE NOT NULL,
  type        TEXT NOT NULL,
  duration    INTEGER NOT NULL,
  notes       TEXT,
  created_at  TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS exercises (
  id          UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  session_id  UUID REFERENCES sessions(id) ON DELETE CASCADE NOT NULL,
  name        TEXT NOT NULL,
  sets        INTEGER NOT NULL,
  reps        INTEGER NOT NULL,
  weight      DECIMAL,
  rest_time   INTEGER,
  created_at  TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS progress_entries (
  id          UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  client_id   UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  date        DATE NOT NULL,
  metric      TEXT NOT NULL,
  value       DECIMAL NOT NULL,
  created_at  TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS progress_photos (
  id          UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  client_id   UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  url         TEXT NOT NULL,
  date        DATE NOT NULL,
  created_at  TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS bookings (
  id            UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  client_id     UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  pt_id         UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  date          DATE NOT NULL,
  time          TIME NOT NULL,
  session_type  TEXT NOT NULL,
  status        TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'confirmed', 'cancelled')),
  created_at    TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS availability (
  id            UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  pt_id         UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  day_of_week   INTEGER NOT NULL CHECK (day_of_week BETWEEN 0 AND 6),
  start_time    TIME NOT NULL,
  end_time      TIME NOT NULL,
  created_at    TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE (pt_id, day_of_week)
);

CREATE TABLE IF NOT EXISTS invoices (
  id                   UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  client_id            UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  pt_id                UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  amount               DECIMAL NOT NULL,
  description          TEXT NOT NULL,
  due_date             DATE NOT NULL,
  status               TEXT NOT NULL DEFAULT 'outstanding' CHECK (status IN ('outstanding', 'paid', 'overdue')),
  stripe_payment_id    TEXT,
  stripe_checkout_url  TEXT,
  created_at           TIMESTAMPTZ DEFAULT NOW()
);

-- ── Row Level Security ────────────────────────────────────

ALTER TABLE profiles         ENABLE ROW LEVEL SECURITY;
ALTER TABLE client_profiles  ENABLE ROW LEVEL SECURITY;
ALTER TABLE sessions         ENABLE ROW LEVEL SECURITY;
ALTER TABLE exercises        ENABLE ROW LEVEL SECURITY;
ALTER TABLE progress_entries ENABLE ROW LEVEL SECURITY;
ALTER TABLE progress_photos  ENABLE ROW LEVEL SECURITY;
ALTER TABLE bookings         ENABLE ROW LEVEL SECURITY;
ALTER TABLE availability     ENABLE ROW LEVEL SECURITY;
ALTER TABLE invoices         ENABLE ROW LEVEL SECURITY;

-- ── Helper Functions ─────────────────────────────────────

CREATE OR REPLACE FUNCTION auth_user_role()
RETURNS TEXT AS $$
  SELECT role FROM profiles WHERE id = auth.uid()
$$ LANGUAGE SQL SECURITY DEFINER STABLE;

CREATE OR REPLACE FUNCTION auth_user_pt_id()
RETURNS UUID AS $$
  SELECT pt_id FROM client_profiles WHERE user_id = auth.uid()
$$ LANGUAGE SQL SECURITY DEFINER STABLE;

-- ── profiles RLS ─────────────────────────────────────────

DROP POLICY IF EXISTS "Users can view own profile" ON profiles;
CREATE POLICY "Users can view own profile"
  ON profiles FOR SELECT USING (auth.uid() = id);

DROP POLICY IF EXISTS "PT can view their clients profiles" ON profiles;
CREATE POLICY "PT can view their clients profiles"
  ON profiles FOR SELECT
  USING (
    auth_user_role() = 'pt'
    AND id IN (SELECT user_id FROM client_profiles WHERE pt_id = auth.uid())
  );

DROP POLICY IF EXISTS "Users can update own profile" ON profiles;
CREATE POLICY "Users can update own profile"
  ON profiles FOR UPDATE USING (auth.uid() = id);

DROP POLICY IF EXISTS "Users can insert own profile" ON profiles;
CREATE POLICY "Users can insert own profile"
  ON profiles FOR INSERT WITH CHECK (auth.uid() = id);

-- ── client_profiles RLS ──────────────────────────────────

DROP POLICY IF EXISTS "PT can manage client profiles" ON client_profiles;
CREATE POLICY "PT can manage client profiles"
  ON client_profiles FOR ALL USING (pt_id = auth.uid());

DROP POLICY IF EXISTS "Client can view own client profile" ON client_profiles;
CREATE POLICY "Client can view own client profile"
  ON client_profiles FOR SELECT USING (user_id = auth.uid());

-- ── sessions RLS ─────────────────────────────────────────

DROP POLICY IF EXISTS "PT can manage sessions" ON sessions;
CREATE POLICY "PT can manage sessions"
  ON sessions FOR ALL USING (pt_id = auth.uid());

DROP POLICY IF EXISTS "Client can view own sessions" ON sessions;
CREATE POLICY "Client can view own sessions"
  ON sessions FOR SELECT USING (client_id = auth.uid());

-- ── exercises RLS ────────────────────────────────────────

DROP POLICY IF EXISTS "PT can manage exercises" ON exercises;
CREATE POLICY "PT can manage exercises"
  ON exercises FOR ALL
  USING (session_id IN (SELECT id FROM sessions WHERE pt_id = auth.uid()));

DROP POLICY IF EXISTS "Client can view own exercises" ON exercises;
CREATE POLICY "Client can view own exercises"
  ON exercises FOR SELECT
  USING (session_id IN (SELECT id FROM sessions WHERE client_id = auth.uid()));

-- ── progress_entries RLS ─────────────────────────────────

DROP POLICY IF EXISTS "PT can manage client progress entries" ON progress_entries;
CREATE POLICY "PT can manage client progress entries"
  ON progress_entries FOR ALL
  USING (client_id IN (SELECT user_id FROM client_profiles WHERE pt_id = auth.uid()));

DROP POLICY IF EXISTS "Client can manage own progress entries" ON progress_entries;
CREATE POLICY "Client can manage own progress entries"
  ON progress_entries FOR ALL USING (client_id = auth.uid());

-- ── progress_photos RLS ──────────────────────────────────

DROP POLICY IF EXISTS "PT can manage client progress photos" ON progress_photos;
CREATE POLICY "PT can manage client progress photos"
  ON progress_photos FOR ALL
  USING (client_id IN (SELECT user_id FROM client_profiles WHERE pt_id = auth.uid()));

DROP POLICY IF EXISTS "Client can manage own progress photos" ON progress_photos;
CREATE POLICY "Client can manage own progress photos"
  ON progress_photos FOR ALL USING (client_id = auth.uid());

-- ── bookings RLS ─────────────────────────────────────────

DROP POLICY IF EXISTS "PT can manage bookings" ON bookings;
CREATE POLICY "PT can manage bookings"
  ON bookings FOR ALL USING (pt_id = auth.uid());

DROP POLICY IF EXISTS "Client can view own bookings" ON bookings;
CREATE POLICY "Client can view own bookings"
  ON bookings FOR SELECT USING (client_id = auth.uid());

DROP POLICY IF EXISTS "Client can create bookings" ON bookings;
CREATE POLICY "Client can create bookings"
  ON bookings FOR INSERT
  WITH CHECK (
    client_id = auth.uid()
    AND pt_id = auth_user_pt_id()
  );

DROP POLICY IF EXISTS "Client can cancel own bookings" ON bookings;
CREATE POLICY "Client can cancel own bookings"
  ON bookings FOR UPDATE
  USING (client_id = auth.uid())
  WITH CHECK (status = 'cancelled');

-- ── availability RLS ─────────────────────────────────────

DROP POLICY IF EXISTS "PT can manage own availability" ON availability;
CREATE POLICY "PT can manage own availability"
  ON availability FOR ALL USING (pt_id = auth.uid());

DROP POLICY IF EXISTS "Clients can view PT availability" ON availability;
CREATE POLICY "Clients can view PT availability"
  ON availability FOR SELECT
  USING (pt_id = auth_user_pt_id());

-- ── invoices RLS ─────────────────────────────────────────

DROP POLICY IF EXISTS "PT can manage invoices" ON invoices;
CREATE POLICY "PT can manage invoices"
  ON invoices FOR ALL USING (pt_id = auth.uid());

DROP POLICY IF EXISTS "Client can view own invoices" ON invoices;
CREATE POLICY "Client can view own invoices"
  ON invoices FOR SELECT USING (client_id = auth.uid());

-- ── Auto-create profile on signup ────────────────────────

CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO profiles (id, role, full_name, email)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'role', 'client'),
    COALESCE(NEW.raw_user_meta_data->>'full_name', split_part(NEW.email, '@', 1)),
    NEW.email
  )
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- ── Storage Buckets ──────────────────────────────────────

INSERT INTO storage.buckets (id, name, public)
  VALUES ('avatars', 'avatars', true)
  ON CONFLICT (id) DO NOTHING;

INSERT INTO storage.buckets (id, name, public)
  VALUES ('progress-photos', 'progress-photos', false)
  ON CONFLICT (id) DO NOTHING;

-- Storage: avatars (public)
DROP POLICY IF EXISTS "Avatar images are publicly accessible" ON storage.objects;
CREATE POLICY "Avatar images are publicly accessible"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'avatars');

DROP POLICY IF EXISTS "Users can upload own avatar" ON storage.objects;
CREATE POLICY "Users can upload own avatar"
  ON storage.objects FOR INSERT
  WITH CHECK (bucket_id = 'avatars' AND auth.uid()::text = (storage.foldername(name))[1]);

DROP POLICY IF EXISTS "Users can update own avatar" ON storage.objects;
CREATE POLICY "Users can update own avatar"
  ON storage.objects FOR UPDATE
  USING (bucket_id = 'avatars' AND auth.uid()::text = (storage.foldername(name))[1]);

-- Storage: progress-photos (private, PT + client access)
DROP POLICY IF EXISTS "PT and client can view progress photos" ON storage.objects;
CREATE POLICY "PT and client can view progress photos"
  ON storage.objects FOR SELECT
  USING (
    bucket_id = 'progress-photos'
    AND (
      auth.uid()::text = (storage.foldername(name))[1]
      OR auth_user_role() = 'pt'
    )
  );

DROP POLICY IF EXISTS "Client can upload progress photos" ON storage.objects;
CREATE POLICY "Client can upload progress photos"
  ON storage.objects FOR INSERT
  WITH CHECK (
    bucket_id = 'progress-photos'
    AND auth.uid()::text = (storage.foldername(name))[1]
  );
