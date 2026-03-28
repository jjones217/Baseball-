export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');

  const { teamSlug } = req.query;

  if (!teamSlug) {
    return res.status(400).json({ error: 'teamSlug is required' });
  }

  // Allowlist check to prevent SSRF
  if (!/^[a-z0-9-]+$/.test(teamSlug)) {
    return res.status(400).json({ error: 'Invalid teamSlug' });
  }

  try {
    const rssUrl = `https://www.mlb.com/${teamSlug}/news/rss.xml`;
    const response = await fetch(rssUrl, {
      headers: { 'User-Agent': 'NavHawk-MLB/1.0' },
    });

    if (!response.ok) {
      return res.status(502).json({ error: `RSS fetch failed: ${response.status}` });
    }

    const xml = await response.text();
    const articles = parseRSS(xml).slice(0, 8);

    // Cache 5 min on CDN edge, serve stale for 10 min while revalidating
    res.setHeader('Cache-Control', 's-maxage=300, stale-while-revalidate=600');
    return res.status(200).json({ articles });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
}

function parseRSS(xml) {
  const articles = [];
  const itemRegex = /<item>([\s\S]*?)<\/item>/g;
  let match;

  while ((match = itemRegex.exec(xml)) !== null) {
    const item = match[1];

    const title = extractCDATA(item, 'title') || extractTag(item, 'title');
    const rawDesc = extractCDATA(item, 'description') || extractTag(item, 'description') || '';
    const description = stripHtml(rawDesc).trim().slice(0, 220);
    const link = extractTag(item, 'link') || '';
    const pubDate = extractTag(item, 'pubDate') || '';

    const thumbMatch =
      item.match(/media:content[^>]*url="([^"]+)"/i) ||
      item.match(/media:thumbnail[^>]*url="([^"]+)"/i) ||
      item.match(/enclosure[^>]*url="([^"]+)"/i);
    const thumbnail = thumbMatch?.[1] || null;

    if (title) {
      articles.push({
        title: title.trim(),
        description,
        link: link.trim(),
        pubDate: pubDate.trim(),
        thumbnail,
      });
    }
  }

  return articles;
}

function extractCDATA(str, tag) {
  const re = new RegExp(`<${tag}><!\\[CDATA\\[([\\s\\S]*?)\\]\\]><\\/${tag}>`);
  return str.match(re)?.[1] ?? null;
}

function extractTag(str, tag) {
  const re = new RegExp(`<${tag}[^>]*>([\\s\\S]*?)<\\/${tag}>`);
  return str.match(re)?.[1] ?? null;
}

function stripHtml(str) {
  return str
    .replace(/<[^>]+>/g, '')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/\s+/g, ' ');
}
