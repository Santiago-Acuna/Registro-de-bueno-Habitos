import { useState, useMemo } from 'react';
import styles from './glassmorphism-chart.module.css';

interface ActionLog {
  id: string;
  startTime: string;
  endTime: string | null;
  durationSeconds: number | null;
  actionDate: string;
  actionTypeId: string;
  createdAt: string;
  updatedAt: string;
}

interface GlassmorphismChartProps {
  actionLogs?: ActionLog[];
  actionTypeName?: string;
  onClose?: () => void;
}

const MOCK_LOGS: ActionLog[] = [
  { id: '1', createdAt: '2024-01-15T10:30:00Z', durationSeconds: 1800, startTime: '2024-01-15T10:30:00Z', endTime: '2024-01-15T11:00:00Z', actionDate: '2024-01-15', actionTypeId: '1', updatedAt: '2024-01-15T11:00:00Z' },
  { id: '2', createdAt: '2024-01-16T14:20:00Z', durationSeconds: 2700, startTime: '2024-01-16T14:20:00Z', endTime: '2024-01-16T15:05:00Z', actionDate: '2024-01-16', actionTypeId: '1', updatedAt: '2024-01-16T15:05:00Z' },
  { id: '3', createdAt: '2024-01-17T09:15:00Z', durationSeconds: 1200, startTime: '2024-01-17T09:15:00Z', endTime: '2024-01-17T09:35:00Z', actionDate: '2024-01-17', actionTypeId: '1', updatedAt: '2024-01-17T09:35:00Z' },
  { id: '4', createdAt: '2024-01-18T16:45:00Z', durationSeconds: 3600, startTime: '2024-01-18T16:45:00Z', endTime: '2024-01-18T17:45:00Z', actionDate: '2024-01-18', actionTypeId: '1', updatedAt: '2024-01-18T17:45:00Z' },
  { id: '5', createdAt: '2024-01-19T11:00:00Z', durationSeconds: 2100, startTime: '2024-01-19T11:00:00Z', endTime: '2024-01-19T11:35:00Z', actionDate: '2024-01-19', actionTypeId: '1', updatedAt: '2024-01-19T11:35:00Z' },
  { id: '6', createdAt: '2024-01-20T13:30:00Z', durationSeconds: 4200, startTime: '2024-01-20T13:30:00Z', endTime: '2024-01-20T14:40:00Z', actionDate: '2024-01-20', actionTypeId: '1', updatedAt: '2024-01-20T14:40:00Z' },
  { id: '7', createdAt: '2024-01-21T10:00:00Z', durationSeconds: 1500, startTime: '2024-01-21T10:00:00Z', endTime: '2024-01-21T10:25:00Z', actionDate: '2024-01-21', actionTypeId: '1', updatedAt: '2024-01-21T10:25:00Z' },
];

const CHART_WIDTH = 700;
const CHART_HEIGHT = 400;
const PADDING = { top: 40, right: 40, bottom: 60, left: 60 };
const INNER_WIDTH = CHART_WIDTH - PADDING.left - PADDING.right;
const INNER_HEIGHT = CHART_HEIGHT - PADDING.top - PADDING.bottom;

