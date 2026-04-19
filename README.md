# Ankieta UX: Gmail vs Outlook

Statyczna aplikacja ankietowa do porównania interakcji w Gmail i Outlook, z:
- sekcją instrukcji do każdego pytania,
- zapisem odpowiedzi,
- automatycznymi wykresami zbiorczymi.

Aplikacja działa jako czysty frontend (HTML/CSS/JS), więc można ją hostować zarówno na Vercel, jak i GitHub Pages.

## Struktura

- `index.html` - UI ankiety i sekcja wyników
- `styles.css` - styl i responsywny layout
- `app.js` - logika pytań, zapis odpowiedzi, agregacje i wykresy
- `config.example.js` - wzór konfiguracji połączenia
- `sql/supabase_schema.sql` - schema + polityki RLS dla Supabase

## 1) Konfiguracja zapisu danych (Supabase)

1. Załóż projekt w Supabase.
2. Wejdź do SQL Editor i uruchom zawartość pliku:
   - `sql/supabase_schema.sql`
3. Pobierz z Supabase:
   - Project URL
   - anon public key
4. Utwórz lokalnie plik `config.js` na podstawie `config.example.js` i wpisz wartości:

```js
window.APP_CONFIG = {
  supabaseUrl: 'https://TWOJ-PROJEKT.supabase.co',
  supabaseAnonKey: 'TWOJ_PUBLICZNY_ANON_KEY'
};
```

Uwaga: `config.js` jest w `.gitignore`, więc nie wycieknie do repo.

## 2) Tryb lokalny bez bazy

Jeśli `config.js` nie jest skonfigurowany, aplikacja przechodzi w tryb lokalny i zapisuje dane do `localStorage` przeglądarki.

## 3) Uruchomienie lokalne

Wystarczy otworzyć `index.html` lub postawić prosty serwer statyczny, np. przez VS Code Live Server.

## 4) Deploy na Vercel

1. Wypchnij repo do GitHub.
2. W Vercel kliknij `Add New -> Project` i wybierz repo.
3. Framework preset: `Other`.
4. Build command: puste.
5. Output directory: `.`
6. Deploy.

### Konfiguracja `config.js` na Vercel

Masz dwie opcje:

1. Commitować publiczny `config.js` (URL + anon key) i usunąć go z `.gitignore`.
2. Dodać osobny etap build, który generuje `config.js` z env varów.

Dla prostoty w statycznych ankietach zwykle wybiera się opcję 1 (anon key jest publiczny).

## 5) Deploy na GitHub Pages

Workflow jest gotowy w:
- `.github/workflows/deploy-pages.yml`

Kroki:
1. W repo na GitHub wejdź: `Settings -> Pages`.
2. Source ustaw na `GitHub Actions`.
3. Wypchnij branch `main`.
4. Po zakończeniu workflow strona będzie dostępna pod adresem `https://<user>.github.io/<repo>/`.

### Konfiguracja `config.js` na GitHub Pages

Tak samo jak w Vercel: klucz anon jest publiczny, więc możesz commitować `config.js` z danymi Supabase.

## 6) Jak czytać wyniki

- Wykres słupkowy: średnie oceny Gmail vs Outlook dla każdego kryterium.
- Wykres kołowy: rozkład preferencji końcowej (Gmail / Outlook / Remis).
- Kafelki podsumowania: liczba odpowiedzi i średnie globalne.

## Dalsze rozszerzenia

- filtrowanie wyników po poziomie zaawansowania,
- eksport CSV,
- osobny panel admina z komentarzami jakościowymi.
