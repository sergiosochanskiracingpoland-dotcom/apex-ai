# Apex AI — Race Engineer

Prototyp webowy do analizy jazdy w Assetto Corsa Competizione.

- [Uruchom dashboard Apex AI](https://sergiosochanskiracingpoland-dotcom.github.io/apex-ai/)
- [Rejestrator ACC na Windows 11 — instrukcja](acc_collector/README.md)

Wersja webowa działa w przeglądarce. Do zbierania rzeczywistej telemetrii użyj lokalnego rejestratora, a następnie zaimportuj pliki `*_laps.csv` i `*_samples.csv` do dashboardu. Import surowej telemetrii działa od 0.2.8, a od **0.2.9** dashboard pokazuje wykres prędkości wybranego okrążenia, a od **0.2.10** również wykres gazu i hamulca. Wybór okrążenia jest zsynchronizowany między wykresami. **Aktualna wersja 0.2.14** poprawia Race Analysis Engine v1: prędkość minimalna nie jest już pobierana z następnej strefy hamowania, krótkie dohamowania mogą być łączone, a dashboard pokazuje rzeczywistą częstotliwość próbkowania podczas jazdy. Wersja 0.2.13 wprowadziła wykrywanie hamowań, mapę różnic czasowych, trzy priorytety treningowe i przyciski przybliżania. Pozostają też funkcje 0.2.12: zoom, porównanie prędkości i pedałów, dokładny odczyt A/B. Odczyt ACC i format CSV pozostają bez zmian. Pliki są przechowywane na Twoim komputerze. Konsultacje z prawdziwym modelem AI i komunikacja głosowa na żywo są planowane na później.

**Status:** eksperymentalny kod rejestratora; wymaga testu z uruchomionym ACC.