const GlassmorphismChart: React.FC<GlassmorphismChartProps> = ({
  actionLogs = [],
  actionTypeName = 'Action Statistics',
  onClose,
}) => {
  const [hoveredPoint, setHoveredPoint] = useState<number | null>(null);

  const displayLogs = actionLogs.length > 0 ? actionLogs : MOCK_LOGS;

  const chartData = useMemo(() => {
    const logsWithMinutes = displayLogs
      .filter((log) => log.durationSeconds !== null)
      .map((log) => ({
        ...log,
        minutes: Math.round((log.durationSeconds ?? 0) / 60),
        date: new Date(log.createdAt),
        dateLabel: new Date(log.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
      }))
      .sort((a, b) => a.date.getTime() - b.date.getTime());

    const maxMinutes = Math.max(...logsWithMinutes.map((l) => l.minutes), 60);

    return { logsWithMinutes, maxMinutes };
  }, [displayLogs]);

  const { logsWithMinutes, maxMinutes } = chartData;

  const getX = (index: number) => (index / Math.max(logsWithMinutes.length - 1, 1)) * INNER_WIDTH;
  const getY = (minutes: number) => INNER_HEIGHT - (minutes / maxMinutes) * INNER_HEIGHT;

  const linePath = logsWithMinutes
    .map((log, i) => `${i === 0 ? 'M' : 'L'} ${getX(i)} ${getY(log.minutes)}`)
    .join(' ');

  const areaPath =
    logsWithMinutes.length > 0
      ? `M 0 ${INNER_HEIGHT} ${logsWithMinutes.map((log, i) => `L ${getX(i)} ${getY(log.minutes)}`).join(' ')} L ${INNER_WIDTH} ${INNER_HEIGHT} Z`
      : '';

  const avgMinutes =
    logsWithMinutes.length > 0
      ? Math.round(logsWithMinutes.reduce((acc, l) => acc + l.minutes, 0) / logsWithMinutes.length)
      : 0;

  return (
    <div className={styles.overlay} onClick={onClose}>
      <div className={`${styles.orb} ${styles.orbPurple}`} />
      <div className={`${styles.orb} ${styles.orbBlue}`} />
      <div className={`${styles.orb} ${styles.orbPink}`} />

      <div className={styles.card} onClick={(e) => e.stopPropagation()}>
        {onClose && (
          <button className={styles.closeBtn} onClick={onClose}>
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
              <line x1="1" y1="1" x2="13" y2="13" stroke="white" strokeWidth="2.5" strokeLinecap="round" />
              <line x1="13" y1="1" x2="1" y2="13" stroke="white" strokeWidth="2.5" strokeLinecap="round" />
            </svg>
          </button>
        )}

        <div className={styles.header}>
          <div className={styles.badge}>ANALYTICS</div>
          <h1 className={styles.title}>{actionTypeName}</h1>
          <div className={styles.divider} />
          <p className={styles.subtitle}>Duration Over Time</p>
        </div>

        <div className={styles.statsGrid}>
          <div className={styles.statCard}>
            <div className={styles.statLabel}>Total Sessions</div>
            <div className={styles.statValue}>{logsWithMinutes.length}</div>
          </div>
          <div className={styles.statCard}>
            <div className={styles.statLabel}>Avg Duration</div>
            <div className={styles.statValue}>{avgMinutes}m</div>
          </div>
          <div className={styles.statCard}>
            <div className={styles.statLabel}>Peak Duration</div>
            <div className={styles.statValue}>{maxMinutes}m</div>
          </div>
        </div>

        <div className={styles.chartContainer}>
          <svg width={CHART_WIDTH} height={CHART_HEIGHT} className={styles.svg}>
            <defs>
              <linearGradient id="areaGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stopColor="rgba(138, 43, 226, 0.6)" />
                <stop offset="50%" stopColor="rgba(0, 191, 255, 0.4)" />
                <stop offset="100%" stopColor="rgba(255, 0, 128, 0.1)" />
              </linearGradient>
              <linearGradient id="lineGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="#8a2be2" />
                <stop offset="50%" stopColor="#00bfff" />
                <stop offset="100%" stopColor="#ff0080" />
              </linearGradient>
              <filter id="glow">
                <feGaussianBlur stdDeviation="4" result="coloredBlur" />
                <feMerge>
                  <feMergeNode in="coloredBlur" />
                  <feMergeNode in="SourceGraphic" />
                </feMerge>
              </filter>
            </defs>

            <g transform={`translate(${PADDING.left}, ${PADDING.top})`}>
              {[0, 0.25, 0.5, 0.75, 1].map((ratio, i) => {
                const y = INNER_HEIGHT - ratio * INNER_HEIGHT;
                return (
                  <g key={`grid-y-${i}`}>
                    <line
                      className={styles.gridLineY}
                      x1={0} y1={y} x2={INNER_WIDTH} y2={y}
                      stroke="rgba(138, 43, 226, 0.15)"
                      strokeWidth="1"
                      strokeDasharray="4 4"
                    />
                    <text
                      x={-10} y={y + 4}
                      fill="rgba(255, 255, 255, 0.6)"
                      fontSize="11"
                      textAnchor="end"
                      fontFamily="'Courier New', monospace"
                    >
                      {Math.round(ratio * maxMinutes)}m
                    </text>
                  </g>
                );
              })}

              {logsWithMinutes.map((log, i) => {
                if (i % Math.ceil(logsWithMinutes.length / 6) !== 0) return null;
                const x = getX(i);
                return (
                  <line
                    key={`grid-x-${i}`}
                    className={styles.gridLineX}
                    x1={x} y1={0} x2={x} y2={INNER_HEIGHT}
                    stroke="rgba(0, 191, 255, 0.15)"
                    strokeWidth="1"
                    strokeDasharray="4 4"
                  />
                );
              })}

              {areaPath && (
                <path d={areaPath} fill="url(#areaGradient)" opacity="0.3" />
              )}

              {linePath && (
                <path
                  d={linePath}
                  fill="none"
                  stroke="url(#lineGradient)"
                  strokeWidth="3"
                  filter="url(#glow)"
                />
              )}

              {logsWithMinutes.map((log, i) => {
                const x = getX(i);
                const y = getY(log.minutes);
                const isHovered = hoveredPoint === i;

                return (
                  <g key={log.id}>
                    <circle
                      cx={x} cy={y}
                      r={isHovered ? 12 : 8}
                      fill="rgba(138, 43, 226, 0.3)"
                      style={{ transition: 'all 0.3s ease' }}
                    />
                    <circle
                      cx={x} cy={y}
                      r={isHovered ? 7 : 5}
                      fill="url(#lineGradient)"
                      stroke="white"
                      strokeWidth="2"
                      style={{
                        cursor: 'pointer',
                        transition: 'all 0.3s ease',
                        filter: 'drop-shadow(0 0 8px rgba(138, 43, 226, 0.8))',
                      }}
                      onMouseEnter={() => setHoveredPoint(i)}
                      onMouseLeave={() => setHoveredPoint(null)}
                    />

                    {isHovered && (
                      <g>
                        <rect
                          x={x - 60} y={y - 50}
                          width="120" height="40"
                          fill="rgba(0, 0, 0, 0.9)"
                          stroke="rgba(138, 43, 226, 0.8)"
                          strokeWidth="2"
                          rx="8"
                          filter="url(#glow)"
                        />
                        <text
                          x={x} y={y - 32}
                          fill="white" fontSize="11"
                          textAnchor="middle"
                          fontFamily="'Courier New', monospace"
                          fontWeight="bold"
                        >
                          {log.dateLabel}
                        </text>
                        <text
                          x={x} y={y - 18}
                          fill="#00bfff" fontSize="14"
                          textAnchor="middle"
                          fontFamily="'Courier New', monospace"
                          fontWeight="bold"
                        >
                          {log.minutes} min
                        </text>
                      </g>
                    )}
                  </g>
                );
              })}

              {logsWithMinutes.map((log, i) => {
                if (logsWithMinutes.length > 10 && i % 2 !== 0) return null;
                return (
                  <text
                    key={`label-${i}`}
                    x={getX(i)} y={INNER_HEIGHT + 20}
                    fill="rgba(255, 255, 255, 0.6)"
                    fontSize="10"
                    textAnchor="middle"
                    fontFamily="'Courier New', monospace"
                  >
                    {log.dateLabel}
                  </text>
                );
              })}

              <text
                x={INNER_WIDTH / 2} y={INNER_HEIGHT + 50}
                fill="rgba(255, 255, 255, 0.8)"
                fontSize="12"
                textAnchor="middle"
                fontFamily="'Courier New', monospace"
                fontWeight="bold"
                letterSpacing="2"
              >
                DATE
              </text>

              <text
                x={-INNER_HEIGHT / 2} y={-45}
                fill="rgba(255, 255, 255, 0.8)"
                fontSize="12"
                textAnchor="middle"
                fontFamily="'Courier New', monospace"
                fontWeight="bold"
                letterSpacing="2"
                transform={`rotate(-90, -${INNER_HEIGHT / 2}, -45)`}
              >
                DURATION (MINUTES)
              </text>
            </g>
          </svg>
        </div>

        <div className={styles.legend}>
          <div className={styles.legendItem}>
            <div className={styles.legendDot} />
            <span className={styles.legendText}>Action Duration</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default GlassmorphismChart;
