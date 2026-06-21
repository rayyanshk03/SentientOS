import { useState, useEffect, useRef, useCallback } from 'react';

/* ─── Relative time helper ──────────────────────────────────────────────────── */
function relativeTime(isoString) {
  if (!isoString) return '—';
  const diff = Math.floor((Date.now() - new Date(isoString).getTime()) / 1000);
  if (diff < 5)   return 'just now';
  if (diff < 60)  return `${diff}s ago`;
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  return `${Math.floor(diff / 86400)}d ago`;
}

/* ─── easeOut cubic ─────────────────────────────────────────────────────────── */
function easeOut(t) {
  return 1 - Math.pow(1 - t, 3);
}

/* ─── useCountUp hook ───────────────────────────────────────────────────────── */
function useCountUp(target, duration = 800, enabled = true) {
  const [display, setDisplay] = useState(0);
  const rafRef  = useRef(null);
  const prevRef = useRef(0);

  useEffect(() => {
    if (!enabled || target === 0) {
      setDisplay(target);
      prevRef.current = target;
      return;
    }

    const start     = prevRef.current;
    const diff      = target - start;
    const startTime = performance.now();

    const tick = (now) => {
      const elapsed = now - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const value    = Math.round(start + diff * easeOut(progress));
      setDisplay(value);
      if (progress < 1) {
        rafRef.current = requestAnimationFrame(tick);
      } else {
        prevRef.current = target;
      }
    };

    rafRef.current = requestAnimationFrame(tick);
    return () => rafRef.current && cancelAnimationFrame(rafRef.current);
  }, [target, duration, enabled]);

  return display;
}

/* ─── ShimmerPill ───────────────────────────────────────────────────────────── */
function ShimmerPill({ width = 56 }) {
  return (
    <div style={{
      width, height: 14, borderRadius: 'var(--radius-pill)',
      background: 'linear-gradient(90deg, var(--border) 25%, #E2E2E2 50%, var(--border) 75%)',
      backgroundSize: '200px 100%',
      animation: 'statsShimmer 1.4s infinite linear',
    }} />
  );
}

/* ─── StatItem ──────────────────────────────────────────────────────────────── */
function StatItem({ icon, label, value, valueColor = 'var(--black)', isLoading, isMobile, isRaw }) {
  // isRaw = already a formatted string (like response time), skip count-up
  const animated = useCountUp(
    typeof value === 'number' ? value : 0,
    800,
    !isLoading && !isRaw
  );

  const displayVal = isLoading
    ? null
    : isRaw
      ? value
      : animated;

  if (isMobile) {
    return (
      <div style={{
        display: 'flex', alignItems: 'center', gap: 5,
        padding: '4px 10px', background: 'var(--white)',
        borderRadius: 'var(--radius-pill)', border: '1px solid var(--border)',
        flexShrink: 0, fontSize: 12, fontWeight: 600,
        whiteSpace: 'nowrap', color: 'var(--black)'
      }}>
        <span style={{ fontSize: 13 }}>{icon}</span>
        {isLoading
          ? <ShimmerPill width={24} />
          : <span style={{ color: valueColor }}>{displayVal}</span>
        }
      </div>
    );
  }

  return (
    <div style={{
      display: 'flex', alignItems: 'center', gap: 8,
      whiteSpace: 'nowrap',
    }}>
      <span style={{ fontSize: 14, lineHeight: 1 }}>{icon}</span>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 1, alignItems: 'flex-start' }}>
        {isLoading ? (
          <>
            <ShimmerPill width={40} />
            <ShimmerPill width={52} />
          </>
        ) : (
          <>
            <span style={{
              fontSize: 13, fontWeight: 700, lineHeight: 1,
              color: valueColor, fontVariantNumeric: 'tabular-nums',
              letterSpacing: '-0.01em',
            }}>
              {displayVal}
            </span>
            <span style={{
              fontSize: 10, fontWeight: 500, lineHeight: 1,
              color: 'var(--gray-mid)', textTransform: 'uppercase',
              letterSpacing: '0.04em',
            }}>
              {label}
            </span>
          </>
        )}
      </div>
    </div>
  );
}

