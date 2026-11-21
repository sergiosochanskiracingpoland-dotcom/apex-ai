using System.Diagnostics;

namespace ApexAI.Collector;

/// <summary>
/// Deadline-based sampling clock. Uses QPC/Stopwatch for monotonic timing,
/// sleeps while safely distant from the deadline, then spins briefly to
/// avoid the Windows Sleep(13) rounding/oversleep that reduced effective Hz.
/// No busy waiting while the game is disconnected or paused: caller only
/// invokes WaitForNext after a successful recording iteration.
/// </summary>
internal sealed class SampleClock
{
    public const int TargetHz = 75;
    private readonly long periodTicks = Math.Max(1, Stopwatch.Frequency / TargetHz);
    private long nextDeadline;

    public void WaitForNext()
    {
        long now = Stopwatch.GetTimestamp();
        if (nextDeadline == 0 || now - nextDeadline > periodTicks * 2)
            nextDeadline = now + periodTicks;
        else
            nextDeadline += periodTicks;

        // Windows timer resolution is requested at 1ms by Program.Main.
        // Keep the active spin below ~1.2ms to avoid high CPU consumption.
        while (true)
        {
            long remaining = nextDeadline - Stopwatch.GetTimestamp();
            if (remaining <= 0) return;
            double ms = (double)remaining * 1000 / Stopwatch.Frequency;
            if (ms > 2.3)
                Thread.Sleep(Math.Max(1, (int)Math.Floor(ms - 1.2)));
            else
                Thread.SpinWait(80);
        }
    }

    public void Reset() => nextDeadline = 0;
}
