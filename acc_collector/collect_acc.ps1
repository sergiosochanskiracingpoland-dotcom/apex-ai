# Apex AI 0.2 - ACC telemetry collector for Windows 11
# Reads ACC shared memory locally. No admin rights, Python, cloud or API key required.
# The lap CSV is compatible with the existing Apex AI website.
$ErrorActionPreference = "Stop"
$culture = [System.Globalization.CultureInfo]::InvariantCulture
$folder = Join-Path ([Environment]::GetFolderPath("MyDocuments")) "ApexAI\sessions"
[void](New-Item -ItemType Directory -Force -Path $folder)
$encoding = New-Object System.Text.UTF8Encoding($false)

function N([object]$value, [int]$digits = 3) {
    if ($null -eq $value) { return "" }
    return ([double]$value).ToString("F$digits", $culture)
}

$pm = $null; $gm = $null; $p = $null; $g = $null
$lapWriter = $null; $sampleWriter = $null
$active = $false; $previousLap = -1; $previousSector = -1
$s1 = 0; $s2 = 0; $s3 = 0
$previousPacket = -1; $lastProgress = Get-Date
$waitMessageShown = $false

Write-Host "APEX AI 0.2 | Rejestrator ACC" -ForegroundColor Cyan
Write-Host "Zapis danych: $folder"
Write-Host "Uruchom ACC i wejdz na tor. Zatrzymanie: Ctrl+C."
Write-Host "Pliki _laps.csv wgrasz do Apex AI; _samples.csv to surowe dane do przyszlej analizy."
Write-Host ""

