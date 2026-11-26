using System.IO.MemoryMappedFiles;

namespace ApexAI.Collector;

// Kunos ACC Shared Memory 1.8.12, SPageFileGraphic, 4-byte packing.
// 60 XYZ coordinates and 60 car IDs precede the player/penalty fields.
internal readonly record struct AccGraphics(
    bool InPitLane, bool InPit, bool MandatoryPitDone, int Penalty, float PenaltyTime,
    int SessionIndex)
{
    public static AccGraphics Read(MemoryMappedViewAccessor graphics) => new(
        graphics.ReadInt32(1236) == 1, graphics.ReadInt32(160) == 1,
        graphics.ReadInt32(1244) == 1, graphics.ReadInt32(1228),
        graphics.ReadSingle(1220), graphics.ReadInt32(1320));
}
