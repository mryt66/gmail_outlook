# Ankieta UX: Gmail vs Outlook

Badanie porównawcze interakcji użytkownika na platformach Gmail i Outlook.

## Metodologia badania

### 1. Określenie wzorcowych elementów interakcji

Zdefiniowano 8 kluczowych kryteriów oceny:
- Łatwość rozpoczęcia pracy
- Czytelność nawigacji i układu
- Wyszukiwanie i filtrowanie wiadomości
- Tworzenie i edycja wiadomości
- Zarządzanie skrzynką
- Widoczność statusu i informacji zwrotnej
- Wydajność i szybkość interakcji
- Ogólna satysfakcja z doświadczenia

### 2. Przegląd kandydatów do ewaluacji

Do badania wybrano dwie wiodące platformy pocztowe:
- **Gmail** (Google Workspace) — dominant na rynku konsumenckim
- **Microsoft Outlook** (Web / Office 365) — popularny w środowisku korporacyjnym

### 3. Schemat badania

- **Skala pomiaru**: 1–10 dla każdego kryterium (osobno Gmail i Outlook)
- **Wiek respondenta**: wymagany (10–100)
- **Grupy wiekowe**: 15–25, 26–35, 36–44, 45–60
- **Preferencja końcowa**: Gmail / Outlook / Remis
- **Informacja o czasie**: respondenci zwracają uwagę na czas wykonania zadania

### 4. Wnioski

Szczegółowe wnioski i rekomendacje w `plan.md` (sekcja 6).

## Uruchomienie

### Lokalnie

```bash
cp .env.example .env   # wypełnij dane Supabase
npm run config          # generuje src/config.js z .env
npm run dev             # uruchamia serwer na localhost:8080
```

### Generowanie wykresów

```bash
python3 charts/generate.py
```

Wykresy PNG trafiają do folderu `charts/`.

### Konfiguracja bazy (Supabase)

1. Załóż projekt w [Supabase](https://supabase.com)
2. W SQL Editor uruchom `sql/supabase_schema.sql`
3. Opcjonalnie: uruchom `sql/migration_add_age.sql`
4. Wypełnij `.env` danymi projektu
5. Uruchom `npm run config`

## Struktura projektu

- `src/` — kod źródłowy aplikacji webowej (HTML, CSS, JS)
- `charts/` — skrypt generujący wykresy + PNG
- `scripts/` — narzędzia build (Node.js)
- `sql/` — schemat i migracje bazy Supabase
- `plan.md` — metodologia i wyniki badania
- `pyproject.toml` — zależności Python
- `.env` — konfiguracja Supabase (gitignored)
- `.github/workflows/deploy-pages.yml` — workflow deploy
