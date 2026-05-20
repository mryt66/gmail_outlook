create extension if not exists pgcrypto;

create table if not exists public.survey_responses (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  participant_name text,
  experience_level text not null,
  q1_gmail int,
  q1_outlook int,
  q2_gmail int,
  q2_outlook int,
  q3_gmail int,
  q3_outlook int,
  q4_gmail int,
  q4_outlook int,
  q5_gmail int,
  q5_outlook int,
  q6_gmail int,
  q6_outlook int,
  q7_gmail int,
  q7_outlook int,
  q8_gmail int,
  q8_outlook int,
  overall_preference text not null check (overall_preference in ('gmail', 'outlook', 'remis')),
  overall_comment text
);

alter table public.survey_responses enable row level security;

create policy "insert_response" on public.survey_responses
for insert
to anon
with check (true);

create policy "read_responses" on public.survey_responses
for select
to anon
using (true);
