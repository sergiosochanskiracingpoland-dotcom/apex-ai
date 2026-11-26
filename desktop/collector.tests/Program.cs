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
  r.Update(time.AddSeconds(420),4,10,false,false,160,36,"DHE",4,30);
  r.Update(time.AddSeconds(430),4,10,true,false,50,35,"DHE",4,30);
  r.Update(time.AddSeconds(440),4,10,true,true,0,35,"DHE",4,30);
  r.Update(time.AddSeconds(470),4,12,true,true,0,35,"DHE");
  r.Update(time.AddSeconds(480),4,12,false,false,100,34,"DHE");
  r.Update(time.AddSeconds(600),5,12,false,false,170,30,"DHE");
  r.Close();
  using var doc=JsonDocument.Parse(File.ReadAllText(Path.Combine(dir,r.Id+"_race.json")));
  var root=doc.RootElement;
  var pits=root.GetProperty("pitVisits");
  if(pits.GetArrayLength()!=2)throw new Exception("Expected 2 pit visits in a 10-minute race");
  var p=pits[0];
  if(p.GetProperty("kind").GetString()!="stop"||pits[1].GetProperty("kind").GetString()!="penalty")
     throw new Exception("Pit stop and penalty service must be counted separately");
  var penalty=root.GetProperty("penalties")[0];
  if(penalty.GetProperty("stopAndGoSeconds").GetInt32()!=30||
     penalty.GetProperty("status").GetString()!="servedInferred"||
     penalty.GetProperty("visit").GetInt32()!=2||
     penalty.GetProperty("alreadyActive").GetBoolean()||
     penalty.GetProperty("firstSeenAtUtc").GetDateTime()!=time.AddSeconds(420)||
     penalty.GetProperty("clearedAtUtc").GetDateTime()!=time.AddSeconds(470))
     throw new Exception("Stop & Go 30 detection, service and visit linkage");
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
  if(Directory.GetFiles(dir,"*_race.json").Length!=1)throw new Exception("Duplicate report");

  var idle=new RaceCapture(dir,"imola","ferrari_296_gt3",2,0,false);
  idle.Update(time,0,1,false,false,30,10,"DHE");
  idle.Close();
  if(File.Exists(Path.Combine(dir,idle.Id+"_race.json")))throw new Exception("Empty race report");

  var driveThrough=new RaceCapture(dir,"imola","ferrari_296_gt3",2,0,false,1);
  if(driveThrough.Matches("imola","ferrari_296_gt3",2,0,2))throw new Exception("Different ACC session");
  driveThrough.Update(time,0,6,false,false,150,15,"DHE",7);
  driveThrough.Update(time.AddSeconds(1),0,6,true,false,75,15,"DHE",7);
  driveThrough.Update(time.AddSeconds(8),0,7,true,false,75,15,"DHE");
  driveThrough.Update(time.AddSeconds(9),0,7,false,false,110,15,"DHE");
  driveThrough.Update(time.AddSeconds(20),0,7,false,false,110,15,"DHE",10);
  driveThrough.Update(time.AddSeconds(21),0,7,true,false,75,15,"DHE",10);
  driveThrough.TelemetryGap();
  driveThrough.Update(time.AddSeconds(60),0,7,false,false,100,15,"DHE");
  driveThrough.Close();
  using var second=JsonDocument.Parse(File.ReadAllText(Path.Combine(dir,driveThrough.Id+"_race.json")));
  var events=second.RootElement.GetProperty("penalties");
  var visits=second.RootElement.GetProperty("pitVisits");
  if(events[0].GetProperty("status").GetString()!="servedInferred"||
     !events[0].GetProperty("alreadyActive").GetBoolean()||
     events[1].GetProperty("status").GetString()!="cleared"||
     visits[1].GetProperty("laneSeconds").ValueKind!=JsonValueKind.Null||
     visits[1].GetProperty("stationarySeconds").ValueKind!=JsonValueKind.Null)
     throw new Exception("Drive-through and missing telemetry must preserve uncertainty");
  Console.WriteLine("PASS: 10-minute race, two visits, 30-second Stop & Go, drive-through, gap, positions, stints and no empty report");
}finally{Directory.Delete(dir,true);}
