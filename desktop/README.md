# Apex AI Desktop 0.3.0 — pierwsza aplikacja Windows

Wersja 0.3.0 przenosi **dotychczasowy dashboard do własnego okna Windows**. To działająca aplikacja offline, korzystająca z tego samego silnika analitycznego co 0.2.15.

## Pobranie i instalacja (Windows 10/11 x64)

1. Otwórz [Apex AI — GitHub Actions](https://github.com/sergiosochanskiracingpoland-dotcom/apex-ai/actions/workflows/build-windows.yml).
2. Kliknij najnowszy **zielony, zakończony powodzeniem** przebieg „Apex AI Windows installer”.
3. Pobierz archiwum w sekcji **Artifacts** (nazwa `ApexAI-Windows-0.3.0`); zalogowanie na GitHub może być wymagane.
4. Rozpakuj ZIP. Powinny być dwa pliki `.exe`: instalator (NSIS) i wersja portable.
5. Uruchom wybrany plik. Po otwarciu wybierz w menu **Apex AI → Otwórz folder sesji ACC** i zaimportuj właściwe `*_laps.csv` oraz `*_samples.csv`.

**Uwaga:** w 0.3.0 nadal trzeba osobno uruchamiać rejestrator `acc_collector/Start-ApexACC.cmd` z głównego repozytorium. Wersja 0.3.1 ma zautomatyzować uruchamianie i import rejestracji.

Instalator nie jest podpisany komercyjnym certyfikatem. Windows SmartScreen może ostrzec o nieznanym wydawcy. Nie uruchamiaj pliku, jeśli pochodzi spoza Twojego repozytorium.

## Funkcje

- Natywne okno Windows; lokalny, **offline** dashboard z analityką 0.2.15.
- Import telemetrii ACC z plików CSV, porównanie okrążeń, paliwo, opony, RPM, G, skręt i TC/ABS.
- Historia sesji i setupów zapisywana lokalnie.
- Menu: odśwież, folder sesji ACC, zmiana powiększenia, pełny ekran.
- Bez logowania, subskrypcji, API AI, serwerów i przesyłania telemetrii.

## Lokalny rozwój

Zainstaluj Node.js, a następnie w folderze `desktop`:
```powershell
npm install
npm start
```

Na Windows zbuduj pliki instalacyjne:
```powershell
npm run dist
```
Wyniki pojawią się w `desktop/dist`.

Aplikacja **pakuje główny `index.html`** z katalogu repozytorium. Dzięki temu dashboard na GitHub Pages oraz aplikacja korzystają z tego samego kodu. Przyszłe wersje mogą przekształcić frontend w React.

## Status i ograniczenia

Kod aplikacji i proces budowania przygotowano w repozytorium. Dopiero **udany workflow Windows** potwierdza, że instalator został zbudowany. Test na komputerze użytkownika pozostaje konieczny.

W 0.3.0 nie ma jeszcze C# rejestratora, automatycznego wykrywania ACC ani wsparcia zwykłego AC. To plan serii 0.3.x. Czat AI będzie etapem 0.4.x.
