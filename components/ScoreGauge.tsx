'use client';

import { useEffect, useState } from 'react';
import { ScoreResult } from '@/lib/types';

const GRADE_LABELS: Record<string, string> = {
  excellent: '우수',
  good: '양호',
  average: '보통',
  poor: '개선 필요',
};

const GRADE_COLORS: Record<string, string> = {
  excellent: '#22C55E',
  good: '#6366F1',
  average: '#EAB308',
  poor: '#EF4444',
};

interface Props {
  result: ScoreResult;
}

export default function ScoreGauge({ result }: Props) {
  const [displayScore, setDisplayScore] = useState(0);
  const [animated, setAnimated] = useState(false);

  useEffect(() => {
    setDisplayScore(0);
    setAnimated(false);
    const timeout = setTimeout(() => {
      setAnimated(true);
      let current = 0;
      const target = result.total;
      const step = Math.max(1, Math.ceil(target / 40));
      const interval = setInterval(() => {
        current = Math.min(current + step, target);
        setDisplayScore(current);
        if (current >= target) clearInterval(interval);
      }, 25);
      return () => clearInterval(interval);
    }, 100);
    return () => clearTimeout(timeout);
  }, [result.total]);

  const color = GRADE_COLORS[result.grade];
  const label = GRADE_LABELS[result.grade];

  // SVG arc gauge
  const radius = 80;
  const cx = 110;
  const cy = 110;
  const startAngle = 210; // degrees
  const endAngle = 330;   // total sweep = 300deg
  const sweepDeg = 300;

  function polarToXY(angleDeg: number, r: number) {
    const rad = ((angleDeg - 90) * Math.PI) / 180;
    return { x: cx + r * Math.cos(rad), y: cy + r * Math.sin(rad) };
  }

  function describeArc(start: number, end: number, r: number) {
    const s = polarToXY(start, r);
    const e = polarToXY(end, r);
    const largeArc = end - start > 180 ? 1 : 0;
    return `M ${s.x} ${s.y} A ${r} ${r} 0 ${largeArc} 1 ${e.x} ${e.y}`;
  }

  const filledDeg = startAngle + (animated ? (displayScore / 100) * sweepDeg : 0);

  return (
    <div className="flex flex-col items-center gap-4">
      <svg width="220" height="180" viewBox="0 0 220 180">
        {/* track */}
        <path
          d={describeArc(startAngle, startAngle + sweepDeg, radius)}
          fill="none"
          stroke="#1e1e2e"
          strokeWidth="18"
          strokeLinecap="round"
        />
        {/* filled arc */}
        <path
          d={describeArc(startAngle, Math.max(startAngle + 0.1, filledDeg), radius)}
          fill="none"
          stroke={color}
          strokeWidth="18"
          strokeLinecap="round"
          style={{ filter: `drop-shadow(0 0 8px ${color}88)`, transition: 'all 0.05s linear' }}
        />
        {/* score text */}
        <text x={cx} y={cy + 8} textAnchor="middle" fontSize="42" fontWeight="700" fill="white" fontFamily="'Noto Sans KR', sans-serif">
          {displayScore}
        </text>
        <text x={cx} y={cy + 32} textAnchor="middle" fontSize="13" fill="#888" fontFamily="'Noto Sans KR', sans-serif">
          / 100
        </text>
      </svg>

      {/* grade badge */}
      <div
        className="px-4 py-1.5 rounded-full text-sm font-semibold tracking-wide"
        style={{ backgroundColor: `${color}22`, color, border: `1px solid ${color}55` }}
      >
        {label}
      </div>

      {/* bonus / penalty detail */}
      <div className="flex gap-4 text-xs text-zinc-500 font-mono">
        <span>기본 <span className="text-white">{result.base}</span></span>
        <span className="text-green-400">+{result.bonus} 가점</span>
        <span className="text-red-400">-{result.penalty} 감점</span>
      </div>
    </div>
  );
}
