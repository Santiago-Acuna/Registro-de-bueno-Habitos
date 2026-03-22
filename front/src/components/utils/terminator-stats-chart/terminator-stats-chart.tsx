import React, { useMemo } from 'react';

interface ActionLog {
  id: string;
  startTime: string;
  endTime: string | null;
  durationSeconds: number | null;
  actionDate: string;
  actionTypeId: string;
  createdAt: string;
  updatedAt: string;
  logTypeData: Record<string, unknown> | null;
}

interface DayStats {
  date: string;
  count: number;
  trend: 'increase' | 'decrease' | 'neutral';
}

interface TerminatorStatsChartProps {
  actionLogs: ActionLog[];
  actionTypeName: string;
  onClose: () => void;
}

const TerminatorStatsChart: React.FC<TerminatorStatsChartProps> = ({ actionLogs, actionTypeName, onClose }) => {
  const dayStats = useMemo(() => {
    const logsByDate = actionLogs.reduce((acc, log) => {
      const date = new Date(log.actionDate).toISOString().split('T')[0];
      acc[date] = (acc[date] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const sortedDates = Object.keys(logsByDate).sort();

    const stats: DayStats[] = sortedDates.map((date, index) => {
      const count = logsByDate[date];
      let trend: 'increase' | 'decrease' | 'neutral' = 'neutral';

      if (index > 0) {
        const prevCount = logsByDate[sortedDates[index - 1]];
        if (count > prevCount) trend = 'increase';
        else if (count < prevCount) trend = 'decrease';
      }

      return { date, count, trend };
    });

    return stats;
  }, [actionLogs]);

  const maxCount = Math.max(...dayStats.map(s => s.count), 1);
  const chartHeight = 400;
  const chartWidth = 800;
  const padding = { top: 40, right: 40, bottom: 80, left: 60 };
  const graphWidth = chartWidth - padding.left - padding.right;
  const graphHeight = chartHeight - padding.top - padding.bottom;

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        backgroundColor: 'rgba(0,0,0,0.92)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 9999,
        padding: '2rem',
      }}
      onClick={onClose}
    >
      <style>{`
        @keyframes gridPulse {
          0%, 100% { opacity: 0.3; }
          50% { opacity: 0.6; }
        }
        @keyframes scanLine {
          0% { transform: translateY(0); opacity: 0; }
          10% { opacity: 1; }
          90% { opacity: 1; }
          100% { transform: translateY(${chartHeight}px); opacity: 0; }
        }
        @keyframes titleGlitch {
          0%, 90%, 100% { transform: translate(0, 0); }
          91% { transform: translate(-2px, 1px); }
          92% { transform: translate(2px, -1px); }
          93% { transform: translate(-1px, 2px); }
        }
        @keyframes dataBlink {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.5; }
        }
        @keyframes trendPulse {
          0%, 100% { transform: scale(1); }
          50% { transform: scale(1.2); }
        }
        .tc-bg-grid {
          background-image:
            repeating-linear-gradient(0deg, transparent, transparent 19px, rgba(255, 0, 0, 0.1) 19px, rgba(255, 0, 0, 0.1) 20px),
            repeating-linear-gradient(90deg, transparent, transparent 19px, rgba(255, 0, 0, 0.1) 19px, rgba(255, 0, 0, 0.1) 20px);
          animation: gridPulse 3s ease-in-out infinite;
        }
        .tc-scan-line {
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          height: 2px;
          background: linear-gradient(90deg, transparent, rgba(255, 0, 0, 0.8), transparent);
          box-shadow: 0 0 15px rgba(255, 0, 0, 1);
          animation: scanLine 4s linear infinite;
          pointer-events: none;
        }
        .tc-chart-title {
          font-size: 1.8rem;
          color: #ff0000;
          font-weight: 900;
          letter-spacing: 8px;
          text-transform: uppercase;
          font-family: 'Courier New', monospace;
          text-shadow:
            0 0 20px rgba(255, 0, 0, 1),
            0 0 40px rgba(255, 0, 0, 0.8),
            3px 3px 0 #000;
          animation: titleGlitch 6s infinite;
        }
        .tc-stat-badge {
          background: rgba(255, 0, 0, 0.15);
          border: 2px solid #ff0000;
          border-left: 4px solid #ff0000;
          color: #ff0000;
          padding: 4px 12px;
          font-size: 0.7rem;
          letter-spacing: 3px;
          font-weight: 700;
          font-family: 'Courier New', monospace;
          text-shadow: 0 0 8px rgba(255, 0, 0, 0.8);
          animation: dataBlink 2s infinite;
          display: inline-block;
          margin-bottom: 8px;
        }
        .tc-data-point {
          transition: all 0.3s ease;
        }
        .tc-data-point:hover {
          filter: brightness(1.5);
          transform: scale(1.2);
        }
        .tc-trend-indicator {
          animation: trendPulse 2s ease-in-out infinite;
        }
        .tc-axis-label {
          font-family: 'Courier New', monospace;
          fill: #ff0000;
          font-size: 12px;
          letter-spacing: 2px;
        }
        .tc-grid-line {
          stroke: rgba(255, 0, 0, 0.2);
          stroke-width: 1;
          stroke-dasharray: 5, 5;
        }
        .tc-close-btn {
          position: absolute;
          top: 1rem;
          right: 1rem;
          background: transparent;
          border: 2px solid #ff0000;
          color: #ff0000;
          font-family: 'Courier New', monospace;
          font-size: 0.75rem;
          letter-spacing: 2px;
          padding: 4px 10px;
          cursor: pointer;
          text-shadow: 0 0 8px rgba(255, 0, 0, 0.8);
          box-shadow: 0 0 10px rgba(255, 0, 0, 0.3);
          transition: all 0.2s;
        }
        .tc-close-btn:hover {
          background: rgba(255, 0, 0, 0.2);
          box-shadow: 0 0 20px rgba(255, 0, 0, 0.6);
        }
      `}</style>

      <div
        style={{ width: '100%', maxWidth: '900px' }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <div className="tc-stat-badge">◆ TACTICAL ANALYSIS ACTIVE</div>
          <h1 className="tc-chart-title">{actionTypeName} — STATISTICS</h1>
          <div style={{ color: '#555', fontSize: '0.75rem', letterSpacing: '4px', textTransform: 'uppercase', marginTop: '4px', fontFamily: 'Courier New, monospace' }}>
            Daily Activity Metrics
          </div>
        </div>

        {/* Stats Summary */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '1rem', marginBottom: '1.5rem' }}>
          {[
            { label: 'TOTAL LOGS', value: actionLogs.length },
            { label: 'ACTIVE DAYS', value: dayStats.length },
            { label: 'AVG PER DAY', value: dayStats.length > 0 ? Math.round(actionLogs.length / dayStats.length) : 0 },
          ].map(({ label, value }) => (
            <div key={label} style={{
              background: '#000',
              border: '2px solid #3d0000',
              padding: '1rem 1.5rem',
              position: 'relative',
              overflow: 'hidden',
            }}>
              <div style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '1px', background: 'linear-gradient(90deg, transparent, #cc0000, transparent)' }} />
              <div style={{ color: '#555', fontSize: '0.65rem', letterSpacing: '3px', fontFamily: 'Courier New, monospace', marginBottom: '4px' }}>{label}</div>
              <div style={{ color: '#cc0000', fontSize: '2rem', fontFamily: 'Courier New, monospace', fontWeight: 'bold', textShadow: '0 0 10px rgba(255,0,0,0.8)' }}>{value}</div>
            </div>
          ))}
        </div>

        {/* Chart */}
        <div style={{
          position: 'relative',
          background: '#000',
          border: '4px solid #3d0000',
          padding: '2rem',
          boxShadow: '0 0 60px rgba(255,0,0,0.3), inset 0 0 60px rgba(255,0,0,0.05)',
        }}>
          {/* Corner brackets */}
          {[
            { top: '1rem', left: '1rem', borderTop: '2px solid #cc0000', borderLeft: '2px solid #cc0000' },
            { top: '1rem', right: '1rem', borderTop: '2px solid #cc0000', borderRight: '2px solid #cc0000' },
            { bottom: '1rem', left: '1rem', borderBottom: '2px solid #cc0000', borderLeft: '2px solid #cc0000' },
            { bottom: '1rem', right: '1rem', borderBottom: '2px solid #cc0000', borderRight: '2px solid #cc0000' },
          ].map((s, i) => (
            <div key={i} style={{ position: 'absolute', width: '1.5rem', height: '1.5rem', boxShadow: '0 0 10px rgba(255,0,0,0.8)', ...s }} />
          ))}

          <div className="tc-scan-line" />

          <button className="tc-close-btn" onClick={onClose}>✕ CLOSE</button>

          {dayStats.length === 0 ? (
            <div style={{ textAlign: 'center', color: '#555', fontFamily: 'Courier New, monospace', padding: '4rem', letterSpacing: '4px' }}>
              NO DATA AVAILABLE
            </div>
          ) : (
            <>
              <svg width="100%" viewBox={`0 0 ${chartWidth} ${chartHeight}`} className="tc-bg-grid">
                {/* Horizontal grid lines */}
                {[0, 1, 2, 3, 4, 5].map(i => {
                  const y = padding.top + (graphHeight / 5) * i;
                  return <line key={`gh-${i}`} x1={padding.left} y1={y} x2={chartWidth - padding.right} y2={y} className="tc-grid-line" />;
                })}

                {/* Y-axis */}
                <line x1={padding.left} y1={padding.top} x2={padding.left} y2={chartHeight - padding.bottom}
                  stroke="#ff0000" strokeWidth="2" style={{ filter: 'drop-shadow(0 0 5px rgba(255,0,0,0.8))' }} />

                {/* X-axis */}
                <line x1={padding.left} y1={chartHeight - padding.bottom} x2={chartWidth - padding.right} y2={chartHeight - padding.bottom}
                  stroke="#ff0000" strokeWidth="2" style={{ filter: 'drop-shadow(0 0 5px rgba(255,0,0,0.8))' }} />

                {/* Y-axis labels */}
                {[0, 1, 2, 3, 4, 5].map(i => {
                  const value = Math.round((maxCount / 5) * (5 - i));
                  const y = padding.top + (graphHeight / 5) * i;
                  return (
                    <text key={`yl-${i}`} x={padding.left - 15} y={y + 5} textAnchor="end" className="tc-axis-label">
                      {value}
                    </text>
                  );
                })}

                {/* Y-axis title */}
                <text x={20} y={chartHeight / 2} textAnchor="middle"
                  transform={`rotate(-90, 20, ${chartHeight / 2})`} className="tc-axis-label" fontSize="14">
                  ACTION LOGS
                </text>

                {/* Data points and lines */}
                {dayStats.map((stat, index) => {
                  const x = padding.left + (graphWidth / (dayStats.length - 1 || 1)) * index;
                  const y = chartHeight - padding.bottom - (stat.count / maxCount) * graphHeight;
                  const prev = index > 0 ? dayStats[index - 1] : null;
                  const prevX = prev ? padding.left + (graphWidth / (dayStats.length - 1 || 1)) * (index - 1) : x;
                  const prevY = prev ? chartHeight - padding.bottom - (prev.count / maxCount) * graphHeight : y;
                  const color = stat.trend === 'increase' ? '#00ff00' : stat.trend === 'decrease' ? '#ff0000' : '#ffaa00';

                  return (
                    <g key={stat.date}>
                      {index > 0 && (
                        <line x1={prevX} y1={prevY} x2={x} y2={y}
                          stroke={color} strokeWidth="3"
                          style={{ filter: `drop-shadow(0 0 8px ${color})`, opacity: 0.8 }} />
                      )}
                      <circle cx={x} cy={y} r="6" fill={color} stroke="#000" strokeWidth="2"
                        className="tc-data-point"
                        style={{ filter: `drop-shadow(0 0 10px ${color})` }} />
                      {stat.trend !== 'neutral' && (
                        <text x={x} y={y - 15} textAnchor="middle" fill={color} fontSize="16"
                          className="tc-trend-indicator"
                          style={{ filter: `drop-shadow(0 0 5px ${color})` }}>
                          {stat.trend === 'increase' ? '▲' : '▼'}
                        </text>
                      )}
                      <text x={x} y={y - 28} textAnchor="middle" fill="#ff0000" fontSize="12"
                        fontFamily="Courier New, monospace" fontWeight="700"
                        style={{ filter: 'drop-shadow(0 0 4px rgba(255,0,0,0.8))' }}>
                        {stat.count}
                      </text>
                      <text x={x} y={chartHeight - padding.bottom + 20} textAnchor="middle"
                        className="tc-axis-label" fontSize="10">
                        {new Date(stat.date + 'T12:00:00').toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                      </text>
                    </g>
                  );
                })}

                {/* X-axis title */}
                <text x={chartWidth / 2} y={chartHeight - 10} textAnchor="middle" className="tc-axis-label" fontSize="14">
                  DATE
                </text>
              </svg>

              {/* Legend */}
              <div style={{ display: 'flex', justifyContent: 'center', gap: '2rem', marginTop: '1rem' }}>
                {[
                  { color: '#00ff00', label: 'INCREASE' },
                  { color: '#ffaa00', label: 'NEUTRAL' },
                  { color: '#ff0000', label: 'DECREASE' },
                ].map(({ color, label }) => (
                  <div key={label} style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <div style={{ width: '12px', height: '12px', borderRadius: '50%', background: color, boxShadow: `0 0 8px ${color}` }} />
                    <span style={{ color: '#666', fontSize: '0.7rem', letterSpacing: '2px', fontFamily: 'Courier New, monospace' }}>{label}</span>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default TerminatorStatsChart;
