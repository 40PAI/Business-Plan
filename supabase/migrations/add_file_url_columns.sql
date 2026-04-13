-- Migration: Add dedicated file URL columns to projects table
-- Run this in the Supabase SQL Editor (Dashboard > SQL Editor)

ALTER TABLE projects
  ADD COLUMN IF NOT EXISTS logo_url      TEXT DEFAULT NULL,
  ADD COLUMN IF NOT EXISTS plan_doc_url  TEXT DEFAULT NULL,
  ADD COLUMN IF NOT EXISTS plan_html_url TEXT DEFAULT NULL,
  ADD COLUMN IF NOT EXISTS pitch_url     TEXT DEFAULT NULL;

-- Backfill logo_url from existing artifacts JSONB for projects already generated
UPDATE projects
SET logo_url = artifacts->'logo'->'urls'->0
WHERE logo_url IS NULL
  AND artifacts->'logo'->'urls'->0 IS NOT NULL;

-- Optional: add an index for quick lookups by logo/plan presence
CREATE INDEX IF NOT EXISTS idx_projects_logo_url    ON projects (logo_url)     WHERE logo_url IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_projects_plan_doc_url ON projects (plan_doc_url) WHERE plan_doc_url IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_projects_pitch_url   ON projects (pitch_url)    WHERE pitch_url IS NOT NULL;
