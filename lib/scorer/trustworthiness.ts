import { CategoryScore } from '../types';

// ② 출처 신뢰성 (weight 16)
// 외부 링크, HTTPS 비율, 저자/연락처, 스팸 패턴
export function scoreTrustworthiness(content: string): CategoryScore {
  const suggestions = [];
  let score = 0;

  const urlPattern = /https?:\/\/[^\s)"\]]+/g;
  const allLinks = content.match(urlPattern) || [];
  const httpsLinks = allLinks.filter(l => l.startsWith('https://'));
  const externalLinks = allLinks.filter(l => !l.includes('localhost'));

  // 외부 링크 존재 (0~0.35)
  let linkScore = 0;
  if (externalLinks.length >= 3) linkScore = 0.35;
  else if (externalLinks.length >= 1) linkScore = 0.2;
  else suggestions.push({ text: '외부 출처 링크가 없습니다. 신뢰할 수 있는 외부 사이트(공식 문서, 연구 기관 등) 링크를 2개 이상 추가하세요.', priority: 'high' as const });

  // HTTPS 비율 (0~0.2)
  let httpsScore = 0;
  if (allLinks.length === 0) httpsScore = 0.1; // 링크 없을 땐 neutral
  else if (httpsLinks.length === allLinks.length) httpsScore = 0.2;
  else if (httpsLinks.length / allLinks.length >= 0.5) httpsScore = 0.1;
  else suggestions.push({ text: 'HTTP(비보안) 링크가 포함되어 있습니다. 모든 링크를 HTTPS로 교체하세요.', priority: 'medium' as const });

  // 저자/연락처 표기 (0~0.25)
  let authorScore = 0;
  const hasAuthor = /작성자|저자|글쓴이|author|by\s+\w+|written by/i.test(content);
  const hasContact = /이메일|email|@[\w.-]+\.\w+|연락처|contact/i.test(content);
  const hasDate = /\d{4}[-./년]\s*\d{1,2}[-./월]\s*\d{1,2}|작성일|게시일|published|updated/i.test(content);
  if (hasAuthor) authorScore += 0.1;
  if (hasContact || hasDate) authorScore += 0.15;
  if (!hasAuthor && !hasDate) suggestions.push({ text: '저자명이나 게시일이 없습니다. AI 검색 엔진은 E-E-A-T 신호로 작성자 정보와 날짜를 중요하게 봅니다.', priority: 'high' as const });

  // 스팸 패턴 감지 (0~0.2) — 키워드 과반복, 어색한 반복
  let spamPenalty = 0;
  const words = content.toLowerCase().split(/\s+/);
  const wordFreq: Record<string, number> = {};
  words.forEach(w => { if (w.length > 2) wordFreq[w] = (wordFreq[w] || 0) + 1; });
  const maxFreq = Math.max(...Object.values(wordFreq));
  if (maxFreq > words.length * 0.06) spamPenalty = 0.1; // 한 단어가 전체의 6% 초과
  if (maxFreq > words.length * 0.1) {
    spamPenalty = 0.2;
    suggestions.push({ text: '특정 단어가 과도하게 반복됩니다. 키워드 스터핑은 AI 검색에서 신뢰도를 낮춥니다.', priority: 'high' as const });
  }
  const antiSpamScore = Math.max(0, 0.2 - spamPenalty);

  score = linkScore + httpsScore + authorScore + antiSpamScore;
  score = Math.min(1, score);

  return {
    id: 'trustworthiness',
    label: '출처 신뢰성',
    score,
    weight: 16,
    earned: Math.round(score * 16 * 10) / 10,
    suggestions,
  };
}