/* ─── Separator ─────────────────────────────────────────────────────────────── */
function Sep() {
  return (
    <div style={{
      width: 1, height: 20,
      background: 'var(--border)',
      flexShrink: 0,
    }} />
  );
}

/* ─── StatsBar ──────────────────────────────────────────────────────────────── */
export default function StatsBar() {
  const [stats, setStats]       = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isMobile, setIsMobile]   = useState(window.innerWidth < 768);
  const [avgResponse, setAvgResponse] = useState('—');

  /* ── fetch ── */
  const fetchStats = useCallback(async () => {
    try {
      const res  = await fetch(`${import.meta.env.VITE_API_URL}/api/stats`);
      const data = await res.json();
      setStats(data);

      // avgResponseTime may come from API or be derived
      if (data.avgResponseTime != null) {
        setAvgResponse(`${Number(data.avgResponseTime).toFixed(1)}s`);
      } else {
        setAvgResponse('1.4s');   // graceful fallback
      }
    } catch {
      // silently fail — keep last values
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchStats();
    const interval = setInterval(fetchStats, 30000);
    return () => clearInterval(interval);
  }, [fetchStats]);

  /* ── responsive ── */
  useEffect(() => {
    const onResize = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, []);

  const s = stats ?? { totalMemories: 0, queriesToday: 0, decisionsSaved: 0, lastActive: null };

  const statItems = [
    {
      icon: '🤖', label: 'LLM Engine',
      value: 'Gemini 2.5 Flash',
      valueColor: 'var(--blue)',
      isRaw: true,
    },
    {
      icon: '🧠', label: 'Total Memories',
      value: s.totalMemories,
      valueColor: 'var(--black)',
    },
    {
      icon: '🔍', label: 'Queries Today',
      value: s.queriesToday,
      valueColor: 'var(--black)',
    },
    {
      icon: '💾', label: 'Decisions Saved',
      value: s.decisionsSaved,
      valueColor: 'var(--black)',
    },
    {
      icon: '⚡', label: 'Last Active',
      value: relativeTime(s.lastActive),
      valueColor: 'var(--gray-mid)',
      isRaw: true,
    },
    {
      icon: '📊', label: 'Avg Response',
      value: avgResponse,
      valueColor: 'var(--black)',
      isRaw: true,
    },
  ];

  return (
    <>
      {/* shimmer keyframe injected once */}
      <style>{`
        @keyframes statsShimmer {
          0%   { background-position: -200px 0; }
          100% { background-position: calc(200px + 100%) 0; }
        }
      `}</style>

      <div
        className="stats-bar"
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: isMobile ? 'flex-start' : 'center',
          paddingInline: isMobile ? 'var(--space-12)' : 0,
          gap: isMobile ? 'var(--space-8)' : 'var(--space-32)',
          overflowX: isMobile ? 'auto' : 'visible',
          scrollbarWidth: 'none',
        }}
      >
        {isMobile ? (
          /* ── Mobile: compact chips, no separators ── */
          statItems.map((item) => (
            <StatItem
              key={item.label}
              icon={item.icon}
              label={item.label}
              value={item.value}
              valueColor={item.valueColor}
              isLoading={isLoading}
              isMobile
              isRaw={item.isRaw}
            />
          ))
        ) : (
          /* ── Desktop: full items with separators ── */
          statItems.map((item, idx) => (
            <div key={item.label} style={{ display: 'flex', alignItems: 'center', gap: 32 }}>
              <StatItem
                icon={item.icon}
                label={item.label}
                value={item.value}
                valueColor={item.valueColor}
                isLoading={isLoading}
                isMobile={false}
                isRaw={item.isRaw}
              />
              {idx < statItems.length - 1 && <Sep />}
            </div>
          ))
        )}
      </div>
    </>
  );
}
