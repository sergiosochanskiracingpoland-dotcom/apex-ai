# Apex AI 0.2.13 — dashboard i rejestrator ACC

## Uruchomienie bez instalowania Pythona

1. Na stronie repozytorium kliknij **Code → Download ZIP**, rozpakuj archiwum.
2. Włącz **Assetto Corsa Competizione** i wejdź na tor (nie tylko do menu).
3. W folderze `acc_collector` kliknij dwukrotnie **Start-ApexACC.cmd**.
4. Przejedź minimum 2–3 pełne okrążenia, obserwując komunikaty o okrążeniach w okienku rejestratora.
5. Zatrzymaj rejestrator naciskając **Ctrl+C** w jego oknie, a następnie potwierdzając zakończenie, jeśli Windows zapyta.
6. W Apex AI w przeglądarce kliknij **Importuj okrążenia** i wybierz plik kończący się na **_laps.csv**.
7. Kliknij **Importuj telemetrię** i wybierz odpowiadający mu plik **_samples.csv** z tej samej sesji. Dashboard pokaże liczbę wczytanych próbek.

**Folder wyników:** `Dokumenty\ApexAI\sessions` (rzeczywisty systemowy katalog Dokumenty, także gdy przekierowany do OneDrive).

Powstają dwa pliki dla każdej sesji (gdy rejestrator uruchomiono tylko raz):
- `*_laps.csv`: ukończone okrążenia, czasy, paliwo, temperatury rdzenia opon; format współpracujący z obecnym dashboardem.
- `*_samples.csv`: próbki z eksperymentalną docelową częstotliwością 50 Hz (20 ms między pomiarami), m.in. prędkość, gaz, hamulec, paliwo, ciśnienia i temperatury — baza pod przyszłe wykresy hamowania i coaching.

### Co zmieniono w 0.2.13

**Race Analysis Engine v1 — nowa sekcja pod wykresami porównawczymi.** Działa lokalnie, regułowo, bez zewnętrznego modelu AI:

1. **Wykrywanie stref hamowania** z próbek hamulca na wybranym okrążeniu A. Progi: nacisk >=18%, szczyt >=45%, czas >=0,22 s, prędkość >35 km/h. Łączymy bliskie fragmenty; strefy nie są oficjalnymi granicami zakrętów.
2. **Porównanie techniki A/B w strefach:** początek hamowania (procent postępu okrążenia), prędkość minimalna w strefie i do 3% trasy za nią oraz punkt powrotu do >=80% gazu. Strefy B dopasowywane są według początku hamowania (tolerancja 3,5% długości trasy); niedopasowane oznaczamy kreską.
3. **Mapa zmian czasu B − A** na kolejnych odcinkach po 5% długości toru. Czasy są obliczane z UTC próbek interpolowanych względem postępu okrążenia. Dodatnie słupki = B wolniejsze na odcinku, ujemne = B szybsze. Nie ekstrapolujemy brakujących fragmentów, odrzucamy nieciągłe lub cofające się znaczniki czasu. Suma **nie musi równać się** różnicy pełnych czasów, ponieważ niekompletne odcinki są pomijane.
4. **Trzy priorytety analizy** — odcinki o największej mierzalnej stracie B względem A (próg >0,025 s). Jeśli B nie traci na żadnym wiarygodnym odcinku, pokazujemy największe zyski. Wnioski są ostrożne: wskazują miejsce i sugerują sprawdzenie hamowania, prędkości i gazu, **nie przypisują automatycznie przyczyny**.
5. **Przyciski „Pokaż”** w tabeli stref i na liście priorytetów automatycznie ustawiają przybliżenie trzech wykresów porównawczych i przenoszą widok do sekcji porównania.
6. Wybór okrążeń A/B steruje analizą; zoom i suwak punktu odczytu z 0.2.12 pozostają bez zmian.

**Przykładowy test 0.2.13:** 2 okrążenia rozgrzewkowe, następnie **10 pełnych okrążeń pomiarowych** bez restartowania sesji, najlepiej Ferrari 296 GT3 na Imoli w stałych warunkach. Włącz zużycie paliwa i opon, jeśli chcesz testować również ich analizę. Po zatrzymaniu rejestratora zaimportuj odpowiadające sobie `*_laps.csv` i `*_samples.csv`. Porównaj najlepsze okrążenie z wyraźnie wolniejszym; sprawdź mapę zmian czasu, strefy hamowania, trzy priorytety i przyciski przybliżenia. Prześlij oba pliki i zrzuty.

