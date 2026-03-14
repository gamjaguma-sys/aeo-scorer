import { AnalysisInput, ScoreResult } from '../types';
import { scoreRelevance } from './relevance';
import { scoreTrustworthiness } from './trustworthiness';
import { scoreAuthority } from './authority';
import { scoreCitability } from './citability';
import { scoreEvidence } from './evidence';
import { scoreStructure } from './structure';
import { scoreFreshness } from './freshness';

function calcBonus(content: string): number {
  let bonus = 0;

  // +2: Answer-first (초반 200자 내 요약/정의)
  if (/이란|정의|요약|TL;DR|이\s*가이드|이\s*글에서|핵심|In this|summary/i.test(content.slice(0, 200))) bonus += 2;

  // +2: 외부 링크 70% 이상 HTTPS
  const allLinks = content.match(/https?:\/\/[^\s)"\]]+/g) || [];
  const https = allLinks.filter(l => l.startsWith('https://'));
  if (allLinks.length >= 2 && https.length / allLinks.length >= 0.7) bonus += 2;

  // +2: 수치+단위+기간 문장 3개 이상
  const numericWithDate = (content.match(/\d+([,.]?\d+)?\s*(%|배|개|명|원|달러|\$).{0,80}20[12]\d/g) || []).length;
  if (numericWithDate >= 3) bonus += 2;

  // +1: 목록 2개 이상 섹션
  const listBlocks = (content.match(/(?:^[-*]\s.+\n)+/gm) || []).length;
  if (listBlocks >= 2) bonus += 1;

  // +2: FAQ 섹션 또는 ? 소제목 2개 이상
  const hasFaq = /^#{1,3}\s*(FAQ|자주|Q&A)/im.test(content);
  const questionHeadings = (content.match(/^#{1,3}.*\?/gm) || []).length;
  if (hasFaq || questionHeadings >= 2) bonus += 2;

  // +1: H2/H3 3개 이상
  const headings = (content.match(/^#{2,3}\s/gm) || []).length;
  if (headings >= 3) bonus += 1;

  return Math.min(bonus, 10);
}

function calcPenalty(content: string): number {
  let penalty = 0;
  const charCount = content.replace(/\s/g, '').length;

  // -8: 외부 링크 전혀 없음 (주장 문장 3개 이상인 경우)
  const hasLinks = /https?:\/\//.test(content);
  const claimCount = (content.match(/연구|조사|보고서|에 따르면|study|research|report/gi) || []).length;
  if (!hasLinks && claimCount >= 3) penalty += 8;

  // -6: 키워드 스터핑 (한 단어가 전체의 10% 초과)
  const words = content.toLowerCase().split(/\s+/).filter(w => w.length > 2);
  const freq: Record<string, number> = {};
  words.forEach(w => { freq[w] = (freq[w] || 0) + 1; });
  const maxFreqWord = Object.values(freq).sort((a, b) => b - a)[0] || 0;
  if (maxFreqWord > words.length * 0.1) penalty += 6;

  // -4: 모호한 대명사 과다 (15% 초과)
  const vaguePronouns = (content.match(/\b(이것|저것|그것|이거|저거|그거|그\s|이\s|저\s)\b/g) || []).length;
  if (words.length > 0 && vaguePronouns / words.length > 0.15) penalty += 4;

  // -5: 중복 문장 20% 초과
  const sentences = content.split(/[.!?。]\s+/).filter(s => s.trim().length > 20);
  const seen = new Set<string>();
  let dups = 0;
  sentences.forEach(s => {
    const key = s.toLowerCase().trim().slice(0, 60);
    if (seen.has(key)) dups++;
    else seen.add(key);
  });
  if (sentences.length > 0 && dups / sentences.length > 0.2) penalty += 5;

  // -5: 본문 너무 짧음 (500자 미만)
  if (charCount < 500) penalty += 5;

  // -3: 저자/게시일/출처 모두 없음
  const hasAuthor = /작성자|저자|author|by\s+\w+/i.test(content);
  const hasDate = /\d{4}[-./년]|게시일|published/i.test(content);
  const hasSource = /https?:\/\//.test(content);
  if (!hasAuthor && !hasDate && !hasSource) penalty += 3;

  return Math.min(penalty, 30);
}

export function analyzeContent(input: AnalysisInput): ScoreResult {
  const { content, keyword } = input;

  const categories = [
    scoreRelevance(content, keyword),
    scoreTrustworthiness(content),
    scoreAuthority(content),
    scoreCitability(content),
    scoreEvidence(content),
    scoreStructure(content),
    scoreFreshness(content),
  ];

  const base = categories.reduce((sum, c) => sum + c.earned, 0);
  const bonus = calcBonus(content);
  const penalty = calcPenalty(content);
  const total = Math.round(Math.min(100, Math.max(0, base + bonus - penalty)));

  const grade =
    total >= 80 ? 'excellent' :
    total >= 60 ? 'good' :
    total >= 40 ? 'average' : 'poor';

  return { total, base: Math.round(base), bonus, penalty, grade, categories };
}
