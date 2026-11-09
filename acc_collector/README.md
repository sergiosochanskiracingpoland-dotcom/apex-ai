# Apex AI 0.2.1 — rejestrator ACC na Windows 11

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

### Ważne ograniczenia wersji testowej

- Rejestrator działa **lokalnie na Windows**, bez serwera, logowania i usług AI.
- Zapis CSV z pierwszych prób wersji 0.2 może nie mieć czasów sektorów; aby sprawdzić nową poprawkę, pobierz ZIP z GitHuba jeszcze raz.
- Nie publikuje danych w internecie. Import pliku do Apex AI odbywa się lokalnie w Twojej przeglądarce.
- Sektory w wersji 0.2.1 są **przybliżonymi czasami** wyliczonymi z momentów zmiany sektora (około 5 Hz, możliwy błąd około 0,2–0,5 s). W pliku `_laps.csv` oznacza je kolumna `sector_source=estimated_5hz`. Jeśli nie udało się zaobserwować pełnego okrążenia, czasy sektorów pozostają puste. **Nie są to oficjalne czasy sektorów ACC.**
- Jest to **pierwszy prototyp bez testu na działającej grze**, a nie potwierdzona integracja ACC. Po pierwszym teście możemy skorygować różnice w wersjach Shared Memory.
- Zarejestrowane temperatury **nie oznaczają zmierzonego zużycia opon**. Nie należy diagnozować degradacji wyłącznie z temperatur.
- Dane wpisane jako `fuel` traktujemy roboczo jako litry, ale należy porównać wskazanie z grą podczas pierwszego testu.
- Jeśli strona Apex AI jest otwarta z Internetu przez GitHub Pages, pliki `*_samples.csv` nie są jeszcze analizowane w dashboardzie.
- Uruchamiaj wyłącznie kod, którego źródło znasz; plik CMD uruchamia dołączony skrypt PowerShell w procesie z polityką `Bypass`, bez trwałej zmiany ustawień systemu.

### Źródła formatu Shared Memory

ACC udostępnia `Local\acpmf_graphics` oraz `Local\acpmf_physics`; kolejność pól do odczytu sprawdzono w strukturach `Graphics.cs` i `Physics.cs` projektu [AssettoCorsaCompetizioneSharedMemory](https://github.com/MorGuux/AssettoCorsaCompetizioneSharedMemory) oraz w [CppAccSharedMemory](https://github.com/SolusDev-sys/CppAccSharedMemory).
