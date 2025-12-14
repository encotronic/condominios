-- backend/migrations/002_announcements_consolidated.sql
-- Consolidated migration for Announcements
-- 1) Ensure uuid extension (uuid_generate_v4)
-- 2) Create/adjust table `announcements` using `condominium_id`
-- 3) Create `announcement_targets` (flexible JSON targets)
-- 4) Create `announcement_reads`
-- 5) Add useful indexes
-- Run with: psql -d <your_db> -f backend/migrations/002_announcements_consolidated.sql

BEGIN;

-- 0) Ensure extension for uuid_generate_v4() is available.
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1) Create announcements table if not present.
CREATE TABLE IF NOT EXISTS announcements (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title TEXT NOT NULL,
    content TEXT,
    author_id UUID,
    condominium_id UUID NOT NULL,
    published_at TIMESTAMPTZ,
    expires_at TIMESTAMPTZ,
    pinned BOOLEAN DEFAULT FALSE,
    metadata JSONB DEFAULT '{}'::jsonb,
    status TEXT DEFAULT 'PUBLISHED',
    visibility TEXT DEFAULT 'BUILDING',
    start_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- 2) If an existing announcements table used `tenant_id`, rename it to `condominium_id`.
DO $$
BEGIN
    IF EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_schema = 'public' AND table_name = 'announcements' AND column_name = 'tenant_id'
    ) THEN
        RAISE NOTICE 'Renaming column public.announcements.tenant_id -> condominium_id';
        ALTER TABLE public.announcements RENAME COLUMN tenant_id TO condominium_id;
    END IF;
END$$;

-- 3) Create announcement_targets for flexible targeting (unit, building, role, user, or "all")
CREATE TABLE IF NOT EXISTS announcement_targets (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    announcement_id UUID NOT NULL REFERENCES announcements(id) ON DELETE CASCADE,
    target JSONB NOT NULL,
    condominium_id UUID NOT NULL,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- 4) Create announcement_reads to track which users acknowledged/read an announcement
CREATE TABLE IF NOT EXISTS announcement_reads (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    announcement_id UUID NOT NULL REFERENCES announcements(id) ON DELETE CASCADE,
    user_id UUID NOT NULL,
    condominium_id UUID NOT NULL,
    read_at TIMESTAMPTZ DEFAULT now(),
    CONSTRAINT uniq_announcement_user UNIQUE (announcement_id, user_id)
);

-- 5) Indexes to speed common queries
CREATE INDEX IF NOT EXISTS idx_announcements_condominium ON announcements (condominium_id);
CREATE INDEX IF NOT EXISTS idx_announcements_published_at ON announcements (published_at);
CREATE INDEX IF NOT EXISTS idx_targets_announcement ON announcement_targets (announcement_id);
CREATE INDEX IF NOT EXISTS idx_targets_condominium ON announcement_targets (condominium_id);
CREATE INDEX IF NOT EXISTS idx_reads_announcement_user ON announcement_reads (announcement_id, user_id);

COMMIT;

-- NOTES:
-- - Backup first. `CREATE EXTENSION` may require superuser.
-- - The DO block renames tenant_id -> condominium_id if present.
-- - The backend code must be updated to use `condominium_id`.
