# Apex AI 0.2.7 - ACC telemetry collector for Windows 11
# Reads ACC shared memory locally. No admin rights, Python, cloud or API key required.
# The lap CSV is compatible with the existing Apex AI website.
$ErrorActionPreference = "Stop"
$culture = [System.Globalization.CultureInfo]::InvariantCulture
$folder = Join-Path ([Environment]::GetFolderPath("MyDocuments")) "ApexAI\sessions"
[void](New-Item -ItemType Directory -Force -Path $folder)
$encoding = New-Object System.Text.UTF8Encoding($false)
# Experimental target: 50 samples/second; actual rate depends on Windows scheduling and ACC.
$sampleIntervalMs = 20
# Windows' default timer resolution can round short sleeps up to ~16 ms.
# Request a 1 ms multimedia timer for this process; release it on exit.
$highResolutionTimerActive = $false
try {
    Add-Type -TypeDefinition @'
using System.Runtime.InteropServices;
public static class ApexTimerResolution {
    [DllImport("winmm.dll", ExactSpelling = true)]
    public static extern uint timeBeginPeriod(uint period);
    [DllImport("winmm.dll", ExactSpelling = true)]
    public static extern uint timeEndPeriod(uint period);
}
'@ -ErrorAction Stop
    $highResolutionTimerActive = ([ApexTimerResolution]::timeBeginPeriod(1) -eq 0)
}
catch {
    # Timer optimization is optional: the collector must still run without it.
    $highResolutionTimerActive = $false
}

function N([object]$value, [int]$digits = 3) {
    if ($null -eq $value) { return "" }
    return ([double]$value).ToString("F$digits", $culture)
}

function Format-LapTimeMs([int]$milliseconds) {
    $minutes = [int][Math]::Floor($milliseconds / 60000)
    $seconds = [int][Math]::Floor(($milliseconds % 60000) / 1000)
    $ms = $milliseconds % 1000
    return ("{0}:{1:00}.{2:000}" -f $minutes, $seconds, $ms)
}

# ACC StaticInfo (Pack=4, UTF-16): CarModel at byte 68, Track at 134.
# The raw identifiers come from ACC, never from a previously selected session.
function Read-ACCStaticString([System.IO.MemoryMappedFiles.MemoryMappedViewAccessor]$view, [int]$offset) {
    $bytes = New-Object byte[] 66
    for ($i = 0; $i -lt $bytes.Length; $i++) {
        $bytes[$i] = $view.ReadByte($offset + $i)
    }
    $value = [System.Text.Encoding]::Unicode.GetString($bytes).Split([char]0)[0].Trim()
    if ($value.Length -ge 2 -and $value.Length -le 32 -and $value -notmatch '[,;"\r\n]') {
        return $value
    }
    return ""
}

function Get-ACCSessionInfo {
    $staticMap = $null
    $staticView = $null
    try {
        $staticMap = [System.IO.MemoryMappedFiles.MemoryMappedFile]::OpenExisting("Local\acpmf_static")
        $staticView = $staticMap.CreateViewAccessor(0, 0, [System.IO.MemoryMappedFiles.MemoryMappedFileAccess]::Read)
        return @{
            Track = (Read-ACCStaticString $staticView 134)
            CarModel = (Read-ACCStaticString $staticView 68)
        }
    }
    catch {
        # Metadata can be unavailable during loading; do not stop telemetry.
        return $null
    }
    finally {
        if ($staticView) { $staticView.Dispose() }
        if ($staticMap) { $staticMap.Dispose() }
    }
}

# Display names are mapped from LIVE ACC identifiers, never chosen by default.
# Unknown identifiers are displayed exactly as received from ACC.
function Get-ACCTrackName([string]$trackId) {
    switch ($trackId.ToLowerInvariant()) {
        "imola" { return "Imola Autodromo Enzo e Dino Ferrari" }
        default { return $trackId }
    }
}

function Get-ACCCarName([string]$carId) {
    switch ($carId.ToLowerInvariant()) {
        "porsche_992_gt3_r" { return "Porsche 992 GT3 R" }
        default { return $carId }
    }
}

$pm = $null; $gm = $null; $p = $null; $g = $null
$lapWriter = $null; $sampleWriter = $null
$active = $false; $previousLap = -1; $previousSector = -1
$lapStartTime = $null; $boundaryTime = $null
$estSector1 = $null; $estSector2 = $null
$pendingFinish = $null
$previousPacket = -1; $lastProgress = Get-Date
$waitMessageShown = $false
$latestTrackId = ""; $latestCarId = ""
$trackId = ""; $carId = ""
$nextInfoCheck = Get-Date

