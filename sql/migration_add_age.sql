-- Migration: Add age column to survey_responses
-- Run this in Supabase SQL Editor or via API

ALTER TABLE public.survey_responses
  ADD COLUMN IF NOT EXISTS age int NOT NULL DEFAULT 0;

ALTER TABLE public.survey_responses
  ADD CONSTRAINT survey_responses_age_check
  CHECK (age >= 10 AND age <= 100);
