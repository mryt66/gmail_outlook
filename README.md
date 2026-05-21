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

Do badania rekrutowana jest grupa użytkowników o różnym poziomie zaawansowania (początkujący, średniozaawansowani, zaawansowani). Każdy uczestnik wykonuje zestaw zadań na obu platformach.

### 3. Schemat badania

- **Zadania**: uczestnicy otrzymują listę czynności do wykonania (np. "znajdź wiadomość od X", "utwórz nową wiadomość z załącznikiem", "oznacz etykietą/folderem")
- **Pomiar czasu**: mierzony jest czas wykonania każdego zadania na każdej platformie
- **Ocena subiektywna**: po każdym zadaniu uczestnik ocenia platformę w skali 1-10
- **Preferencja końcowa**: po wykonaniu wszystkich zadań uczestnik wskazuje ogólnie lepszą platformę

### 4. Przeprowadzenie analizy

Uczestnicy wykonują zadania samodzielnie, a ich odpowiedzi są zapisywane w bazie Supabase. Dane zbierane są anonimowo (opcjonalny pseudonim).

### 5. Wyniki

Dane są agregowane i prezentowane na wykresach porównawczych (średnie ocen Gmail vs Outlook dla każdego kryterium, rozkład preferencji końcowej).

### 6. Wnioski i ulepszenia

Na podstawie wyników formułowane są rekomendacje dotyczące poprawy interfejsu i interakcji dla każdej z platform.

---

## Uruchomienie

### Lokalnie

```bash
npx serve .
```

Otwórz `http://localhost:3000`.

### Konfiguracja bazy (Supabase)

1. Załóż projekt w [Supabase](https://supabase.com)
2. W SQL Editor uruchom `sql/supabase_schema.sql`
3. Skopiuj `config.example.js` do `config.js` i wpisz URL projektu oraz anon key
4. Bez konfiguracji aplikacja działa w trybie offline (localStorage)

### Deploy na GitHub Pages

Wypchnij na `main` — GitHub Actions automatycznie zbuduje i wdroży `dist/` na Pages.

## Struktura projektu

- `index.html` — UI ankiety
- `app.js` — logika pytań, zapis odpowiedzi
- `styles.css` — styl i layout
- `config.js` — konfiguracja Supabase (pominięty w git)
- `sql/supabase_schema.sql` — schema bazy danych
- `.github/workflows/deploy-pages.yml` — workflow deploy
