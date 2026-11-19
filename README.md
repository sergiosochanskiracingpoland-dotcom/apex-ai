# Apex AI — Race Engineer

## POBIERZ APLIKACJĘ NA WINDOWS

**[STRONA POBIERANIA APEX AI 0.3.1](https://sergiosochanskiracingpoland-dotcom.github.io/apex-ai/)**

Instalator bezpośrednio: [ApexAI-Setup-0.3.1-x64.exe](https://github.com/sergiosochanskiracingpoland-dotcom/apex-ai/releases/download/v0.3.1/ApexAI-Setup-0.3.1-x64.exe).

> **Aktualizacja z 0.3.0 wymaga jednorazowego ręcznego zainstalowania wersji 0.3.1.** W 0.3.0 nie było aktualizatora. Od 0.3.1 aplikacja sama sprawdza nowe wydania z GitHub, pobiera je i proponuje zainstalowanie po restarcie. Pełny mechanizm zweryfikujemy po publikacji kolejnej wersji.

### Co nowego w 0.3.1?

- Wbudowany rejestrator ACC w **C# / .NET 8**, uruchamiany wraz z aplikacją: **bez Start-ApexACC.cmd**.
- Wykrywanie uruchomionego ACC, toru i samochodu; automatyczny zapis sesji i aktualizacja danych po ukończonym okrążeniu.
- Automatyczne ładowanie ostatniej sesji po ponownym uruchomieniu aplikacji.
- Pasek statusu połączenia oraz pobierania aktualizacji i przycisk „Sprawdź aktualizacje”.
- Bez uruchamiania gier z programu i bez zmian graficznych w głównym dashboardzie — te funkcje zaplanowano później.

[Instrukcja instalacji i testów 0.3.1](desktop/README.md) | [Kod aplikacji Windows](desktop/) | [Repozytorium wydania](https://github.com/sergiosochanskiracingpoland-dotcom/apex-ai/releases)

### Archiwum 0.2.x

- [Dashboard 0.2.15 — zachowany bez zmian](archive/0.2.15/index.html)
- [Uruchom archiwalny dashboard online](https://sergiosochanskiracingpoland-dotcom.github.io/apex-ai/archive/0.2.15/index.html)
- [Rejestrator PowerShell 0.2.15](acc_collector/)

**Status:** kod 0.3.1 jest przygotowany do automatycznej kompilacji Windows. Możliwość pobrania EXE zależy od powodzenia GitHub Actions i publikacji wydania v0.3.1. Instalator nie jest podpisany certyfikatem wydawcy.
