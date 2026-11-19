# Apex AI 0.3.2 — aplikacja Windows

## Instalacja i aktualizacja

**[POBIERZ APEX AI NA WINDOWS](https://sergiosochanskiracingpoland-dotcom.github.io/apex-ai/)**

Instalator: `ApexAI-Setup-0.3.2-x64.exe`.

Jeśli korzystasz z instalowanej wersji **0.3.1**, aplikacja powinna wykryć nowe wydanie, pobrać je i zaproponować aktualizację (internet wymagany). Jeżeli nie zadziała, zainstaluj ręcznie 0.3.2 z głównej strony. Wersja 0.3.0 nadal wymaga ręcznego przejścia na nowsze wydanie.

## Zmiany w 0.3.2

- **Nowy interfejs:** ciemny motyw, czerwono-fioletowe akcenty, składany pasek boczny, minimalistyczne powitanie „Witaj, Kierowco”.
- **Zakładki:** Strona główna, Dashboard, Analiza stintu, Historia, Setupy (placeholder), Inżynier AI (placeholder), Jedź (placeholder).
- **Trwała historia:** każdy stint zapisuje się **automatycznie** w `Dokumenty\ApexAI\sessions` — CSV z okrążeniami, CSV z pełną telemetrią i nowy plik metadanych `_meta.json`.
- **Podział stintów:** kolektor 0.3.2 kończy stint, gdy samochód wjeżdża do pit lane, i otwiera nowy po wyjeździe. Zamyka też stint przy zmianie samochodu/toru i zakończeniu jazdy.
- **Biblioteka:** każda karta pokazuje **tor, auto, datę, liczbę ukończonych okrążeń i najlepszy czas**. Jest pole wyszukiwania.
- **Pełna analiza z historii:** kliknięcie dowolnego zapisanego stintu ładuje jego parę CSV do dotychczasowego silnika analizy; dostępne są Dashboard i Analiza stintu.
- **Wsteczna zgodność:** stare dane 0.3.1 bez metadanych również są wykrywane, jeśli mają poprawne pliki CSV.
- **Dane lokalne:** sesje pozostają na komputerze; brak serwera i konta.
- **Aktualizacje:** zachowany `electron-updater` z GitHub Releases.

Oryginalny dashboard serii 0.2.x znajduje się w `archive/0.2.15/index.html` i nie jest modyfikowany.

### Ważne ograniczenia

- Funkcje **Jedź / Setupy / Inżynier AI** są widoczne jako miejsca na przyszłe aktualizacje, ale **jeszcze nie są aktywne**. Uruchamianie ACC z poziomu Apex AI nie jest w 0.3.2.
- Każdy stint zapisuje się automatycznie na dysk, także bez pełnego okrążenia. Niektóre wykresy wymagają co najmniej jednego ukończonego pełnego okrążenia i nie będą widoczne przy samym outlapie.
- Telemetria z prawdziwego ACC musi być przetestowana na komputerze z grą. Kompilacja i testy plików nie zastąpią jazdy.
- Instalator nie ma komercyjnego podpisu cyfrowego; Windows SmartScreen może wyświetlić ostrzeżenie.

## Test na dziś — bez wchodzenia do symulatora

1. Uruchom 0.3.2 i sprawdź wygląd strony głównej oraz zwijany pasek boczny.
2. Przejdź przez zakładki, w tym Setupy, Inżynier AI i Jedź.
3. Otwórz **Historia**. Jeśli masz pliki zapisane w 0.3.1, powinny pojawić się karty z nazwą toru, auta i datą.
4. Kliknij kartę stintu i sprawdź, czy otwiera się **Analiza stintu** z danymi.
5. Na **Dashboardzie** możesz użyć „Załaduj sesję demo”, żeby ocenić wykresy nawet bez nowych jazd.

Jutro w ACC sprawdzimy podział na stinty na pit lane, odczyt telemetrii i stabilność rejestratora.

## Budowanie ze źródeł

Windows 10/11, Node.js 24, .NET SDK 8:

```powershell
cd desktop
dotnet publish collector/ApexCollector.csproj -c Release -r win-x64 --self-contained true -o collector/publish -p:PublishSingleFile=true
npm install
npm test
npm start
```

Instalator oraz manifest aktualizacji:
```powershell
npm run dist
```

Workflow `.github/workflows/build-windows.yml` buduje cały projekt na GitHub Actions, uruchamia testy biblioteki i publikuje pliki `ApexAI-Setup-0.3.2-x64.exe`, `ApexAI-Portable-0.3.2-x64.exe`, `latest.yml` i blockmap w GitHub Releases.