**Uwaga:** dla wiarygodnego pomiaru czasów fragmentów potrzebne są ciągłe próbki UTC. Gdy są luki, dashboard pomija niepewne odcinki; nie obiecuje oficjalnej mapy strat czasu, nazw zakrętów ani jednoznacznej diagnozy. W rejestratorze zmieniono **wyłącznie numer wersji** w tytule i konsoli, bez zmian w odczycie ACC, blokadzie drugiej instancji i formacie CSV. Testy automatyczne na danych syntetycznych przeszły; rzeczywisty test w ACC pozostaje do wykonania.

### Co zmieniono w 0.2.12

- **Przybliżanie trzech wykresów porównawczych** (prędkość, gaz, hamulec): suwaki `Od` i `Do` wybierają fragment postępu okrążenia z dokładnością do 5 punktów procentowych. Przycisk `Całe okrążenie` przywraca widok 0–100%.
- **Odczyt w punkcie:** suwak `Odczyt w punkcie` (krok 0,5% trasy) pokazuje pionowy znacznik na wszystkich trzech wykresach oraz tabelę z wartościami okrążenia A, B i różnicą **B − A**. Dla gazu i hamulca wartości i różnice podawane są w procentach/ punktach procentowych. Dane są interpolowane z próbek ACC; różnica prędkości w punkcie nie oznacza bezpośrednio straty czasu.
- **Dokładniejsze wykresy:** rozdzielczość wyrównania danych zwiększona z 0,5% do 0,1% postępu trasy. Brakujące fragmenty nie są ekstrapolowane.
- **Ostrożniejsze wskazówki:** poniżej 5 okrążeń nie oceniamy regularności ani trendu tempa; gdy CSV nie pokazuje mierzalnego spadku paliwa, dashboard informuje o tym zamiast podawać `0,00 L/okr.`. Ulepszono również podsumowanie i odpowiedzi regułowego inżyniera o paliwie.
- **Rejestrator:** tylko napis wersji w PowerShell i tytuł okna zmieniono na 0.2.12. Mechanizm odczytu ACC, format CSV, częstotliwość docelowa i blokada drugiej instancji pozostają bez zmian.

