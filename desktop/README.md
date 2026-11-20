# Apex AI 0.3.3 — pełny raport stintów w Historii

## Co naprawiono

W 0.3.2 kliknięcie stintu w Historii otwierało tylko zakładkę **Analiza stintu**, pomijając wykresy i porównania dostępne w **Dashboardzie**. To różne widoki tej samej telemetrii, ale dla użytkownika wyglądało jak brak danych.

Od **0.3.3** kliknięcie dowolnego zapisanego stintu (także „Ostatni stint”) otwiera **Pełny raport stintu**:

- **Dashboard:** tempo, sektory, prędkość, gaz/hamulec, porównania okrążeń, Race Analysis Engine, strefy hamowania i podsumowanie.
- **Analiza stintu:** czasy okrążeń, paliwo, opony i ciśnienie, elektronika, dynamika jazdy i jakość telemetrii.
- Pasek raportu zawiera przyciski skoku do obu części i powrotu do Historii.
- Obie części korzystają z **tych samych oryginalnych plików CSV** z wybranego stintu. Nie generujemy fałszywych czy zastępczych danych.
- Zakładki boczne **Dashboard** i **Analiza stintu** nadal działają osobno.
- Nie zmienialiśmy mechanizmu rejestrowania ACC ani archiwalnego dashboardu 0.2.15.

## Instalacja

**[Strona pobierania Windows](https://sergiosochanskiracingpoland-dotcom.github.io/apex-ai/)**

- Instalator: `ApexAI-Setup-0.3.3-x64.exe`.
- Jeżeli używasz zainstalowanej wersji 0.3.2, aktualizacja powinna zostać pobrana przez wbudowany aktualizator. Jeżeli nie zadziała, zainstaluj nową wersję ręcznie.
- Historia pozostaje na dysku w `Dokumenty\ApexAI\sessions`. Nie usuwaj tego folderu.

## Test

1. Otwórz **Historia** i wybierz dowolny stint.
2. Upewnij się, że widać nagłówek **Pełny raport stintu** i u góry przyciski **Dashboard** oraz **Analiza stintu**.
3. Sprawdź wykresy prędkości, gazu/hamulca i porównania okrążeń z pierwszej części raportu.
4. Kliknij „Analiza stintu” i sprawdź poniżej paliwo, opony, elektronikę i dane jakości.
5. Wróć do Historii i wybierz inny stint — zawartość musi się zmienić na dane wybranej jazdy.
6. Następnie wykonaj uzgodniony test 5 okrążeń ACC, sprawdź zapisywanie sesji i otwarcie raportu. Stint bez ukończonych okrążeń może nie mieć wszystkich wykresów.

**0.3.3 to pilna poprawka kompletności raportu.** Całkowicie nowy wygląd, personalizacja, języki, tapety i telemetria live pozostają planem następnej większej aktualizacji, a nie częścią tego wydania.
