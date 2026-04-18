"use client";

import { useMemo } from "react";

interface PricePoint { day: number; price: number; }

interface SpotPriceChartProps {
  data: PricePoint[];
  currentDay: number;
}

const W = 340, H = 170;
const PAD = { l: 46, r: 12, t: 18, b: 26 };
const MAX_DAY = 28;
const chartW = W - PAD.l - PAD.r;
const chartH = H - PAD.t - PAD.b;

function toX(day: number) { return PAD.l + (day / MAX_DAY) * chartW; }
function toY(price: number, maxP: number) {
  return PAD.t + chartH - (price / (maxP * 1.2)) * chartH;
}

export default function SpotPriceChart({ data, currentDay }: SpotPriceChartProps) {
  const { pathD, areaD, yTicks, xTicks, maxP, last } = useMemo(() => {
    const maxP = data.length ? Math.max(...data.map(p => p.price)) : 24;
    const safeMax = maxP === 0 ? 24 : maxP;

    const pts = data.map(p => ({ x: toX(p.day), y: toY(p.price, safeMax) }));
    const pathD = pts.length > 1
      ? pts.map((p, i) => `${i === 0 ? 'M' : 'L'}${p.x.toFixed(1)},${p.y.toFixed(1)}`).join(' ')
      : '';
    const baseY = (PAD.t + chartH).toFixed(1);
    const areaD = pts.length > 1
      ? `${pathD} L${pts[pts.length-1].x.toFixed(1)},${baseY} L${pts[0].x.toFixed(1)},${baseY} Z`
      : '';

    const peak = safeMax;
    const step = peak / 5;
    const yTicks = [0,1,2,3,4,5,6].map(i => +(i * step).toFixed(2));

    const xTicks = [
      { day: 0, label: 'Day 0' },
      { day: 7, label: 'Wk 1' },
      { day: 14, label: 'Wk 2' },
      { day: 21, label: 'Wk 3' },
      { day: 28, label: 'Wk 4' },
    ];

    const last = data[data.length - 1] ?? null;
    return { pathD, areaD, yTicks, xTicks, maxP: safeMax, last };
  }, [data]);

  const showCalculating = currentDay <= 1 && data.length === 0;

  return (
    <svg
      viewBox={`0 0 ${W} ${H}`}
      width="100%"
      preserveAspectRatio="xMidYMid meet"
      style={{ display: 'block' }}
    >
      <defs>
        <linearGradient id="cg" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#1B5E3B" stopOpacity="0.28"/>
          <stop offset="100%" stopColor="#1B5E3B" stopOpacity="0.02"/>
        </linearGradient>
        <filter id="glow" x="-20%" y="-20%" width="140%" height="140%">
          <feGaussianBlur stdDeviation="2.2" result="blur"/>
          <feMerge><feMergeNode in="blur"/><feMergeNode in="SourceGraphic"/></feMerge>
        </filter>
        <clipPath id="chartClip">
          <rect x={PAD.l} y={PAD.t} width={chartW} height={chartH}/>
        </clipPath>
      </defs>

      {/* Grid */}
      {yTicks.map(t => (
        <line key={t}
          x1={PAD.l} y1={toY(t, maxP)}
          x2={PAD.l + chartW} y2={toY(t, maxP)}
          stroke="#C8DCC8" strokeWidth="0.6"
          strokeDasharray={t === 0 ? "none" : "4,4"}
        />
      ))}

      {/* Week vertical guides */}
      {[7,14,21].map(d => (
        <line key={d}
          x1={toX(d)} y1={PAD.t}
          x2={toX(d)} y2={PAD.t+chartH}
          stroke="#C8DCC8" strokeWidth="0.5" strokeDasharray="3,5"
        />
      ))}

      {/* Area */}
      {areaD && <path d={areaD} fill="url(#cg)" clipPath="url(#chartClip)"/>}

      {/* Line */}
      {pathD && (
        <path d={pathD} fill="none"
          stroke="#1B5E3B" strokeWidth="2"
          strokeLinejoin="round" strokeLinecap="round"
          filter="url(#glow)" clipPath="url(#chartClip)"
        />
      )}

      {/* Dots */}
      {data.map((p, i) => {
        const isLast = i === data.length - 1;
        return (
          <circle key={i}
            cx={toX(p.day)} cy={toY(p.price, maxP)}
            r={isLast ? 4.5 : 2}
            fill={isLast ? "#1B5E3B" : "#2D7A52"}
            stroke={isLast ? "#fff" : "none"}
            strokeWidth={isLast ? 1.5 : 0}
          />
        );
      })}

      {/* Calculating text */}
      {showCalculating && (
        <text x={PAD.l + 18} y={PAD.t + chartH/2}
          fontSize="10" fill="#5A7A65" fontFamily="'Crimson Pro', serif"
          fontStyle="italic"
        >
          Calculating…
        </text>
      )}

      {/* Current price tooltip */}
      {last && (() => {
        const cx = toX(last.day);
        const cy = toY(last.price, maxP);
        const bx = Math.min(cx - 22, PAD.l + chartW - 48);
        return (
          <g>
            <rect x={bx} y={cy - 22} width={46} height={16} rx={4} fill="#1B5E3B" opacity={0.92}/>
            <text x={bx + 23} y={cy - 10.5} textAnchor="middle"
              fontSize="8.5" fill="#E8CC82" fontFamily="'DM Mono', monospace"
            >
              {last.price.toFixed(4)}π
            </text>
          </g>
        );
      })()}

      {/* Y-axis labels */}
      {yTicks.map(t => (
        <text key={t}
          x={PAD.l - 5} y={toY(t, maxP) + 3.5}
          textAnchor="end" fontSize="8.5" fill="#5A7A65"
          fontFamily="'DM Mono', monospace"
        >
          {t === 0 ? '0' : t.toFixed(maxP < 1 ? 3 : maxP < 10 ? 2 : 1)}
        </text>
      ))}
      <text x={PAD.l - 5} y={PAD.t - 5}
        textAnchor="end" fontSize="9" fill="#5A7A65"
        fontFamily="'Crimson Pro', serif" fontStyle="italic"
      >π</text>

      {/* X-axis labels */}
      {xTicks.map(({ day, label }) => (
        <text key={day}
          x={toX(day)} y={PAD.t + chartH + 17}
          textAnchor="middle" fontSize="8.5" fill="#5A7A65"
          fontFamily="'DM Mono', monospace"
        >
          {label}
        </text>
      ))}

      {/* Axes */}
      <line x1={PAD.l} y1={PAD.t} x2={PAD.l} y2={PAD.t+chartH} stroke="#C8DCC8" strokeWidth="1"/>
      <line x1={PAD.l} y1={PAD.t+chartH} x2={PAD.l+chartW} y2={PAD.t+chartH} stroke="#C8DCC8" strokeWidth="1"/>
    </svg>
  );
}
