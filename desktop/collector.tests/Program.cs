using System;
using System.IO;
using System.Linq;
using System.Text.Json;
using ApexAI.Collector;

CheckTelemetryContinuity();

static void CheckTelemetryContinuity()
{
    var gate = new TelemetryContinuity();
    static TimeSpan At(double seconds) => TimeSpan.FromSeconds(seconds);
    static void Check(bool expected, bool actual, string scenario)
    {
        if (expected != actual) throw new Exception("Telemetry continuity: " + scenario);
    }

    for (int reopen = 0; reopen < 1800; reopen += 13)
    {
        gate.Opened(At(reopen));
        for (int offset = 0; offset <= 12; offset++)
        {
            var now = At(reopen + offset);
            Check(false, gate.Observe(now, 395390, 395400), "same frozen packets after reopen");
            Check(false, gate.IsLive(now), "frozen telemetry during thirty minutes idle");
            Check(offset == 12, gate.ShouldReopen(now), "reopen deadline");
        }
    }
    gate.Opened(At(1812));
    gate.Observe(At(1812.1), 395391, 395400);
    Check(false, gate.IsLive(At(1812.1)), "graphics advancing with frozen physics");
    gate.Observe(At(1812.2), 395391, 395401);
    Check(true, gate.IsLive(At(1812.2)), "both streams advance");
    Check(false, TelemetryContinuity.CanStartStint(0), "stationary live game creates no stint");
    Check(true, TelemetryContinuity.CanStartStint(2), "outlap can create a stint");
    Check(false, gate.IsLive(At(1815)), "short dropout suspends sampling");
    Check(false, gate.Observe(At(1816), 395392, 395402), "resuming same session");
    Check(true, gate.IsLive(At(1816)), "resume after dropout");
    gate.Opened(At(1829));
    Check(false, gate.Observe(At(1830), 395393, 395403), "reconnect to same stream");
    Check(true, gate.IsLive(At(1830)), "resumed packets across map reopen");
    Check(true, gate.Observe(At(1850), 1, 1), "restart closes previous session once");
    Check(false, gate.IsLive(At(1850)), "wait for fresh packets after restart");
    Check(false, gate.Observe(At(1851), 2, 2), "restart is not reported twice");
    Check(true, gate.IsLive(At(1851)), "new session can be recorded");
    Console.WriteLine("PASS: frozen packets, idle, short dropout, reopen, restart and motion gate");
}

string dir=Path.Combine(Path.GetTempPath(),"apex-race-smoke-"+Guid.NewGuid().ToString("N"));
Directory.CreateDirectory(dir);
try{
  var r=new RaceCapture(dir,"imola","ferrari_296_gt3",2,0,false);
  var time=DateTime.UtcNow;
  r.AddStint("acc_20261122_140010_1234");
  r.Update(time,0,5,false,false,150,10,"DHE");
  r.Update(time.AddSeconds(1),1,4,true,false,80,9,"DHE");
  r.Update(time.AddSeconds(11),1,5,true,true,0,9,"DHE");
  r.Update(time.AddSeconds(31),1,8,true,true,0,50,"DHE");
  r.Update(time.AddSeconds(40),1,8,false,false,100,50,"DHE");
  r.AddStint("acc_20261122_141010_9876");
  r.Close();
  using var doc=JsonDocument.Parse(File.ReadAllText(Path.Combine(dir,r.Id+"_race.json")));
  var root=doc.RootElement;
  var pits=root.GetProperty("pitStops");
  if(pits.GetArrayLength()!=1)throw new Exception("Expected 1 pit visit");
  var p=pits[0];
  if(Math.Abs(p.GetProperty("laneSeconds").GetDouble()-39)>0.15)
     throw new Exception("Pit lane duration should be 39 sec");
  if(Math.Abs(p.GetProperty("fuelAddedLitres").GetDouble()-41)>0.15)
     throw new Exception("Observed fuel increase wrong");
  if(Math.Abs(p.GetProperty("stationarySeconds").GetDouble()-29)>0.15)
     throw new Exception("Stationary duration incorrect");
  if(root.GetProperty("stints").GetArrayLength()!=2)
     throw new Exception("Two stint linkage missing");
  if(root.GetProperty("positions").GetArrayLength()<2)
     throw new Exception("Real position timeline missing");
  if(!root.TryGetProperty("endedAtUtc",out var ended)||ended.ValueKind!=JsonValueKind.String)
     throw new Exception("Race completion timestamp missing");
  Console.WriteLine("PASS: pit entry/exit, measured lane time, fuel delta, positions, linked stints");
}finally{Directory.Delete(dir,true);}
