# Apex AI 0.3.6 — „Jedź” oraz analiza wyścigu

Wersja **0.3.6** dodaje dwa moduły: uruchamianie ACC przez Steam w zakładce **Jedź** oraz nową zakładkę **Wyścig**, powiązaną z Historią, Dashboardem, Analizą stintu i ekranem Na torze.

## Jedź

- Przycisk **Uruchom ACC przez Steam** wysyła systemowy URI `steam://run/805550`.
- Potwierdzenie otwarcia URI nie jest potwierdzeniem uruchomienia gry. Status zmienia się dopiero po wykryciu ACC przez rejestrator.
- Nie trzeba wskazywać ścieżki gry. Obsługa AC przez Steam/Content Manager pozostaje osobną funkcją kolejnej wersji.

## Wyścig

Nowy plik `acc_YYYYMMDD_HHMMSS_NNNN_race.json` to **raport jednej sesji gry**, która może zawierać wiele stintów. Dotychczasowe pliki `_samples.csv` / `_laps.csv` i zakładka Historia nadal działają. W metadanych nowych stintów znajduje się `raceId`; stare stinty nie mają sztucznie uzupełnianych danych wyścigowych.

Nowy rejestrator odczytuje z **ACC Graphics shared memory (Pack=4)**:
- `session` pod offsetem 8 (2 = wyścig);
- `position` pod offsetem 136 (miejsce w klasyfikacji, jeśli wartość jest prawidłowa);
- `isInPit` pod offsetem 160 (obserwacja boxu/pit);
- `isInPitLane` pod offsetem 280 (wejście i wyjście z pit lane);
- `sessionTimeLeft` pod offsetem 152 i `mandatoryPitDone` pod 288;
- `tyreCompound` od offsetu 176;
- `fuel` i `speedKmh` z ACC Physics.

Po każdym **wjazdzie do pit lane** dotychczasowy stint jest archiwizowany, a po **wyjeździe** rozpoczyna się następny. Raport wyścigu łączy oba stinty, więc nie gubimy całego wyścigu przy pit stopie.

### Co pokazujemy jako fakt, a czego nie zgadujemy?

| Informacja | Status |
|---|---|
| Liczba zarejestrowanych wizyt w pit lane | **Pomiar**; zliczamy wejście z zewnątrz i wyjście z pit lane |
| Czas od wjazdu do wyjazdu z pit lane | **Pomiar** czasu wizyty; to NIE jest czas obsługi mechaników |
| Czas przy prędkości do 2 km/h | **Szacunek czasu postoju**, obejmuje także zatrzymanie na pasie |
| Wzrost ilości paliwa | **Pomiar** różnicy poziomu paliwa (co najmniej 0,5 l), przybliżenie zatankowanej ilości |
| Pozycja w wyścigu i jej zmiany | **Pomiar** wartości ACC; tylko dla sesji typu Race |
| Zmiana mieszanki opon | **Pomiar** różnicy nazwy mieszanki przed i po wizycie, jeśli ACC podaje obie |
| Wymiana opon na nowy komplet | **Niepotwierdzona**; identyczna mieszanka nie pozwala potwierdzić wymiany |
| Naprawy, zmiana kierowcy, dokładny czas mechaników | **Brak danych w obecnym module** |
| Liczba obowiązkowych pit stopów | Jeszcze nieobsługiwana w raporcie |

Nie podajemy liczby pit stopów dla historycznych plików CSV, które nie mają `raceId` — nie ma w nich kompletnych informacji o wizytach w pit lane.

## Zgodność i wydajność

- Zachowane docelowe **75 Hz** i poprawka biegów **R / N / 1–6**.
- Nowe kolumny dodawane **na końcu CSV**: `race_position`, `in_pit_lane`, `session_type`, `session_time_left_s`, `mandatory_pit_done`. Poprzednie 30 kolumn pozostaje bez zmian.
- Zapis pliku wyścigu jest osobny i odbywa się tylko przy zdarzeniach lub nie częściej niż co 2 s dla zmian miejsca. Nie wykonujemy zapisów JSON 75 razy na sekundę.
- Tapety CC0, historia, personalizacja i raporty pozostają bez zmian.
- Przejścia do nowego raportu przez przyciski z Historii, raportu stintu, Dashboardu i „Na torze”.

## Test ręczny w ACC

1. Uruchom Apex AI 0.3.6 → **Jedź** → **Uruchom ACC przez Steam**. Zweryfikuj, czy ACC faktycznie się uruchamia, po czym gra jest automatycznie wykrywana.
2. W ACC wybierz **Race** (a nie Practice), najlepiej krótki wyścig na Imoli/Monzy. Sprawdź rzeczywistą pozycję, przejedź 1–2 okrążenia.
3. Zjedź do pit lane, zatrzymaj się w swoim boxie, **zatankuj** i opcjonalnie zmień mieszankę. Po wyjeździe przejedź jeszcze pełne okrążenie.
4. Otwórz **Wyścig**: sprawdź, czy jest dokładnie jedna wizyta, czas pit lane jest prawdopodobny, zauważony wzrost paliwa jest zbliżony do wartości gry, widnieją obie części wyścigu.
5. Sprawdź zmianę pozycji, powrót do raportu stintu przez kliknięcie i przejście z Historii do Wyścigu.
6. Sprawdź, czy **75 Hz** i FPS nadal są stabilne i czy kolejne wyścigi mają osobne raporty.
7. Nie oczekuj potwierdzenia wymiany identycznych opon lub napraw; przy takich zdarzeniach nowy moduł powinien pokazać brak danych, a nie wymyślony pomiar.

Automatyczne testy CI kompilują kolektor i uruchamiają symulację wejścia/wyjścia z pit lane (czas, paliwo, pozycja, więcej niż jeden stint) oraz testy historii i interfejsu. **Rzeczywistego zachowania pamięci ACC w pit lane nie da się potwierdzić bez testu w grze**.

### Źródła opisujące strukturę ACC Graphics
- [ACC Shared Memory: lista pól](https://github.com/ebnerdm/accshm/blob/main/FIELDS.md)
- [PyAccSharedMemory](https://github.com/rrennoir/PyAccSharedMemory)

Instalator Windows 10/11 x64 nie jest podpisany certyfikatem. Użytkownicy wersji 0.3.5.1 powinni jednorazowo uruchomić nowy instalator ręcznie, bo poprzednie wydanie miało wewnętrzny numer 0.3.6 (niezgodność numeracji aktualizatora).
