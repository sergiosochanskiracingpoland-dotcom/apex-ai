param(
    [Parameter(Mandatory)][string]$Collector,
    [Parameter(Mandatory)][string]$TestDirectory,
    [int]$IdleSeconds = 130,
    [switch]$ReproduceLegacy
)

$ErrorActionPreference = 'Stop'
if (Get-Process -Name 'AC2-Win64-Shipping', 'Apex AI', 'ApexCollector' -ErrorAction SilentlyContinue) {
    throw 'Close ACC and Apex AI before running the shared-memory test.'
}
$collectorPath = (Resolve-Path -LiteralPath $Collector).Path
$testPath = (New-Item -ItemType Directory -Path $TestDirectory).FullName
$previousDirectory = $env:APEX_SESSIONS_DIR
$env:APEX_SESSIONS_DIR = $testPath
$maps = @{}
$views = @{}
$child = $null
$pitLane = 0
$pitBox = 0
$penalty = 0
$mandatoryDone = 0

function Write-Frame([int]$packet, [int]$status, [int]$lap, [single]$speed, [bool]$updatePhysics = $true) {
    $g = $views.graphics
    $p = $views.physics
    $g.Write(4, $status)
    $g.Write(8, 2)
    $g.Write(132, $lap)
    $g.Write(144, 105000)
    $g.Write(152, [single]600)
    $g.Write(248, [single]0.1)
    $g.Write(136, 12)
    $g.Write(160, $pitBox)
    # Nonzero XYZ coordinates must never be interpreted as pit flags.
    $g.Write(280, [single]127.25)
    $g.Write(288, [single]-50.25)
    $g.Write(1220, [single]($(if ($penalty -eq 4) {30} else {0})))
    $g.Write(1228, $penalty)
    $g.Write(1236, $pitLane)
    $g.Write(1244, $mandatoryDone)
    $g.Write(1320, 1)
    if ($updatePhysics) {
        $p.Write(20, 5000)
        $p.Write(28, $speed)
        $p.Write(0, $packet)
    }
    $g.Write(0, $packet)
}

function Send-Frames([int]$first, [int]$status, [int]$lap, [single]$speed, [bool]$updatePhysics = $true) {
    for ($packet = $first; $packet -lt $first + 35; $packet++) {
        Write-Frame $packet $status $lap $speed $updatePhysics
        Start-Sleep -Milliseconds 45
    }
}

function Assert-Stints([int]$expected, [int]$ended, [string]$step) {
    $files = @(Get-ChildItem -LiteralPath $testPath -Filter '*_meta.json')
    $closed = @($files | Where-Object { (Get-Content -LiteralPath $_.FullName -Raw | ConvertFrom-Json).endedAtUtc })
    if ($files.Count -ne $expected -or $closed.Count -ne $ended) {
        throw "$step expected $expected stints, $ended closed. Found $($files.Count), $($closed.Count) closed."
    }
}

