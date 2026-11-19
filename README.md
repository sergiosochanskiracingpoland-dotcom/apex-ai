# Apex AI — Race Engineer

## APEX AI 0.3.2 — aplikacja Windows

**[POBIERZ APLIKACJĘ NA WINDOWS](https://sergiosochanskiracingpoland-dotcom.github.io/apex-ai/)**

Instalator: [ApexAI-Setup-0.3.2-x64.exe](https://github.com/sergiosochanskiracingpoland-dotcom/apex-ai/releases/download/v0.3.2/ApexAI-Setup-0.3.2-x64.exe).

### Nowości w 0.3.2

- Nowy ciemny interfejs z czerwonymi i fioletowymi akcentami oraz zwijanym menu bocznym.
- Minimalistyczna strona główna **„Witaj, Kierowco”**.
- Zakładki: **Strona główna**, **Dashboard**, **Analiza stintu**, **Historia**, **Setupy**, **Inżynier AI** i **Jedź**. Ostatnie trzy mają na razie status „w przygotowaniu”.
- **Automatyczna historia każdego stintu** w ACC: zapis trwałych plików telemetrii (CSV) i informacji o torze, samochodzie i dacie (JSON).
- Stinty rozdzielane przy wjeździe do pit lane, po wyjeździe rozpoczyna się nowy plik.
- **Biblioteka z wyszukiwarką** i pełnym wczytywaniem zapisanej telemetrii po kliknięciu wybranej jazdy.
- Stare sesje 0.3.1 otwierają się w nowej bibliotece, jeżeli mają zapisane poprawne pary CSV.
- Zachowany automatyczny aktualizator z 0.3.1.

Nie dodano jeszcze uruchamiania symulatorów z zakładki **Jedź**, czatu AI ani funkcjonalnego generatora setupów.

**[Instrukcje i test wizualny 0.3.2](desktop/README.md)** | [Kod desktop](desktop/) | [Wydania Windows](https://github.com/sergiosochanskiracingpoland-dotcom/apex-ai/releases)

### Archiwum 0.2.x

- [Oryginalny dashboard 0.2.15](archive/0.2.15/index.html)
- [Oryginalny kolektor PowerShell](acc_collector/)

Wszystkie sesje 0.3.x są zapisywane lokalnie w katalogu `Dokumenty\ApexAI\sessions`. Nie wysyłamy telemetrii na zewnętrzny serwer.

**Uwagi:** Instalator wymaga udanego builda GitHub Actions i publikacji wydania v0.3.2. Program nie jest podpisany certyfikatem wydawcy; Windows może pokazać ostrzeżenie SmartScreen. Integracja z prawdziwym ACC wymaga testu podczas jazdy.
