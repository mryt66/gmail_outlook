# Metodologia i wyniki badania: Ankieta UX — Gmail vs Outlook

Badanie porównawcze interakcji użytkownika na platformach Gmail i Outlook.

---

## 1. Określenie wzorcowych elementów interakcji dla badanej klasy rozwiązań/aplikacji

### Charakterystyka badanej klasy

Badana klasa obejmuje **webowe klienty pocztowe** — aplikacje umożliwiające zarządzanie korespondencją elektroniczną poprzez przeglądarkę internetową. Kluczowe elementy interakcji w tej klasie to:

- **Nawigacja** — struktura widoków, hierarchia folderów/etykiet, czytelność menu
- **Zarządzanie treścią** — tworzenie, edycja, usuwanie wiadomości
- **Wyszukiwanie** — lokalizacja konkretnych wiadomości wśród large zbiorów
- **Organizacja** — etykiety, foldery, archiwizacja, masowe operacje
- **Informacja zwrotna** — komunikaty o stanie akcji (wysłano, zapisano, błąd)
- **Wydajność** — czas odpowiedzi interfejsu na akcje użytkownika

### Zdefiniowane kryteria oceny

Na podstawie analizy literatury z zakresu UX (Nielsen, Tognazzini) oraz specyfiki klientów pocztowych zdefiniowano **8 kryteriów oceny**:

| Nr  | Kryterium | Opis | Powiązanie z elementami interakcji |
|-----|-----------|------|-------------------------------------|
| Q1  | Łatwość rozpoczęcia pracy | Jak szybko i intuicyjnie da się rozpocząć realizację zadania po wejściu do interfejsu | Onboarding, pierwsze wrażenie |
| Q2  | Czytelność nawigacji i układu | Czy struktura widoków, etykiety i rozmieszczenie elementów prowadzą użytkownika bez zgadywania | Struktura informacyjna, hierarchy |
| Q3  | Wyszukiwanie i filtrowanie wiadomości | Precyzja wyników, łatwość użycia filtrów oraz czas dojścia do właściwej wiadomości | Wyszukiwanie, filtry |
| Q4  | Tworzenie i edycja wiadomości | Komfort pisania, formatowania, dodawania odbiorców i załączników oraz poprawiania treści | Edycja treści, załączniki |
| Q5  | Zarządzanie skrzynką | Działania na wiadomościach: oznaczanie, przenoszenie, archiwizacja, etykiety/foldery, masowe operacje | Organizacja, operacje masowe |
| Q6  | Widoczność statusu i informacji zwrotnej | Czy system jasno komunikuje wynik akcji: wysłano, zapisano, błąd, synchronizacja itp. | Feedback systemowy |
| Q7  | Wydajność i szybkość interakcji | Responsywność interfejsu i płynność podczas realizacji typowych zadań | Performance, UX techniczny |
| Q8  | Ogólna satysfakcja z doświadczenia | Całościowe odczucie pracy z platformą po wykonaniu wszystkich zadań testowych | Synteza doświadczenia |

### Schemat pomiaru

Każde kryterium oceniane jest **niezależnie dla każdej platformy** (Gmail i Outlook) w skali 1–10, gdzie:
- **1** — bardzo słabo
- **5** — neutralnie
- **10** — bardzo dobrze

Dodatkowo respondent wskazuje **ogólną preferencję** (Gmail / Outlook / Remis).

---

## 2. Przegląd potencjalnych rozwiązań — kandydatów do ewaluacji

### Wybrane platformy

Do badania wybrano dwie wiodące platformy pocztowe:

| Cecha | Gmail (Google Workspace) | Outlook (Microsoft 365) |
|-------|--------------------------|------------------------|
| Rynek | Dominujący na rynku konsumenckim | Popularny w środowisku korporacyjnym |
| Interfejs webowy | Material Design, minimalistyczny | Fluent UI, zintegrowany z pakietem Office |
| Darmowa wersja | Tak (15 GB) | Tak (15 GB) |
| Integracje | Google Drive, Kalendarz, Meet | OneDrive, Kalendarz, Teams |
| Mobilność | Aplikacja Gmail (iOS/Android) | Aplikacja Outlook (iOS/Android) |

