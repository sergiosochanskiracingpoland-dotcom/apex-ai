@echo off
title Apex AI 0.2.10.5 - ACC Telemetry Collector
cd /d "%~dp0"
powershell.exe -NoProfile -ExecutionPolicy Bypass -File "%~dp0collect_acc.ps1"
echo.
echo Rejestrator zatrzymany. Nacisnij dowolny klawisz, aby zamknac okno.
pause >nul
