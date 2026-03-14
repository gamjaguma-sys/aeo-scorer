'use client';

import { useState } from 'react';
import { analyzeContent } from '@/lib/scorer';
import { ScoreResult } from '@/lib/types';
import ContentInput from '@/components/ContentInput';
import ScoreGauge from '@/components/ScoreGauge';
import CategoryBreakdown from '@/components/CategoryBreakdown';
import Suggestions from '@/components/Suggestions';

export default function Home() {
  const [result, setResult] = useState<ScoreResult | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedCat, setSelectedCat] = useState<string | null>(null);

  const handleAnalyze = (content: string, keyword: string) => {
    setIsLoading(true);
    setSelectedCat(null);
    setTimeout(() => {
      const r = analyzeContent({ content, keyword: keyword || undefined });
      setResult(r);
      setIsLoading(false);
    }, 300);
  };

  const handleAnalyzeUrl = async (url: string, keyword: string) => {
    setIsLoading(true);
    setSelectedCat(null);
    try {
      const res = await fetch('/api/fetch-url', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url }),
      });
      const data = await res.json();
      if (!res.ok) {
        alert(data.error || 'URL 분석 중 오류가 발생했습니다.');
        return;
      }
      const r = analyzeContent({ content: data.content, keyword: keyword || undefined });
      setResult(r);
    } catch {
      alert('네트워크 오류가 발생했습니다.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCatSelect = (id: string) => {
    setSelectedCat(prev => prev === id ? null : id);
  };

  return (
    <main className="min-h-screen">
      {/* header */}
      <header className="border-b border-white/5 px-6 py-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div
              className="w-8 h-8 rounded-lg flex items-center justify-center text-sm font-bold"
              style={{ background: 'linear-gradient(135deg, #6366F1, #8B5CF6)' }}
            >
              A
            </div>
            <span className="font-display font-bold text-white tracking-tight">AEO Score</span>
            <span className="text-xs text-zinc-600 border border-white/10 px-2 py-0.5 rounded-full">beta</span>
          </div>
          <span className="text-xs text-zinc-600">Google AI Overview 최적화 지수 분석기</span>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* title */}
        <div className="mb-8">
          <h1 className="text-3xl font-display font-bold text-white mb-2 tracking-tight">
            콘텐츠 AI 최적화 지수 분석
          </h1>
          <p className="text-zinc-500 text-sm">
            작성한 콘텐츠가 Google AI Overview에 인용될 가능성을 7가지 기준으로 진단합니다.
          </p>
        </div>

        {/* main grid */}
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_420px] gap-6 items-start">
          {/* left: input */}
          <div
            className="rounded-2xl p-6 border"
            style={{ backgroundColor: '#111118', borderColor: 'rgba(255,255,255,0.06)' }}
          >
            <ContentInput onAnalyze={handleAnalyze} onAnalyzeUrl={handleAnalyzeUrl} isLoading={isLoading} />
          </div>

          {/* right: results */}
          <div className="flex flex-col gap-4">
            {!result && !isLoading && (
              <div
                className="rounded-2xl p-8 border flex flex-col items-center justify-center gap-4 text-center"
                style={{ backgroundColor: '#111118', borderColor: 'rgba(255,255,255,0.06)', minHeight: 320 }}
              >
                <div className="text-4xl">✦</div>
                <p className="text-zinc-600 text-sm leading-relaxed">
                  콘텐츠를 입력하고<br />
                  <span className="text-zinc-400">"AI 최적화 지수 분석"</span> 버튼을 누르면<br />
                  7개 항목 점수와 개선 제안을 확인할 수 있습니다.
                </p>
              </div>
            )}

            {isLoading && (
              <div
                className="rounded-2xl p-8 border flex flex-col items-center justify-center gap-4"
                style={{ backgroundColor: '#111118', borderColor: 'rgba(255,255,255,0.06)', minHeight: 320 }}
              >
                <div className="w-10 h-10 rounded-full border-2 border-indigo-500 border-t-transparent animate-spin" />
                <p className="text-zinc-500 text-sm">분석 중...</p>
              </div>
            )}

            {result && !isLoading && (
              <>
                {/* score gauge card */}
                <div
                  className="rounded-2xl p-6 border"
                  style={{ backgroundColor: '#111118', borderColor: 'rgba(255,255,255,0.06)' }}
                >
                  <ScoreGauge result={result} />
                </div>

                {/* category breakdown card */}
                <div
                  className="rounded-2xl p-5 border"
                  style={{ backgroundColor: '#111118', borderColor: 'rgba(255,255,255,0.06)' }}
                >
                  <h2 className="text-xs font-medium text-zinc-500 uppercase tracking-widest mb-4">
                    항목별 점수
                    <span className="ml-2 text-zinc-700 normal-case font-normal">클릭하면 해당 제안을 필터링합니다</span>
                  </h2>
                  <CategoryBreakdown
                    categories={result.categories}
                    onSelect={handleCatSelect}
                    selectedId={selectedCat}
                  />
                </div>

                {/* suggestions card */}
                <div
                  className="rounded-2xl p-5 border"
                  style={{ backgroundColor: '#111118', borderColor: 'rgba(255,255,255,0.06)' }}
                >
                  <div className="flex items-center justify-between mb-4">
                    <h2 className="text-xs font-medium text-zinc-500 uppercase tracking-widest">
                      개선 제안
                    </h2>
                    {selectedCat && (
                      <button
                        onClick={() => setSelectedCat(null)}
                        className="text-xs text-indigo-400 hover:text-indigo-300"
                      >
                        전체 보기
                      </button>
                    )}
                  </div>
                  <Suggestions categories={result.categories} selectedId={selectedCat} />
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </main>
  );
}
