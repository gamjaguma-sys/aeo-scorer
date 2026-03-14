'use client';

import { CategoryScore } from '@/lib/types';

const PRIORITY_CONFIG = {
  high: { label: '필수', color: '#EF4444', bg: 'rgba(239,68,68,0.1)' },
  medium: { label: '권장', color: '#EAB308', bg: 'rgba(234,179,8,0.1)' },
  low: { label: '선택', color: '#6366F1', bg: 'rgba(99,102,241,0.1)' },
};

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
  selectedId: string | null;
}

export default function Suggestions({ categories, selectedId }: Props) {
  const visible = selectedId
    ? categories.filter(c => c.id === selectedId)
    : categories;

  const allSuggestions = visible.flatMap(cat =>
    cat.suggestions.map(s => ({ ...s, catLabel: cat.label, catId: cat.id }))
  );

  if (allSuggestions.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-zinc-500 gap-2">
        <span className="text-3xl">✅</span>
        <span className="text-sm">이 항목에서 개선이 필요한 사항이 없습니다.</span>
      </div>
    );
  }

  // Sort: high → medium → low
  const sorted = [...allSuggestions].sort((a, b) => {
    const order = { high: 0, medium: 1, low: 2 };
    return order[a.priority] - order[b.priority];
  });

  return (
    <div className="flex flex-col gap-3">
      {sorted.map((s, i) => {
        const cfg = PRIORITY_CONFIG[s.priority];
        return (
          <div
            key={i}
            className="rounded-xl p-4 border border-white/5"
            style={{ backgroundColor: cfg.bg }}
          >
            <div className="flex items-start gap-3">
              <div className="flex-shrink-0 flex flex-col items-center gap-1 pt-0.5">
                <span className="text-base">{ICONS[s.catId]}</span>
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <span
                    className="text-[10px] font-bold px-1.5 py-0.5 rounded"
                    style={{ color: cfg.color, backgroundColor: `${cfg.color}22` }}
                  >
                    {cfg.label}
                  </span>
                  <span className="text-xs text-zinc-500">{s.catLabel}</span>
                </div>
                <p className="text-sm text-zinc-200 leading-relaxed">{s.text}</p>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
