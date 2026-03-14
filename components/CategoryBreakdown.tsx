'use client';

import { CategoryScore } from '@/lib/types';

const ICONS: Record<string, string> = {
  relevance: '🎯',
  trustworthiness: '🔒',
  authority: '🏅',
  citability: '📎',
  evidence: '📊',
  structure: '🏗️',
  freshness: '📅',
};

interface Props {
  categories: CategoryScore[];
  onSelect: (id: string) => void;
  selectedId: string | null;
}

export default function CategoryBreakdown({ categories, onSelect, selectedId }: Props) {
  return (
    <div className="flex flex-col gap-2">
      {categories.map(cat => {
        const pct = Math.round((cat.earned / cat.weight) * 100);
        const isSelected = selectedId === cat.id;
        const barColor =
          pct >= 80 ? '#22C55E' : pct >= 55 ? '#6366F1' : pct >= 35 ? '#EAB308' : '#EF4444';

        return (
          <button
            key={cat.id}
            onClick={() => onSelect(cat.id)}
            className={`w-full text-left rounded-xl px-4 py-3 transition-all duration-150 border ${
              isSelected
                ? 'border-indigo-500/50 bg-indigo-500/10'
                : 'border-white/5 bg-white/3 hover:bg-white/6 hover:border-white/10'
            }`}
          >
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-zinc-300 flex items-center gap-2">
                <span>{ICONS[cat.id]}</span>
                {cat.label}
              </span>
              <span className="text-sm font-semibold font-mono" style={{ color: barColor }}>
                {cat.earned.toFixed(1)} <span className="text-zinc-600 font-normal">/ {cat.weight}</span>
              </span>
            </div>
            <div className="h-1.5 rounded-full bg-white/5 overflow-hidden">
              <div
                className="h-full rounded-full transition-all duration-700 ease-out"
                style={{ width: `${pct}%`, backgroundColor: barColor, boxShadow: `0 0 6px ${barColor}66` }}
              />
            </div>
          </button>
        );
      })}
    </div>
  );
}