**Test 0.2.12 bez nowej jazdy:** otwórz [dashboard](https://sergiosochanskiracingpoland-dotcom.github.io/apex-ai/), odśwież `Ctrl+F5`, wczytaj istniejące pliki `acc_20261115_131708_1527_laps.csv` oraz `acc_20261115_131708_1527_samples.csv` (Ferrari 296 GT3, Imola). Powinny pojawić się 2 ukończone okrążenia, **17 516 próbek**, czasy **1:48.205** i **1:47.362**, różnica **B − A = −0.843 s**. Sprawdź zakres `25–50%`, przesuń suwak punktu odczytu i porównaj wartości w tabeli oraz znaczniki na wykresach. Priorytety treningowe powinny informować o zbyt małej liczbie okrążeń i braku mierzalnego spadku paliwa. Nie trzeba ponownie uruchamiać ACC, aby sprawdzić dashboard. Aby także okno rejestratora pokazywało 0.2.12, pobierz nowy ZIP repozytorium.

**Status testów:** kod JavaScript i funkcje porównawcze sprawdzono automatycznie na danych syntetycznych (interpolacja, luki, zoom, odczyt, dwa okrążenia, brak danych). Weryfikacja wizualna i interakcyjna w przeglądarce użytkownika pozostaje do wykonania.

### Co zmieniono w 0.2.11

- Dodano do dashboardu **porównanie dwóch wybranych okrążeń** na trzech wykresach: prędkość, gaz i hamulec. Kolor turkusowy oznacza okrążenie A, pomarańczowy okrążenie B.
- Porównanie korzysta z istniejących plików `*_samples.csv`. Próbki są wyrównywane do wspólnej osi postępu okrążenia (0–100%) z interpolacją liniową; brakujących fragmentów nie ekstrapolujemy. **Nie jest to porównanie po czasie ani automatyczna diagnoza błędów.**
- Gdy zaimportowano także odpowiadający plik `*_laps.csv`, dashboard pokazuje czasy A i B oraz różnicę **B − A** (wartość ujemna = B szybsze).
- Pozostawiono osobne wykresy prędkości, gazu i hamulca z 0.2.10.5 oraz wybór pojedynczego okrążenia.
- W rejestratorze zmieniono **wyłącznie napis wersji** w konsoli i tytule okna na 0.2.11. Odczyt ACC, format CSV, blokada drugiej instancji i próbkowanie pozostają identyczne.
- Testy automatyczne obejmują składnię JavaScript, interpolację, luki w danych, rysowanie trzech wykresów i wyświetlanie różnicy czasów. **Test z rzeczywistym ACC nadal wymagany.**

**Test 0.2.11:** otwórz dashboard, odśwież `Ctrl+F5`, sprawdź nagłówek `0.2.11`. Zaimportuj `acc_20261111_182843_7449_laps.csv` i `acc_20261111_182843_7449_samples.csv` (Ferrari, Imola), wybierz A=1 i B=2. Oczekiwana różnica **B − A = −0.022 s** (1:46.355 minus 1:46.377). Sprawdź trzy nakładające się wykresy i zmianę obu list. Aby rejestrator również pokazywał 0.2.11, pobierz nowy ZIP repozytorium i uruchom nowy CMD. Prześlij oba CSV i zrzuty wykresów po nowym teście.

### Co zmieniono w 0.2.10.5

- Ujednolicono numer wersji w **dashboardzie**, nagłówku okna Windows i komunikacie startowym rejestratora: wszędzie widnieje **Apex AI 0.2.10.5**.
- Funkcje z 0.2.10 (wykresy gazu i hamulca oraz zsynchronizowany wybór okrążenia) pozostają dostępne.
- **Nie zmieniono logiki rejestratora** względem 0.2.9: nadal odczytuje ACC, zapisuje te same dwa pliki CSV, próbuje próbkować z częstotliwością 50 Hz i blokuje podwójne uruchomienie.
- Aby zobaczyć nowy numer w **oknie rejestratora**, pobierz ponownie repozytorium przez `Code → Download ZIP`, rozpakuj i uruchom nowy `Start-ApexACC.cmd`. Samo odświeżenie strony nie aktualizuje plików PowerShell na komputerze.

**Test 0.2.10.5:** odśwież stronę `Ctrl+F5` (nagłówek 0.2.10.5), uruchom nowo pobrany rejestrator (tytuł okna i pierwszy wiersz 0.2.10.5), następnie zaimportuj wcześniej zapisane pliki `*_laps.csv` i `*_samples.csv` i sprawdź wykresy prędkości, gazu i hamulca. Nowa jazda nie jest wymagana do testu dashboardu.

### Co zmieniono w 0.2.10

- **Wykres gazu i hamulca:** po zaimportowaniu `*_samples.csv` dashboard pokazuje dwa przebiegi pedałów na wspólnym wykresie: gaz (turkusowy) i hamulec (pomarańczowy), oba w skali 0–100%.
- **Wybór okrążenia:** wykres pedałów i wcześniejszy wykres prędkości mają zsynchronizowane listy okrążeń. Zmiana okrążenia w dowolnym miejscu aktualizuje oba wykresy.
- Oś pozioma przedstawia postęp okrążenia od 0 do 100%. Dane pochodzą bezpośrednio z ACC, bez wygładzania; podczas ograniczania liczby punktów zachowywane są wartości minimalne i maksymalne krótkich fragmentów.
- **Nie zmieniono rejestratora** (nadal wersja 0.2.9), jego próbkowania, sposobu wykrywania torów i samochodów, sektorów ani formatu plików CSV.

**Test 0.2.10 (bez nowej jazdy):** odśwież dashboard `Ctrl+F5`. Zaimportuj pliki `acc_20261111_182843_7449_laps.csv` oraz `acc_20261111_182843_7449_samples.csv` z ostatniego testu Ferrari na Imoli. Sprawdź, czy widać dwie linie (gaz i hamulec) oraz czy zmiana okrążenia 1 ↔ 2 na jednym z wykresów aktualizuje również drugi. Wykresy mają przedstawiać pełne okrążenie, nie okrążenie wyjazdowe.

### Co zmieniono w 0.2.9

- **Blokada podwójnego uruchomienia:** rejestrator używa systemowego muteksu Windows `Local\\ApexAI_ACCCollector`. Jeśli pierwsza kopia nadal działa, druga wyświetla ostrzeżenie i kończy pracę **bez tworzenia plików CSV**. Działa także po uruchomieniu kopii z różnych folderów.
- **Wykres prędkości:** po imporcie `*_samples.csv` dashboard pokazuje prędkość (km/h) w funkcji postępu okrążenia (0–100%). Można wybierać ukończone okrążenia; domyślnie pokazuje najlepsze z `*_laps.csv` (jeśli jest dostępne).
- Pierwsze okrążenie może zawierać wyjazd z boksu; wykres wybiera końcowy pełny przebieg postępu 0–100%, nie miesza go z outlapem. Nieukończonych okrążeń nie pokazuje.
- Dla płynnego działania wykres wyświetla ograniczoną liczbę punktów, ale **nie zmienia oryginalnego CSV ani próbek w pamięci**.
- Próbkowanie ACC, szacowanie sektorów i formaty CSV pozostają bez zmian.

**Test 0.2.9 (bez jazdy):** otwórz dashboard i zaimportuj oba pliki z testu Lamborghini na Imoli: `acc_20261111_154845_3342_laps.csv` i `acc_20261111_154845_3342_samples.csv`. Powinny pojawić się okrążenia 1, 2, 3 i wykres prędkości; domyślnie okrążenie 3 (1:46.112). Przełącz na 1 i 2, sprawdź, czy wykres się zmienia.

**Test 0.2.9 (blokada):** uruchom `Start-ApexACC.cmd` dwukrotnie bez zamykania pierwszego okna. Druga kopia powinna zgłosić, że rejestrator już działa, i **nie tworzyć nowej pary plików**. Jeśli Windows pyta o zamknięcie okna, pozostaw pierwszą kopię uruchomioną i zamknij tylko drugą.

### Co zmieniono w 0.2.8

- Dashboard umożliwia osobny import pliku `*_samples.csv` (surowa telemetria ACC) bez modyfikowania rejestratora.
- Sprawdza nagłówki, czas UTC i wymagane wartości liczbowe, a następnie pokazuje liczbę wczytanych próbek i dostępne kanały.
- Jeśli nazwy plików wskazują różne sesje, nie pozwala przypadkowo połączyć ich danych. Import nowego pliku okrążeń usuwa niepasującą telemetrię poprzedniej sesji.
- Dane pozostają **wyłącznie w pamięci przeglądarki** podczas bieżącej pracy. Wykresy z surowej telemetrii pojawią się w kolejnych wersjach.
- Rejestrator, próbkowanie i formaty CSV pozostają bez zmian.

**Test 0.2.8:** nie musisz jechać kolejnego stintu. Otwórz dashboard, odśwież `Ctrl+F5`, zaimportuj oba pliki z testu 0.2.7 (`acc_20261111_153200_7263_laps.csv` i `acc_20261111_153200_7263_samples.csv`). Powinno pojawić się **7 956 próbek** oraz informacja, że oba pliki są z tej samej sesji. Sprawdź również, czy nadal wyświetlają się czasy okrążeń i wykres sektorów.

### Co zmieniono w 0.2.7

- **Naprawa sektorów:** zachowujemy szacunkowe czasy S1/S2 z ukończonego okrążenia, nawet gdy ACC przełącza sektor z 2 na 0 przed zwiększeniem licznika okrążeń. W teście 0.2.6 taka różnica wynosiła około 31–67 ms, przez co czasy sektorów znikały.
- **Dokładniejszy zegar:** na Windows rejestrator próbuje włączyć rozdzielczość timera 1 ms przez `winmm.dll` (`timeBeginPeriod(1)`). Wyłącza ją przy zamknięciu. Jeśli system nie pozwoli, działa dalej na standardowym zegarze.
- Używa `Thread.Sleep` zamiast `Start-Sleep` do odmierzania pozostałego czasu cyklu. Cel nadal wynosi **50 Hz (20 ms)**; wynik musi potwierdzić test w ACC.
- Zachowano format CSV, odczytywane kanały, wykrywanie torów/samochodów i etykietę `estimated_50hz`. **Czasy sektorów są nadal szacunkowe, a nie oficjalne z ACC.**
- Dashboard ma teraz osobny **wykres S1/S2/S3** dla okrążeń. Jeśli importowany plik nie zawiera sektorów (np. 0.2.6), wyświetla jasny komunikat zamiast pustego wykresu. Tabela w zakładce „Analiza stintu” pozostaje bez zmian.

**Test 0.2.7:** przejedź na Imoli 2–3 pełne okrążenia, najlepiej Ferrari 296 GT3 dla porównania z 0.2.6. Sprawdź, czy w konsoli widnieje `Timer Windows: tryb 1 ms aktywny`, a następnie prześlij zrzut konsoli i oba pliki CSV. Zbadamy rzeczywistą częstotliwość, stabilność oraz obecność wszystkich sektorów w `*_laps.csv`. Zaimportuj plik `*_laps.csv` do dashboardu i sprawdź wykres sektorów.

### Co zmieniono w 0.2.6

- **Eksperymentalne 50 Hz:** skrócono docelowy odstęp między zapisami z 50 ms do 20 ms.
- Nie zmieniono sposobu odczytu Shared Memory, rozpoznawania toru i samochodu, struktury plików CSV ani mechanizmu szacowania sektorów.
- Nowe szacunkowe sektory mają oznaczenie `estimated_50hz`, które informuje o **docelowej** częstotliwości próbkowania, a nie gwarantuje osiągnięcia 50 Hz.
- Częstotliwość rzeczywistą i powtórzenia danych trzeba zweryfikować na pliku `*_samples.csv`; sama liczba wierszy nie dowodzi, że ACC dostarczyło tyle samo nowych pakietów.

**Test 0.2.6:** pobierz najnowszy ZIP, uruchom ACC i rejestrator, przejedź 2–3 pełne okrążenia. Prześlij zrzut konsoli oraz oba pliki `*_laps.csv` i `*_samples.csv`. Porównamy średnią częstotliwość, odstępy między próbkami, przerwy i liczbę powtarzających się wartości z wersją 0.2.5. Nie przechodzimy do dalszej optymalizacji bez wyników tego testu.

### Co zmieniono w 0.2.5

- Zwiększono **docelową częstotliwość zapisu próbek z około 5 Hz do 20 Hz** (interwał 50 ms).
- Interwał uwzględnia czas wykonania odczytu i zapisu (zegar monotoniczny `Stopwatch`), zamiast dodawać 50 ms opóźnienia do każdej iteracji.
- Nie zmieniono źródła danych ACC, odczytywanych pól, formatu czasu okrążeń ani wykrywania toru/samochodu.
- Szacunkowe sektory z nowych sesji otrzymują etykietę `estimated_20hz`; **nadal nie są oficjalnymi sektorami ACC**.
- 20 Hz to **cel próbkowania, nie potwierdzona częstotliwość świeżych danych z gry**. Faktyczną częstotliwość, ewentualne powtórzenia odczytów i stabilność trzeba ocenić na rzeczywistych plikach `*_samples.csv`.

**Test 0.2.5:** pobierz najnowszą wersję, przejedź na Imoli Porsche 992 GT3 R 2–3 pełne okrążenia i prześlij **oba** pliki CSV oraz zrzut konsoli. Zmierzymy rzeczywistą liczbę próbek na sekundę, odstępy między próbkami, zgodność okrążeń i zachowanie programu.

### Co zmieniono w 0.2.4

- Nazwa toru i model samochodu są **odczytywane z ACC StaticInfo** (tor: offset 134, samochód: offset 68), a nie przypisywane na stałe.
- Identyfikator `Imola` jest wyświetlany jako `Imola Autodromo Enzo e Dino Ferrari`, a `porsche_992_gt3_r` jako `Porsche 992 GT3 R`. To mapowanie nazw do wyświetlania, nie dodatkowe pole udostępniane przez ACC.
- Nieznane identyfikatory wyświetlane są bez zmian, bez zgadywania pełnych nazw.
- Konsola pokazuje **nazwę oraz oryginalny identyfikator ACC**; nowy plik `*_laps.csv` zawiera `track` (surowe ID), `track_name`, `car_model` (surowe ID) i `car_name`.
- Dashboard pokazuje nazwę toru i samochodu po imporcie nowego CSV. Starsze pliki bez nowych kolumn nadal działają.
- Program sprawdza identyfikatory co około sekundę i rozpoczyna nowy plik sesji, jeśli wykryje zmianę toru lub samochodu. Po wyjściu z aktywnej sesji nie przenosi starego identyfikatora do kolejnej sesji.

**Test 0.2.4:** uruchom Imolę w Porsche 992 GT3 R, przejedź pełne okrążenie i sprawdź obie nazwy. Następnie zmień tor na inny (np. Monza) i uruchom kolejną sesję; musi pokazać nazwę nowego toru, nigdy Imolę. Sprawdź oba pliki `*_laps.csv` w dashboardzie. Jeśli ACC zwróci nieznane ID, zobaczysz je w oryginalnej postaci.

### Co zmieniono w 0.2.3

- Rejestrator odczytuje nazwę toru z `Local\acpmf_static` (pole `Track` w ACC StaticInfo).
- Po rozpoczęciu sesji pokazuje np. `Wykryty tor: imola`.
- W pliku `*_laps.csv` dopisuje na końcu kolumnę `track`; format czasów i pozostałe kolumny nie zmieniają się.
- Dashboard wyświetla nazwę toru przy informacji o wczytanej sesji. Starsze CSV bez kolumny `track` nadal działają.
- Gdy ACC nie udostępnia nazwy toru, pole pozostaje puste. Rejestracja okrążeń trwa dalej, bez zgadywania toru.

**Test:** rozpocznij sesję na Imoli, sprawdź komunikat `Wykryty tor`, przejedź 2–3 okrążenia i zaimportuj nowy plik `*_laps.csv` do dashboardu. Nie trzeba zmieniać samochodu ani ustawień zużycia.

### Co zmieniono w 0.2.2

- Czas ukończonego okrążenia w oknie rejestratora jest wyświetlany jako `M:SS.mmm`, np. `1:27.010` zamiast `87.010 s`.
- Dashboard stosuje ten sam format i poprawnie obsługuje zaokrąglenie przy granicy minuty.
- **CSV pozostaje bez zmian:** `time` jest liczbą sekund (np. `87.010`), aby zachować zgodność z analizą i wcześniejszymi plikami.

### Ważne ograniczenia wersji testowej

- Rejestrator działa **lokalnie na Windows**, bez serwera, logowania i usług AI.
- Zapis CSV z pierwszych prób wersji 0.2 może nie mieć czasów sektorów; aby sprawdzić nową poprawkę, pobierz ZIP z GitHuba jeszcze raz.
- Nie publikuje danych w internecie. Import pliku do Apex AI odbywa się lokalnie w Twojej przeglądarce.
- Sektory od wersji 0.2.1 są **przybliżonymi czasami** wyliczonymi z momentów zmiany sektora. W starszych sesjach oznaczono je `estimated_5hz` lub `estimated_20hz`, a od 0.2.6 — `estimated_50hz` (częstotliwość docelowa). Jeśli nie udało się zaobserwować pełnego okrążenia, czasy sektorów pozostają puste. **Nie są to oficjalne czasy sektorów ACC.**
- Integracja była testowana w ACC, ale wymaga dalszych testów stabilności i zgodności na różnych konfiguracjach.
- Zarejestrowane temperatury **nie oznaczają zmierzonego zużycia opon**. Nie należy diagnozować degradacji wyłącznie z temperatur.
- Dane wpisane jako `fuel` traktujemy roboczo jako litry, ale należy porównać wskazanie z grą podczas pierwszego testu.
- Pliki `*_samples.csv` można importować do dashboardu. Dostępne są wykresy prędkości, gazu i hamulca, ale zaawansowana analiza i porównywanie dwóch okrążeń nie są jeszcze dostępne. Dane pozostają lokalnie w przeglądarce.
- Uruchamiaj wyłącznie kod, którego źródło znasz; plik CMD uruchamia dołączony skrypt PowerShell w procesie z polityką `Bypass`, bez trwałej zmiany ustawień systemu.

### Źródła formatu Shared Memory

ACC udostępnia `Local\acpmf_graphics` oraz `Local\acpmf_physics`; kolejność pól do odczytu sprawdzono w strukturach `Graphics.cs` i `Physics.cs` projektu [AssettoCorsaCompetizioneSharedMemory](https://github.com/MorGuux/AssettoCorsaCompetizioneSharedMemory) oraz w [CppAccSharedMemory](https://github.com/SolusDev-sys/CppAccSharedMemory).
