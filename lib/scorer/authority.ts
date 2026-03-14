import { CategoryScore } from '../types';

// ③ 전문가 권위 / E-E-A-T (weight 12)
// 저자 자격, 소속, 외부 인용, 편집 정책
export function scoreAuthority(content: string): CategoryScore {
  const suggestions = [];
  let score = 0;

  // 저자 실명/프로필 (0~0.3)
  let authorScore = 0;
  const hasRealName = /작성자\s*[:：]\s*\S+|저자\s*[:：]\s*\S+|글쓴이\s*[:：]\s*\S+|author\s*[:：]\s*\S+/i.test(content);
  const hasBio = /약력|소개|프로필|경력|bio|profile|years? of experience|\d+년\s*경력/i.test(content);
  if (hasRealName) authorScore += 0.15;
  if (hasBio) authorScore += 0.15;
  if (!hasRealName) suggestions.push({ text: '저자 실명이 명시되어 있지 않습니다. "작성자: 홍길동" 형식으로 저자를 밝히면 E-E-A-T 점수가 높아집니다.', priority: 'high' as const });

  // 자격/전문성 표현 (0~0.25)
  let credentialScore = 0;
  const hasCredential = /박사|석사|교수|전문가|컨설턴트|CTO|CEO|PhD|MA\b|MBA|certified|자격증|면허/i.test(content);
  const hasExperience = /\d+년[간]?\s*(이상\s*)?(경력|경험|근무|연구|운영)|경험\s*\d+년/i.test(content);
  if (hasCredential) credentialScore += 0.15;
  if (hasExperience) credentialScore += 0.1;
  if (!hasCredential && !hasExperience) suggestions.push({ text: '전문성을 나타내는 표현이 없습니다. 관련 경력, 자격, 연구 경험을 구체적으로 언급하세요.', priority: 'medium' as const });

  // 소속/조직 (0~0.15)
  let orgScore = 0;
  const hasOrg = /소속\s*[:：]\s*\S+|\(주\)|\(주식회사\)|대학교|연구소|institute|university|corporation|inc\.|ltd\./i.test(content);
  if (hasOrg) orgScore = 0.15;

  // 외부 인용/참고 (0~0.3)
  let citationScore = 0;
  const externalRefs = (content.match(/https?:\/\/[^\s)"\]]+/g) || []).length;
  const hasRefSection = /참고문헌|reference|출처|bibliography|주석/i.test(content);
  if (externalRefs >= 3 && hasRefSection) citationScore = 0.3;
  else if (externalRefs >= 2) citationScore = 0.2;
  else if (externalRefs >= 1) citationScore = 0.1;
  else suggestions.push({ text: '외부 참고 자료가 없습니다. 공신력 있는 연구나 공식 자료를 인용하면 권위가 높아집니다.', priority: 'medium' as const });

  score = authorScore + credentialScore + orgScore + citationScore;
  score = Math.min(1, score);

  return {
    id: 'authority',
    label: '전문가 권위',
    score,
    weight: 12,
    earned: Math.round(score * 12 * 10) / 10,
    suggestions,
  };
}
