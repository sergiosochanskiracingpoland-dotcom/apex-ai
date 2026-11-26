using System.Globalization;
using System.Text;
using System.Text.Json;
namespace ApexAI.Collector;

internal sealed class RaceCapture
{
    public string Id { get; }
    public string Track { get; }
    public string Car { get; }
    public int Type { get; }
    private readonly int sessionIndex;
    public int LastLap { get; private set; }
    private readonly string file;
    private readonly string started = DateTime.UtcNow.ToString("O");
    private string? ended;
    private readonly List<string> stints = new();
    private readonly List<object> positions = new();
    private readonly List<Dictionary<string, object?>> pits = new();
    private readonly List<Penalty> penalties = new();
    private Penalty? penalty;
    private Penalty? driveThroughClearedInLane;
    private Dictionary<string, object?>? pit;
    private DateTime? stoppedAt;
    private bool interruptedVisit;
    private bool gap;
    private bool? mandatoryAtEntry;
    private bool boxStop;
    private bool possiblePenalty;
    private bool lane;
    private bool published;
    private int previousPosition;
    private DateTime lastWrite = DateTime.MinValue;

    private sealed class Penalty
    {
        public required int Code { get; init; }
        public required DateTime FirstSeenAtUtc { get; init; }
        public required int Lap { get; init; }
        public required bool AlreadyActive { get; init; }
        public double? ObservedSeconds { get; set; }
        public DateTime? ClearedAtUtc { get; set; }
        public string Status { get; set; } = "active";
        public int? Visit { get; set; }
        public int? StopAndGoSeconds => Code switch { 2 or 8 => 10, 3 or 9 => 20, 4 or 10 => 30, _ => null };
        public bool DriveThrough => Code is 1 or 7 or 19;
    }

    public RaceCapture(string folder,string track,string car,int type,int lap,bool inLane,int sessionIndex=0)
    {
        Track=track;Car=car;Type=type;LastLap=lap;lane=inLane;this.sessionIndex=sessionIndex;
        string id;
        do { id="acc_"+DateTime.Now.ToString("yyyyMMdd_HHmmss",CultureInfo.InvariantCulture)+"_"+
             Random.Shared.Next(1000,9999).ToString(CultureInfo.InvariantCulture); }
        while(File.Exists(Path.Combine(folder,id+"_race.json")));
        Id=id;file=Path.Combine(folder,Id+"_race.json");
    }
    public bool Matches(string track,string car,int type,int lap,int index) =>
        ended is null&&Track==track&&Car==car&&Type==type&&lap>=LastLap&&index==sessionIndex;
    public void AddStint(string key) { if(!stints.Contains(key)){stints.Add(key);published=true;Save(true);} }

    public void TelemetryGap()
    {
        gap = true;
        if (pit is null) return;
        interruptedVisit = true;
        stoppedAt = null;
        pit["stationarySeconds"] = null;
        Save(true);
    }