### Kryteria wyboru

Platformy wybrano na podstawie:
1. **Popularności** — obie mają setki milionów użytkowników na świecie
2. **Dostępności webowej** — obie oferują pełną funkcjonalność w przeglądarce
3. **Różnorodności podejść** — Gmail (Google, Material Design) vs Outlook (Microsoft, Fluent UI) reprezentują odmienne filozofie projektowania interfejsów
4. **Dostępności** — minimalne wymagania sprzętowe, brak konieczności instalacji

### Ograniczenia wyboru

- Nie uwzględniono klientów desktopowych (Thunderbird, Apple Mail)
- Nie porównywano wersji mobilnych
- Nie badano integracji z zewnętrznymi narzędziami (CRM, task management)

---

## 3. Opracowanie schematu/metodologii badań

### Sposób pomiaru

| Element pomiaru | Format | Opis |
|-----------------|--------|------|
| Ocena kryteriów | Skala 1–10 (Gmail + Outlook) | 8 kryteriów × 2 platformy = 16 ocen na respondenta |
| Preferencja końcowa | Wybór: Gmail / Outlook / Remis | Po wykonaniu wszystkich zadań |
| Wiek respondenta | Liczba całkowita (10–100) | Do analizy wg grup wiekowych |
| Pseudonim | Tekst (opcjonalny) | Identyfikacja respondenta |
| Komentarz | Tekst (opcjonalny) | Uwagi i spostrzeżenia |

### Grupy wiekowe

Badanie uwzględnia podział na 4 grupy wiekowe:

| Grupa | Zakres | Liczba respondentów |
|-------|--------|---------------------|
| Młodzi | 15–25 | 14 |
| Średniozaawansowani | 26–35 | 2 |
| Dojrzali | 36–44 | 1 |
| Doświadczeni | 45–60 | 1 |

### Narzędzia

1. **Aplikacja webowa** (HTML/CSS/JS)
   - Formularz ankiety z dynamiczną skalą punktową
   - Zapis danych do bazy **Supabase** (PostgreSQL) via REST API
   - Row Level Security (RLS): anonimowy zapis i odczyt
   - Informacja o konieczności zwracania uwagi na czas wykonania zadania

2. **Panel analizy** (Chart.js)
   - Wykresy porównawcze w czasie rzeczywistym
   - Analiza wg grup wiekowych
   - Kompletność odpowiedzi

3. **Skrypt generujący wykresy** (Python / matplotlib)
   - Eksport PNG do folderu `charts/`
   - Automatyczne pobieranie danych z Supabase

### Przebieg badania

1. Uczestnik otwiera ankietę pod adresem URL aplikacji
2. Zapoznaje się z informacją o zwracaniu uwagi na czas wykonania zadania
3. Podaje wiek (wymagany) i opcjonalnie pseudonim
4. Na obu platformach (Gmail i Outlook) wykonuje zestaw typowych zadań:
   - Wyszukanie konkretnej wiadomości
   - Utworzenie nowej wiadomości z załącznikiem
   - Oznaczenie/przeniesienie wiadomości
   - Sprawdzenie statusu wysyłki
5. Po zakończeniu zadań na obu platformach wypełnia ankietę, oceniająceach kryterium
6. Na końcu wskazuje ogólną preferencję platformy
7. Klika "Zapisz odpowiedzi" — dane trafiają do bazy

### Liczba prób i testerów

| Parametr | Wartość |
|----------|---------|
| Liczba kryteriów | 8 (×2 platformy = 16 ocen) |
| Liczba respondentów | 18 |
| Rozkład kompletności | 12 pełnych, 2 w połowie, 4 częściowe |
| Liczba prób na respondenta | 1 pełna ankieta (lub częściowa) |
| Grupa wiekowa dominująca | 15–25 lat (78% respondentów) |

### Kompletność danych

| Kategoria | Liczba | Opis |
|-----------|--------|------|
| Pełne (8 pytań) | 12 | Respondent ocenił wszystkie kryteria |
| Połowa (4–7 pytań) | 2 | Częściowa ocena |
| Częściowe (1–3 pytania) | 4 | Minimalna liczba ocen |

