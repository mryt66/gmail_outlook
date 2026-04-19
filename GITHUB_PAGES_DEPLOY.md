# Krótka instrukcja publikacji na github.io przez GitHub Pages

1. Wypchnij projekt do repozytorium na GitHub (branch `main`).
2. Wejdź w repo: Settings -> Pages.
3. W sekcji Source wybierz GitHub Actions.
4. Sprawdź, czy w repo jest workflow: `.github/workflows/deploy-pages.yml`.
5. Zrób commit i push do `main`.
6. Wejdź do zakładki Actions i poczekaj aż workflow `Deploy to GitHub Pages` zakończy się na zielono.
7. Otwórz adres strony:
   - `https://<twoj-login>.github.io/<nazwa-repo>/`

## Szybka checklista problemów

- Brak strony: upewnij się, że w Pages ustawione jest GitHub Actions.
- Workflow nie startuje: sprawdź, czy push był do branch `main`.
- 404 po wdrożeniu: odczekaj 1-2 minuty i odśwież stronę.
