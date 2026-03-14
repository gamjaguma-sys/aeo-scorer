import { NextRequest, NextResponse } from 'next/server';
import * as cheerio from 'cheerio';

export async function POST(req: NextRequest) {
  const { url } = await req.json();

  if (!url || typeof url !== 'string') {
    return NextResponse.json({ error: 'URL이 필요합니다.' }, { status: 400 });
  }

  let parsedUrl: URL;
  try {
    parsedUrl = new URL(url);
  } catch {
    return NextResponse.json({ error: '유효하지 않은 URL입니다.' }, { status: 400 });
  }

  if (!['http:', 'https:'].includes(parsedUrl.protocol)) {
    return NextResponse.json({ error: 'http 또는 https URL만 지원합니다.' }, { status: 400 });
  }

  let html: string;
  try {
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (compatible; AEOScorer/1.0)',
        'Accept': 'text/html,application/xhtml+xml',
        'Accept-Language': 'ko-KR,ko;q=0.9,en;q=0.8',
      },
      signal: AbortSignal.timeout(10000),
    });

    if (!response.ok) {
      return NextResponse.json(
        { error: `페이지를 가져올 수 없습니다. (HTTP ${response.status})` },
        { status: 422 }
      );
    }

    html = await response.text();
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : '알 수 없는 오류';
    if (msg.includes('timeout') || msg.includes('TimeoutError')) {
      return NextResponse.json({ error: '요청 시간이 초과되었습니다. (10초)' }, { status: 422 });
    }
    return NextResponse.json({ error: `네트워크 오류: ${msg}` }, { status: 422 });
  }

  const $ = cheerio.load(html);

  // 불필요한 태그 제거
  $('script, style, noscript, nav, footer, header, aside, iframe, [role="navigation"], [role="banner"], [role="complementary"]').remove();
  $('[class*="comment"], [class*="sidebar"], [class*="menu"], [class*="ad-"], [id*="sidebar"], [id*="menu"]').remove();

  // 본문 추출 우선순위: article > main > #content > body
  let mainEl = $('article').first();
  if (!mainEl.length) mainEl = $('main').first();
  if (!mainEl.length) mainEl = $('#content, .content, .post-content, .entry-content, .article-body').first();

  const rawText = mainEl.length ? mainEl.text() : $('body').text();

  // 제목 추출 (마크다운 형식으로 변환)
  const title = $('h1').first().text().trim();

  // 간단한 마크다운 변환 (제목 구조 보존)
  let markdown = '';
  if (title) markdown += `# ${title}\n\n`;

  mainEl.length
    ? mainEl.find('h2, h3, p, li, a').each((_, el) => {
        const tag = el.type === 'tag' ? el.name : '';
        const text = $(el).text().trim();
        if (!text) return;
        if (tag === 'h2') markdown += `\n## ${text}\n\n`;
        else if (tag === 'h3') markdown += `\n### ${text}\n\n`;
        else if (tag === 'p') markdown += `${text}\n\n`;
        else if (tag === 'li') markdown += `- ${text}\n`;
        else if (tag === 'a') {
          const href = $(el).attr('href') || '';
          if (href.startsWith('http')) markdown += `[${text}](${href}) `;
        }
      })
    : void (markdown += rawText);

  const content = markdown.trim() || rawText.trim();

  if (content.length < 100) {
    return NextResponse.json(
      { error: '콘텐츠를 추출할 수 없습니다. 일부 사이트는 봇 접근을 차단합니다.' },
      { status: 422 }
    );
  }

  return NextResponse.json({ content, title });
}
