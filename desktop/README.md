# Apex AI Desktop 0.3.1 — automatyczna telemetria ACC i aktualizacje

## Pobieranie

**[POBIERZ APLIKACJĘ NA WINDOWS](https://sergiosochanskiracingpoland-dotcom.github.io/apex-ai/)** — jedno kliknięcie prowadzi bezpośrednio do instalatora `ApexAI-Setup-0.3.1-x64.exe`.

**Ważne:** jeżeli masz **0.3.0**, instalację **0.3.1** musisz wykonać **jeden ostatni raz ręcznie**, ponieważ 0.3.0 nie posiada mechanizmu aktualizowania. Mechanizm automatycznych aktualizacji działa od 0.3.1 i musi zostać jeszcze sprawdzony na przyszłym wydaniu 0.3.2.

## Co zmieniono w 0.3.1?

1. **Rejestrator C# (.NET 8):** aplikacja uruchamia razem ze sobą `ApexCollector.exe`; sam wykrywa uruchomione ACC, tor, samochód i zapisuje pełną telemetrię (30 kolumn) oraz czasy okrążeń w zgodnym formacie CSV.
2. **Bez starego CMD:** nie uruchamiaj `Start-ApexACC.cmd` — oba rejestratory korzystają z tego samego muteksa Windows i nie mogą działać równocześnie. Zachowujemy stary kod jako archiwum 0.2.x.
3. **Automatyczny import:** po każdym ukończonym okrążeniu aplikacja ponownie ładuje zebrane dane i aktualizuje dashboard. Import jest również wykonywany po otwarciu aplikacji dla ostatniej sesji. Można nadal importować ręcznie stare CSV.
4. **Pasek stanu:** informacja o stanie połączenia ACC i pobieraniu aktualizacji, przycisk ręcznego sprawdzenia dostępności nowej wersji.
5. **Automatyczne aktualizacje:** aplikacja sprawdza GitHub Releases po uruchomieniu i co cztery godziny. Przy dostępności nowszej wersji pobiera ją w tle i pyta o instalację/restart. Wymagany instalator **Setup**, a nie wersja portable.
6. **Dotychczasowy dashboard zachowany:** wygląd i analizy 0.2.15 na razie pozostają; pełne odświeżenie grafiki i obsługa innych symulatorów są planowane na kolejne 0.3.x. Nie dodano uruchamiania gier z poziomu aplikacji.

## Pierwszy test

1. Pobierz `ApexAI-Setup-0.3.1-x64.exe` z głównej strony Apex AI i zainstaluj na Windows.
2. Uruchom Apex AI. W górnym pasku powinna pojawić się informacja „ACC: …”.
3. **Nie uruchamiaj** `Start-ApexACC.cmd`. Uruchom ACC normalnie (Steam), wybierz Ferrari 296 GT3 na Imoli, włącz zużycie paliwa i opon.
4. Przejedź 2–3 pełne okrążenia. Po każdym przekroczeniu mety czas i dane powinny automatycznie pojawić się w aplikacji. Nie powinieneś klikać „Importuj okrążenia” ani „Importuj telemetrię”.
5. Zamknij ACC i sprawdź, czy w `Dokumenty\ApexAI\sessions` są dwie pasujące nazwy `*_laps.csv` i `*_samples.csv`.
6. Zrestartuj Apex AI i sprawdź, czy ostatnia sesja zostanie automatycznie wczytana.
7. Kliknij „Sprawdź aktualizacje”. Powinien pojawić się status, nie błąd strony. Prawdziwe pobieranie i instalację sprawdzimy po publikacji następnej wersji.

Wyślij zrzut paska ACC LIVE, zrzut aktualizatora i oba CSV, jeśli pojawi się jakikolwiek problem.

## Instalacja dla programisty

Potrzebujesz Windows, .NET SDK 8 i Node.js. W katalogu `desktop`:

```powershell
dotnet publish collector/ApexCollector.csproj -c Release -r win-x64 --self-contained true -o collector/publish -p:PublishSingleFile=true
npm install
npm start
```

Budowanie instalatora i plików do automatycznych aktualizacji:

```powershell
npm run dist
```

Gotowe pliki pojawiają się w `desktop/dist`. GitHub Actions automatycznie buduje rejestrator i aplikację, weryfikuje kompletność instalatora, a następnie publikuje `v0.3.1` na GitHub Releases wraz z `latest.yml`.

## Ograniczenia i bezpieczeństwo

- **Pierwsza instalacja 0.3.1 jest ręczna**, następne wersje są obsługiwane przez automatyczny aktualizator, ale mechanizm wymaga jeszcze testu end-to-end na nowszym wydaniu.
- Program nadal nie jest podpisany komercyjnym certyfikatem. Windows SmartScreen może ostrzegać o nieznanym wydawcy.
- Aplikacja nie ma kont ani serwera, dane telemetryczne zapisuje lokalnie. Do sprawdzania aktualizacji łączy się z GitHub Releases.
- Aktualizator wymaga dostępności internetu; bez internetu analizy ACC nadal działają.
- Rejestrator C# czyta pamięć współdzieloną ACC. Wymaga testu z prawdziwą grą; sam sukces kompilacji nie gwarantuje bezbłędnego działania w każdej sesji.
- Zwykłe Assetto Corsa, Content Manager i uruchamianie symulatorów z aplikacji nie są częścią 0.3.1.
