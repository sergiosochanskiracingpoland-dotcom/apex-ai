# Apex AI 0.3.4 — Desktop Redesign

## Instalacja

**[Pobierz Apex AI 0.3.4 na Windows](https://sergiosochanskiracingpoland-dotcom.github.io/apex-ai/)**

Instalator: `ApexAI-Setup-0.3.4-x64.exe`. Jeśli masz już **0.3.3 Setup**, poczekaj na automatyczne pobranie aktualizacji albo użyj instalatora.

**Nie odinstalowuj 0.3.3 ani nie usuwaj sesji.** Nowa aplikacja korzysta z tego samego katalogu `Dokumenty\ApexAI\sessions` i zachowuje wszystkie stare pliki CSV.

## Funkcje 0.3.4

- **Nowy, osobny interfejs Electron**, zamiast archiwalnej strony 0.2.15 osadzonej wewnątrz aplikacji.
- **Ciemny, własny pasek okna** z przyciskami minimalizacji, maksymalizacji i zamykania. Nie ma już białego paska systemowego i menu z Worda.
- **Pełna lokalizacja PL/EN**: wybór języka przy pierwszym uruchomieniu i później w Ustawieniach.
- **Kreator pierwszego uruchomienia**: nazwa kierowcy, język, kolory i tło.
- **Personalizacja**: gotowe motywy kolorystyczne, dwie dowolne barwy interfejsu, gęstość danych, zwijanie menu.
- **Dashboard z widżetami**: konfiguracja widoczności i kolejności (przeciąganie lub przyciski góra/dół); ustawienia przetrwają restart aplikacji i kolejne aktualizacje.
- **Tapety**: motorsportowe presety GT3, WEC i F1 (fotografie z Wikimedia Commons, wymagają internetu), własne JPG, PNG lub WEBP do 7 MB. Suwaki: blur, jasność, nasycenie i widoczność. Autorzy i licencje fotografii są widoczne w Ustawieniach.
- **Eksport i import ustawień** jako JSON, wraz z własną tapetą. Konfiguracja jest zapisywana lokalnie w katalogu Electron `userData/settings/preferences.json`.
- **Nowy Dashboard, Analiza stintu, Historia i pełny raport sesji** z rzeczywistych CSV, w tym tempo, sektory, prędkość, gaz/hamulec, paliwo, temperatura/ciśnienie opon, porównania okrążeń, szacowane strefy hamowania i kontrola jakości danych.
- **Na torze**: aktualna prędkość, bieg, obroty, paliwo, operowanie pedałami, postęp okrążenia oraz opony. Dane są pobierane tylko gdy rejestrator ACC wskazuje aktywny stint. Przy braku połączenia widoczne są kreski zamiast fikcyjnych wartości.
- **Ustawienia** na dole menu: personalizacja, widżety, przenoszenie ustawień, centrum aktualizacji, folder sesji i wersja.
- **Automatyczne aktualizacje** przez GitHub Releases pozostają w aplikacji. Przygotowano przycisk instalacji pobranego wydania.

### Czego nie zmieniono

Rejestrator ACC z wersji 0.3.3 pozostał w tej samej logice. **Nie zwiększyliśmy próbkowania.** Efektywne 32,3 Hz z ostatniego testu wymaga osobnej diagnostyki. W 0.3.5 przetestujemy docelowe **75 Hz** bez udawania, że osiągnięto wyższą częstotliwość.

Funkcje **Jedź**, **Setupy AI** i **Inżynier AI** nadal są w przygotowaniu i nie zostały przedstawione jako działające funkcje.

### Zdjęcia używane jako opcjonalne tapety

Fotografie z Wikimedia Commons (pobierane w aplikacji jako zewnętrzne zdjęcia, nie osadzane w instalatorze):

- **GT3:** British GT GT3 cars at Donington — Bradley Wurth, CC BY 4.0.
- **WEC:** 2024 24 Hours of Le Mans (54093434907) — mickeil WEC, CC BY 2.0.
- **F1:** BMW Formula 1 race car — Mark Fosh, CC BY 2.0.

Pełne odsyłacze do plików, licencji i autorów znajdują się w ekranie Ustawienia. Jeśli komputer jest offline, tło domyślne pozostaje ciemnym gradientem.

## Test 0.3.4

1. Zainstaluj 0.3.4. Wykonaj kreator, zmień język PL/EN i sprawdź, czy zachowuje wybór po restarcie.
2. W Ustawieniach wybierz kolor, tło GT3/WEC/F1 lub dodaj własny JPG; przetestuj suwaki jasności i rozmycia.
3. Zmień kolejność i widoczność widżetów, zrestartuj aplikację, sprawdź czy układ się zachował.
4. Wyeksportuj ustawienia do JSON; zmień motyw; zaimportuj JSON i sprawdź przywrócenie konfiguracji.
5. Wejdź w Historię, otwórz wcześniejszą sesję i sprawdź pełny raport oraz porównania okrążeń.
6. Uruchom ACC. Otwórz „Na torze” i sprawdź, czy pomiary odświeżają się na bieżąco.
7. Sprawdź automatyczne archiwizowanie przejazdu. Rejestrator nie wymaga dodatkowego CMD.
8. W Ustawieniach sprawdź dostępność aktualizacji.

## Technicznie

Wymagane: Windows 10/11 x64, Node.js 24, .NET SDK 8.

```powershell
cd desktop
dotnet publish collector/ApexCollector.csproj -c Release -r win-x64 --self-contained true -o collector/publish -p:PublishSingleFile=true
npm install
npm test
npm start
```

Do zbudowania instalatora `npm run dist`. GitHub Actions uruchamia testy i publikuje kompletne wydanie Windows z `latest.yml`.

**Uwaga:** kompilacja i testy automatyczne nie zastąpią testu na komputerze z ACC. Przy odtwarzaniu wykresów historycznych wartości są szacowane z zapisanych próbek, a nie oznaczane jako oficjalne wyniki ACC.
