import { CategoryScore } from '../types';

// ④ 인용도·검증 가능성 (weight 14)
// 주장 문장 대비 링크 비율, 참고문헌 섹션, URL 유효성 패턴
export function scoreCitability(content: string): CategoryScore {
  const suggestions = [];
  let score = 0;

  const sentences = content.split(/[.!?。]\s+/).filter(s => s.trim().length > 20);
  const claimSentences = sentences.filter(s =>
    /\d+%|연구|조사|보고서|발표|증명|확인|밝혀|나타나|분석|결과|에 따르면|according to|study|research|report|shows?|found|reveals?/i.test(s)
  );

  const links = content.match(/https?:\/\/[^\s)"\]]+/g) || [];
  const externalLinks = links.filter(l => !l.includes('localhost'));

  // 주장 대비 인용 비율 (0~0.4)
  let coverageScore = 0;
  if (claimSentences.length === 0) {
    coverageScore = 0.2; // 주장 문장이 없으면 neutral
  } else {
    const ratio = externalLinks.length / claimSentences.length;
    if (ratio >= 0.7) coverageScore = 0.4;
    else if (ratio >= 0.4) coverageScore = 0.25;
    else if (ratio >= 0.2) coverageScore = 0.15;
    else {
      coverageScore = 0;
      suggestions.push({ text: `주장/근거 문장 ${claimSentences.length}개 중 출처 링크가 ${externalLinks.length}개뿐입니다. 주요 주장마다 신뢰할 수 있는 출처 링크를 추가하세요.`, priority: 'high' as const });
    }
  }

  // 참고문헌/출처 섹션 존재 (0~0.25)
  let refSectionScore = 0;
  if (/^#{1,3}\s*(참고문헌|참고\s*자료|출처|reference|bibliography|sources)/im.test(content)) {
    refSectionScore = 0.25;
  } else {
    suggestions.push({ text: '본문 하단에 "참고문헌" 또는 "출처" 섹션을 추가하면 AI 검색 엔진이 인용 근거를 더 명확히 파악합니다.', priority: 'medium' as const });
  }

  // 링크 형식 품질 (0~0.2) — 마크다운 링크 vs 나이키드 URL
  let linkQualityScore = 0;
  const markdownLinks = (content.match(/\[.+?\]\(https?:\/\/.+?\)/g) || []).length;
  const nakedLinks = (content.match(/(?<!\()(https?:\/\/[^\s)"\]]+)(?!\))/g) || []).length;
  if (markdownLinks > 0 && markdownLinks >= nakedLinks) linkQualityScore = 0.2;
  else if (markdownLinks > 0) linkQualityScore = 0.1;
  else if (nakedLinks > 0) {
    linkQualityScore = 0.05;
    suggestions.push({ text: 'URL을 마크다운 링크 형식([텍스트](URL))으로 작성하면 AI가 링크 맥락을 더 잘 이해합니다.', priority: 'low' as const });
  }

  // 링크 다양성 (0~0.15) — 같은 도메인만 있으면 감점
  let diversityScore = 0;
  if (externalLinks.length >= 2) {
    const domains = externalLinks.map(l => {
      try { return new URL(l).hostname; } catch { return l; }
    });
    const uniqueDomains = new Set(domains).size;
    if (uniqueDomains >= 3) diversityScore = 0.15;
    else if (uniqueDomains >= 2) diversityScore = 0.1;
    else {
      diversityScore = 0.05;
      suggestions.push({ text: '모든 링크가 같은 도메인을 가리킵니다. 다양한 독립 출처를 인용하면 검증 가능성이 높아집니다.', priority: 'low' as const });
    }
  }

  score = coverageScore + refSectionScore + linkQualityScore + diversityScore;
  score = Math.min(1, score);

  return {
    id: 'citability',
    label: '인용도·검증 가능성',
    score,
    weight: 14,
    earned: Math.round(score * 14 * 10) / 10,
    suggestions,
  };
}
