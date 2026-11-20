# Apex AI — Race Intelligence

## Desktop 0.3.4

**[Strona instalatora Windows](https://sergiosochanskiracingpoland-dotcom.github.io/apex-ai/)**

Najnowsze źródła wersji 0.3.4. Bezpośredni instalator po zakończonej publikacji wydania:
[ApexAI-Setup-0.3.4-x64.exe](https://github.com/sergiosochanskiracingpoland-dotcom/apex-ai/releases/download/v0.3.4/ApexAI-Setup-0.3.4-x64.exe)

### Nowe w 0.3.4

- Nowy, niezależny interfejs desktop (bez osadzania UI 0.2.15).
- Ciemny, własny pasek okna; estetyka premium, rozmyte i przezroczyste panele.
- Kreator pierwszego uruchomienia oraz języki **polski i angielski**.
- Dowolne akcenty kolorystyczne, motywy, nazwa kierowcy i ustawienia menu.
- Motorsportowe tapety **GT3, WEC, F1** z Wikimedia Commons; własna tapeta JPG/PNG/WEBP, suwaki blur, jasności, nasycenia i widoczności.
- Dashboard z wybieranymi i przestawianymi widżetami.
- Lokalny zapis i eksport/import wszystkich preferencji.
- Nowy ekran **Na torze** z rzeczywistą telemetrią ACC pobieraną podczas jazdy.
- Historia i pełne raporty z zapisanych stintów, w tym szacunkowe strefy hamowania, porównania prędkości, paliwo, opony, elektronikę i jakość danych.
- Centrum aktualizacji w zakładce **Ustawienia** (dół menu bocznego).

**Zbieranie danych ACC pozostaje na poziomie wersji 0.3.3.** Test przejścia na docelowe 75 Hz jest zaplanowany na **0.3.5**. Wynik poprzedniego testu wynosił efektywnie 32,3 Hz, więc sam wzrost żądanej częstotliwości nie jest gwarancją 75 Hz.

Dokumentacja: [Instrukcja 0.3.4](desktop/README.md) · [Kod aplikacji](desktop/) · [Wydania](https://github.com/sergiosochanskiracingpoland-dotcom/apex-ai/releases)

### Dane lokalne i poprzednie wersje

- Sesje z ACC: `Dokumenty\ApexAI\sessions`.
- Preferencje użytkownika: standardowy katalog `userData/settings/preferences.json` aplikacji Electron.
- [Archiwalny dashboard 0.2.15](archive/0.2.15/index.html)
- [Archiwalny rejestrator PowerShell](acc_collector/)

Apex AI w tej wersji nie ma kont użytkowników, subskrypcji ani serwera zbierającego telemetrię. Instalator Windows jest niepodpisany certyfikatem, więc Windows SmartScreen może wyświetlić ostrzeżenie.
