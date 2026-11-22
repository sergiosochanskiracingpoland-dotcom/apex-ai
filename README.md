# Apex AI — Race Intelligence

## Windows desktop 0.3.6

**[Strona Apex AI](https://sergiosochanskiracingpoland-dotcom.github.io/apex-ai/)**

[Instalator Apex AI 0.3.6 (Windows 10/11 x64)](https://github.com/sergiosochanskiracingpoland-dotcom/apex-ai/releases/download/v0.3.6/ApexAI-Setup-0.3.6-x64.exe)

### Co nowego

- **Jedź:** uruchamianie ACC jednym przyciskiem przez Steam, prawdziwe wykrywanie gry, automatyczna rejestracja 75 Hz.
- **Wyścig:** nowa zakładka łącząca wszystkie stinty jednego wyścigu, z pozycją, zmianami miejsc, wizytami w pit lane i danymi z pit stopów.
- **Pit lane:** zmierzony czas w alei, przybliżony czas postoju przy bardzo niskiej prędkości, wykryty wzrost paliwa, ewentualna zmiana mieszanki.
- **Powiązane widoki:** Historia, Dashboard, Analiza stintu i Na torze prowadzą do raportu wyścigu.
- Historia zapisów z poprzednich wersji, korekta biegów R/N/1–6, 75 Hz i tapety CC0 pozostają bez zmian.

**Ograniczenie:** obecny interfejs ACC nie potwierdza wymiany opon na nowy komplet ani zakresu napraw — przy braku informacji Apex AI wyświetla „brak danych”, nie przypisuje nieistniejących czynności.

**Nowość wymaga krótkiego testu w prawdziwym wyścigu z jednym pit stopem.** GitHub Actions i test symulowany przeszły, ale nie zastępują testu ACC w grze.

[Instrukcja, źródła danych i plan testu 0.3.6](desktop/README.md) · [Wydania aplikacji](https://github.com/sergiosochanskiracingpoland-dotcom/apex-ai/releases)

### Dostęp i dane

- Darmowe testy, bez konta i subskrypcji na obecnym etapie.
- Dane sesji: `Dokumenty\ApexAI\sessions`; pliki historyczne zachowane.
- Instalator nie jest podpisany certyfikatem, dlatego Windows może wyświetlić komunikat SmartScreen.
- **Przejście z 0.3.5.1:** zalecana jednorazowa ręczna instalacja 0.3.6, ponieważ 0.3.5.1 miała wewnętrzną wersję aktualizatora 0.3.6.
