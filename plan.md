# Metodologia badania: Ankieta UX — Gmail vs Outlook

Badanie porównawcze interakcji użytkownika na platformach Gmail i Outlook.

---

## 1. Określenie wzorcowych elementów interakcji dla badanej klasy rozwiązań/aplikacji

Zdefiniowano 8 kluczowych kryteriów oceny interfejsu klienta pocztowego:

| Nr  | Kryterium | Opis |
|-----|-----------|------|
| Q1  | Łatwość rozpoczęcia pracy | Jak szybko i intuicyjnie da się rozpocząć realizację zadania po wejściu do interfejsu |
| Q2  | Czytelność nawigacji i układu | Czy struktura widoków, etykiety i rozmieszczenie elementów prowadzą użytkownika bez zgadywania |
| Q3  | Wyszukiwanie i filtrowanie wiadomości | Precyzja wyników, łatwość użycia filtrów oraz czas dojścia do właściwej wiadomości |
| Q4  | Tworzenie i edycja wiadomości | Komfort pisania, formatowania, dodawania odbiorców i załączników oraz poprawiania treści |
| Q5  | Zarządzanie skrzynką | Działania na wiadomościach: oznaczanie, przenoszenie, archiwizacja, etykiety/foldery, masowe operacje |
| Q6  | Widoczność statusu i informacji zwrotnej | Czy system jasno komunikuje wynik akcji: wysłano, zapisano, błąd, synchronizacja itp. |
| Q7  | Wydajność i szybkość interakcji | Responsywność interfejsu i płynność podczas realizacji typowych zadań |
| Q8  | Ogólna satysfakcja z doświadczenia | Całościowe odczucie pracy z platformą po wykonaniu wszystkich zadań testowych |

---

## 2. Przegląd potencjalnych rozwiązań — kandydatów do ewaluacji

Do badania wybrano dwie wiodące platformy pocztowe:

- **Gmail** (Google Workspace) — dominant na rynku konsumenckim,	intuicyjny interfejs webowy
- **Microsoft Outlook** (Web / Office 365) — popularny w środowisku korporacyjnym, zintegrowany z pakietem Office

Obie platformy są powszechnie dostępne w wersji webowej, co umożliwia porównanie przy minimalnych różnicach w dostępie sprzętowym.

---

## 3. Opracowanie schematu/metodologii badań

### Sposób pomiaru
- **Skala punktowa 1–10** dla każdego z 8 kryteriów, osobno dla Gmail i Outlook
- **Preferencja końcowa** — wybór jednej z trzech opcji: Gmail / Outlook / Remis
- **Opcjonalny pseudonim** respondenta (do ewentualnej identyfikacji duplikatów)

### Narzędzia
- Aplikacja webowa (ankieta HTML/CSS/JS) zapisująca odpowiedzi do bazy **Supabase** (PostgreSQL)
- Notebook Jupyter z bibliotekami `pandas`, `matplotlib` do analizy i wizualizacji danych

### Przebieg badania
1. Uczestnik wykonuje zestaw typowych zadań na **obu platformach** (w ustalonej kolejności)
2. Po zakończeniu zadań na każdej platformie wypełnia ankietę, oceniająceach kryterium
3. Na końcu wskazuje ogólną preferencję platformy

### Liczba prób i testerów
- **Liczba kryteriów**: 8 (×2 platformy = 16 ocen na respondenta)
- **Rekomendowana liczba respondentów**: min. 20–30 osób o zróżnicowanym poziomie zaawansowania (początkujący, średniozaawansowani, zaawansowani)
- **Liczba prób na respondenta**: 1 pełna ankieta (8 pytań × 2 platformy + preferencja końcowa)

### Grupa docelowa
- Użytkownicy o różnym poziomie zaawansowania technicznego
- Rekrutacja: otwarta (link do ankiety online)

---

## 4. Przeprowadzenie właściwej analizy jakościowej/ilościowej interakcji ✅

Dane zbierane są automatycznie przez aplikację webową i zapisywane w tabeli `survey_responses` w bazie Supabase.

**Struktura rekordu odpowiedzi:**
- `id` (UUID)
- `created_at` (timestamp)
- `participant_name` (text, opcjonalny)
- `experience_level` (text)
- `q1_gmail` ... `q8_outlook` (int, oceny 1–10)
- `overall_preference` (text: gmail / outlook / remis)
- `overall_comment` (text, opcjonalny)

**Polityki RLS:**
- Anonimowy zapis (INSERT) — Każdy może dodać odpowiedź
- Anonimowy odczyt (SELECT) — Każdy może odczytać dane (potrzebne do zakładki Analiza)

---

## 5. Wizualizacja i analiza wyników ✅

Zakładka **Analiza** w aplikacji webowej generuje wykresy w czasie rzeczywistym na podstawie danych z Supabase:

### Wykresy
1. **Porównanie średnich ocen** — wykres słupkowy (Gmail vs Outlook) dla wszystkich 8 pytań
2. **Średnie per pytanie** — 8 oddzielnych wykresów słupkowych (Q1–Q8)
3. **Preferencja końcowa** — wykres słupkowy + kołowy (doughnut) rozkładu preferencji
4. **Statystyki podsumowujące** — łączna liczba odpowiedzi, rozkład preferencji

### Dodatkowa analiza (Jupyter notebook)
- Przegląd danych i liczba wypełnionych ocen dla każdego pytania
- Wykresy porównawcze (bar charts) z biblioteki matplotlib
- Rozkład preferencji końcowej (bar + pie)
- Przyrost odpowiedzi w czasie (line chart)
- Komentarze uczestników

---

## 6. Wnioski i propozycje modyfikacji/poprawek/ulepszeń

### Na podstawie zebranych danych należy sformułować:

1. **Wnioski ogólne**
   - Która platforma uzyskuje wyższe średnie oceny w poszczególnych kryteriach?
   - Jak kształtuje się rozkład preferencji końcowych?
   - Czy istnieją kryteria, w których platformy są zbliżone?

2. **Rekomendacje dla Gmail**
   - Obszary, w których Outlook przewyższa Gmail
   - Propozycje usprawnień interfejsu

3. **Rekomendacje dla Outlook**
   - Obszary, w których Gmail przewyższa Outlook
   - Propozycje uproszczenia interfejsu

4. **Propozycje dalszych badań**
   - Badanie z podziałem na grupy zaawansowania
   - Testy A/B konkretnych zmian w interfejsie
   - Pomiary czasu wykonania zadań (nie tylko ocena subiektywna)

---

## Struktura projektu

```
gmail_outlook/
├── src/                    # Kod źródłowy aplikacji webowej
│   ├── index.html          # Główna strona (ankieta + analiza)
│   ├── styles.css          # Style CSS
│   ├── app.js              # Logika aplikacji (ankieta, wykresy)
│   ├── config.js           # Konfiguracja Supabase (generowany z .env)
│   └── config.example.js   # Przykład konfiguracji
├── sql/
│   └── supabase_schema.sql # Schemat bazy danych
├── notebooks/
│   └── analysis.ipynb      # Analiza danych w Jupyter
├── scripts/
│   ├── build.mjs           # Skrypt build
│   └── generate-config.mjs # Generowanie config.js z .env
├── .env                    # Konfiguracja Supabase (gitignored)
├── plan.md                 # Ten plik
└── README.md               # Dokumentacja projektu
```