try {
    foreach ($name in 'graphics', 'physics', 'static') {
        $maps[$name] = [IO.MemoryMappedFiles.MemoryMappedFile]::CreateNew("Local\acpmf_$name", 4096)
        $views[$name] = $maps[$name].CreateViewAccessor()
    }
    $car = [Text.Encoding]::Unicode.GetBytes('ferrari_296_gt3' + [char]0)
    $track = [Text.Encoding]::Unicode.GetBytes('imola' + [char]0)
    $views.static.WriteArray(68, $car, 0, $car.Length)
    $views.static.WriteArray(134, $track, 0, $track.Length)
    Write-Frame 395400 2 8 0
    $start = @{
        FilePath = $collectorPath
        WindowStyle = 'Hidden'
        PassThru = $true
        RedirectStandardOutput = (Join-Path $testPath 'collector.log')
        RedirectStandardError = (Join-Path $testPath 'collector-error.log')
    }
    $child = Start-Process @start
    Start-Sleep -Seconds $IdleSeconds
    if ($ReproduceLegacy) {
        $phantoms = @(Get-ChildItem -LiteralPath $testPath -Filter '*_laps.csv' |
            Where-Object { @(Get-Content -LiteralPath $_.FullName).Count -eq 1 })
        if ($phantoms.Count -lt 2) { throw "Expected duplicate phantom stints, got $($phantoms.Count)." }
        Write-Output "REPRODUCED: $($phantoms.Count) zero-lap stints from one frozen packet."
        return
    }
    Assert-Stints 0 0 'Frozen ACC maps during repeated reopen'

    Send-Frames 395401 2 8 0
    Assert-Stints 0 0 'Fresh telemetry while stationary'
    Send-Frames 395441 2 8 120
    Assert-Stints 1 0 'Provisional capture before first lap'
    $audit = Join-Path $testPath 'history-audit.jsonl'
    if (Select-String -LiteralPath $audit -Pattern 'history_first_completed_lap' -Quiet) {
        throw 'History was committed before the first lap.'
    }
    Send-Frames 395481 2 9 130
    Assert-Stints 1 0 'One driven stint'
    Start-Sleep -Seconds 3
    Send-Frames 395521 2 9 130
    Assert-Stints 1 0 'Resume after brief dropout'
    Start-Sleep -Seconds 13
    Send-Frames 395561 2 10 140
    Assert-Stints 1 0 'Resume after reopening maps'
    $firstLaps = Get-ChildItem -LiteralPath $testPath -Filter '*_laps.csv'
    if (@(Get-Content -LiteralPath $firstLaps.FullName).Count -ne 3) { throw 'Expected one row per completed lap.' }

    for ($lap = 11; $lap -le 16; $lap++) {
        Send-Frames (395601 + (($lap - 11) * 40)) 2 $lap 140
    }
    $reader = (Resolve-Path (Join-Path $PSScriptRoot '../session-library.cjs')).Path
    $check = 'const lib = require(process.argv[1]); for (let i=0; i<20; i++) { const rows=lib.listSessions(process.argv[2]); if(rows.length!==1 || rows[0].lapCount!==8) process.exit(1); }'
    node -e $check $reader $testPath
    if ($LASTEXITCODE) { throw 'Expected one eight-lap History entry across repeated refreshes.' }
    $duplicate = Start-Process -FilePath $collectorPath -WindowStyle Hidden -PassThru -Wait
    if ($duplicate.ExitCode -ne 2) { throw 'Second collector did not report the expected writer lock.' }
    $pitLane = 1
    Send-Frames 395881 2 16 60
    $pitBox = 1
    $mandatoryDone = 1
    Send-Frames 395921 2 16 0
    $pitLane = $pitBox = 0
    Send-Frames 395961 2 16 0
    $penalty = 4
    Send-Frames 396001 2 16 0
    $pitLane = 1
    Send-Frames 396041 2 16 60
    $pitBox = 1
    $serviceClock = [Diagnostics.Stopwatch]::StartNew()
    $packet = 396081
    while ($serviceClock.Elapsed.TotalSeconds -lt 30.5) {
        Write-Frame ($packet++) 2 16 0
        Start-Sleep -Milliseconds 45
    }
    $penalty = 0
    Send-Frames $packet 2 16 0
    $pitLane = $pitBox = 0
    Send-Frames ($packet + 40) 2 16 0
    Send-Frames ($packet + 80) 0 16 0 $false
    Assert-Stints 1 1 'ACC ends session while physics freezes'
    Send-Frames ($packet + 120) 0 16 0 $false
    Assert-Stints 1 1 'Repeated end signal'
    Send-Frames 1 2 0 110
    Assert-Stints 2 1 'ACC restarts and begins a new stint'
    Send-Frames 41 0 0 0 $false
    Assert-Stints 2 2 'Second stint closes'
    node -e $check $reader $testPath
    if ($LASTEXITCODE) { throw 'Expected the second, zero-lap capture to stay out of History.' }
    $commits = @(Get-Content -LiteralPath $audit | ForEach-Object { ConvertFrom-Json $_ } | Where-Object trigger -eq 'history_first_completed_lap')
    if ($commits.Count -ne 1 -or $commits[0].lapCount -ne 1 -or !$commits[0].sessionId -or !$commits[0].stintId -or !$commits[0].pid) {
        throw 'Expected one fully attributed History commit.'
    }
    $events = Get-Content -LiteralPath (Join-Path $testPath 'collector.log')
    if (@($events | Where-Object { $_ -like 'SESSION|*' }).Count -ne 2 -or
        @($events | Where-Object { $_ -like 'CLOSED|*' }).Count -ne 2) {
        throw 'Expected exactly one start and close notification per driven stint.'
    }
    Stop-Process -Id $child.Id
    $child.WaitForExit()
    $child = Start-Process @start
    Send-Frames 81 2 0 0
    node -e $check $reader $testPath
    if ($LASTEXITCODE) { throw 'Collector restart while stationary changed History.' }
    Assert-Stints 2 2 'Application restart while stationary'
    $raceReader = (Resolve-Path (Join-Path $PSScriptRoot '../race-library.cjs')).Path
    $checkRace = 'const l=require(process.argv[1]),d=process.argv[2],a=l.listRaces(d); if(a.length!==1) process.exit(2); const r=l.loadRace(d,a[0].id); if(!r.endedAtUtc||r.stints.length!==1||r.pitVisits.map(v=>v.kind).join()!=="stop,penalty"||r.penalties[0]?.stopAndGoSeconds!==30||r.penalties[0]?.status!=="servedInferred"||r.penalties[0]?.visit!==2) process.exit(3); console.log(JSON.stringify(r,null,2));'
    node -e $checkRace $raceReader $testPath
    if ($LASTEXITCODE) { throw "Expected one persisted race with two visits and Stop & Go service ($LASTEXITCODE)." }
    Write-Output "PASS: $IdleSeconds seconds idle, stationary ACC, dropout, reconnect, ACC restart, one write and close per stint."
} finally {
    if ($child -and -not $child.HasExited) {
        Stop-Process -Id $child.Id
        $child.WaitForExit()
    }
    foreach ($view in $views.Values) { $view.Dispose() }
    foreach ($map in $maps.Values) { $map.Dispose() }
    $env:APEX_SESSIONS_DIR = $previousDirectory
}

