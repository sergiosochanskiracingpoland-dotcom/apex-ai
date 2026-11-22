using System.Diagnostics;
using System.Globalization;
using System.IO.MemoryMappedFiles;
using System.Runtime.InteropServices;
using System.Text;
using System.Text.Json;

namespace ApexAI.Collector;

internal static class Program
{
    private const string MutexName = @"Local\ApexAI_ACCCollector";
    private static readonly CultureInfo Culture = CultureInfo.InvariantCulture;
    private static volatile bool stopping;
    private static string lastState = "";

    [DllImport("winmm.dll")] private static extern uint timeBeginPeriod(uint period);
    [DllImport("winmm.dll")] private static extern uint timeEndPeriod(uint period);

    private static string N(float v, int digits = 3) =>
        float.IsFinite(v) ? v.ToString("F" + digits, Culture) : "";
    private static string N(double v, int digits = 3) =>
        double.IsFinite(v) ? v.ToString("F" + digits, Culture) : "";

    private static void Say(string type, string message) =>
        Console.WriteLine(type + "|" + message.Replace("\r", " ").Replace("\n", " ").Replace("|", "/"));
    private static void Audit(string folder, string trigger, string sessionId, string? stintId,
        int lapCount, int accCompletedLaps, int graphicsPacket, int physicsPacket)
    {
        var entry = JsonSerializer.Serialize(new {
            timestampUtc = DateTime.UtcNow, trigger, sessionId, stintId, lapCount,
            accCompletedLaps, graphicsPacket, physicsPacket,
            process = "ApexCollector", pid = Environment.ProcessId
        });
        try { File.AppendAllText(Path.Combine(folder, "history-audit.jsonl"), entry + Environment.NewLine); }
        catch (IOException error) { Say("ERROR", "History audit: " + error.Message); }
        catch (UnauthorizedAccessException error) { Say("ERROR", "History audit: " + error.Message); }
    }

    private static void State(string code, string message)
    {
        if (code == lastState) return;
        lastState = code;
        Console.WriteLine("STATE|" + code + "|" + message.Replace("|", "/"));
    }

    private static string ReadString(MemoryMappedViewAccessor a, long offset)
    {
        byte[] bytes = new byte[66];
        a.ReadArray(offset, bytes, 0, bytes.Length);
        string value = Encoding.Unicode.GetString(bytes).Split('\0')[0].Trim();
        if (value.Length < 2 || value.Length > 32 || value.Contains(',') ||
            value.Contains('"') || value.Contains('\n') || value.Contains('\r')) return "";
        return value;
    }

    private static (string track, string car) ReadInfo()
    {
        try
        {
            using var map = MemoryMappedFile.OpenExisting(@"Local\acpmf_static");
            using var view = map.CreateViewAccessor(0, 0, MemoryMappedFileAccess.Read);
            return (ReadString(view, 134), ReadString(view, 68));
        }
        catch { return ("", ""); }
    }

    private static string TrackName(string id) => id.ToLowerInvariant() switch
    {
        "imola" => "Imola Autodromo Enzo e Dino Ferrari",
        "monza" => "Autodromo Nazionale Monza",
        "spa" => "Circuit de Spa-Francorchamps",
        "silverstone" => "Silverstone",
        "mount_panorama" => "Mount Panorama Bathurst",
        "zolder" => "Circuit Zolder",
        "brands_hatch" => "Brands Hatch",
        "nurburgring" => "Nürburgring",
        _ => id
    };
    private static string CarName(string id) => id.ToLowerInvariant() switch
    {
        "porsche_992_gt3_r" => "Porsche 992 GT3 R",
        "ferrari_296_gt3" => "Ferrari 296 GT3",
        "mercedes_amg_gt3_evo" => "Mercedes-AMG GT3 Evo",
        "bmw_m4_gt3" => "BMW M4 GT3",
        "lamborghini_huracan_gt3_evo2" => "Lamborghini Huracán GT3 Evo2",
        "mclaren_720s_gt3_evo" => "McLaren 720S GT3 Evo",
        _ => id
    };

    private sealed class Session : IDisposable
    {
        public string Base { get; }
        public string Track { get; }
        public string Car { get; }
        private readonly string metadataFile;
        private bool closed;
        private bool announced;
        private readonly Dictionary<string,string> metadata;
        public StreamWriter Laps { get; }
        public StreamWriter Samples { get; }
        public int RecordedLaps { get; set; }
        public int PreviousLap { get; set; }
        public int PreviousSector { get; set; }
        public DateTime? LapStart { get; set; }
        public DateTime? Boundary { get; set; }
        public double? SectorOne { get; set; }
        public double? SectorTwo { get; set; }
        public (DateTime? start, double? s1, double? s2, DateTime at)? Pending { get; set; }
        public DateTime LastFlush { get; set; } = DateTime.UtcNow;

