-- ==============================================================================
-- AeroLearn Database Migrations: Profiles, Documents, Topics, Hive, Reports
-- ==============================================================================
-- HOW TO RUN:
-- 1. Open your Supabase project → SQL Editor → paste this entire file → Run
-- 2. After running, go to: Project Settings → API → click "Reload Schema"
--    This refreshes PostgREST's schema cache so the new columns are visible.
-- ==============================================================================

-- 1. PROFILES Table (Extends auth.users via a profile table)
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    display_name TEXT,
    full_name TEXT,
    preferred_languages TEXT[] DEFAULT '{}',
    disabilities TEXT[] DEFAULT '{}',
    -- Srishti's accessibility preference columns (used by OnboardingForm.jsx + AccessibilityContext.js)
    dyslexia_friendly BOOLEAN DEFAULT FALSE,
    high_contrast BOOLEAN DEFAULT FALSE,
    sign_language_preference BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- IDEMPOTENT COLUMN ADDITIONS:
-- If the profiles table already existed (e.g. from a default Supabase setup)
-- without these columns, ADD COLUMN IF NOT EXISTS ensures they are added safely.
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS display_name TEXT;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS full_name TEXT;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS preferred_languages TEXT[] DEFAULT '{}';
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS disabilities TEXT[] DEFAULT '{}';
-- Srishti's accessibility columns (OnboardingForm.jsx + AccessibilityContext.js)
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS dyslexia_friendly BOOLEAN DEFAULT FALSE;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS high_contrast BOOLEAN DEFAULT FALSE;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS sign_language_preference BOOLEAN DEFAULT FALSE;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS created_at TIMESTAMPTZ DEFAULT NOW();
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT NOW();

-- Enable RLS on profiles
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY IF NOT EXISTS "Allow public read access to profiles"
    ON public.profiles FOR SELECT
    TO authenticated
    USING (true);

CREATE POLICY IF NOT EXISTS "Allow users to update own profile"
    ON public.profiles FOR UPDATE
    TO authenticated
    USING (auth.uid() = id)
    WITH CHECK (auth.uid() = id);

CREATE POLICY IF NOT EXISTS "Allow users to insert own profile"
    ON public.profiles FOR INSERT
    TO authenticated
    WITH CHECK (auth.uid() = id);


-- 2. DOCUMENTS Table
CREATE TABLE IF NOT EXISTS public.documents (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    owner_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    source_type TEXT NOT NULL CHECK (source_type IN ('upload', 'youtube')),
    source_url TEXT,
    original_lang TEXT NOT NULL DEFAULT 'en',
    target_lang TEXT NOT NULL DEFAULT 'en',
    status TEXT NOT NULL CHECK (status IN ('pending', 'extracting', 'translating', 'auditing', 'ready', 'failed')),
    raw_text TEXT,
    translated_text TEXT,
    audit_warnings JSONB,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Idempotent column additions for documents
ALTER TABLE public.documents ADD COLUMN IF NOT EXISTS source_url TEXT;
ALTER TABLE public.documents ADD COLUMN IF NOT EXISTS raw_text TEXT;
ALTER TABLE public.documents ADD COLUMN IF NOT EXISTS translated_text TEXT;
ALTER TABLE public.documents ADD COLUMN IF NOT EXISTS audit_warnings JSONB;

-- Enable RLS on documents
ALTER TABLE public.documents ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can manage their own documents" ON public.documents;
CREATE POLICY "Users can manage their own documents"
    ON public.documents FOR ALL
    TO authenticated
    USING (auth.uid() = owner_id)
    WITH CHECK (auth.uid() = owner_id);


-- 3. TOPICS Table
CREATE TABLE IF NOT EXISTS public.topics (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    document_id UUID REFERENCES public.documents(id) ON DELETE CASCADE,
    order_index INT NOT NULL,
    title TEXT NOT NULL,
    explanation TEXT NOT NULL,
    image_query TEXT,
    image_url TEXT,
    audio_path TEXT,
    sign_video_url TEXT
);

-- Idempotent column additions for topics
ALTER TABLE public.topics ADD COLUMN IF NOT EXISTS image_query TEXT;
ALTER TABLE public.topics ADD COLUMN IF NOT EXISTS image_url TEXT;
ALTER TABLE public.topics ADD COLUMN IF NOT EXISTS audio_path TEXT;
ALTER TABLE public.topics ADD COLUMN IF NOT EXISTS sign_video_url TEXT;

-- Enable RLS on topics
ALTER TABLE public.topics ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can access topics of accessible documents" ON public.topics;
CREATE POLICY "Users can access topics of accessible documents"
    ON public.topics FOR SELECT
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM public.documents d 
            WHERE d.id = topics.document_id 
            AND d.owner_id = auth.uid()
        )
    );