Write-Host "APEX AI 0.2.7 | Rejestrator ACC" -ForegroundColor Cyan
Write-Host "Zapis danych: $folder"
Write-Host "Uruchom ACC i wejdz na tor. Zatrzymanie: Ctrl+C."
Write-Host "Pliki _laps.csv wgrasz do Apex AI; _samples.csv to surowe dane do przyszlej analizy."
Write-Host "Eksperymentalne probkowanie: 50 Hz (co 20 ms). Rzeczywista czestotliwosc wymaga testu."
if ($highResolutionTimerActive) {
    Write-Host "Timer Windows: tryb 1 ms aktywny." -ForegroundColor Green
}
else {
    Write-Host "Timer Windows: tryb 1 ms niedostepny; uzywam standardowego." -ForegroundColor Yellow
}
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
                $latestTrackId = ""; $latestCarId = ""
                $nextInfoCheck = Get-Date
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
            $sampleStarted = [System.Diagnostics.Stopwatch]::GetTimestamp()
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
                $latestTrackId = ""; $latestCarId = ""
                $nextInfoCheck = Get-Date
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
                # Never reuse the previous session's track/car after a lap reset.
                $latestTrackId = ""; $latestCarId = ""
                $nextInfoCheck = Get-Date
            }

            # Poll ACC's own StaticInfo once a second. A track/car change
            # closes the old CSV and starts a fresh session, even if ACC keeps
            # reporting status=LIVE across the transition.
            $infoNow = Get-Date
            if ($infoNow -ge $nextInfoCheck) {
                $info = Get-ACCSessionInfo
                $nextInfoCheck = $infoNow.AddSeconds(1)
                if ($info) {
                    if ($active -and
                        (($info.Track -and $info.Track -ne $trackId) -or
                         ($info.CarModel -and $info.CarModel -ne $carId))) {
                        Write-Host "Zmiana toru lub samochodu - nowa sesja." -ForegroundColor Cyan
                        if ($lapWriter) { $lapWriter.Dispose(); $lapWriter = $null }
                        if ($sampleWriter) { $sampleWriter.Dispose(); $sampleWriter = $null }
                        $active = $false
                    }
                    if ($info.Track) { $latestTrackId = $info.Track }
                    if ($info.CarModel) { $latestCarId = $info.CarModel }
                }
            }

            if (-not $active) {
                $trackId = $latestTrackId
                $carId = $latestCarId
                $trackName = Get-ACCTrackName $trackId
                $carName = Get-ACCCarName $carId
                if ($trackId) {
                    Write-Host ("Wykryty tor: " + $trackName + " [ACC: " + $trackId + "]") -ForegroundColor Cyan
                }
                else {
                    Write-Host "Tor: nieznany (ACC nie podalo identyfikatora)." -ForegroundColor Yellow
                }
                if ($carId) {
                    Write-Host ("Wykryty samochod: " + $carName + " [ACC: " + $carId + "]") -ForegroundColor Cyan
                }
                else {
                    Write-Host "Samochod: nieznany (ACC nie podalo identyfikatora)." -ForegroundColor Yellow
                }
                $stamp = (Get-Date).ToString("yyyyMMdd_HHmmss")
                $base = Join-Path $folder ("acc_" + $stamp + "_" + (Get-Random -Minimum 1000 -Maximum 9999))
                $lapPath = $base + "_laps.csv"
                $samplePath = $base + "_samples.csv"
                $lapWriter = New-Object System.IO.StreamWriter($lapPath, $false, $encoding)
                $sampleWriter = New-Object System.IO.StreamWriter($samplePath, $false, $encoding)
                $lapWriter.AutoFlush = $true
                $sampleWriter.AutoFlush = $true
                $lapWriter.WriteLine("lap,time,s1,s2,s3,fuel,tyre_fl,tyre_fr,tyre_rl,tyre_rr,sector_source,track,track_name,car_model,car_name")
                $sampleWriter.WriteLine("timestamp_utc,completed_laps,sector_index,lap_progress,speed_kmh,gas,brake,gear,rpm,fuel,tyre_fl,tyre_fr,tyre_rl,tyre_rr,pressure_fl,pressure_fr,pressure_rl,pressure_rr")
                $previousLap = $completed  # Never invent already completed laps.
                $previousSector = $sector
                $lapStartTime = $null; $boundaryTime = Get-Date
                $estSector1 = $null; $estSector2 = $null
                $pendingFinish = $null
                $active = $true
                Write-Host "Sesja: $lapPath" -ForegroundColor Green
            }

            # ACC lastSectorTime may be unavailable in some sessions.
            # Approximate S1/S2 from observed sector boundaries, never claim
            # that these are official ACC sector times.
            $now = Get-Date
            $sectorChanged = ($sector -ne $previousSector)
            if ($sectorChanged) {
                if ($previousSector -eq 2 -and $sector -eq 0) {
                    # ACC may reset the sector to 0 BEFORE completedLaps
                    # advances (observed 31-67 ms in real 0.2.6 logs).
                    # Preserve the finished lap's boundaries until its
                    # completed-lap counter and official time arrive.
                    $pendingFinish = @{
                        LapStart = $lapStartTime
                        Sector1 = $estSector1
                        Sector2 = $estSector2
                        FinishedAt = $now
                    }
                    $lapStartTime = $now
                    $estSector1 = $null; $estSector2 = $null
                }
                if ($previousSector -eq 0 -and $sector -eq 1 -and $lapStartTime) {
                    $estSector1 = ($now - $lapStartTime).TotalMilliseconds
                }
                if ($previousSector -eq 1 -and $sector -eq 2 -and $boundaryTime) {
                    $estSector2 = ($now - $boundaryTime).TotalMilliseconds
                }
                $boundaryTime = $now
            }

            if ($completed -gt $previousLap) {
                if ($completed -eq ($previousLap + 1) -and $lastLapMs -gt 10000 -and $lastLapMs -lt 600000) {
                    $sectorValues = @("", "", "")
                    $sectorSource = ""
                    $sectorLapStart = $lapStartTime
                    $sectorOne = $estSector1
                    $sectorTwo = $estSector2
                    # Use the preserved finish only if it belongs to this
                    # just-completed lap, not a previous outlap or old session.
                    if ($pendingFinish -and
                        [Math]::Abs(($now - $pendingFinish.FinishedAt).TotalMilliseconds) -lt 2000) {
                        $sectorLapStart = $pendingFinish.LapStart
                        $sectorOne = $pendingFinish.Sector1
                        $sectorTwo = $pendingFinish.Sector2
                    }
                    if ($sectorLapStart -and $sectorOne -and $sectorTwo -and
                        [Math]::Abs(($now - $sectorLapStart).TotalMilliseconds - $lastLapMs) -lt 1500) {
                        $s3estimate = $lastLapMs - $sectorOne - $sectorTwo
                        if ($sectorOne -gt 0.07 * $lastLapMs -and $sectorOne -lt 0.75 * $lastLapMs -and
                            $sectorTwo -gt 0.07 * $lastLapMs -and $sectorTwo -lt 0.75 * $lastLapMs -and
                            $s3estimate -gt 0.07 * $lastLapMs -and $s3estimate -lt 0.75 * $lastLapMs) {
                            $sectorValues = @((N ($sectorOne / 1000)), (N ($sectorTwo / 1000)), (N ($s3estimate / 1000)))
                            $sectorSource = "estimated_50hz"
                        }
                    }
                    $row = @(
                        "$completed", (N ($lastLapMs / 1000)),
                        $sectorValues[0], $sectorValues[1], $sectorValues[2],
                        (N $fuel), (N $tyres[0]), (N $tyres[1]),
                        (N $tyres[2]), (N $tyres[3]), $sectorSource, $trackId, $trackName, $carId, $carName
                    )
                    $lapWriter.WriteLine(($row -join ","))
                    Write-Host ("Okrazenie {0}: {1}, paliwo {2}" -f $completed, (Format-LapTimeMs $lastLapMs), (N $fuel))
                }
                else {
                    Write-Host "Pominieto niepelne okrazenie lub nieprawidlowy czas." -ForegroundColor Yellow
                }
                $previousLap = $completed
                $pendingFinish = $null
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
            # Compensate for read/process/write time; Thread.Sleep avoids
            # the extra PowerShell cmdlet overhead of Start-Sleep.
            $elapsedMs = 1000.0 * ([System.Diagnostics.Stopwatch]::GetTimestamp() - $sampleStarted) / [System.Diagnostics.Stopwatch]::Frequency
            $remainingMs = [int][Math]::Floor($sampleIntervalMs - $elapsedMs)
            if ($remainingMs -gt 0) { [System.Threading.Thread]::Sleep($remainingMs) }
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
    if ($highResolutionTimerActive) { [void][ApexTimerResolution]::timeEndPeriod(1) }
}