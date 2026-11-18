# Apex AI — Race Engineer

Prototyp webowy do analizy jazdy w Assetto Corsa Competizione.

- [Uruchom dashboard Apex AI](https://sergiosochanskiracingpoland-dotcom.github.io/apex-ai/)
- [Rejestrator ACC na Windows 11 — instrukcja](acc_collector/README.md)

Wersja 0.2.15 (pre-0.3) rozszerza dotychczasową analizę prędkości, hamulca, gazu i porównywania okrążeń o zakładkę **Analiza stintu**: wykres paliwa, temperatury i ciśnienia czterech opon, RPM, biegi, sterowanie, przybliżone G, pracę TC/ABS oraz kontrolę jakości próbek i wykrywanie pit lane. Dopasowanie stref hamowania jest ostrożniejsze. Nowy rejestrator zapisuje **30 kolumn** w `*_samples.csv`; istniejące kolumny pozostały bez zmian, a stare pliki CSV nadal można otwierać (bez nowych funkcji). **Surowe pole tyreWear nie jest jeszcze zweryfikowanym pomiarem degradacji bieżnika.** Nadal brak prawdziwego modelu AI oraz desktopowej aplikacji — to plan 0.3.x i 0.4.x. Dane analizowane są lokalnie w przeglądarce.

**Status:** testy statyczne i syntetyczne przeszły; wymagany test 0.2.15 w ACC i przeglądarce. 0.2.15 jest kandydatem na ostatnie wydanie 0.2.x, ale dalsze poprawki zależą od wyników.