'use client';

import { useState } from 'react';

interface Props {
  onAnalyze: (content: string, keyword: string) => void;
  onAnalyzeUrl: (url: string, keyword: string) => void;
  isLoading: boolean;
}

const SAMPLE = `## AI 시대의 콘텐츠 마케팅이란?

2025년 현재, 검색 환경이 빠르게 변화하고 있습니다. Google AI Overviews, ChatGPT Search, Perplexity 같은 생성형 AI 검색 엔진이 사용자의 질문에 직접 답변을 제공하면서, 기존 SEO 방식만으로는 충분하지 않은 시대가 되었습니다.

## AEO(Answer Engine Optimization)란?

AEO는 AI 검색 엔진이 질문에 답변할 때 내 콘텐츠를 인용하도록 최적화하는 전략입니다. 2024년 BrightEdge 연구에 따르면 [https://brightedge.com/research](https://brightedge.com/research), Google AI Overviews는 전체 검색의 약 42%에서 등장하며, 특히 정보성 쿼리에서 가장 많이 활성화됩니다.

## AI 검색에서 인용되기 위한 3가지 핵심 요소

- **구조화된 답변**: 질문에 직접 답변하는 문장을 글 초반에 배치
- **신뢰할 수 있는 출처**: 공신력 있는 외부 링크와 통계 데이터 포함
- **E-E-A-T 신호**: 저자 전문성, 경험, 권위, 신뢰성을 명시

## 자주 묻는 질문 (FAQ)

### AEO와 SEO는 어떻게 다른가요?
SEO는 검색 결과 페이지에서 상위 노출을 목표로 하지만, AEO는 AI가 직접 인용하는 콘텐츠가 되는 것을 목표로 합니다.

### AI 검색 최적화에 얼마나 시간이 걸리나요?
일반적으로 콘텐츠 개선 후 2~6주 이내에 AI 검색 인용 변화를 확인할 수 있습니다.

## 참고문헌

- BrightEdge AI Search Report 2024: [https://brightedge.com/research](https://brightedge.com/research)
- Google Search Central - AI Overviews: [https://developers.google.com/search](https://developers.google.com/search)

작성자: 홍길동 | 게시일: 2025년 3월 | 소속: 디지털 마케팅 연구소`;

type Tab = 'text' | 'url';

