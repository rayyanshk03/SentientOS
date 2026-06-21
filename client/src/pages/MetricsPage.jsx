import { useState, useEffect } from 'react';
import { useOutletContext } from 'react-router-dom';
import Badge from '../components/ui/Badge';
import { MetricsSkeleton } from '../components/ui/Skeleton';

export default function MetricsPage() {
  const { memories = [], stats = {} } = useOutletContext();
  const [animatedStats, setAnimatedStats] = useState({ totalMemories: 0, queriesToday: 0, decisionsSaved: 0, avgResponse: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loaderTimer = setTimeout(() => setLoading(false), 800);
    return () => clearTimeout(loaderTimer);
  }, []);

  useEffect(() => {
    if (loading) return;
    const targetTotal = memories.length || stats.totalMemories || 14;
    const targetQueries = stats.queriesToday || 7;
    const targetSaved = stats.decisionsSaved || 5;
    const targetAvg = parseFloat(stats.avgResponseTime || stats.avgResponse || 1.4);

    let startTimestamp = null;
    const duration = 800;

    const step = (timestamp) => {
      if (!startTimestamp) startTimestamp = timestamp;
      const progress = Math.min((timestamp - startTimestamp) / duration, 1);

      setAnimatedStats({
        totalMemories: Math.floor(progress * targetTotal),
        queriesToday: Math.floor(progress * targetQueries),
        decisionsSaved: Math.floor(progress * targetSaved),
        avgResponse: (progress * targetAvg).toFixed(1)
      });

      if (progress < 1) {
        window.requestAnimationFrame(step);
      }
    };

    window.requestAnimationFrame(step);
  }, [stats, memories]);

  if (loading) {
    return (
      <div 
        className="main-content-page"
        style={{
          gridColumn: 2,
          gridRow: '2 / 4',
          padding: '24px 32px',
          overflowY: 'auto',
          background: 'var(--gray-light)',
          display: 'flex',
          flexDirection: 'column',
          gap: 24,
        }}
      >
        <div>
          <h1 style={{ fontSize: 22, fontWeight: 700, color: 'var(--black)', margin: '0 0 4px 0' }}>Analytics Dashboard</h1>
          <p style={{ fontSize: 13, color: 'var(--gray-mid)', margin: 0 }}>Review memory growth, retrieval metrics, and API speed performance</p>
        </div>
        <MetricsSkeleton />
      </div>
    );
  }

  return (
    <div 
      className="main-content-page"
      style={{
        gridColumn: 2,
        gridRow: '2 / 4',
        padding: '24px 32px',
        overflowY: 'auto',
        background: 'var(--gray-light)',
        display: 'flex',
        flexDirection: 'column',
        gap: 24,
      }}
    >
      {/* Header */}
      <div>
        <h1 style={{ fontSize: 22, fontWeight: 700, color: 'var(--black)', margin: '0 0 4px 0' }}>Analytics Dashboard</h1>
        <p style={{ fontSize: 13, color: 'var(--gray-mid)', margin: 0 }}>Review memory growth, retrieval metrics, and API speed performance</p>
      </div>

      {/* Primary Metrics Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16 }}>
        <div style={{ background: 'var(--white)', border: '1px solid var(--border)', borderRadius: 12, padding: 18 }}>
          <span style={{ fontSize: 11, color: 'var(--gray-mid)', fontWeight: 600, textTransform: 'uppercase' }}>Memories Indexed</span>
          <div style={{ fontSize: 32, fontWeight: 700, color: 'var(--blue)', marginTop: 4 }}>{animatedStats.totalMemories}</div>
        </div>
        <div style={{ background: 'var(--white)', border: '1px solid var(--border)', borderRadius: 12, padding: 18 }}>
          <span style={{ fontSize: 11, color: 'var(--gray-mid)', fontWeight: 600, textTransform: 'uppercase' }}>Queries Contextualized</span>
          <div style={{ fontSize: 32, fontWeight: 700, color: 'var(--black)', marginTop: 4 }}>{animatedStats.queriesToday}</div>
        </div>
        <div style={{ background: 'var(--white)', border: '1px solid var(--border)', borderRadius: 12, padding: 18 }}>
          <span style={{ fontSize: 11, color: 'var(--gray-mid)', fontWeight: 600, textTransform: 'uppercase' }}>Decisions Ingested</span>
          <div style={{ fontSize: 32, fontWeight: 700, color: '#34c759', marginTop: 4 }}>{animatedStats.decisionsSaved}</div>
        </div>
        <div style={{ background: 'var(--white)', border: '1px solid var(--border)', borderRadius: 12, padding: 18 }}>
          <span style={{ fontSize: 11, color: 'var(--gray-mid)', fontWeight: 600, textTransform: 'uppercase' }}>Agent Latency</span>
          <div style={{ fontSize: 32, fontWeight: 700, color: '#ff9500', marginTop: 4 }}>{animatedStats.avgResponse}s</div>
        </div>
      </div>

      {/* Growth Chart Panel */}
      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 24 }}>
        
        {/* Memory growth visualizer */}
        <div style={{ background: 'var(--white)', border: '1px solid var(--border)', borderRadius: 12, padding: 20 }}>
          <h2 style={{ fontSize: 15, fontWeight: 600, color: 'var(--black)', marginBottom: 12 }}>Ingestion Growth (Weekly Indexing)</h2>
          
          <div style={{ border: '1px solid var(--border)', borderRadius: 10, padding: 16, display: 'flex', justifyContent: 'center' }}>
            <svg width="100%" height="150" viewBox="0 0 340 100">
              {(stats.weeklyGrowth || [0, 0, 0, 0, 0, 0, 0]).map((val, idx) => {
                const maxVal = Math.max(...(stats.weeklyGrowth || [0]), 4);
                const barHeight = val > 0 ? (val / maxVal) * 70 : 2;
                const x = idx * 44 + 20;
                const y = 80 - barHeight;
                const isSunday = idx === 6;
                const dayLabels = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

                return (
                  <g key={idx}>
                    {val > 0 && (
                      <text x={x + 15} y={y - 6} textAnchor="middle" fill="var(--black)" fontSize="9" fontWeight="700">
                        +{val}
                      </text>
                    )}
                    <rect
                      x={x}
                      y={y}
                      width="30"
                      height={barHeight}
                      rx="4"
                      fill={isSunday ? '#005BBB' : 'var(--blue)'}
                    />
                    <text x={x + 15} y="94" textAnchor="middle" fill="var(--gray-mid)" fontSize="9" fontWeight="600">
                      {dayLabels[idx].slice(0,3)}
                    </text>
                  </g>
                );
              })}
            </svg>
          </div>
        </div>

        {/* Database Health Status */}
        <div style={{ background: 'var(--white)', border: '1px solid var(--border)', borderRadius: 12, padding: 20, display: 'flex', flexDirection: 'column', gap: 16 }}>
          <h2 style={{ fontSize: 15, fontWeight: 600, color: 'var(--black)', margin: 0 }}>System Health</h2>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: 13, color: 'var(--black)' }}>MongoDB Cluster</span>
              <Badge color={stats.mongoConnected !== false ? "green" : "red"}>{stats.mongoConnected !== false ? "Connected" : "Disconnected"}</Badge>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: 13, color: 'var(--black)' }}>Parcle API Server</span>
              <Badge color={stats.parcleOnline !== false ? "green" : "red"}>{stats.parcleOnline !== false ? "Online" : "Offline"}</Badge>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: 13, color: 'var(--black)' }}>Memory Load</span>
              <span style={{ fontSize: 12, fontWeight: 600, color: 'var(--black)' }}>0.42% (Parcle limits)</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: 13, color: 'var(--black)' }}>Storage Chunks</span>
              <span style={{ fontSize: 12, fontWeight: 600, color: 'var(--black)' }}>{memories.length} / 10,000</span>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
