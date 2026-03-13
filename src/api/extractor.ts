// Article text extraction from external URLs.
// Strategy: fetch HTML, find article body via a priority selector list, detect paywalls.

import axios from 'axios';
import { parse } from 'node-html-parser';

export interface ExtractionResult {
  title?: string;
  text?: string;
  /** success = reader text available; failed = couldn't extract; restricted = paywall/login required */
  status: 'success' | 'failed' | 'restricted';
}

// Ordered from most-specific to most-generic.
const ARTICLE_SELECTORS = [
  '[itemprop="articleBody"]',       // Schema.org — NYT, Bloomberg, many publishers
  '.entry-content',                  // WordPress standard (TechCrunch, Forbes, etc.)
  '.post-content',                   // Ars Technica, common blog pattern
  '.article-content',                // generic
  '.article-body',                   // Social Media Today, generic
  '.article__body',                  // Reuters, BEM style
  '.story-body',                     // BBC, generic
  '.caas-body',                      // Yahoo / Engadget
  '.ArticleBody-articleBody',        // CNBC
  '#body',                           // The Register, The Independent
  '#article-body',                   // generic
  'article',                         // semantic HTML — Gizmodo, Engadget, Dexerto
  'main',                            // iPhoneInCanada, last-resort semantic
];

// Structural paywall signals: class/id fragments on gate elements.
// These are reliable because they appear on actual gate containers, not in nav/footer text.
const PAYWALL_CLASS_SIGNALS = [
  'paywall',
  'piano-paywall',
  'subscriber-gate',
  'metered-content',
  'regwall',
  'premium-gate',
  'tp-modal',          // Piano SDK modal
  'barricade',         // WSJ
  'sub-module',        // Bloomberg gate
];

// Text signals checked only on the EXTRACTED body text, not the full HTML.
// This avoids false positives from footer/nav "subscribe" links on free articles.
const PAYWALL_TEXT_SIGNALS = [
  'subscribe to continue reading',
  'this article is for subscribers',
  'this content is for paid subscribers',
  'already a subscriber? sign in',
  'unlock this article',
  'members-only content',
];

function detectStructuralPaywall(html: string): boolean {
  const lower = html.toLowerCase();
  // Schema.org machine-readable paywall flag — very reliable
  if (/"isAccessibleForFree"\s*:\s*"?false"?/i.test(html)) return true;
  // Class/id-based paywall containers
  if (PAYWALL_CLASS_SIGNALS.some(s => lower.includes(s))) return true;
  return false;
}

function detectTextPaywall(extractedText: string): boolean {
  const lower = extractedText.toLowerCase();
  return PAYWALL_TEXT_SIGNALS.some(s => lower.includes(s));
}

function extractText(html: string): { title?: string; text?: string } {
  const root = parse(html, { blockTextElements: { script: false, style: false } });

  // Remove noise nodes before extracting text
  for (const tag of ['script', 'style', 'noscript', 'nav', 'header', 'footer',
                      'aside', 'figure', 'figcaption', 'iframe', 'button', 'form']) {
    root.querySelectorAll(tag).forEach(n => n.remove());
  }

  // Title
  const titleEl = root.querySelector('h1') ?? root.querySelector('title');
  const title = titleEl?.text.trim() || undefined;

  // Find article body via priority selector chain
  let bodyEl = null;
  for (const selector of ARTICLE_SELECTORS) {
    const el = root.querySelector(selector);
    if (el) {
      bodyEl = el;
      break;
    }
  }

  const getText = (el: typeof bodyEl): string[] => {
    if (!el) return [];
    const paragraphs = el.querySelectorAll('p');
    return paragraphs
      .map(p => p.text.replace(/\s+/g, ' ').trim())
      .filter(t => t.length > 30);
  };

  let lines = bodyEl ? getText(bodyEl) : [];

  // Body-level fallback: if no selector matched (or matched but got too little), collect
  // all substantial paragraphs from the whole document. This catches custom CMS layouts.
  if (lines.join('').length < 300) {
    const allParas = root.querySelectorAll('p')
      .map(p => p.text.replace(/\s+/g, ' ').trim())
      .filter(t => t.length > 80); // Stricter minimum to avoid nav fragments
    if (allParas.join('').length > lines.join('').length) {
      lines = allParas;
    }
  }

  if (lines.length === 0) return { title };
  return { title, text: lines.join('\n\n') };
}

// Max HTML size we'll attempt to parse (512KB). Anything larger risks OOM on mobile.
const MAX_HTML_BYTES = 512 * 1024;

export async function extractArticle(url: string): Promise<ExtractionResult> {
  try {
    let html: string;
    try {
      const response = await axios.get<string>(url, {
        timeout: 15000,
        headers: {
          'User-Agent':
            'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 ' +
            '(KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
          'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
          'Accept-Language': 'en-US,en;q=0.5',
        },
        maxRedirects: 5,
        maxContentLength: MAX_HTML_BYTES,
      });
      html = response.data as string;
    } catch {
      return { status: 'failed' };
    }

    // Bail if the response is too large despite the limit (e.g. chunked transfer)
    if (html.length > MAX_HTML_BYTES) {
      return { status: 'failed' };
    }

    // Check structural paywall signals on raw HTML before parsing (fast path)
    if (detectStructuralPaywall(html)) {
      return { status: 'restricted' };
    }

    const { title, text } = extractText(html);

    // Require at least 300 characters of real content
    if (!text || text.length < 300) {
      return { status: 'failed' };
    }

    // Check paywall signals on the extracted text only — avoids false positives
    // from "subscribe" links in footers/nav on free-access articles
    if (detectTextPaywall(text)) {
      return { status: 'restricted' };
    }

    return { title, text, status: 'success' };
  } catch {
    // Catch-all: OOM, parse errors, anything — never crash the app
    return { status: 'failed' };
  }
}
