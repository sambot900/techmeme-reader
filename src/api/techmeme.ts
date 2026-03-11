import axios from 'axios';
import { parse } from 'node-html-parser';
import { ArticleSummary, TechmemeSection, RelatedLink } from '@/types';

// Verified against live HTML on 2026-03-10.
//
// Data sources:
//   top / newest  → https://www.techmeme.com/m  (mobile, server-rendered, no bot gate)
//   more          → https://www.techmeme.com    (desktop UA required for full layout)
//   river         → https://www.techmeme.com/river
//   events        → https://www.techmeme.com/events

const BASE = 'https://www.techmeme.com';

const MOBILE_UA =
  'Mozilla/5.0 (Linux; Android 14; Pixel 9) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Mobile Safari/537.36';
const DESKTOP_UA =
  'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36';

export const SECTION_URLS: Record<TechmemeSection, string> = {
  top:    `${BASE}/m`,
  newest: `${BASE}/m`,
  more:   BASE,
  river:  `${BASE}/river`,
  events: `${BASE}/events`,
};

async function getHTML(url: string, ua: string): Promise<string> {
  const { data } = await axios.get<string>(url, {
    headers: { 'User-Agent': ua, Accept: 'text/html,application/xhtml+xml' },
    timeout: 15000,
  });
  return data;
}

// Exported for extractor and other consumers that need arbitrary page HTML.
export async function fetchRawHTML(url: string): Promise<string> {
  return getHTML(url, MOBILE_UA);
}

// ─── Cite parsing ─────────────────────────────────────────────────────────────
// Cite text format: "Author / Source:" or "Source:" (some sources contain / in name).
// The author/source separator is always " / " (spaces required).
function sourceFromCiteText(citeText: string): string {
  const clean = citeText.replace(/:$/, '').trim();
  const idx = clean.lastIndexOf(' / ');
  return idx !== -1 ? clean.slice(idx + 3).trim() : clean;
}

// ─── Top / Newest ─────────────────────────────────────────────────────────────
// Mobile page pre-loads both sections. Main articles: <a class="item wide">.
// Related articles: <a class="indented_item wide"> — clustered under previous main item.
// Newest items additionally carry <span class="ago"> with relative time.
function parseMobileList(
  html: string,
  listId: 'top_items' | 'new_items',
): ArticleSummary[] {
  const ul = parse(html).getElementById(listId);
  if (!ul) return [];

  const results: ArticleSummary[] = [];
  let cluster: ArticleSummary | null = null;

  for (const li of ul.querySelectorAll('li')) {
    if (li.classList.contains('sp_post')) continue; // skip sponsored

    const anchor = li.querySelector('a');
    if (!anchor) continue;

    const cls = anchor.getAttribute('class') ?? '';
    if (!cls.includes('item')) continue; // not a content anchor

    const url = anchor.getAttribute('href') ?? '';
    if (!url.startsWith('http')) continue;

    const title = anchor.querySelector('.title')?.textContent?.trim() ?? '';
    const source = sourceFromCiteText(anchor.querySelector('.cite')?.textContent ?? '');
    const timestamp = anchor.querySelector('.ago')?.textContent?.trim() ?? '';

    const isMain = cls.includes('item') && !cls.includes('indented_item');

    if (isMain) {
      cluster = { id: url, title, url, source, sourceUrl: '', timestamp, relatedLinks: [] };
      results.push(cluster);
    } else if (cluster) {
      cluster.relatedLinks!.push({ title, url, source });
    }
  }

  return results;
}

