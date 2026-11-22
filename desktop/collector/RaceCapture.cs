using System.Globalization;
using System.Text;
using System.Text.Json;
namespace ApexAI.Collector;

// Records only ACC-observed race position, pit-lane visits, fuel gain, and compound changes.
// Tyre replacement and repairs cannot be confirmed from these shared-memory fields.
internal sealed class RaceCapture
{
    public string Id { get; }
    public string Track { get; }
    public string Car { get; }
    public int Type { get; }
    public int LastLap { get; private set; }
    private readonly string file;
    private readonly string started = DateTime.UtcNow.ToString("O");
    private string? ended;
    private readonly List<string> stints = new();
    private readonly List<object> positions = new();
    private readonly List<Dictionary<string, object?>> pits = new();
    private Dictionary<string, object?>? pit;
    private DateTime? stoppedAt;
    private bool lane;
    private int previousPosition;
    private DateTime lastWrite = DateTime.MinValue;

    public RaceCapture(string folder,string track,string car,int type,int lap,bool inLane)
    {
        Track=track;Car=car;Type=type;LastLap=lap;lane=inLane;
        string id;
        do { id="acc_"+DateTime.Now.ToString("yyyyMMdd_HHmmss",CultureInfo.InvariantCulture)+"_"+
             Random.Shared.Next(1000,9999).ToString(CultureInfo.InvariantCulture); }
        while(File.Exists(Path.Combine(folder,id+"_race.json")));
        Id=id;file=Path.Combine(folder,Id+"_race.json");
        Save(true);
    }
    public bool Matches(string track,string car,int type,int lap) =>
        ended is null&&Track==track&&Car==car&&Type==type&&lap>=LastLap;
    public void AddStint(string key) { if(!stints.Contains(key)){stints.Add(key);Save(true);} }

    public void Update(DateTime at,int lap,int position,bool inLane,bool atBox,float speed,
        float fuel,string compound)
    {
        LastLap=Math.Max(LastLap,lap);
        if(Type==2&&position is >=1 and <=200&&position!=previousPosition)
        {
            previousPosition=position;
            if(positions.Count<3000)positions.Add(new {atUtc=at.ToString("O"),lap,position});
            Save(false);
        }
        if(!lane&&inLane)
        {
            pit=new Dictionary<string,object?> {
                ["entryAtUtc"]=at.ToString("O"),["exitAtUtc"]=null,
                ["entryLap"]=lap,["positionBefore"]=position is >=1 and <=200?position:null,
                ["fuelBeforeLitres"]=float.IsFinite(fuel)&&fuel>=0?Math.Round(fuel,2):null,
                ["tyreCompoundBefore"]=compound,["tyreCompoundAfter"]=null,
                ["fuelAddedLitres"]=null,["laneSeconds"]=null,["stationarySeconds"]=0d,
                ["pitBoxFirstSeenUtc"]=null
            };
            pits.Add(pit);Save(true);
        }
        if(inLane&&pit is not null)
        {
            if(float.IsFinite(speed)&&speed<=2)stoppedAt??=at;
            else if(stoppedAt is { } first)
            { pit["stationarySeconds"]=(double)pit["stationarySeconds"]!+(at-first).TotalSeconds; stoppedAt=null; }
            if(atBox&&pit["pitBoxFirstSeenUtc"] is null)pit["pitBoxFirstSeenUtc"]=at.ToString("O");
        }
        if(lane&&!inLane&&pit is not null)
        {
            if(stoppedAt is { } first)
            { pit["stationarySeconds"]=(double)pit["stationarySeconds"]!+(at-first).TotalSeconds;stoppedAt=null; }
            pit["stationarySeconds"]=Math.Round((double)pit["stationarySeconds"]!,1);
            pit["exitAtUtc"]=at.ToString("O");
            pit["exitLap"]=lap;pit["positionAfter"]=position is >=1 and <=200?position:null;
            pit["laneSeconds"]=Math.Round((at-DateTime.Parse((string)pit["entryAtUtc"]!,
                CultureInfo.InvariantCulture,DateTimeStyles.RoundtripKind)).TotalSeconds,1);
            pit["fuelAfterLitres"]=float.IsFinite(fuel)&&fuel>=0?Math.Round(fuel,2):null;
            if(pit["fuelBeforeLitres"] is double before&&pit["fuelAfterLitres"] is double after&&after-before>0.5)
                pit["fuelAddedLitres"]=Math.Round(after-before,2);
            pit["tyreCompoundAfter"]=compound;
            pit=null;Save(true);
        }
        lane=inLane;
    }
    public void Close() { if(ended is null){ended=DateTime.UtcNow.ToString("O");Save(true);} }
    private void Save(bool force)
    {
        if(!force&&(DateTime.UtcNow-lastWrite).TotalSeconds<2)return;
        lastWrite=DateTime.UtcNow;
        var report=new {schemaVersion=1,id=Id,track=Track,car=Car,
            sessionType=Type,startedAtUtc=started,endedAtUtc=ended,
            stints,pitStops=pits,positions,source="ACC shared memory"};
        try {
            string tmp=file+".tmp";
            File.WriteAllText(tmp,JsonSerializer.Serialize(report),new UTF8Encoding(false));
            File.Move(tmp,file,true);
        }catch(Exception e){Console.WriteLine("ERROR|Race report: "+e.Message.Replace("|","/"));}
    }
}