        public Session(string folder, string track, string car, int lap, int sector, RaceCapture race)
        {
            string name;
            do { name = "acc_" + DateTime.Now.ToString("yyyyMMdd_HHmmss", Culture) + "_" +
                          Random.Shared.Next(100000, 1000000).ToString(Culture); }
            while (new[] {"_laps.csv", "_samples.csv", "_meta.json"}.Any(suffix => File.Exists(Path.Combine(folder, name + suffix))));
            Base = Path.Combine(folder, name);
            Track = track;
            Car = car;
            metadataFile = Base + "_meta.json";
            metadata = new Dictionary<string,string> {
                ["track"] = track, ["car"] = car, ["raceId"] = race.Id,
                ["sessionType"] = race.Type.ToString(Culture),
                ["trackName"] = TrackName(track), ["carName"] = CarName(car),
                ["startedAtUtc"] = DateTime.UtcNow.ToString("O", Culture),
                ["targetSamplingHz"] = SampleClock.TargetHz.ToString(Culture),
                ["samplingMode"] = "deadline_qpc_75hz"
            };
            PreviousLap = lap;
            PreviousSector = sector;
            var utf8 = new UTF8Encoding(false);
            Laps = new StreamWriter(new FileStream(Base + "_laps.csv", FileMode.CreateNew, FileAccess.Write, FileShare.Read), utf8, 16 * 1024);
            Samples = new StreamWriter(new FileStream(Base + "_samples.csv", FileMode.CreateNew, FileAccess.Write, FileShare.Read), utf8, 128 * 1024);
            Laps.WriteLine("lap,time,s1,s2,s3,fuel,tyre_fl,tyre_fr,tyre_rl,tyre_rr,sector_source,track,track_name,car_model,car_name");
            Samples.WriteLine("timestamp_utc,completed_laps,sector_index,lap_progress,speed_kmh,gas,brake,gear,rpm,fuel,tyre_fl,tyre_fr,tyre_rl,tyre_rr,pressure_fl,pressure_fr,pressure_rl,pressure_rr,steer_input,g_x,g_y,g_z,tc_action,abs_action,tyre_wear_fl_raw,tyre_wear_fr_raw,tyre_wear_rl_raw,tyre_wear_rr_raw,in_pit,physics_packet_id,race_position,in_pit_lane,session_type,session_time_left_s,mandatory_pit_done");
            Laps.Flush();
            Samples.Flush();
        }
        public bool AnnounceFirstSample()
        {
            if (announced) return false;
            Samples.Flush();
            SaveMetadata();
            announced = true;
            Say("SESSION", Path.GetFileName(Base));
            return true;
        }
        private void SaveMetadata()
        {
            try
            {
                string temporary = metadataFile + ".tmp";
                File.WriteAllText(temporary, JsonSerializer.Serialize(metadata), new UTF8Encoding(false));
                File.Move(temporary, metadataFile, overwrite: true);
            }
            catch (Exception error) { Say("ERROR", "Nie mogę zapisać metadanych stintu: " + error.Message); }
        }
        public void Dispose()
        {
            if (closed) return;
            closed = true;
            try { Samples.Dispose(); }
            finally { Laps.Dispose(); }
            if (!announced) return;
            metadata["endedAtUtc"] = DateTime.UtcNow.ToString("O", Culture);
            SaveMetadata();
            Say("CLOSED", Path.GetFileName(Base));
        }
    }

    private static int Main()
    {
        string folder = Environment.GetEnvironmentVariable("APEX_SESSIONS_DIR") ??
                        Path.Combine(Environment.GetFolderPath(Environment.SpecialFolder.MyDocuments), "ApexAI", "sessions");
        Directory.CreateDirectory(folder);
        using var mutex = new Mutex(false, MutexName);
        bool acquired;
        try { acquired = mutex.WaitOne(0); }
        catch (AbandonedMutexException) { acquired = true; }
        if (!acquired)
        {
            State("busy", "Inny rejestrator ACC już działa. Zamknij go przed uruchomieniem Apex AI.");
            return 2;
        }
        Console.CancelKeyPress += (_, e) => { e.Cancel = true; stopping = true; };
        bool timerActive = false;
        if (OperatingSystem.IsWindows())
        {
            try { timerActive = timeBeginPeriod(1) == 0; } catch { /* optional */ }
        }
        try { Run(folder); return 0; }
        finally
        {
            if (timerActive) try { timeEndPeriod(1); } catch { }
            mutex.ReleaseMutex();
        }
    }

