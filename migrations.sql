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