---

## 6. Wnioski i propozycje modyfikacji/poprawek/ulepszeń

### 6.1. Wnioski ogólne

#### Dominacja Gmaila

**Gmail uzyskuje wyższe średnie oceny w 7 z 8 kryteriach:**

| Kryterium | Gmail | Outlook | Przewaga |
|-----------|-------|---------|----------|
| Q1: Łatwość rozpoczęcia pracy | 7.00 | 6.06 | Gmail +0.94 |
| Q2: Czytelność nawigacji | 6.56 | 6.11 | Gmail +0.45 |
| Q3: Wyszukiwanie i filtrowanie | 6.76 | 5.59 | Gmail +1.17 |
| Q5: Zarządzanie skrzynką | 6.17 | 5.92 | Gmail +0.25 |
| Q6: Widoczność statusu | 6.50 | 6.17 | Gmail +0.33 |
| Q7: Wydajność i szybkość | 6.75 | 6.17 | Gmail +0.58 |
| Q8: Ogólna satysfakcja | 7.33 | 6.42 | Gmail +0.91 |

**Outlook wygrywa w 1 kryterium:**
| Kryterium | Gmail | Outlook | Przewaga |
|-----------|-------|---------|----------|
| Q4: Tworzenie i edycja wiadomości | 6.57 | 6.71 | Outlook +0.14 |

#### Rozkład preferencji końcowych

```
Gmail:   12 (66.7%)
Outlook:  6 (33.3%)
Remis:    0 ( 0.0%)
```

**Dwie trzecie respondentów wskazuje Gmail jako lepszą platformę.** Żaden respondent nie wskazał remisu, co sugeruje wyraźne preferencje.

#### Największe różnice

1. **Wyszukiwanie (Q3):** Gmail +1.17 — największa przewaga; respondenci doceniają precyzję i szybkość wyszukiwania Google
2. **Łatwość rozpoczęcia (Q1):** Gmail +0.94 — interfejs Gmail jest postrzegany jako bardziej intuicyjny
3. **Ogólna satysfakcja (Q8):** Gmail +0.91 — całościowe doświadczenie jest lepiej oceniane

#### Miejsca przewagi Outlooka

**Tworzenie i edycja wiadomości (Q4):** Outlook +0.14 — niewielka, ale jedyna przewaga. Może wynikać z bogatszego edytora formatowania (HTML, szablony) oraz integracji z pakietem Office.

### 6.2. Wnioski z komentarzy respondentów

Najczęściej pojawiające się motywy:

| Motyw | Liczba wzmianek | Przykładowe wypowiedzi |
|-------|-----------------|------------------------|
| Gmail intuicyjny/prosty | 5 | "Gmail jest bardziej intuicyjny", "Gmail wygrywa prostotą" |
| Outlook do pracy biurowej | 4 | "Outlook lepszy do pracy biurowej" |
| Outlook wolny | 1 | "Outlook męczy mnie wolnym działaniem" |
| Gmail lepsze wyszukiwanie | 1 | "Gmail ma lepsze wyszukiwanie" |
| Brak dużej różnicy | 1 | "Po dłuższym użytkowaniu nie widzę dużej różnicy" |

**Kluczowy wniosek:** Gmail jest postrzegany jako prostszy i bardziej intuicyjny, podczas gdy Outlook jest kojarzony z pracą biurową (kalendarz, integracja z Office).

### 6.3. Rekomendacje dla Gmail

Na podstawie danych, w których Outlook przewyższa Gmail:

1. **Edycja wiadomości (Q4):** Outlook ma lepszy edytor — Gmail powinien rozważyć:
   - Dodanie zaawansowanego formatowania HTML
   - Wprowadzenie szablonów wiadomości
   - Lepszą integrację z edytorami tekstu

2. **Zarządzanie skrzynką (Q5):** Przewaga Gmaila jest niewielka (+0.25) — warto:
   - Ulepszyć masowe operacje (oznaczanie, przenoszenie)
   - Dodać inteligentne foldery/widoki

