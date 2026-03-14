import { CategoryScore } from '../types';

// ⑦ 최신성 (weight 10)
// 최근 연도 언급, 게시/수정일, 시간 표현
export function scoreFreshness(content: string): CategoryScore {
  const suggestions = [];
  let score = 0;
  const currentYear = new Date().getFullYear();
  const recentYears = [currentYear, currentYear - 1]; // 2025, 2024

  // 최근 연도 언급 (0~0.35)
  let yearScore = 0;
  const recentYearMentions = recentYears.filter(y =>
    new RegExp(`\\b${y}\\b`).test(content)
  ).length;
  if (recentYearMentions >= 2) yearScore = 0.35;
  else if (recentYearMentions === 1) yearScore = 0.2;
  else {
    yearScore = 0;
    suggestions.push({ text: `최근 연도(${currentYear}년 또는 ${currentYear - 1}년) 언급이 없습니다. 콘텐츠의 최신성을 명시하면 AI 검색 우선순위가 높아집니다.`, priority: 'high' as const });
  }

  // 게시/수정일 표기 (0~0.3)
  let dateScore = 0;
  const hasPublishedDate = /게시일|작성일|발행일|published|posted|created\s*[:：]\s*\d{4}/i.test(content);
  const hasUpdatedDate = /수정일|업데이트|최종\s*수정|updated\s*[:：]\s*\d{4}|last\s*modified/i.test(content);
  if (hasPublishedDate && hasUpdatedDate) dateScore = 0.3;
  else if (hasPublishedDate || hasUpdatedDate) dateScore = 0.18;
  else suggestions.push({ text: '게시일과 최종 수정일이 없습니다. 콘텐츠 상단에 날짜를 명시하면 AI 검색 엔진이 최신성을 판단할 수 있습니다.', priority: 'high' as const });

  // 시간 표현의 검증 가능성 (0~0.2)
  // "현재", "최신" 등 모호한 표현보다 구체적 날짜가 더 좋음
  const vagueTimewords = (content.match(/현재|지금|요즘|최근|올해|이번\s*년도|최신|nowadays|currently|recently|this year/g) || []).length;
  const specificDates = (content.match(/\d{4}[-./년]\s*\d{1,2}[-./월]\s*\d{1,2}/g) || []).length;
  let freshnessExprScore = 0;
  if (specificDates >= 2) freshnessExprScore = 0.2;
  else if (specificDates >= 1) freshnessExprScore = 0.12;
  else if (vagueTimewords >= 1) {
    freshnessExprScore = 0.06;
    suggestions.push({ text: '"현재", "최근" 같은 모호한 시간 표현보다 "2025년 3월 기준"처럼 구체적인 날짜를 쓰면 AI가 최신성을 정확히 판단할 수 있습니다.', priority: 'low' as const });
  }

  // 최근 출처 비율 (0~0.15)
  let recentSourceScore = 0;
  const allLinks = content.match(/https?:\/\/[^\s)"\]]+/g) || [];
  // URL에 최근 연도가 포함된 링크 추정 (블로그/뉴스 URL 패턴)
  const recentLinks = allLinks.filter(l =>
    recentYears.some(y => l.includes(String(y)))
  );
  if (allLinks.length === 0) recentSourceScore = 0.08;
  else if (recentLinks.length / allLinks.length >= 0.5) recentSourceScore = 0.15;
  else if (recentLinks.length >= 1) recentSourceScore = 0.08;

  score = yearScore + dateScore + freshnessExprScore + recentSourceScore;
  score = Math.min(1, score);

  return {
    id: 'freshness',
    label: '최신성',
    score,
    weight: 10,
    earned: Math.round(score * 10 * 10) / 10,
    suggestions,
  };
}