    public void Update(DateTime at,int lap,int position,bool inLane,bool atBox,float speed,
        float fuel,string compound,int penaltyCode=0,float penaltyTime=0,bool mandatoryPitDone=false)
    {
        LastLap=Math.Max(LastLap,lap);
        bool changedPosition = false;
        if(Type==2&&position is >=1 and <=200&&position!=previousPosition)
        {
            previousPosition=position;
            if(positions.Count<3000)positions.Add(new {atUtc=at.ToString("O"),lap,position});
            changedPosition = true;
        }
        bool changed = false;
        if(!lane&&inLane)
        {
            pit=new Dictionary<string,object?> {
                ["entryAtUtc"]=gap?null:at.ToString("O"),["exitAtUtc"]=null,
                ["entryLap"]=lap,["positionBefore"]=position is >=1 and <=200?position:null,
                ["fuelBeforeLitres"]=float.IsFinite(fuel)&&fuel>=0?Math.Round(fuel,2):null,
                ["tyreCompoundBefore"]=compound,["tyreCompoundAfter"]=null,
                ["fuelAddedLitres"]=null,["laneSeconds"]=null,["stationarySeconds"]=0d,
                ["pitBoxFirstSeenUtc"]=null,["kind"]="pending"
            };
            interruptedVisit=gap; possiblePenalty=false; boxStop=false;
            driveThroughClearedInLane=null;
            if(gap)pit["stationarySeconds"]=null;
            mandatoryAtEntry=gap?null:mandatoryPitDone;
            pits.Add(pit);
            published=true;
            changed=true;
        }
        if(inLane&&pit is not null&&!interruptedVisit)
        {
            if(float.IsFinite(speed)&&speed is >=0 and <=2)
            {
                stoppedAt??=at;
                boxStop |= atBox;
            }
            else if(stoppedAt is { } first)
            { pit["stationarySeconds"]=(double)pit["stationarySeconds"]!+(at-first).TotalSeconds; stoppedAt=null; }
            if(atBox&&pit["pitBoxFirstSeenUtc"] is null)pit["pitBoxFirstSeenUtc"]=at.ToString("O");
        }
        // A clear near a measured service is evidence of service. ACC may also
        // clear a code for other reasons, so keep inferred service distinct.
        if(penalty is not null&&penaltyCode>=0&&penalty.Code!=penaltyCode)
        {
            penalty.ClearedAtUtc=at;
            penalty.Status=penaltyCode==0?"cleared":"changed";
            double stationary=pit?["stationarySeconds"] is double seconds
                ? seconds+(stoppedAt is {} stop?(at-stop).TotalSeconds:0):0;
            if(penaltyCode==0&&pit is not null&&!gap&&!interruptedVisit&&possiblePenalty)
            {
                if(penalty.StopAndGoSeconds is {} required&&stationary>=required-0.25)
                    MarkServed(penalty,pit);
                else if(penalty.DriveThrough)
                    driveThroughClearedInLane=penalty;
            }
            penalty=null;
            changed=true;
        }
        if(Type==2&&penaltyCode>0&&penalty is null)
        {
            penalty=new Penalty { Code=penaltyCode,FirstSeenAtUtc=at,Lap=lap,AlreadyActive=firstFrame||gap };
            penalties.Add(penalty);
            published=true;
            changed=true;
        }
        if(penalty is not null)
        {
            if(pit is not null&&(penalty.DriveThrough||penalty.StopAndGoSeconds is not null))
                possiblePenalty=true;
            if(penalty.ObservedSeconds is null&&float.IsFinite(penaltyTime)&&penaltyTime>0)
            {
                penalty.ObservedSeconds=Math.Round(penaltyTime,2);
                changed=true;
            }
        }
        if(lane&&!inLane&&pit is not null)
        {
            if(stoppedAt is { } first)
            { pit["stationarySeconds"]=(double)pit["stationarySeconds"]!+(at-first).TotalSeconds;stoppedAt=null; }
            if(pit["stationarySeconds"] is double stationary)
                pit["stationarySeconds"]=Math.Round(stationary,1);
            pit["exitAtUtc"]=at.ToString("O");
            pit["exitLap"]=lap;pit["positionAfter"]=position is >=1 and <=200?position:null;
            if(!interruptedVisit&&pit["entryAtUtc"] is string entry)
                pit["laneSeconds"]=Math.Round((at-DateTime.Parse(entry,
                    CultureInfo.InvariantCulture,DateTimeStyles.RoundtripKind)).TotalSeconds,1);
            pit["fuelAfterLitres"]=float.IsFinite(fuel)&&fuel>=0?Math.Round(fuel,2):null;
            if(!interruptedVisit&&pit["fuelBeforeLitres"] is double before&&pit["fuelAfterLitres"] is double after&&after-before>0.5)
                pit["fuelAddedLitres"]=Math.Round(after-before,2);
            pit["tyreCompoundAfter"]=compound;
            if(!interruptedVisit&&driveThroughClearedInLane is {} driveThrough&&
                pit["stationarySeconds"] is double duration&&duration<2)
                MarkServed(driveThrough,pit);
            if((string?)pit["kind"]!="penalty")
            {
                bool service=mandatoryAtEntry==false&&mandatoryPitDone || pit["fuelAddedLitres"] is double ||
                    (string?)pit["tyreCompoundBefore"] is { Length: >0 } beforeCompound &&
                    compound.Length>0&&compound!=beforeCompound;
                pit["kind"]=possiblePenalty?"possiblePenalty":interruptedVisit?"incomplete":
                    service||boxStop?"stop":"pass";
            }
            pit=null;changed=true;
        }
        lane=inLane;
        firstFrame=false;
        gap=false;
        if(changed||changedPosition)Save(changed);
    }
    private void MarkServed(Penalty served, Dictionary<string,object?> visit)
    {
        served.Status="servedInferred";
        served.Visit=pits.Count;
        visit["kind"]="penalty";
    }
    private bool firstFrame=true;
    public void Close()
    {
        if(ended is not null)return;
        ended=DateTime.UtcNow.ToString("O");
        if(pit is not null&&Equals(pit["kind"],"pending"))pit["kind"]="incomplete";
        if(penalty is not null)penalty.Status="unresolved";
        Save(true);
    }
    private void Save(bool force)
    {
        if(!published||(!force&&(DateTime.UtcNow-lastWrite).TotalSeconds<2))return;
        lastWrite=DateTime.UtcNow;
        var report=new {schemaVersion=2,id=Id,track=Track,car=Car,
            sessionType=Type,startedAtUtc=started,endedAtUtc=ended,
            stints,pitVisits=pits,positions,penalties,
            source="ACC shared memory"};
        try {
            string tmp=file+".tmp";
            File.WriteAllText(tmp,JsonSerializer.Serialize(report,JsonOptions),new UTF8Encoding(false));
            File.Move(tmp,file,true);
        }catch(Exception e){Console.WriteLine("ERROR|Race report: "+e.Message.Replace("|","/"));}
    }
    private static readonly JsonSerializerOptions JsonOptions = new() { PropertyNamingPolicy=JsonNamingPolicy.CamelCase };
}
