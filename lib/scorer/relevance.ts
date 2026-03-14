import { CategoryScore } from '../types';

// ① 응답 적합성 (weight 22)
// 타깃 키워드 커버리지, 콘텐츠 길이, 단락 수, 헤딩 구조 점검
export function scoreRelevance(content: string, keyword?: string): CategoryScore {
  const suggestions = [];
  let score = 0;

  const text = content.replace(/#{1,6}\s/g, '').replace(/\[.*?\]\(.*?\)/g, '');
  const wordCount = text.split(/\s+/).filter(Boolean).length;
  const charCount = text.length;
  const paragraphs = content.split(/\n\n+/).filter(p => p.trim().length > 30);
  const headings = (content.match(/^#{1,3}\s.+/gm) || []);

  // 콘텐츠 길이 (0~0.3)
  let lengthScore = 0;
  if (charCount >= 2000) lengthScore = 0.3;
  else if (charCount >= 1000) lengthScore = 0.2;
  else if (charCount >= 500) lengthScore = 0.1;
  else suggestions.push({ text: '본문이 500자 미만입니다. AI 검색 결과에 인용되려면 최소 1,000자 이상의 심층 콘텐츠를 작성하세요.', priority: 'high' as const });

  // 단락 구성 (0~0.2)
  let paragraphScore = 0;
  if (paragraphs.length >= 5) paragraphScore = 0.2;
  else if (paragraphs.length >= 3) paragraphScore = 0.1;
  else suggestions.push({ text: '단락이 부족합니다. 주제별로 단락을 나눠 논리적 흐름을 명확히 하세요.', priority: 'medium' as const });

  // 헤딩 구조 (0~0.2)
  let headingScore = 0;
  if (headings.length >= 3) headingScore = 0.2;
  else if (headings.length >= 1) headingScore = 0.1;
  else suggestions.push({ text: 'H2/H3 소제목이 없습니다. 주제를 소제목으로 구분하면 AI가 콘텐츠를 구조적으로 파악하기 쉬워집니다.', priority: 'high' as const });

  // 키워드 커버리지 (0~0.3)
  let keywordScore = 0.15; // keyword 없으면 기본값
  if (keyword && keyword.trim()) {
    const kw = keyword.trim().toLowerCase();
    const contentLower = content.toLowerCase();
    const kwInTitle = headings.some(h => h.toLowerCase().includes(kw));
    const kwCount = (contentLower.match(new RegExp(kw.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g')) || []).length;
    const density = kwCount / (wordCount || 1);

    if (kwInTitle && kwCount >= 3 && density < 0.05) keywordScore = 0.3;
    else if (kwCount >= 2) keywordScore = 0.2;
    else if (kwCount >= 1) keywordScore = 0.1;
    else {
      keywordScore = 0;
      suggestions.push({ text: `타깃 키워드 "${keyword}"가 본문에 없습니다. 제목과 핵심 단락에 자연스럽게 포함하세요.`, priority: 'high' as const });
    }
    if (density >= 0.05) suggestions.push({ text: `키워드 "${keyword}"가 과도하게 반복됩니다(밀도 ${(density * 100).toFixed(1)}%). 3~4% 이하로 줄이세요.`, priority: 'medium' as const });
  }

  score = lengthScore + paragraphScore + headingScore + keywordScore;
  score = Math.min(1, score);

  return {
    id: 'relevance',
    label: '응답 적합성',
    score,
    weight: 22,
    earned: Math.round(score * 22 * 10) / 10,
    suggestions,
  };
}
