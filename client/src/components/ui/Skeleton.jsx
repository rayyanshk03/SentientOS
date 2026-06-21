/* ─────────────────────────────────────────────────────────────────────────────
   Skeleton.jsx — Reusable shimmer skeleton primitives
   ───────────────────────────────────────────────────────────────────────────── */

/* ── Raw shimmer block ─────────────────────────────────────────────────── */
export function SkeletonBlock({ width = '100%', height = 12, borderRadius = 4, style = {} }) {
  return (
    <div
      className="skeleton-shimmer"
      style={{ width, height, borderRadius, flexShrink: 0, ...style }}
    />
  );
}

/* ── Single memory card skeleton ──────────────────────────────────────── */
export function MemoryCardSkeleton() {
  return (
    <div style={{
      background: 'var(--white)',
      border: '1px solid var(--border)',
      borderRadius: 12,
      padding: 18,
      display: 'flex',
      flexDirection: 'column',
      gap: 12,
    }}>
      {/* Badge + actions row */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <SkeletonBlock width={64} height={20} borderRadius={999} />
        <div style={{ display: 'flex', gap: 8 }}>
          <SkeletonBlock width={20} height={20} borderRadius={4} />
          <SkeletonBlock width={20} height={20} borderRadius={4} />
          <SkeletonBlock width={20} height={20} borderRadius={4} />
        </div>
      </div>

      {/* Title */}
      <SkeletonBlock width="60%" height={14} />

      {/* Content lines */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
        <SkeletonBlock width="100%" height={10} />
        <SkeletonBlock width="90%"  height={10} />
        <SkeletonBlock width="40%"  height={10} />
      </div>

      {/* Tags */}
      <div style={{ display: 'flex', gap: 6 }}>
        <SkeletonBlock width={40} height={22} borderRadius={999} />
        <SkeletonBlock width={60} height={22} borderRadius={999} />
      </div>

      {/* Footer */}
      <div style={{ height: 1, background: 'var(--border)', margin: '2px 0' }} />
      <div style={{ display: 'flex', justifyContent: 'space-between' }}>
        <SkeletonBlock width={80}  height={10} />
        <SkeletonBlock width={70}  height={10} />
      </div>
    </div>
  );
}

/* ── Grid of n memory card skeletons ──────────────────────────────────── */
export function MemoryGridSkeleton({ count = 6 }) {
  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: 16 }}>
      {Array.from({ length: count }).map((_, i) => (
        <MemoryCardSkeleton key={i} />
      ))}
    </div>
  );
}

/* ── Chat message skeleton (agent) ────────────────────────────────────── */
function AgentMessageSkeleton() {
  return (
    <div style={{ display: 'flex', gap: 8, padding: '6px 20px', alignItems: 'flex-start' }}>
      {/* Avatar */}
      <SkeletonBlock
        width={32} height={32} borderRadius="50%"
        style={{ flexShrink: 0, marginTop: 4 }}
      />
      {/* Lines */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8, flex: 1, maxWidth: '55%' }}>
        <SkeletonBlock width={80}   height={10} />
        <SkeletonBlock width="100%" height={34} borderRadius={12} />
      </div>
    </div>
  );
}

/* ── Chat message skeleton (user) ─────────────────────────────────────── */
function UserMessageSkeleton() {
  return (
    <div style={{ display: 'flex', flexDirection: 'row-reverse', padding: '6px 20px' }}>
      <SkeletonBlock width="38%" height={38} borderRadius={14} />
    </div>
  );
}

/* ── Full chat skeleton (2 agent + 1 user) ────────────────────────────── */
export function ChatSkeleton() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 8, padding: '16px 0' }}>
      <AgentMessageSkeleton />
      <UserMessageSkeleton />
      <AgentMessageSkeleton />
    </div>
  );
}

