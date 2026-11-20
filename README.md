# Apex AI — Race Intelligence

## Desktop 0.3.4.5

**[Strona instalatora Windows](https://sergiosochanskiracingpoland-dotcom.github.io/apex-ai/)**

Gotowe wydanie Windows:
[ApexAI-Setup-0.3.4.5-x64.exe](https://github.com/sergiosochanskiracingpoland-dotcom/apex-ai/releases/download/v0.3.5-beta.5/ApexAI-Setup-0.3.4.5-x64.exe)

### Poprawka 0.3.4.5

- Nowy, niezależny interfejs desktop (bez osadzania UI 0.2.15).
- Ciemny, własny pasek okna; estetyka premium, rozmyte i przezroczyste panele.
- Kreator pierwszego uruchomienia oraz języki **polski i angielski**.
- Dowolne akcenty kolorystyczne, motywy, nazwa kierowcy i ustawienia menu.
- **6 lokalnych tapet motorsportowych CC0 16:9 (1920×1080)**, działających bez internetu. Naprawione nakładanie warstw, rozmycie, jasność i podgląd na żywo; własny JPG/PNG/WEBP nadal dostępny.
- Dashboard z wybieranymi i przestawianymi widżetami.
- Lokalny zapis i eksport/import wszystkich preferencji.
- Nowy ekran **Na torze** z rzeczywistą telemetrią ACC pobieraną podczas jazdy.
- Historia i pełne raporty z zapisanych stintów, w tym szacunkowe strefy hamowania, porównania prędkości, paliwo, opony, elektronikę i jakość danych.
- Centrum aktualizacji w zakładce **Ustawienia** (dół menu bocznego).

**Zbieranie danych ACC pozostaje bez zmian od 0.3.3.** Test przejścia na docelowe 75 Hz jest zaplanowany na **0.3.5**. Wynik poprzedniego testu wynosił efektywnie 32,3 Hz, więc sam wzrost żądanej częstotliwości nie jest gwarancją 75 Hz.

Dokumentacja: [Instrukcja 0.3.4.5](desktop/README.md) · [Kod aplikacji](desktop/) · [Wydania](https://github.com/sergiosochanskiracingpoland-dotcom/apex-ai/releases)

### Dane lokalne i poprzednie wersje

- Sesje z ACC: `Dokumenty\ApexAI\sessions`.
- Preferencje użytkownika: standardowy katalog `userData/settings/preferences.json` aplikacji Electron.
- [Archiwalny dashboard 0.2.15](archive/0.2.15/index.html)
- [Archiwalny rejestrator PowerShell](acc_collector/)

Apex AI w tej wersji nie ma kont użytkowników, subskrypcji ani serwera zbierającego telemetrię. Instalator Windows jest niepodpisany certyfikatem, więc Windows SmartScreen może wyświetlić ostrzeżenie.


**Wersjonowanie:** wydanie nazywa się 0.3.4.5, a jego wewnętrzny identyfikator SemVer to `0.3.5-beta.5`. Ma to umożliwić kolejną aktualizację do stabilnej `0.3.5` z próbą 75 Hz. Wersja 0.3.4 może wymagać jednorazowej ręcznej instalacji poprawki tapet.
