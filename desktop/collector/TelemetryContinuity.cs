namespace ApexAI.Collector;

internal sealed class TelemetryContinuity
{
    private int? graphicsPacket, physicsPacket;
    private TimeSpan? graphicsAt, physicsAt;
    private TimeSpan openedAt;
    public bool GraphicsAdvanced { get; private set; }

    public void Opened(TimeSpan now)
    {
        openedAt = now;
        graphicsAt = physicsAt = null;
    }

    public bool Observe(TimeSpan now, int graphics, int physics)
    {
        bool restarted = Rewound(graphicsPacket, graphics) || Rewound(physicsPacket, physics);
        GraphicsAdvanced = !restarted && graphicsPacket.HasValue && graphics != graphicsPacket;
        if (restarted) Opened(now);
        else
        {
            if (GraphicsAdvanced) graphicsAt = now;
            if (physicsPacket.HasValue && physics != physicsPacket) physicsAt = now;
        }
        graphicsPacket = graphics;
        physicsPacket = physics;
        return restarted;
    }

    public bool IsLive(TimeSpan now) =>
        graphicsAt is { } g && physicsAt is { } p &&
        now - g < TimeSpan.FromSeconds(2) && now - p < TimeSpan.FromSeconds(2);

    public bool ShouldReopen(TimeSpan now) =>
        now - (graphicsAt ?? openedAt) >= TimeSpan.FromSeconds(12) ||
        now - (physicsAt ?? openedAt) >= TimeSpan.FromSeconds(12);

    public static bool CanStartStint(float speed) => float.IsFinite(speed) && speed >= 2;

    private static bool Rewound(int? previous, int current) =>
        previous is { } packet && unchecked(current - packet) < 0;
}