try {
    while ($true) {
        if ($null -eq $g -or $null -eq $p) {
            try {
                # ACC uses these named Windows memory maps.
                $gm = [System.IO.MemoryMappedFiles.MemoryMappedFile]::OpenExisting("Local\acpmf_graphics")
                $pm = [System.IO.MemoryMappedFiles.MemoryMappedFile]::OpenExisting("Local\acpmf_physics")
                $g = $gm.CreateViewAccessor(0, 0, [System.IO.MemoryMappedFiles.MemoryMappedFileAccess]::Read)
                $p = $pm.CreateViewAccessor(0, 0, [System.IO.MemoryMappedFiles.MemoryMappedFileAccess]::Read)
                $previousPacket = -1
                $lastProgress = Get-Date
                $waitMessageShown = $false
                Write-Host "Polaczono z pamiecia ACC." -ForegroundColor Green
            }
            catch {
                if ($g) { $g.Dispose(); $g = $null }
                if ($p) { $p.Dispose(); $p = $null }
                if ($gm) { $gm.Dispose(); $gm = $null }
                if ($pm) { $pm.Dispose(); $pm = $null }
                if (-not $waitMessageShown) {
                    Write-Host "Czekam na uruchomienie ACC..." -ForegroundColor Yellow
                    $waitMessageShown = $true
                }
                Start-Sleep -Seconds 3
                continue
            }
        }

        try {
            # Graphic page: first four strings are 15 UTF-16 code units each.
            # Offsets based on ACC Shared Memory Pack=4 / Graphics.cs.
            $packet = $g.ReadInt32(0)
            $status = $g.ReadInt32(4)          # ACC_LIVE = 2
            $completed = $g.ReadInt32(132)
            $lastLapMs = $g.ReadInt32(144)
            $sector = $g.ReadInt32(164)
            $lastSectorMs = $g.ReadInt32(168)
            $progress = $g.ReadSingle(248)

            if ($packet -ne $previousPacket) {
                $previousPacket = $packet
                $lastProgress = Get-Date
            }
            elseif (((Get-Date) - $lastProgress).TotalSeconds -gt 12) {
                throw "Brak nowych pakietow z ACC przez 12 sekund."
            }

            if ($status -ne 2) {
                # A pause keeps the current files; menu/replay closes a session.
                if ($status -eq 0 -or $status -eq 1) {
                    if ($lapWriter) { $lapWriter.Dispose(); $lapWriter = $null }
                    if ($sampleWriter) { $sampleWriter.Dispose(); $sampleWriter = $null }
                    $active = $false
                }
                Start-Sleep -Milliseconds 500
                continue
            }
            if ($completed -lt 0 -or $completed -gt 100000 -or $sector -lt 0 -or $sector -gt 2) {
                Start-Sleep -Milliseconds 250
                continue
            }

            # Physics: these prefix offsets are fixed in the ACC SDK.
            # fuel at 12; gear 16; RPM 20; speed 28;
            # pressures at 88..100; core tyre temperatures at 152..164.
            $gas = $p.ReadSingle(4)
            $brake = $p.ReadSingle(8)
            $fuel = $p.ReadSingle(12)
            $gear = $p.ReadInt32(16)
            $rpm = $p.ReadInt32(20)
            $speed = $p.ReadSingle(28)
            $tyres = @(
                $p.ReadSingle(152), $p.ReadSingle(156),
                $p.ReadSingle(160), $p.ReadSingle(164)
            )
            $pressures = @(
                $p.ReadSingle(88), $p.ReadSingle(92),
                $p.ReadSingle(96), $p.ReadSingle(100)
            )

            if ($active -and $completed -lt $previousLap) {
                Write-Host "Licznik okrazen zresetowany, otwieram nowa sesje."
                $lapWriter.Dispose(); $lapWriter = $null
                $sampleWriter.Dispose(); $sampleWriter = $null
                $active = $false
            }

            if (-not $active) {
                $stamp = (Get-Date).ToString("yyyyMMdd_HHmmss")
                $base = Join-Path $folder ("acc_" + $stamp + "_" + (Get-Random -Minimum 1000 -Maximum 9999))
                $lapPath = $base + "_laps.csv"
                $samplePath = $base + "_samples.csv"
                $lapWriter = New-Object System.IO.StreamWriter($lapPath, $false, $encoding)
                $sampleWriter = New-Object System.IO.StreamWriter($samplePath, $false, $encoding)
                $lapWriter.AutoFlush = $true
                $sampleWriter.AutoFlush = $true
                $lapWriter.WriteLine("lap,time,s1,s2,s3,fuel,tyre_fl,tyre_fr,tyre_rl,tyre_rr")
                $sampleWriter.WriteLine("timestamp_utc,completed_laps,sector_index,lap_progress,speed_kmh,gas,brake,gear,rpm,fuel,tyre_fl,tyre_fr,tyre_rl,tyre_rr,pressure_fl,pressure_fr,pressure_rl,pressure_rr")
                $previousLap = $completed  # Never invent already completed laps.
                $previousSector = $sector
                $s1 = 0; $s2 = 0; $s3 = 0
                $active = $true
                Write-Host "Sesja: $lapPath" -ForegroundColor Green
            }

            # Collect sector durations opportunistically. Export only if they
            # add up to the finished lap time; otherwise show missing data.
            if ($sector -ne $previousSector -and $lastSectorMs -gt 0) {
                if ($previousSector -eq 0 -and $sector -eq 1) { $s1 = $lastSectorMs }
                if ($previousSector -eq 1 -and $sector -eq 2) { $s2 = $lastSectorMs }
                if ($previousSector -eq 2 -and $sector -eq 0) { $s3 = $lastSectorMs }
            }

            if ($completed -gt $previousLap) {
                if ($completed -eq ($previousLap + 1) -and $lastLapMs -gt 10000 -and $lastLapMs -lt 600000) {
                    $sectorValues = @("", "", "")
                    if ($s1 -gt 0 -and $s2 -gt 0 -and $s3 -gt 0 -and
                        [Math]::Abs(($s1 + $s2 + $s3) - $lastLapMs) -lt 1500) {
                        $sectorValues = @((N ($s1 / 1000)), (N ($s2 / 1000)), (N ($s3 / 1000)))
                    }
                    $row = @(
                        "$completed", (N ($lastLapMs / 1000)),
                        $sectorValues[0], $sectorValues[1], $sectorValues[2],
                        (N $fuel), (N $tyres[0]), (N $tyres[1]),
                        (N $tyres[2]), (N $tyres[3])
                    )
                    $lapWriter.WriteLine(($row -join ","))
                    Write-Host ("Okrazenie {0}: {1} s, paliwo {2}" -f $completed, (N ($lastLapMs / 1000)), (N $fuel))
                }
                else {
                    Write-Host "Pominieto niepelne okrazenie lub nieprawidlowy czas." -ForegroundColor Yellow
                }
                $previousLap = $completed
                $s1 = 0; $s2 = 0; $s3 = 0
            }

            $line = @(
                (Get-Date).ToUniversalTime().ToString("o", $culture),
                "$completed", "$sector", (N $progress 5),
                (N $speed), (N $gas), (N $brake), "$gear", "$rpm", (N $fuel),
                (N $tyres[0]), (N $tyres[1]), (N $tyres[2]), (N $tyres[3]),
                (N $pressures[0]), (N $pressures[1]),
                (N $pressures[2]), (N $pressures[3])
            )
            $sampleWriter.WriteLine(($line -join ","))
            $previousSector = $sector
            Start-Sleep -Milliseconds 200
        }
        catch {
            Write-Host ("Odczyt przerwany: " + $_.Exception.Message) -ForegroundColor Yellow
            if ($lapWriter) { $lapWriter.Dispose(); $lapWriter = $null }
            if ($sampleWriter) { $sampleWriter.Dispose(); $sampleWriter = $null }
            $active = $false
            if ($g) { $g.Dispose(); $g = $null }
            if ($p) { $p.Dispose(); $p = $null }
            if ($gm) { $gm.Dispose(); $gm = $null }
            if ($pm) { $pm.Dispose(); $pm = $null }
            Start-Sleep -Seconds 3
        }
    }
}
finally {
    if ($lapWriter) { $lapWriter.Dispose() }
    if ($sampleWriter) { $sampleWriter.Dispose() }
    if ($g) { $g.Dispose() }
    if ($p) { $p.Dispose() }
    if ($gm) { $gm.Dispose() }
    if ($pm) { $pm.Dispose() }
}