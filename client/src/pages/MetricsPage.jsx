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
          padding: '40px 48px',
          overflowY: 'auto',
          background: '#F5F5F7',
        }}
      >
        <div style={{ maxWidth: 1040, margin: '0 auto', display: 'flex', flexDirection: 'column', gap: 32, width: '100%' }}>
          <div>
            <h1 style={{ fontSize: 28, fontWeight: 700, color: '#1d1d1f', margin: '0 0 8px 0', letterSpacing: '-0.5px' }}>Analytics Dashboard</h1>
            <p style={{ fontSize: 15, color: '#86868b', margin: 0 }}>Review memory growth, retrieval metrics, and API speed performance</p>
          </div>
          <MetricsSkeleton />
        </div>
      </div>
    );
  }

  return (
    <div 
      className="main-content-page"
      style={{
        gridColumn: 2,
        gridRow: '2 / 4',
        padding: '40px 48px',
        overflowY: 'auto',
        background: '#F5F5F7',
      }}
    >
      <div style={{ maxWidth: 1040, margin: '0 auto', display: 'flex', flexDirection: 'column', gap: 32, width: '100%' }}>
        {/* Header */}
        <div>
          <h1 style={{ fontSize: 28, fontWeight: 700, color: '#1d1d1f', margin: '0 0 8px 0', letterSpacing: '-0.5px' }}>Analytics Dashboard</h1>
          <p style={{ fontSize: 15, color: '#86868b', margin: 0 }}>Review memory growth, retrieval metrics, and API speed performance</p>
        </div>

        {/* Primary Metrics Grid */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 24 }}>
          <div style={{ background: 'var(--white)', border: 'none', borderRadius: 20, padding: 24, boxShadow: '0 8px 30px rgba(0,0,0,0.04)' }}>
            <span style={{ fontSize: 12, color: '#86868b', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.5px' }}>Memories Indexed</span>
            <div style={{ fontSize: 36, fontWeight: 700, color: '#007aff', marginTop: 8 }}>{animatedStats.totalMemories}</div>
          </div>
          <div style={{ background: 'var(--white)', border: 'none', borderRadius: 20, padding: 24, boxShadow: '0 8px 30px rgba(0,0,0,0.04)' }}>
            <span style={{ fontSize: 12, color: '#86868b', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.5px' }}>Queries Contextualized</span>
            <div style={{ fontSize: 36, fontWeight: 700, color: '#1d1d1f', marginTop: 8 }}>{animatedStats.queriesToday}</div>
          </div>
          <div style={{ background: 'var(--white)', border: 'none', borderRadius: 20, padding: 24, boxShadow: '0 8px 30px rgba(0,0,0,0.04)' }}>
            <span style={{ fontSize: 12, color: '#86868b', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.5px' }}>Decisions Ingested</span>
            <div style={{ fontSize: 36, fontWeight: 700, color: '#34c759', marginTop: 8 }}>{animatedStats.decisionsSaved}</div>
          </div>
          <div style={{ background: 'var(--white)', border: 'none', borderRadius: 20, padding: 24, boxShadow: '0 8px 30px rgba(0,0,0,0.04)' }}>
            <span style={{ fontSize: 12, color: '#86868b', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.5px' }}>Agent Latency</span>
            <div style={{ fontSize: 36, fontWeight: 700, color: '#ff9500', marginTop: 8 }}>{animatedStats.avgResponse}s</div>
          </div>
        </div>

        {/* Growth Chart Panel */}
        <div style={{ display: 'grid', gridTemplateColumns: '2.5fr 1fr', gap: 32 }}>
          
          {/* Memory growth visualizer */}
          <div style={{ background: 'var(--white)', border: 'none', borderRadius: 20, padding: 32, boxShadow: '0 8px 30px rgba(0,0,0,0.04)' }}>
            <h2 style={{ fontSize: 20, fontWeight: 700, color: '#1d1d1f', marginBottom: 24, letterSpacing: '-0.5px' }}>Ingestion Growth (Last 24 Hours)</h2>
            
            <div style={{ border: 'none', background: '#F5F5F7', borderRadius: 16, padding: '24px 0', display: 'flex', justifyContent: 'center', overflow: 'hidden' }}>
            <svg width="100%" height="160" viewBox="0 0 340 120" style={{ overflow: 'visible' }}>
              <defs>
                <linearGradient id="areaGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#007aff" stopOpacity="0.4" />
                  <stop offset="100%" stopColor="#007aff" stopOpacity="0.0" />
                </linearGradient>
              </defs>
              
              {(() => {
                const hourlyData = stats.hourlyGrowth || [0, 0, 0, 0, 0, 0];
                const maxVal = Math.max(...hourlyData, 4);
                
                const points = hourlyData.map((val, idx) => {
                  const x = idx * 55 + 32; // 6 points: 0..5. Max x = 5*55+32 = 307.
                  const y = 85 - (val / maxVal) * 60;
                  return { x, y, val };
                });

                const pathD = points.map((p, i) => (i === 0 ? `M ${p.x} ${p.y}` : `L ${p.x} ${p.y}`)).join(' ');
                const areaD = `${pathD} L ${points[points.length-1].x} 100 L ${points[0].x} 100 Z`;

                const getLabel = (idx) => {
                  if (idx === 5) return 'Now';
                  return `-${(5 - idx) * 4}h`;
                };

                return (
                  <>
                    <path d={areaD} fill="url(#areaGradient)" />
                    <path d={pathD} fill="none" stroke="#007aff" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
                    
                    {points.map((p, idx) => (
                      <g key={idx}>
                        <circle cx={p.x} cy={p.y} r="4" fill="#ffffff" stroke="#007aff" strokeWidth="2" />
                        {p.val > 0 && (
                          <text x={p.x} y={p.y - 12} textAnchor="middle" fill="#1d1d1f" fontSize="10" fontWeight="700">
                            {p.val}
                          </text>
                        )}
                        <text x={p.x} y="110" textAnchor="middle" fill="#86868b" fontSize="10" fontWeight="600">
                          {getLabel(idx)}
                        </text>
                      </g>
                    ))}
                  </>
                );
              })()}
            </svg>
            </div>
          </div>

          {/* Database Health Status */}
          <div style={{ background: 'var(--white)', border: 'none', borderRadius: 20, padding: 32, display: 'flex', flexDirection: 'column', gap: 24, boxShadow: '0 8px 30px rgba(0,0,0,0.04)' }}>
            <h2 style={{ fontSize: 20, fontWeight: 700, color: '#1d1d1f', margin: 0, letterSpacing: '-0.5px' }}>System Health</h2>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #E5E5EA', paddingBottom: 16 }}>
                <span style={{ fontSize: 14, color: '#515154', fontWeight: 500 }}>MongoDB Cluster</span>
                <Badge color={stats.mongoConnected !== false ? "green" : "red"}>{stats.mongoConnected !== false ? "Connected" : "Disconnected"}</Badge>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #E5E5EA', paddingBottom: 16 }}>
                <span style={{ fontSize: 14, color: '#515154', fontWeight: 500 }}>Parcle API Server</span>
                <Badge color={stats.parcleOnline !== false ? "green" : "red"}>{stats.parcleOnline !== false ? "Online" : "Offline"}</Badge>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #E5E5EA', paddingBottom: 16 }}>
                <span style={{ fontSize: 14, color: '#515154', fontWeight: 500 }}>Memory Load</span>
                <span style={{ fontSize: 13, fontWeight: 600, color: '#1d1d1f' }}>0.42% <span style={{ color: '#86868b', fontWeight: 500 }}>(Parcle limits)</span></span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: 14, color: '#515154', fontWeight: 500 }}>Storage Chunks</span>
                <span style={{ fontSize: 13, fontWeight: 600, color: '#1d1d1f' }}>{memories.length} / 10,000</span>
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
