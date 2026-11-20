# Apex AI 0.3.4.5 — poprawka tapet i wyglądu

## Instalacja

**[Pobierz instalator Apex AI](https://sergiosochanskiracingpoland-dotcom.github.io/apex-ai/)**

Wydanie dla użytkownika nazywa się **0.3.4.5**. Electron używa wewnętrznego numeru SemVer `0.3.5-beta.5`, aby późniejsze wydanie `0.3.5` (test 75 Hz) było nadal nowsze. Z tego powodu aktualizacja z 0.3.4 może wymagać **jednorazowego ręcznego pobrania instalatora**. Nie odinstalowuj poprzedniej wersji ani nie usuwaj danych.

Bezpośredni plik:
[ApexAI-Setup-0.3.4.5-x64.exe](https://github.com/sergiosochanskiracingpoland-dotcom/apex-ai/releases/download/v0.3.5-beta.5/ApexAI-Setup-0.3.4.5-x64.exe).

## Co naprawiono

- **Tapety w instalatorze**, bez hotlinkowania plików z Wikimedia Commons podczas używania aplikacji.
- **6 tapet motorsportowych CC0**: dwa GT3, dwa Le Mans/endurance, dwa F1; rozmiar `1920x1080` (16:9), JPG, 85% jakości.
- **Poprawna kolejność warstw:** zdjęcie jest widoczne za wszystkimi panelami, nie chowa się za tłem okna.
- **Regulacja tła:** rozmycie, jasność, nasycenie i przezroczystość działają na żywo.
- **Podgląd tapety** w Ustawieniach oraz przycisk „Przywróć ustawienia tapety”.
- Własny plik JPG, PNG lub WEBP do 7 MB działa tak samo jak wcześniej.
- Wsteczna zgodność z zapisanym wyborem `gt3`, `wec`, `f1`, a także z eksportem/importem preferencji.

### Źródła zdjęć i prawa

Wszystkie pliki mają na Wikimedia Commons deklarację **CC0 1.0 (public domain dedication)**. Można je kopiować, modyfikować i wykorzystywać komercyjnie bez obowiązku przypisywania autora; zachowujemy jednak informacje o pochodzeniu.

| Tapeta | Autor w Wikimedia Commons | Oryginał |
|---|---|---|
| GT3 Toyota | TTTNIS | [Toyota GR GT3 Prototype cropped](https://commons.wikimedia.org/wiki/File:Toyota_GR_GT3_Prototype_cropped.jpg) |
| GT3 Toyota Rear | TTTNIS | [Toyota GR GT3 Prototype rear](https://commons.wikimedia.org/wiki/File:Toyota_GR_GT3_Prototype_rear.jpg) |
| Le Mans 2023 | Briansoprano | [Car 65 Manuel Maldonado in Le Mans 2023](https://commons.wikimedia.org/wiki/File:Car_65_Manuel_Maldonado_in_Le_Mans_2023.jpg) |
| Le Mans Classic | RandolphGuffey | [24 hours of Le Mans 1990](https://commons.wikimedia.org/wiki/File:24_hours_of_Le_Mans_1990.jpg) |
| F1 2026 | BlackFlash06 | [2026 f1 regulation](https://commons.wikimedia.org/wiki/File:2026_f1_regulation.jpg) |
| F1 Audi | Mustang Joe | [Audi Revolut F1](https://commons.wikimedia.org/wiki/File:Audi_Revolut_F1.jpg) |

Podczas kompilacji skrypt `desktop/scripts/prepare-wallpapers.ps1` pobiera zdjęcia z Wikimedia, **sprawdza ich deklarację licencji CC0**, przycina je do 16:9 i kompresuje; GitHub Actions odmawia publikacji, jeśli obrazów brakuje. Gotowe zdjęcia są dołączone do aplikacji, więc **działają bez internetu**.

## Test po instalacji — bez ACC

1. Otwórz `Ustawienia → Tło aplikacji`.
2. Wybierz GT3 / Le Mans / F1 — zdjęcie powinno pojawić się w podglądzie i za panelami.
3. Zmień suwaki rozmycia, jasności, nasycenia i widoczności. Efekt powinien aktualizować się bez restartowania.
4. Naciśnij „Przywróć ustawienia tapety” — suwaki wrócą do czytelnego poziomu.
5. Wczytaj własny JPG, PNG albo WEBP; zamknij i uruchom Apex AI ponownie — wybór powinien pozostać.
6. Upewnij się, że Historia nadal pokazuje poprzednie stinty, a zakładka Na torze działa bez zmian.

**Rejestrator ACC jest bez zmian.** Eksperyment ze stabilnym 75 Hz pozostaje oddzielnym zakresem przyszłej wersji **0.3.5**.
