import { CategoryScore } from '../types';

// ⑥ 구조적 명확성 (weight 12)
// Answer-first, 헤딩 계층, 목록, FAQ, 중복 억제
export function scoreStructure(content: string): CategoryScore {
  const suggestions = [];
  let score = 0;

  const lines = content.split('\n');
  const first300 = content.slice(0, 300);

  // Answer-first: 초반 300자 내 핵심 답변/정의 존재 (0~0.25)
  let answerFirstScore = 0;
  const hasEarlyAnswer = /이란|이란\?|은\s*(무엇|어떤)|이\s*글에서|이\s*가이드|핵심\s*포인트|요약|TL;DR|정의|개요|In this|This guide|This article|summary/i.test(first300);
  const hasEarlyNumber = /\d/.test(first300);
  if (hasEarlyAnswer || (hasEarlyNumber && first300.length > 100)) {
    answerFirstScore = 0.25;
  } else {
    suggestions.push({ text: '서두에 핵심 답변이나 요약이 없습니다. 첫 200~300자 내에 "이 글은 X를 다룹니다" 형태의 직접적인 답변을 배치하세요(Answer-first 원칙).', priority: 'high' as const });
  }

  // 헤딩 계층 구조 (0~0.25)
  const h2 = lines.filter(l => /^##\s/.test(l));
  const h3 = lines.filter(l => /^###\s/.test(l));
  let headingScore = 0;
  if (h2.length >= 2 && h3.length >= 1) headingScore = 0.25;
  else if (h2.length >= 2) headingScore = 0.15;
  else if (h2.length >= 1) headingScore = 0.1;
  else suggestions.push({ text: 'H2 소제목이 부족합니다. 주요 섹션을 ## 소제목으로 구분하세요(최소 2~3개 권장).', priority: 'high' as const });

  // 목록 사용 (0~0.2)
  const bulletItems = lines.filter(l => /^[\-*]\s/.test(l.trim()));
  const numberedItems = lines.filter(l => /^\d+\.\s/.test(l.trim()));
  let listScore = 0;
  if (bulletItems.length >= 3 || numberedItems.length >= 3) listScore = 0.2;
  else if (bulletItems.length >= 1 || numberedItems.length >= 1) listScore = 0.1;
  else suggestions.push({ text: '글머리 기호(-) 또는 번호 목록이 없습니다. 핵심 요점이나 단계를 목록으로 정리하면 AI 추출이 쉬워집니다.', priority: 'medium' as const });

  // FAQ 패턴 (0~0.15)
  let faqScore = 0;
  const hasFaqSection = /^#{1,3}\s*(자주\s*묻는|FAQ|Q&A|질문)/im.test(content);
  const hasQuestionHeadings = (content.match(/^#{1,3}.*\?/gm) || []).length >= 2;
  if (hasFaqSection || hasQuestionHeadings) {
    faqScore = 0.15;
  } else {
    suggestions.push({ text: '"자주 묻는 질문" 섹션이나 "?" 로 끝나는 소제목을 추가하면 Featured Snippet으로 채택될 가능성이 높아집니다.', priority: 'medium' as const });
  }

  // 중복 문장 억제 (0~0.15)
  const sentences = content.split(/[.!?。]\s+/).filter(s => s.trim().length > 20);
  const seen = new Set<string>();
  let duplicates = 0;
  sentences.forEach(s => {
    const normalized = s.toLowerCase().replace(/\s+/g, ' ').trim().slice(0, 60);
    if (seen.has(normalized)) duplicates++;
    else seen.add(normalized);
  });
  const dupRatio = sentences.length > 0 ? duplicates / sentences.length : 0;
  let dupScore = 0;
  if (dupRatio < 0.05) dupScore = 0.15;
  else if (dupRatio < 0.15) dupScore = 0.08;
  else suggestions.push({ text: `유사하거나 중복된 문장이 많습니다(약 ${Math.round(dupRatio * 100)}%). 반복되는 내용을 정리해 정보 밀도를 높이세요.`, priority: 'medium' as const });

  score = answerFirstScore + headingScore + listScore + faqScore + dupScore;
  score = Math.min(1, score);

  return {
    id: 'structure',
    label: '구조적 명확성',
    score,
    weight: 12,
    earned: Math.round(score * 12 * 10) / 10,
    suggestions,
  };
}
