import { CategoryScore } from '../types';

// ⑤ 통계·증거 (weight 14)
// 숫자+단위, 연도/기간, 데이터 출처 동반 여부
export function scoreEvidence(content: string): CategoryScore {
  const suggestions = [];
  let score = 0;

  const sentences = content.split(/[.!?。]\s+/).filter(s => s.trim().length > 10);

  // 수치+단위 패턴 (0~0.35)
  const numericPattern = /\d+([,.]?\d+)?\s*(%|퍼센트|배|개|명|건|원|달러|\$|€|KB|MB|GB|TB|km|m|kg|g|시간|분|초|년|월|일|위|점|등|회|번)/g;
  const numericMatches = content.match(numericPattern) || [];
  let numericScore = 0;
  if (numericMatches.length >= 5) numericScore = 0.35;
  else if (numericMatches.length >= 3) numericScore = 0.25;
  else if (numericMatches.length >= 1) numericScore = 0.15;
  else suggestions.push({ text: '구체적인 수치가 없습니다. 통계, 비율, 측정값 등 검증 가능한 숫자를 포함하면 AI 인용 가능성이 높아집니다.', priority: 'high' as const });

  // 연도/기간 표기 (0~0.2)
  const yearPattern = /20[12]\d\s*년|20[12]\d[-/.]\d{1,2}|\b20[12]\d\b/g;
  const yearMatches = content.match(yearPattern) || [];
  let yearScore = 0;
  if (yearMatches.length >= 2) yearScore = 0.2;
  else if (yearMatches.length >= 1) yearScore = 0.1;
  else suggestions.push({ text: '데이터에 연도/기간이 없습니다. "2024년 기준", "2023년 3분기" 등 시간 맥락을 명시하세요.', priority: 'medium' as const });

  // 데이터 출처 링크 동반 (0~0.25)
  let sourcedDataScore = 0;
  const dataSentences = sentences.filter(s => numericPattern.test(s));
  numericPattern.lastIndex = 0; // reset regex
  const linkedDataSentences = dataSentences.filter(s => /https?:\/\//.test(s));
  if (dataSentences.length === 0) {
    sourcedDataScore = 0.1;
  } else {
    const ratio = linkedDataSentences.length / dataSentences.length;
    if (ratio >= 0.5) sourcedDataScore = 0.25;
    else if (ratio >= 0.2) sourcedDataScore = 0.15;
    else suggestions.push({ text: '수치를 제시할 때 출처 링크를 같이 달면 AI 검색 엔진이 해당 문장을 근거로 채택할 가능성이 높아집니다.', priority: 'medium' as const });
  }

  // 표/리스트 데이터 (0~0.2)
  let tableScore = 0;
  const hasTable = /\|.+\|.+\|/.test(content);
  const hasDataList = /^[-*]\s+.+\d.+$/m.test(content);
  if (hasTable) tableScore = 0.2;
  else if (hasDataList) tableScore = 0.1;
  else suggestions.push({ text: '표나 비교 목록 형태의 데이터를 추가하면 AI Overviews에서 직접 인용될 가능성이 높아집니다.', priority: 'low' as const });

  score = numericScore + yearScore + sourcedDataScore + tableScore;
  score = Math.min(1, score);

  return {
    id: 'evidence',
    label: '통계·증거',
    score,
    weight: 14,
    earned: Math.round(score * 14 * 10) / 10,
    suggestions,
  };
}
