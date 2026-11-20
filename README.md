# Apex AI — Race Engineer

## APEX AI 0.3.3 — aplikacja Windows

**[POBIERZ APLIKACJĘ NA WINDOWS](https://sergiosochanskiracingpoland-dotcom.github.io/apex-ai/)**

Instalator: [ApexAI-Setup-0.3.3-x64.exe](https://github.com/sergiosochanskiracingpoland-dotcom/apex-ai/releases/download/v0.3.3/ApexAI-Setup-0.3.3-x64.exe).

### Poprawka 0.3.3

- **Historia otwiera pełny raport** wybranej sesji: Dashboard i Analiza stintu razem, bez utraty jakichkolwiek danych.
- W raporcie są przejścia do wykresów prędkości, pedałów, porównań okrążeń, paliwa, opon, elektroniki i kontroli jakości.
- Dotychczasowe sesje ACC i pliki CSV pozostają bez zmian.
- Dalsza przebudowa całego interfejsu, języki, tapety i personalizacja są w przygotowaniu.

**[Instrukcje i test pełnego raportu 0.3.3](desktop/README.md)** | [Kod desktop](desktop/) | [Wydania Windows](https://github.com/sergiosochanskiracingpoland-dotcom/apex-ai/releases)

### Archiwum 0.2.x

- [Oryginalny dashboard 0.2.15](archive/0.2.15/index.html)
- [Oryginalny kolektor PowerShell](acc_collector/)

Wszystkie sesje 0.3.x są zapisywane lokalnie w katalogu `Dokumenty\ApexAI\sessions`. Nie wysyłamy telemetrii na zewnętrzny serwer.

**Uwagi:** Instalator wymaga udanego builda GitHub Actions i publikacji wydania v0.3.3. Program nie jest podpisany certyfikatem wydawcy; Windows może pokazać ostrzeżenie SmartScreen. Integracja z prawdziwym ACC wymaga testu podczas jazdy.
