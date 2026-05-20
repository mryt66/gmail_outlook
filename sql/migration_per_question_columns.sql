-- Migration: replace answers jsonb with per-question columns
alter table public.survey_responses drop column answers;

alter table public.survey_responses add column q1_gmail int;
alter table public.survey_responses add column q1_outlook int;
alter table public.survey_responses add column q2_gmail int;
alter table public.survey_responses add column q2_outlook int;
alter table public.survey_responses add column q3_gmail int;
alter table public.survey_responses add column q3_outlook int;
alter table public.survey_responses add column q4_gmail int;
alter table public.survey_responses add column q4_outlook int;
alter table public.survey_responses add column q5_gmail int;
alter table public.survey_responses add column q5_outlook int;
alter table public.survey_responses add column q6_gmail int;
alter table public.survey_responses add column q6_outlook int;
alter table public.survey_responses add column q7_gmail int;
alter table public.survey_responses add column q7_outlook int;
alter table public.survey_responses add column q8_gmail int;
alter table public.survey_responses add column q8_outlook int;