    private static void Run(string folder)
    {
        MemoryMappedFile? gm = null, pm = null;
        MemoryMappedViewAccessor? g = null, p = null;
        Session? session = null;
        RaceCapture? race = null;
        void CloseStint()
        {
            var current = session;
            session = null;
            current?.Dispose();
        }
        void CloseDrivingSession()
        {
            CloseStint();
            race?.Close();
            race = null;
        }
        void ReleaseMaps()
        {
            g?.Dispose(); p?.Dispose(); gm?.Dispose(); pm?.Dispose();
            g = null; p = null; gm = null; pm = null;
        }
        var continuity = new TelemetryContinuity();
        var elapsed = Stopwatch.StartNew();
        bool hadGap = false;
        DateTime nextInfoAt = DateTime.MinValue;
        string latestTrack = "", latestCar = "";
        var sampleClock = new SampleClock();
        State("waiting", "Oczekiwanie na uruchomienie ACC");
        try
        {
            while (!stopping)
            {
                // Use a monotonic deadline instead of Sleep(20) rounded by Windows.
                try
                {
                    if (g is null || p is null)
                    {
                        try
                        {
                            gm = MemoryMappedFile.OpenExisting(@"Local\acpmf_graphics");
                            pm = MemoryMappedFile.OpenExisting(@"Local\acpmf_physics");
                            g = gm.CreateViewAccessor(0, 0, MemoryMappedFileAccess.Read);
                            p = pm.CreateViewAccessor(0, 0, MemoryMappedFileAccess.Read);
                            continuity.Opened(elapsed.Elapsed);
                            nextInfoAt = DateTime.MinValue;
                            latestTrack = latestCar = "";
                        }
                        catch
                        {
                            ReleaseMaps();
                            State("waiting", "ACC nie jest uruchomione");
                            Thread.Sleep(1000);
                            continue;
                        }
                    }

                    DateTime now = DateTime.UtcNow;
                    int packet = g.ReadInt32(0);
                    int sessionType = g.ReadInt32(8);
                    int position = g.ReadInt32(136);
                    float sessionTimeLeft = g.ReadSingle(152);
                    int inPitLane = g.ReadInt32(280);
                    int mandatoryPitDone = g.ReadInt32(288);
                    int status = g.ReadInt32(4);
                    int completed = g.ReadInt32(132);
                    int lastLapMs = g.ReadInt32(144);
                    int sector = g.ReadInt32(164);
                    int inPit = g.ReadInt32(160);
                    float progress = g.ReadSingle(248);

                    int physicsPacket = p.ReadInt32(0);
                    var tick = elapsed.Elapsed;
                    if (continuity.Observe(tick, packet, physicsPacket))
                        CloseDrivingSession();
                    if (continuity.GraphicsAdvanced && status is 0 or 1)
                    {
                        CloseDrivingSession();
                        latestTrack = latestCar = "";
                        nextInfoAt = DateTime.MinValue;
                    }
                    if (!continuity.IsLive(tick))
                    {
                        if (continuity.ShouldReopen(tick)) ReleaseMaps();
                        State("waiting", "Oczekiwanie na świeżą telemetrię ACC");
                        hadGap = true;
                        sampleClock.WaitForNext();
                        continue;
                    }
                    if (hadGap && session is not null)
                    {
                        session.LapStart = session.Boundary = null;
                        session.SectorOne = session.SectorTwo = null;
                        session.Pending = null;
                        session.PreviousSector = sector;
                        State("recording", TrackName(session.Track) + " • " + CarName(session.Car));
                    }
                    hadGap = false;

                    if (status != 2)
                    {
                        if (status is 0 or 1)
                        {
                            State("connected", "ACC uruchomione; czekam na jazdę");
                        }
                        // status 3 = pause: keep the file open but stop sampling.
                        Thread.Sleep(180);
                        continue;
                    }
                    if (completed is < 0 or > 100000 || sector is < 0 or > 2 || !float.IsFinite(progress))
                    {
                        Thread.Sleep(100);
                        continue;
                    }
                    if (now >= nextInfoAt)
                    {
                        var info = ReadInfo();
                        nextInfoAt = now.AddSeconds(1);
                        if (!string.IsNullOrEmpty(info.track) && !string.IsNullOrEmpty(info.car))
                        {
                            if (session != null && (session.Track != info.track || session.Car != info.car))
                            {
                                CloseStint();
                            }
                            latestTrack = info.track; latestCar = info.car;
                        }
                    }
                    // One race/session can contain several stints. Read race standings and pit
                    // flags from documented ACC Graphics (Pack=4, v1.8+), not estimates.
                    if (!string.IsNullOrEmpty(latestTrack) && !string.IsNullOrEmpty(latestCar))
                    {
                        if (race != null && !race.Matches(latestTrack,latestCar,sessionType,completed))
                        {
                            CloseDrivingSession();
                        }
                        if (race is null)
                        {
                            if (!TelemetryContinuity.CanStartStint(p.ReadSingle(28)))
                            {
                                State("connected", "ACC uruchomione; czekam na jazdę");
                                sampleClock.WaitForNext();
                                continue;
                            }
                            race=new RaceCapture(folder,latestTrack,latestCar,sessionType,
                                completed,inPitLane!=0);
                            Audit(folder, "race_started_on_movement", race.Id, null, 0, completed, packet, physicsPacket);
                            Console.WriteLine("RACE|"+race.Id);
                        }
                        float pitFuel=p.ReadSingle(12), pitSpeed=p.ReadSingle(28);
                        string pitCompound=ReadString(g,176);
                        race.Update(now,completed,position,inPitLane!=0,
                            inPit!=0,pitSpeed,pitFuel,pitCompound);
                    }
                    // Split stints at PIT LANE ENTRY, not at the garage/box,
                    // while race sidecar keeps the whole pit visit connected.
                    if (inPit != 0 || inPitLane != 0)
                    {
                        CloseStint();
                        State("connected","ACC pit lane — race report tracks stop");
                        Thread.Sleep(120);
                        continue;
                    }
                    if (session is not null && completed < session.PreviousLap)
                    {
                        CloseStint();
                    }
                    // Wait for valid game-sourced metadata instead of silently naming the wrong track.
                    if (session is null)
                    {
                        if (string.IsNullOrEmpty(latestTrack) || string.IsNullOrEmpty(latestCar))
                        {
                            State("connected", "Odczytuję samochód i tor z ACC");
                            Thread.Sleep(100);
                            continue;
                        }
                        if (!TelemetryContinuity.CanStartStint(p.ReadSingle(28)))
                        {
                            State("connected", "ACC uruchomione; czekam na jazdę");
                            sampleClock.WaitForNext();
                            continue;
                        }
                        session = new Session(folder, latestTrack, latestCar, completed, sector, race!);
                        Audit(folder, "stint_capture_started", race!.Id, Path.GetFileName(session.Base),
                            0, completed, packet, physicsPacket);
                    }

                    // ACC Physics with Pack=4 layout. Keep the existing CSV column ordering.
                    float gas = p.ReadSingle(4), brake = p.ReadSingle(8), fuel = p.ReadSingle(12);
                    int gear = p.ReadInt32(16), rpm = p.ReadInt32(20);
                    float steering = p.ReadSingle(24), speed = p.ReadSingle(28);
                    float gx = p.ReadSingle(44), gy = p.ReadSingle(48), gz = p.ReadSingle(52);
                    float[] pressure = { p.ReadSingle(88), p.ReadSingle(92), p.ReadSingle(96), p.ReadSingle(100) };
                    float[] wear = { p.ReadSingle(120), p.ReadSingle(124), p.ReadSingle(128), p.ReadSingle(132) };
                    float[] tyre = { p.ReadSingle(152), p.ReadSingle(156), p.ReadSingle(160), p.ReadSingle(164) };
                    float tc = p.ReadSingle(204), abs = p.ReadSingle(252);

                    bool changedSector = sector != session.PreviousSector;
                    if (changedSector)
                    {
                        if (session.PreviousSector == 2 && sector == 0)
                        {
                            session.Pending = (session.LapStart, session.SectorOne, session.SectorTwo, now);
                            session.LapStart = now;
                            session.SectorOne = null;
                            session.SectorTwo = null;
                        }
                        if (session.PreviousSector == 0 && sector == 1 && session.LapStart.HasValue)
                            session.SectorOne = (now - session.LapStart.Value).TotalMilliseconds;
                        if (session.PreviousSector == 1 && sector == 2 && session.Boundary.HasValue)
                            session.SectorTwo = (now - session.Boundary.Value).TotalMilliseconds;
                        session.Boundary = now;
                    }
                    if (completed > session.PreviousLap)
                    {
                        if (completed == session.PreviousLap + 1 && lastLapMs is > 10000 and < 600000)
                        {
                            DateTime? start = session.LapStart;
                            double? s1 = session.SectorOne, s2 = session.SectorTwo;
                            if (session.Pending is { } saved && (now - saved.at).TotalSeconds < 2)
                            {
                                start = saved.start;
                                s1 = saved.s1;
                                s2 = saved.s2;
                            }
                            string[] sectors = { "", "", "" };
                            string source = "";
                            if (start.HasValue && s1.HasValue && s2.HasValue &&
                                Math.Abs((now - start.Value).TotalMilliseconds - lastLapMs) < 1500)
                            {
                                double s3 = lastLapMs - s1.Value - s2.Value;
                                if (s1.Value > .07 * lastLapMs && s1.Value < .75 * lastLapMs &&
                                    s2.Value > .07 * lastLapMs && s2.Value < .75 * lastLapMs &&
                                    s3 > .07 * lastLapMs && s3 < .75 * lastLapMs)
                                {
                                    sectors = new[] { N(s1.Value / 1000), N(s2.Value / 1000), N(s3 / 1000) };
                                    source = "estimated_sampling"; // estimated from sector boundaries; never official ACC sectors
                                }
                            }
                            session.Laps.WriteLine(string.Join(",", new[] {
                                completed.ToString(Culture), N(lastLapMs / 1000.0),
                                sectors[0], sectors[1], sectors[2],
                                N(fuel), N(tyre[0]), N(tyre[1]), N(tyre[2]), N(tyre[3]),
                                source, latestTrack, TrackName(latestTrack), latestCar, CarName(latestCar)
                            }));
                            session.Laps.Flush();
                            session.Samples.Flush();
                            if (++session.RecordedLaps == 1)
                            {
                                string key = Path.GetFileName(session.Base);
                                race!.AddStint(key);
                                Audit(folder, "history_first_completed_lap", race.Id, key,
                                    session.RecordedLaps, completed, packet, physicsPacket);
                            }
                            Console.WriteLine("LAP|" + session.RecordedLaps.ToString(Culture) + "|" + (lastLapMs / 1000.0).ToString("F3", Culture));
                        }
                        session.PreviousLap = completed;
                        session.Pending = null;
                    }

                    session.Samples.WriteLine(string.Join(",", new[] {
                        now.ToString("O", Culture), completed.ToString(Culture), sector.ToString(Culture), N(progress,5),
                        N(speed), N(gas), N(brake), gear.ToString(Culture), rpm.ToString(Culture), N(fuel),
                        N(tyre[0]), N(tyre[1]), N(tyre[2]), N(tyre[3]),
                        N(pressure[0]), N(pressure[1]), N(pressure[2]), N(pressure[3]),
                        N(steering,5), N(gx,4), N(gy,4), N(gz,4), N(tc,4), N(abs,4),
                        N(wear[0],5), N(wear[1],5), N(wear[2],5), N(wear[3],5),
                        inPit.ToString(Culture), physicsPacket.ToString(Culture),
                        (position is >= 1 and <= 200 ? position.ToString(Culture) : ""),
                        inPitLane.ToString(Culture),sessionType.ToString(Culture),
                        (float.IsFinite(sessionTimeLeft) ? N(sessionTimeLeft,2) : ""),
                        mandatoryPitDone.ToString(Culture)
                    }));
                    if (session.AnnounceFirstSample())
                    {
                        State("recording", TrackName(latestTrack) + " • " + CarName(latestCar));
                    }
                    session.PreviousSector = sector;
                    if ((now - session.LastFlush).TotalMilliseconds >= 700)
                    {
                        session.Samples.Flush();
                        session.LastFlush = now;
                    }
                }
                catch (Exception error)
                {
                    Say("ERROR", error.Message);
                    CloseDrivingSession();
                    ReleaseMaps();
                    latestTrack = latestCar = "";
                    State("waiting", "Ponawiam połączenie z ACC");
                    Thread.Sleep(1000);
                }
                sampleClock.WaitForNext();
            }
        }
        finally
        {
            CloseDrivingSession();
            ReleaseMaps();
        }
    }
}