// ─── More News ────────────────────────────────────────────────────────────────
// Desktop HTML: More News items are in DIV#botcol1 > DIV.itc1 blocks.
// Title link: A.ourh; cite: CITE element (may contain an A with the sourceUrl).
// Related articles: each DIV.di contains CITE + A with title.
function parseMoreNews(html: string): ArticleSummary[] {
  const botcol = parse(html).getElementById('botcol1');
  if (!botcol) return [];

  return botcol.querySelectorAll('.itc1').flatMap(itc1 => {
    const ourh = itc1.querySelector('a.ourh');
    if (!ourh) return [];

    const url = ourh.getAttribute('href') ?? '';
    if (!url.startsWith('http')) return [];

    const title = ourh.textContent?.trim() ?? '';
    const cite = itc1.querySelector('cite');
    const sourceEl = cite?.querySelector('a');
    const source = sourceEl?.textContent?.trim() ?? sourceFromCiteText(cite?.textContent ?? '');
    const sourceUrl = sourceEl?.getAttribute('href') ?? '';

    const relatedLinks: RelatedLink[] = itc1.querySelectorAll('.di').reduce<RelatedLink[]>((acc, di) => {
      const anchors = di.querySelectorAll('a');
      const articleAnchor = anchors[anchors.length - 1];
      const relCite = di.querySelector('cite');
      const relSrc = relCite?.querySelector('a');
      const relUrl = articleAnchor?.getAttribute('href') ?? '';
      if (relUrl.startsWith('http')) {
        acc.push({
          title: articleAnchor?.textContent?.trim() ?? '',
          url: relUrl,
          source: relSrc?.textContent?.trim() ?? sourceFromCiteText(relCite?.textContent ?? ''),
        });
      }
      return acc;
    }, []);

    return [{ id: url, title, url, source, sourceUrl, timestamp: '', relatedLinks }] as ArticleSummary[];
  });
}

// ─── River ────────────────────────────────────────────────────────────────────
// River page: each TR.ritem has two TDs — time in first, content in second.
// Content TD: CITE for source info, A for article link + title.
function parseRiver(html: string): ArticleSummary[] {
  return parse(html).querySelectorAll('tr.ritem').reduce<ArticleSummary[]>((acc, row) => {
    const tds = row.querySelectorAll('td');
    if (tds.length < 2) return acc;

    const timestamp = tds[0].textContent?.replace('•', '').trim() ?? '';
    const contentTd = tds[1];
    const anchor = contentTd.querySelector('a[href^="http"]');
    if (!anchor) return acc;

    const url = anchor.getAttribute('href') ?? '';
    const title = anchor.textContent?.trim() ?? '';
    const cite = contentTd.querySelector('cite');
    const sourceEl = cite?.querySelector('a');
    const source = sourceEl?.textContent?.trim() ?? sourceFromCiteText(cite?.textContent ?? '');
    const sourceUrl = sourceEl?.getAttribute('href') ?? '';

    acc.push({ id: url, title, url, source, sourceUrl, timestamp, relatedLinks: [] });
    return acc;
  }, []);
}

// ─── Events ───────────────────────────────────────────────────────────────────
// Events page: each DIV.rhov > A contains three child DIVs: date, name, location.
// Links are Techmeme redirect paths (/r2/...) — resolved to absolute URLs.
function parseEvents(html: string): ArticleSummary[] {
  return parse(html).querySelectorAll('.rhov').reduce<ArticleSummary[]>((acc, rhov) => {
    const anchor = rhov.querySelector('a');
    if (!anchor) return acc;

    const href = anchor.getAttribute('href') ?? '';
    const url = href.startsWith('http') ? href : `${BASE}${href}`;
    const divs = anchor.querySelectorAll('div');
    if (divs.length < 2) return acc;

    const timestamp = divs[0].textContent?.trim() ?? '';
    const title = divs[1].textContent?.trim() ?? '';
    const location = divs[2]?.textContent?.trim() ?? '';

    acc.push({ id: url, title, url, source: location, sourceUrl: url, timestamp, relatedLinks: [] });
    return acc;
  }, []);
}

// ─── Public API ───────────────────────────────────────────────────────────────
export async function fetchSection(section: TechmemeSection): Promise<ArticleSummary[]> {
  switch (section) {
    case 'top': {
      const html = await getHTML(`${BASE}/m`, MOBILE_UA);
      return parseMobileList(html, 'top_items');
    }
    case 'newest': {
      const html = await getHTML(`${BASE}/m`, MOBILE_UA);
      return parseMobileList(html, 'new_items');
    }
    case 'more': {
      const html = await getHTML(BASE, DESKTOP_UA);
      return parseMoreNews(html);
    }
    case 'river': {
      const html = await getHTML(`${BASE}/river`, MOBILE_UA);
      return parseRiver(html);
    }
    case 'events': {
      const html = await getHTML(`${BASE}/events`, DESKTOP_UA);
      return parseEvents(html);
    }
  }
}
