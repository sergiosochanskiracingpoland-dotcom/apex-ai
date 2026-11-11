# Apex AI 0.2.4 — rejestrator ACC na Windows 11

## Uruchomienie bez instalowania Pythona

1. Na stronie repozytorium kliknij **Code → Download ZIP**, rozpakuj archiwum.
2. Włącz **Assetto Corsa Competizione** i wejdź na tor (nie tylko do menu).
3. W folderze `acc_collector` kliknij dwukrotnie **Start-ApexACC.cmd**.
4. Przejedź minimum 2–3 pełne okrążenia, obserwując komunikaty o okrążeniach w okienku rejestratora.
5. Zatrzymaj rejestrator naciskając **Ctrl+C** w jego oknie, a następnie potwierdzając zakończenie, jeśli Windows zapyta.
6. W Apex AI w przeglądarce kliknij **Importuj CSV** i wybierz plik kończący się na **_laps.csv**.

**Folder wyników:** `Dokumenty\ApexAI\sessions` (rzeczywisty systemowy katalog Dokumenty, także gdy przekierowany do OneDrive).

Powstają dwa pliki dla każdej sesji:
- `*_laps.csv`: ukończone okrążenia, czasy, paliwo, temperatury rdzenia opon; format współpracujący z obecnym dashboardem.
- `*_samples.csv`: próbki około 5 Hz, m.in. prędkość, gaz, hamulec, paliwo, ciśnienia i temperatury — baza pod przyszłe wykresy hamowania i coaching.

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
- Sektory od wersji 0.2.1 są **przybliżonymi czasami** wyliczonymi z momentów zmiany sektora (około 5 Hz, możliwy błąd około 0,2–0,5 s). W pliku `_laps.csv` oznacza je kolumna `sector_source=estimated_5hz`. Jeśli nie udało się zaobserwować pełnego okrążenia, czasy sektorów pozostają puste. **Nie są to oficjalne czasy sektorów ACC.**
- Integracja była testowana w ACC, ale wymaga dalszych testów stabilności i zgodności na różnych konfiguracjach.
- Zarejestrowane temperatury **nie oznaczają zmierzonego zużycia opon**. Nie należy diagnozować degradacji wyłącznie z temperatur.
- Dane wpisane jako `fuel` traktujemy roboczo jako litry, ale należy porównać wskazanie z grą podczas pierwszego testu.
- Jeśli strona Apex AI jest otwarta z Internetu przez GitHub Pages, pliki `*_samples.csv` nie są jeszcze analizowane w dashboardzie.
- Uruchamiaj wyłącznie kod, którego źródło znasz; plik CMD uruchamia dołączony skrypt PowerShell w procesie z polityką `Bypass`, bez trwałej zmiany ustawień systemu.

### Źródła formatu Shared Memory

ACC udostępnia `Local\acpmf_graphics` oraz `Local\acpmf_physics`; kolejność pól do odczytu sprawdzono w strukturach `Graphics.cs` i `Physics.cs` projektu [AssettoCorsaCompetizioneSharedMemory](https://github.com/MorGuux/AssettoCorsaCompetizioneSharedMemory) oraz w [CppAccSharedMemory](https://github.com/SolusDev-sys/CppAccSharedMemory).
