# Apex AI — Race Intelligence

## Windows desktop 0.3.5

**[Pobierz na oficjalnej stronie Apex AI](https://sergiosochanskiracingpoland-dotcom.github.io/apex-ai/)**

Bezpośredni instalator Windows:
[ApexAI-Setup-0.3.5-x64.exe](https://github.com/sergiosochanskiracingpoland-dotcom/apex-ai/releases/download/v0.3.5/ApexAI-Setup-0.3.5-x64.exe)

### Co nowego w 0.3.5?

**Eksperymentalna rejestracja telemetrii ACC z celem 75 Hz**, oparta na harmonogramie według monotonicznego zegara Windows/QPC zamiast pętli odczekującej 20 ms. Wynik rzeczywisty zależy od czasu dostarczania pakietów gry i planowania pracy procesu przez Windows — cel nie jest gwarancją.

**Diagnostyka w Dashboard / Pełny raport → Jakość telemetrii:**
- efektywne Hz zapisanych próbek podczas jazdy;
- liczba unikalnych nowych pakietów ACC na sekundę i odsetek powtarzanych pakietów;
- realizacja celu 75 Hz, mediana i 95. percentyl opóźnień, liczba dużych luk i przestojów.

W teście poprzedniej wersji 0.3.4.5 użytkownik potwierdził 18/18 funkcji w 6 okrążeniach, ale efektywne próbkowanie wynosiło **32,3 Hz**. W 0.3.5 porównujemy ten wynik z rzeczywistym nowym stintem, nie deklarujemy osiągnięcia 75 Hz przed testem.

### Wszystko, co działało wcześniej, zostaje

- Personalizowany interfejs w językach PL / EN i własny pasek okna.
- Sześć **lokalnych tapet motorsportowych CC0** w 16:9 i własny JPG/PNG/WEBP, rozmycie/jasność/nasycenie/widoczność.
- Konfigurowalny Dashboard, statystyki, analiza hamowań i porównania.
- Automatyczne wykrywanie ACC i kolektor działający w tle.
- Historia stintów, podgląd telemetrii „Na torze”, eksport/import ustawień i aktualizator.

**Dane zachowywane podczas aktualizacji:** `Dokumenty\ApexAI\sessions`, ustawienia w katalogu danych użytkownika Electron.

[Pełna dokumentacja i test 0.3.5](desktop/README.md) · [Wszystkie wydania](https://github.com/sergiosochanskiracingpoland-dotcom/apex-ai/releases)

Instalator Windows 10/11 x64 nie jest podpisany certyfikatem, więc SmartScreen może ostrzec o nieznanym wydawcy.
