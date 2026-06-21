-- Seed: Remove old data and insert new test data
-- Distribution: 15 complete, 3 half (Q1-Q4), 4 partial (Q1-Q3)
-- Age groups: 15-25, 26-35, 36-44, 45-60

DELETE FROM public.survey_responses;

INSERT INTO public.survey_responses (participant_name, age, experience_level, overall_preference, overall_comment, q1_gmail, q1_outlook, q2_gmail, q2_outlook, q3_gmail, q3_outlook, q4_gmail, q4_outlook, q5_gmail, q5_outlook, q6_gmail, q6_outlook, q7_gmail, q7_outlook, q8_gmail, q8_outlook) VALUES

-- === 15 COMPLETE (Q1-Q8) ===
('kasia_92', 32, 'sredniozaawansowany', 'outlook', '', 6, 7, 5, 9, 4, 8, 6, 8, 6, 7, 5, 7, 6, 9, 4, 7),
('piotrM', 28, 'poczatkujacy', 'gmail', 'Outlook męczy mnie wolnym działaniem.', 9, 7, 6, 4, 7, 4, 9, 5, 5, 5, 6, 3, 6, 4, 8, 6),
('ania_w', 35, 'sredniozaawansowany', 'gmail', '', 9, 5, 7, 5, 7, 5, 5, 9, 7, 4, 7, 3, 8, 4, 9, 6),
('marek_z', 45, 'zaawansowany', 'gmail', 'Outlook lepszy do pracy biurowej.', 8, 7, 7, 7, 8, 5, 8, 9, 7, 5, 5, 7, 6, 4, 7, 6),
('zosia_x', 26, 'sredniozaawansowany', 'outlook', 'Gmail jest bardziej intuicyjny.', 4, 8, 5, 7, 5, 5, 8, 7, 4, 7, 3, 5, 4, 7, 4, 8),
('tomek88', 38, 'zaawansowany', 'gmail', 'Gmail jest bardziej intuicyjny.', 10, 9, 7, 3, 9, 5, 9, 7, 8, 5, 6, 5, 9, 6, 8, 5),
('ewelina', 19, 'poczatkujacy', 'gmail', 'Gmail wygrywa prostotą.', 9, 6, 8, 6, 9, 6, 7, 5, 6, 6, 7, 4, 5, 6, 8, 5),
('kuba_p', 29, 'sredniozaawansowany', 'gmail', 'Outlook lepszy do pracy biurowej.', 8, 5, 8, 7, 7, 6, 8, 9, 5, 7, 4, 8, 10, 9, 10, 9),
('martyna_r', 22, 'poczatkujacy', 'gmail', 'Po dłuższym użytkowaniu nie widzę dużej różnicy.', 10, 7, 6, 5, 7, 6, 9, 6, 8, 6, 9, 6, 9, 5, 9, 6),
('lukasz_b', 41, 'zaawansowany', 'gmail', 'Outlook lepszy do pracy biurowej.', 7, 4, 7, 7, 7, 4, 7, 6, 7, 4, 10, 9, 4, 7, 8, 5),
('natalia_s', 55, 'zaawansowany', 'outlook', '', 7, 7, 8, 7, 8, 9, 7, 10, 4, 7, 3, 9, 6, 9, 5, 8),
('adam_m', 24, 'poczatkujacy', 'outlook', '', 3, 7, 6, 7, 7, 5, 2, 6, 4, 7, 6, 8, 7, 6, 7, 5),
('ola_w', 37, 'sredniozaawansowany', 'outlook', 'Wolę Gmail, ale Outlook ma lepszy kalendarz.', 6, 5, 7, 7, 7, 10, 5, 9, 5, 9, 7, 9, 6, 6, 6, 6),
('grzesiek_k', 58, 'zaawansowany', 'outlook', 'Obie platformy są podobne, ale Gmail wygrywa szybkością.', 6, 9, 5, 7, 4, 6, 2, 5, 7, 7, 7, 9, 4, 6, 4, 8),
('patrycja_t', 44, 'zaawansowany', 'gmail', 'Gmail jest bardziej intuicyjny.', 7, 4, 7, 8, 7, 4, 7, 7, 7, 6, 8, 7, 9, 5, 9, 7),

-- === 3 HALF (Q1-Q4 only) ===
('michal_m', 18, 'brak', 'gmail', 'Łatwiejszy w obsłudze.', 7, 5, 7, 4, 6, 5, 6, 8, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL),
('aga_f', 48, 'zaawansowany', 'outlook', 'Przyzwyczajenie do Outlooka.', 5, 8, 5, 8, 4, 7, 5, 9, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL),
('rafal_d', 52, 'sredniozaawansowany', 'gmail', 'Gmail ma lepsze wyszukiwanie.', 7, 4, 5, 7, 8, 6, 7, 6, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL),

-- === 4 PARTIAL (Q1-Q3 only) ===
('dorota_c', 39, 'sredniozaawansowany', 'outlook', 'Outlook lepszy do pracy biurowej.', 3, 6, 5, 8, 5, 7, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL),
('bartek_j', 16, 'poczatkujacy', 'gmail', 'Gmail prostszy dla młodych.', 7, 4, 8, 5, 8, 4, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL),
('szymon_h', 25, 'poczatkujacy', 'gmail', 'Trudno ocenić po krótkim teście.', 7, 5, 8, 4, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL),
('weronika_k', 47, 'zaawansowany', 'outlook', 'Outlook stabilniejszy.', 4, 8, 3, 9, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL);
