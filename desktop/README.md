# Apex AI 0.3.5 — eksperyment 75 Hz

Wydanie 0.3.5 skupia się **wyłącznie na rejestrowaniu i diagnostyce próbkowania ACC**. W poprzednim teście aplikacji 0.3.4.5 użytkownik potwierdził 18/18 funkcji, 6 okrążeń i efektywną częstotliwość 32,3 Hz.

## Zmiany

- **Cel rejestratora: 75 Hz**, czyli 13,333 ms pomiędzy kolejnymi zaplanowanymi odczytami. Zastąpiono dotychczasowe `Thread.Sleep` i czas oparty na przebiegu pętli mechanizmem planowania odczytów wg monotonicznego zegara `Stopwatch`/QPC.
- Zegar śpi przez większość oczekiwania i aktywnie czeka tylko przez ostatnie ok. 1 ms. Przy dużym opóźnieniu synchronizuje się ponownie bez sztucznego generowania zaległych próbek.
- **Rozszerzona diagnostyka** w `Dashboard → Jakość telemetrii` oraz w pełnym raporcie History:
  - efektywna liczba **zapisanych próbek na sekundę**, liczona z timestampów w czasie jazdy;
  - liczba **unikalnych zmian physics_packet_id na sekundę** (odrębna od liczby zapisów, może być niższa);
  - udział powtarzanych pakietów, realizacja celu 75 Hz;
  - mediana / 95. percentyl odstępu, liczba opóźnień >25 ms i przerw >250 ms;
  - najdłuższy odstęp i liczba zapisanych próbek.
- Metadane nowych stintów zawierają `targetSamplingHz=75` i `samplingMode=deadline_qpc_75hz`.
- Wszystkie historie w CSV pozostały w niezmienionym formacie; stare pliki można nadal otwierać.

## Ograniczenia

**75 Hz to cel, nie gwarantowana częstotliwość dostarczanych przez grę nowych pakietów.**
Jeżeli ACC aktualizuje pamięć współdzieloną wolniej lub system opóźnia wykonywanie procesu, zobaczymy to w pomiarze. Duża liczba powtórzonych pakietów oznacza, że dalsze zwiększanie liczby odczytów nie dostarczy większej ilości unikalnych danych gry.

Zarówno liczby jak i wykresy pochodzą z rzeczywistych plików ACC. Nie ekstrapolujemy telemetrycznych próbek ani nie „wypełniamy” brakujących wartości.

## Procedura testowania 0.3.5

1. **Przed instalacją zapisz wynik odniesienia:** 0.3.4.5 — 32,3 Hz, 6 okrążeń. Nie usuwaj zapisanych sesji.
2. Zainstaluj `ApexAI-Setup-0.3.5-x64.exe` bez odinstalowywania wersji poprzedniej.
3. Uruchom ACC bez osobnego rejestratora CMD. Przejedź **minimum 6 pełnych okrążeń** z rzeczywistym zużyciem paliwa i opon.
4. W Historii otwórz nowy stint. W sekcji **Jakość telemetrii** przepisz: zapisane próbki/s, unikalne odczyty ACC/s, powtórzone pakiety (%), 95. percentyl odstępu (ms), przerwy >250 ms.
5. Porównaj je z 32,3 Hz. Sprawdź kompletność czasów, prawidłowość prędkości/sterowania oraz FPS w ACC.
6. Jeżeli krótki test przejdzie, wykonaj **stint 30 minut**. Sprawdź wykresy, płynność i wielkość pliku próbek.
7. Zrób screen Dashboardu oraz raportu diagnostyki i przekaż do analizy.

### Kryteria wyniku
- **70–75 Hz zapisów, ale mniej unikalnych pakietów:** harmonogram pomiarowy działa, ogranicza nas źródło danych.
- **Poniżej 60 Hz zapisów:** harmonogram lub obciążenie nadal ogranicza skuteczność; diagnostyka odstępów pokaże skalę problemu.
- **Utrata okrążeń, niskie FPS, duże luki:** regresja do poprawienia przed dalszym rozwojem.

Kolejne wydania mogą zoptymalizować rozmiar danych lub częstotliwość. Nie zwiększamy celu do 100 Hz bez uzasadnienia pomiarami.

## Funkcje zachowane z 0.3.4.5

- Tapety GT3/WEC/F1 z licencją CC0 przechowywane lokalnie, podgląd, filtry i własny JPG/PNG/WEBP.
- Personalizacja, PL/EN, własne widżety i aktualizator.
- Historia i pełne raporty, analiza hamowań, porównania okrążeń, podgląd Na torze.

**Sesje:** `Dokumenty\ApexAI\sessions` · **Konfiguracja:** Electron `userData/settings/preferences.json`. Instalator zachowuje istniejące dane.

## Kompilacja

```powershell
cd desktop
dotnet publish collector/ApexCollector.csproj -c Release -r win-x64 --self-contained true -o collector/publish -p:PublishSingleFile=true
npm install
npm test
npm run dist
```

Windows GitHub Actions dodatkowo pobiera i weryfikuje 6 zdjęć CC0, uruchamia testy UI i sprawdza zawartość instalatora oraz manifest aktualizatora `latest.yml`.