DROP POLICY IF EXISTS "Users can insert topics of own documents" ON public.topics;
CREATE POLICY "Users can insert topics of own documents"
    ON public.topics FOR INSERT
    TO authenticated
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.documents d
            WHERE d.id = topics.document_id
            AND d.owner_id = auth.uid()
        )
    );


-- 4. KNOWLEDGE HIVE NOTES Table
CREATE TABLE IF NOT EXISTS public.knowledge_hive_notes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    document_id UUID REFERENCES public.documents(id) ON DELETE CASCADE,
    uploader_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    visible_to_disabilities TEXT[] DEFAULT '{}',
    visible_to_languages TEXT[] DEFAULT '{}',
    upvotes INT DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Idempotent column additions for hive notes
ALTER TABLE public.knowledge_hive_notes ADD COLUMN IF NOT EXISTS visible_to_disabilities TEXT[] DEFAULT '{}';
ALTER TABLE public.knowledge_hive_notes ADD COLUMN IF NOT EXISTS visible_to_languages TEXT[] DEFAULT '{}';
ALTER TABLE public.knowledge_hive_notes ADD COLUMN IF NOT EXISTS upvotes INT DEFAULT 0;

-- Enable RLS on knowledge_hive_notes
ALTER TABLE public.knowledge_hive_notes ENABLE ROW LEVEL SECURITY;

-- Dynamic RLS Policy: row is visible if user's disabilities overlap visible_to_disabilities
-- OR user's preferred_languages overlap visible_to_languages.
-- Uses Postgres array overlap operator (&&) — enforced at DB level, not just application code.
DROP POLICY IF EXISTS "Dynamic RLS visibility check for shared notes" ON public.knowledge_hive_notes;
CREATE POLICY "Dynamic RLS visibility check for shared notes"
    ON public.knowledge_hive_notes FOR SELECT
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM public.profiles p 
            WHERE p.id = auth.uid()
            AND (
                p.disabilities && visible_to_disabilities 
                OR p.preferred_languages && visible_to_languages
            )
        )
    );

DROP POLICY IF EXISTS "Allow uploader to insert notes" ON public.knowledge_hive_notes;
CREATE POLICY "Allow uploader to insert notes"
    ON public.knowledge_hive_notes FOR INSERT
    TO authenticated
    WITH CHECK (auth.uid() = uploader_id);


