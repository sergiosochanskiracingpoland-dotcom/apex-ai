using System;
using System.IO;
using System.Linq;
using System.Text.Json;
using ApexAI.Collector;

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