export default function ContentInput({ onAnalyze, onAnalyzeUrl, isLoading }: Props) {
  const [tab, setTab] = useState<Tab>('text');
  const [content, setContent] = useState('');
  const [url, setUrl] = useState('');
  const [keyword, setKeyword] = useState('');

  const handleSubmit = () => {
    if (tab === 'text') {
      if (!content.trim()) return;
      onAnalyze(content, keyword);
    } else {
      if (!url.trim()) return;
      onAnalyzeUrl(url.trim(), keyword);
    }
  };

  const handleSample = () => {
    setContent(SAMPLE);
    setKeyword('AEO 최적화');
    setTab('text');
  };

  const charCount = content.length;
  const canSubmit = tab === 'text' ? !!content.trim() : !!url.trim();

  return (
    <div className="flex flex-col gap-4 h-full">
      {/* tabs */}
      <div className="flex gap-1 p-1 rounded-lg" style={{ backgroundColor: 'rgba(255,255,255,0.04)' }}>
        {(['text', 'url'] as Tab[]).map(t => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className="flex-1 py-2 rounded-md text-xs font-medium tracking-wide transition-all duration-150"
            style={
              tab === t
                ? { backgroundColor: '#1e1e2e', color: '#fff', boxShadow: '0 1px 4px rgba(0,0,0,0.4)' }
                : { color: '#71717a' }
            }
          >
            {t === 'text' ? '직접 입력' : 'URL 분석'}
          </button>
        ))}
      </div>

      {/* keyword */}
      <div>
        <label className="text-xs font-medium text-zinc-400 uppercase tracking-widest mb-2 block">
          타깃 키워드 <span className="text-zinc-600 normal-case">(선택)</span>
        </label>
        <input
          type="text"
          value={keyword}
          onChange={e => setKeyword(e.target.value)}
          placeholder="예: AI 검색 최적화"
          className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2.5 text-sm text-white placeholder-zinc-600 focus:outline-none focus:border-indigo-500/60 focus:ring-1 focus:ring-indigo-500/30 transition-all"
        />
      </div>

      {/* content / url input */}
      {tab === 'text' ? (
        <div className="flex-1 flex flex-col gap-2">
          <div className="flex items-center justify-between">
            <label className="text-xs font-medium text-zinc-400 uppercase tracking-widest">
              콘텐츠
            </label>
            <div className="flex items-center gap-3">
              <span className={`text-xs font-mono ${charCount >= 500 ? 'text-green-500' : 'text-zinc-600'}`}>
                {charCount.toLocaleString()}자
              </span>
              <button
                onClick={handleSample}
                className="text-xs text-indigo-400 hover:text-indigo-300 transition-colors"
              >
                샘플 불러오기
              </button>
            </div>
          </div>
          <textarea
            value={content}
            onChange={e => setContent(e.target.value)}
            placeholder="블로그 글, 아티클, 가이드 등 분석할 콘텐츠를 붙여넣으세요.&#10;마크다운 형식(#, ##, -, **, [링크](URL))을 지원합니다."
            className="flex-1 min-h-[380px] w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-zinc-200 placeholder-zinc-700 focus:outline-none focus:border-indigo-500/60 focus:ring-1 focus:ring-indigo-500/30 resize-none transition-all font-mono leading-relaxed"
          />
        </div>
      ) : (
        <div className="flex-1 flex flex-col gap-3">
          <div>
            <label className="text-xs font-medium text-zinc-400 uppercase tracking-widest mb-2 block">
              블로그 URL
            </label>
            <input
              type="url"
              value={url}
              onChange={e => setUrl(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && canSubmit && !isLoading && handleSubmit()}
              placeholder="https://your-blog.tistory.com/123"
              className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-sm text-white placeholder-zinc-600 focus:outline-none focus:border-indigo-500/60 focus:ring-1 focus:ring-indigo-500/30 transition-all"
            />
          </div>
          <div
            className="rounded-xl p-4 border text-xs text-zinc-500 leading-relaxed"
            style={{ backgroundColor: 'rgba(255,255,255,0.02)', borderColor: 'rgba(255,255,255,0.06)' }}
          >
            <p className="font-medium text-zinc-400 mb-2">✓ 잘 동작하는 사이트</p>
            <p className="mb-3">Tistory, Velog, Brunch, 워드프레스, 네이버 블로그 (공개글)</p>
            <p className="font-medium text-zinc-400 mb-2">✗ 동작하지 않을 수 있는 경우</p>
            <p>Cloudflare 봇 차단, 로그인 필요, SPA(React/Vue만으로 렌더링)</p>
            <p className="mt-3 text-zinc-600">→ 이런 경우 "직접 입력" 탭으로 내용을 붙여넣으세요.</p>
          </div>
        </div>
      )}

      {/* submit */}
      <button
        onClick={handleSubmit}
        disabled={isLoading || !canSubmit}
        className="relative w-full py-3.5 rounded-xl font-semibold text-sm tracking-wide transition-all duration-200 overflow-hidden group disabled:opacity-40 disabled:cursor-not-allowed"
        style={{
          background: 'linear-gradient(135deg, #6366F1, #8B5CF6)',
          boxShadow: '0 0 20px rgba(99,102,241,0.4)',
        }}
      >
        <span className="relative z-10 flex items-center justify-center gap-2">
          {isLoading ? (
            <>
              <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
              </svg>
              {tab === 'url' ? 'URL 가져오는 중...' : '분석 중...'}
            </>
          ) : (
            <>
              <span>{tab === 'url' ? 'URL에서 콘텐츠 분석' : 'AI 최적화 지수 분석'}</span>
              <span className="opacity-70">→</span>
            </>
          )}
        </span>
        <div className="absolute inset-0 bg-white/0 group-hover:bg-white/10 transition-all duration-200" />
      </button>
    </div>
  );
}