### 6.4. Rekomendacje dla Outlooka

Outlook przegrywa w 7 z 8 kryteriów — priorytowe obszary ulepszeń:

1. **Wyszukiwanie (Q3):** Outlook przegrywa najbardziej (5.59 vs 6.76)
   - Wdrożenie pełnotekstowego wyszukiwania z operatorami logicznymi
   - Lepsze filtrowanie i sortowanie wyników

2. **Łatwość rozpoczęcia pracy (Q1):** Interfejs jest mniej intuicyjny
   - Uproszczenie domyślnego widoku
   - Redukcja liczby elementów na ekranie
   - Lepszy onboarding dla nowych użytkowników

3. **Wydajność (Q7):** Outlook jest postrzegany jako wolniejszy
   - Optymalizacja ładowania interfejsu
   - Redukcja opóźnień przy przełączaniu między widokami
   - Caching częściej używanych danych

4. **Ogólna satysfakcja (Q8):** Niska ocena (6.42) wynika z kumulacji problemów
   - Kompleksowy redesign interfejsu z naciskiem na prostotę

### 6.5. Propozycje dalszych badań

1. **Badanie z podziałem na grupy zaawansowania** — obecnie `experience_level` nie jest zbierany w formularzu; warto dodać pole (początkujący/średniozaawansowany/zaawansowany) i analizować wyniki wg doświadczenia

2. **Pomiary czasu wykonania zadań** — uzupełnienie ocen subiektywnych o obiektywne pomiary czasu (np. "ile czasu zajęło znalezienie wiadomości X?")

3. **Testy A/B konkretnych zmian** — po identyfikacji słabych punktów, testowanie konkretnych modyfikacji interfejsu na reprezentatywnej grupie

4. **Większa próba** — zwiększenie liczby respondentów do min. 30–50 osób w celu uzyskania bardziej miarodajnych statystyk, zwłaszcza w grupach 26–35, 36–44 i 45–60

5. **Badanie longitudinalne** — śledzenie zmian ocen w czasie (przed i po redesignie interfejsu)

---

## Wykresy

Wszystkie wykresy zostały wygenerowane do folderu `charts/`:

| Plik | Opis |
|------|------|
| `01_comparison.png` | Porównanie średnich ocen Gmail vs Outlook (wszystkie kryteria) |
| `02_per_question.png` | Średnie ocen per pytanie (8 oddzielnych wykresów) |
| `03_preference.png` | Rozkład preferencji końcowej (bar + doughnut) |
| `04_age_distribution.png` | Histogram rozkładu wieku respondentów |
| `05_age_comparison.png` | Średnie ocen Gmail vs Outlook wg grupy wiekowej |
| `06_age_preference.png` | Preferencja końcowa wg grupy wiekowej (stacked bar) |
| `07_completeness.png` | Kompletność odpowiedzi (pełne/połowa/częściowe) |

Wygenerowanie wykresów: `python3 charts/generate.py`

---

## Struktura projektu

```
gmail_outlook/
├── src/                        # Aplikacja webowa
│   ├── ankieta.html            # Formularz ankiety
│   ├── analiza.html            # Panel analizy (wykresy)
│   ├── app.js                  # Logika formularza
│   ├── analysis.js             # Logika wykresów (Chart.js)
│   ├── styles.css              # Style CSS
│   ├── config.js               # Konfiguracja Supabase
│   └── config.example.js       # Przykład konfiguracji
├── charts/                     # Wykresy PNG (generowane)
│   ├── generate.py             # Skrypt generujący wykresy
│   └── *.png                   # Wygenerowane wykresy
├── sql/                        # Baza danych
│   ├── supabase_schema.sql     # Schemat tabeli
│   ├── migration_add_age.sql   # Migracja: kolumna age
│   └── seed_test_data.sql      # Dane testowe
├── scripts/                    # Narzędzia build
│   ├── build.mjs
│   └── generate-config.mjs
├── .env                        # Konfiguracja Supabase (gitignored)
├── plan.md                     # Ten plik
├── pyproject.toml              # Zależności Python
└── package.json                # Zależności Node.js
```