/* ── Table / Document rows skeleton ──────────────────────────────────── */
export function TableSkeleton({ rows = 4 }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 12, width: '100%', padding: '8px 4px' }}>
      {/* Header Row */}
      <div style={{ display: 'flex', gap: 16, borderBottom: '1.5px solid var(--border)', paddingBottom: 10 }}>
        <SkeletonBlock width="35%" height={14} />
        <SkeletonBlock width="15%" height={14} />
        <SkeletonBlock width="15%" height={14} />
        <SkeletonBlock width="20%" height={14} />
        <SkeletonBlock width="15%" height={14} />
      </div>
      {/* Rows */}
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} style={{ display: 'flex', gap: 16, borderBottom: '1px solid var(--border)', padding: '12px 0', alignItems: 'center' }}>
          <SkeletonBlock width="35%" height={12} />
          <SkeletonBlock width="15%" height={12} />
          <SkeletonBlock width="15%" height={12} />
          <SkeletonBlock width="20%" height={12} />
          <SkeletonBlock width="15%" height={18} borderRadius={999} />
        </div>
      ))}
    </div>
  );
}

/* ── Metrics Dashboard skeleton ───────────────────────────────────────── */
export function MetricsSkeleton() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24, width: '100%' }}>
      {/* 4 Metric Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16 }}>
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} style={{ background: 'var(--white)', border: '1px solid var(--border)', borderRadius: 12, padding: 18, display: 'flex', flexDirection: 'column', gap: 8 }}>
            <SkeletonBlock width="60%" height={10} />
            <SkeletonBlock width="40%" height={28} style={{ marginTop: 4 }} />
          </div>
        ))}
      </div>
      {/* Chart + Health Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 24 }}>
        {/* Chart card */}
        <div style={{ background: 'var(--white)', border: '1px solid var(--border)', borderRadius: 12, padding: 20, display: 'flex', flexDirection: 'column', gap: 16 }}>
          <SkeletonBlock width="35%" height={14} />
          <div style={{ border: '1px solid var(--border)', borderRadius: 10, padding: 16, display: 'flex', gap: 14, alignItems: 'flex-end', justifyContent: 'space-around', height: 150 }}>
            {[40, 20, 60, 30, 80, 50, 70].map((h, i) => (
              <SkeletonBlock key={i} width={30} height={`${h}%`} borderRadius={4} />
            ))}
          </div>
        </div>
        {/* Health status card */}
        <div style={{ background: 'var(--white)', border: '1px solid var(--border)', borderRadius: 12, padding: 20, display: 'flex', flexDirection: 'column', gap: 16 }}>
          <SkeletonBlock width="40%" height={14} />
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <SkeletonBlock width="50%" height={12} />
                <SkeletonBlock width="25%" height={16} borderRadius={999} />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

/* ── Form Controls skeleton ───────────────────────────────────────────── */
export function FormSkeleton() {
  return (
    <div style={{ display: 'grid', gridTemplateColumns: '2fr 1.2fr', gap: 24, width: '100%' }}>
      {/* Left parameters card */}
      <div style={{ background: 'var(--white)', border: '1px solid var(--border)', borderRadius: 12, padding: 24, display: 'flex', flexDirection: 'column', gap: 20 }}>
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            <SkeletonBlock width="30%" height={12} />
            <SkeletonBlock width="100%" height={i === 2 ? 100 : 38} borderRadius={8} />
          </div>
        ))}
      </div>
      {/* Right guidelines card */}
      <div style={{ background: 'var(--white)', border: '1px solid var(--border)', borderRadius: 12, padding: 20, display: 'flex', flexDirection: 'column', gap: 16 }}>
        <SkeletonBlock width="50%" height={14} />
        <div style={{ height: 1, background: 'var(--border)' }} />
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div>
            <SkeletonBlock width="60%" height={12} style={{ marginBottom: 6 }} />
            <SkeletonBlock width="100%" height={10} style={{ marginBottom: 4 }} />
            <SkeletonBlock width="80%" height={10} />
          </div>
          <div>
            <SkeletonBlock width="45%" height={12} style={{ marginBottom: 6 }} />
            <SkeletonBlock width="100%" height={10} style={{ marginBottom: 4 }} />
            <SkeletonBlock width="90%" height={10} />
          </div>
        </div>
      </div>
    </div>
  );
}