-- 5. REPORTS Table (minimal moderation — see spec section 5.7)
CREATE TABLE IF NOT EXISTS public.reports (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    note_id UUID REFERENCES public.knowledge_hive_notes(id) ON DELETE CASCADE,
    reporter_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    reason TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS on reports
ALTER TABLE public.reports ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Allow users to file reports" ON public.reports;
CREATE POLICY "Allow users to file reports"
    ON public.reports FOR INSERT
    TO authenticated
    WITH CHECK (auth.uid() = reporter_id);

-- ==============================================================================
-- 6. EXTENDED PROFILE SYSTEM (Phase 1 Database Schema Updates)
-- ==============================================================================

-- 6.1 Extend public.profiles with additional settings
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS avatar_url TEXT NULL;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS bio TEXT NULL;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS reading_level_override TEXT NULL DEFAULT 'default';
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS preferred_voice_id TEXT NULL DEFAULT 'Xb7hH8MSUJpSbSDYk0k2';
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS narration_speed DOUBLE PRECISION DEFAULT 1.0;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS low_stimulus_mode BOOLEAN DEFAULT FALSE;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS text_size_scale DOUBLE PRECISION DEFAULT 1.0;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS knowledge_hive_visibility TEXT DEFAULT 'matched_groups';
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS onboarding_completed_at TIMESTAMPTZ NULL;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS goals TEXT[] DEFAULT '{}';

-- 6.2 Supporting table: profile_privacy_settings
CREATE TABLE IF NOT EXISTS public.profile_privacy_settings (
    user_id UUID PRIMARY KEY REFERENCES public.profiles(id) ON DELETE CASCADE,
    show_display_name_in_hive BOOLEAN DEFAULT TRUE,
    show_stats_publicly BOOLEAN DEFAULT FALSE,
    allow_peer_note_requests BOOLEAN DEFAULT TRUE
);

ALTER TABLE public.profile_privacy_settings ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Allow select privacy settings" ON public.profile_privacy_settings;
CREATE POLICY "Allow select privacy settings"
    ON public.profile_privacy_settings FOR SELECT
    TO authenticated
    USING (true);

DROP POLICY IF EXISTS "Allow users to update own privacy settings" ON public.profile_privacy_settings;
CREATE POLICY "Allow users to update own privacy settings"
    ON public.profile_privacy_settings FOR UPDATE
    TO authenticated
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Allow users to insert own privacy settings" ON public.profile_privacy_settings;
CREATE POLICY "Allow users to insert own privacy settings"
    ON public.profile_privacy_settings FOR INSERT
    TO authenticated
    WITH CHECK (auth.uid() = user_id);

-- 6.3 Supporting table: profile_stats
CREATE TABLE IF NOT EXISTS public.profile_stats (
    user_id UUID PRIMARY KEY REFERENCES public.profiles(id) ON DELETE CASCADE,
    documents_processed INT DEFAULT 0,
    topics_completed INT DEFAULT 0,
    notes_shared INT DEFAULT 0,
    notes_helped_count INT DEFAULT 0,
    languages_used TEXT[] DEFAULT '{}',
    current_streak_days INT DEFAULT 0,
    longest_streak_days INT DEFAULT 0,
    last_active_date DATE DEFAULT CURRENT_DATE
);

ALTER TABLE public.profile_stats ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Allow select profile_stats" ON public.profile_stats;
CREATE POLICY "Allow select profile_stats"
    ON public.profile_stats FOR SELECT
    TO authenticated
    USING (
        auth.uid() = user_id 
        OR EXISTS (
            SELECT 1 FROM public.profile_privacy_settings pps 
            WHERE pps.user_id = profile_stats.user_id 
            AND pps.show_stats_publicly = true
        )
    );

DROP POLICY IF EXISTS "Allow users to update own profile_stats" ON public.profile_stats;
CREATE POLICY "Allow users to update own profile_stats"
    ON public.profile_stats FOR UPDATE
    TO authenticated
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Allow users to insert own profile_stats" ON public.profile_stats;
CREATE POLICY "Allow users to insert own profile_stats"
    ON public.profile_stats FOR INSERT
    TO authenticated
    WITH CHECK (auth.uid() = user_id);

-- 6.4 Supporting table: linked_devices
CREATE TABLE IF NOT EXISTS public.linked_devices (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    device_label TEXT NOT NULL,
    last_active TIMESTAMPTZ DEFAULT NOW(),
    is_current BOOLEAN DEFAULT FALSE
);

ALTER TABLE public.linked_devices ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Allow users to manage own linked_devices" ON public.linked_devices;
CREATE POLICY "Allow users to manage own linked_devices"
    ON public.linked_devices FOR ALL
    TO authenticated
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

-- 6.5 Modify Knowledge Hive notes table to prevent cascade delete of notes on profile deletion
ALTER TABLE public.knowledge_hive_notes DROP CONSTRAINT IF EXISTS knowledge_hive_notes_uploader_id_fkey;
ALTER TABLE public.knowledge_hive_notes 
  ADD CONSTRAINT knowledge_hive_notes_uploader_id_fkey 
  FOREIGN KEY (uploader_id) REFERENCES public.profiles(id) ON DELETE SET NULL;

-- 6.6 Triggers to keep profile stats and privacy defaults synchronized

-- A. Auto-create stats and privacy rows for new profiles
CREATE OR REPLACE FUNCTION public.handle_new_profile()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profile_stats (user_id, documents_processed, topics_completed, notes_shared, notes_helped_count, languages_used, current_streak_days, longest_streak_days)
  VALUES (new.id, 0, 0, 0, 0, '{}', 0, 0)
  ON CONFLICT (user_id) DO NOTHING;

  INSERT INTO public.profile_privacy_settings (user_id, show_display_name_in_hive, show_stats_publicly, allow_peer_note_requests)
  VALUES (new.id, true, false, true)
  ON CONFLICT (user_id) DO NOTHING;

  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_profile_created ON public.profiles;
CREATE TRIGGER on_profile_created
  AFTER INSERT ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_profile();

-- Seed existing profiles into new tables for backward compatibility
INSERT INTO public.profile_privacy_settings (user_id)
SELECT id FROM public.profiles
ON CONFLICT (user_id) DO NOTHING;

INSERT INTO public.profile_stats (user_id)
SELECT id FROM public.profiles
ON CONFLICT (user_id) DO NOTHING;

-- B. Update stats on Knowledge Hive events (Note creation, deletion, or upvote updates)
CREATE OR REPLACE FUNCTION public.handle_hive_note_changes()
RETURNS TRIGGER AS $$
DECLARE
  v_uploader_id UUID;
  v_upvotes_diff INT;
BEGIN
  IF TG_OP = 'INSERT' THEN
    IF new.uploader_id IS NOT NULL THEN
      UPDATE public.profile_stats
      SET notes_shared = notes_shared + 1
      WHERE user_id = new.uploader_id;
    END IF;
    
  ELSIF TG_OP = 'UPDATE' THEN
    IF new.uploader_id IS NOT NULL AND old.upvotes IS DISTINCT FROM new.upvotes THEN
      v_upvotes_diff := new.upvotes - COALESCE(old.upvotes, 0);
      
      UPDATE public.profile_stats
      SET notes_helped_count = notes_helped_count + v_upvotes_diff
      WHERE user_id = new.uploader_id;
    END IF;
    
  ELSIF TG_OP = 'DELETE' THEN
    IF old.uploader_id IS NOT NULL THEN
      UPDATE public.profile_stats
      SET notes_shared = GREATEST(0, notes_shared - 1),
          notes_helped_count = GREATEST(0, notes_helped_count - COALESCE(old.upvotes, 0))
      WHERE user_id = old.uploader_id;
    END IF;
  END IF;
  
  RETURN NULL;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_hive_note_changed ON public.knowledge_hive_notes;
CREATE TRIGGER on_hive_note_changed
  AFTER INSERT OR UPDATE OR DELETE ON public.knowledge_hive_notes
  FOR EACH ROW EXECUTE FUNCTION public.handle_hive_note_changes();

-- C. Update stats when a document status changes to 'ready'
CREATE OR REPLACE FUNCTION public.handle_document_status_changes()
RETURNS TRIGGER AS $$
BEGIN
  IF (old.status IS DISTINCT FROM new.status AND new.status = 'ready') THEN
    UPDATE public.profile_stats
    SET documents_processed = documents_processed + 1,
        languages_used = ARRAY(
          SELECT DISTINCT x
          FROM unnest(array_append(languages_used, new.target_lang)) AS x
        )
    WHERE user_id = new.owner_id;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_document_ready ON public.documents;
CREATE TRIGGER on_document_ready
  AFTER UPDATE OF status ON public.documents
  FOR EACH ROW EXECUTE FUNCTION public.handle_document_status_changes();

