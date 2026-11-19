# Apex AI — Race Engineer

Prototyp do analizy jazdy w Assetto Corsa Competizione. Od 0.3.0 rozwijamy również osobną aplikację Windows.

- [Uruchom dashboard Apex AI](https://sergiosochanskiracingpoland-dotcom.github.io/apex-ai/)
- [Rejestrator ACC na Windows 11 — instrukcja](acc_collector/README.md)

Wersja 0.2.15 (pre-0.3) rozszerza dotychczasową analizę prędkości, hamulca, gazu i porównywania okrążeń o zakładkę **Analiza stintu**: wykres paliwa, temperatury i ciśnienia czterech opon, RPM, biegi, sterowanie, przybliżone G, pracę TC/ABS oraz kontrolę jakości próbek i wykrywanie pit lane. Dopasowanie stref hamowania jest ostrożniejsze. Nowy rejestrator zapisuje **30 kolumn** w `*_samples.csv`; istniejące kolumny pozostały bez zmian, a stare pliki CSV nadal można otwierać (bez nowych funkcji). **Surowe pole tyreWear nie jest jeszcze zweryfikowanym pomiarem degradacji bieżnika.** Nadal brak prawdziwego modelu AI oraz desktopowej aplikacji — to plan 0.3.x i 0.4.x. Dane analizowane są lokalnie w przeglądarce.

**Status:** testy statyczne i syntetyczne przeszły; wymagany test 0.2.15 w ACC i przeglądarce. 0.2.15 jest kandydatem na ostatnie wydanie 0.2.x, ale dalsze poprawki zależą od wyników.
## Aplikacja Windows 0.3.0 (Electron)

**Nowość:** kod pierwszej aplikacji desktopowej jest w folderze [desktop/](desktop/). Nie usunięto dotychczasowego dashboardu ani rejestratora ACC. Wersja 0.3.0 otwiera pełny dashboard w osobnym oknie offline; rejestrator 0.2.15 nadal uruchamia się osobno i nadal importuje się CSV. Automatyczną integrację ACC planujemy w 0.3.1.

**Instalator:** [GitHub Actions → Apex AI Windows installer](https://github.com/sergiosochanskiracingpoland-dotcom/apex-ai/actions/workflows/build-windows.yml). Otwórz najnowszy zielony przebieg, a następnie w sekcji **Artifacts** pobierz ZIP z instalatorem i wersją portable. Jeżeli nie ma udanego przebiegu, instalator nie jest jeszcze dostępny — sprawdź [instrukcję](desktop/README.md) i status budowy. Pliki EXE są niepodpisane.
