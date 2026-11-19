# Apex AI Desktop 0.3.0 — pierwsza aplikacja Windows

Wersja 0.3.0 przenosi **dotychczasowy dashboard do własnego okna Windows**. To działająca aplikacja offline, korzystająca z tego samego silnika analitycznego co 0.2.15.

## Pobieranie i instalacja (Windows 10/11 x64)

**Jedno kliknięcie na stronie głównej:**

1. Wejdź na https://sergiosochanskiracingpoland-dotcom.github.io/apex-ai/
2. Kliknij wielki przycisk **POBIERZ APLIKACJĘ NA WINDOWS**.
3. Uruchom pobrany `ApexAI-Setup-0.3.0-x64.exe`, zainstaluj i otwórz Apex AI ze skrótu pulpitu.

**Bez ZIP, GitHub Actions ani szukania plików.** Pobieranie prowadzi bezpośrednio do instalatora z GitHub Releases. W przypadku publikacji nowego wydania link zostanie uaktualniony na stronie.

Wersja 0.3.0 otwiera archiwalny interfejs analityczny 0.2.15 we własnym oknie. Do rejestrowania kolejnych sesji ACC nadal służy kolektor 0.2.x; w 0.3.1 zastąpi go rejestracja zintegrowana z aplikacją.

Instalator jest niepodpisany. System Windows może pokazać ostrzeżenie SmartScreen o nieznanym wydawcy.

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

Aplikacja **pakuje archiwalny `archive/0.2.15/index.html`** z katalogu repozytorium. Dzięki temu dashboard na GitHub Pages oraz aplikacja korzystają z tego samego kodu. Przyszłe wersje mogą przekształcić frontend w React.

## Status i ograniczenia

Kod aplikacji i proces budowania przygotowano w repozytorium. Dopiero **udany workflow Windows** potwierdza, że instalator został zbudowany. Test na komputerze użytkownika pozostaje konieczny.

W 0.3.0 nie ma jeszcze C# rejestratora, automatycznego wykrywania ACC ani wsparcia zwykłego AC. To plan serii 0.3.x. Czat AI będzie etapem 0.4.x.
