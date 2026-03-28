const TEAM_NAMES = {
  108: 'Los Angeles Angels',
  109: 'Arizona Diamondbacks',
  110: 'Baltimore Orioles',
  111: 'Boston Red Sox',
  112: 'Chicago Cubs',
  113: 'Cincinnati Reds',
  114: 'Cleveland Guardians',
  115: 'Colorado Rockies',
  116: 'Detroit Tigers',
  117: 'Houston Astros',
  118: 'Kansas City Royals',
  119: 'Los Angeles Dodgers',
  120: 'Washington Nationals',
  121: 'New York Mets',
  133: 'Oakland Athletics',
  134: 'Pittsburgh Pirates',
  135: 'San Diego Padres',
  136: 'Seattle Mariners',
  137: 'San Francisco Giants',
  138: 'St. Louis Cardinals',
  139: 'Tampa Bay Rays',
  140: 'Texas Rangers',
  141: 'Toronto Blue Jays',
  142: 'Minnesota Twins',
  143: 'Philadelphia Phillies',
  144: 'Atlanta Braves',
  145: 'Chicago White Sox',
  146: 'Miami Marlins',
  147: 'New York Yankees',
  158: 'Milwaukee Brewers',
};

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');

  const teamId = Number(req.query.teamId);
  const teamName = TEAM_NAMES[teamId];

  if (!teamName) {
    return res.status(400).json({ error: 'Unknown teamId' });
  }

  try {
    const query = encodeURIComponent(`${teamName} MLB baseball`);
    const url = `https://news.google.com/rss/search?q=${query}&hl=en-US&gl=US&ceid=US:en`;

    const response = await fetch(url, {
      headers: { 'User-Agent': 'Mozilla/5.0 (compatible; NavHawk/1.0)' },
    });

    if (!response.ok) {
      return res.status(502).json({ error: `News fetch failed: ${response.status}` });
    }

    const xml = await response.text();
    const articles = parseRSS(xml).slice(0, 8);

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

    const rawTitle = extractCDATA(item, 'title') || extractTag(item, 'title') || '';
    // Google News titles are "Headline - Source Name", split them apart
    const dashIdx = rawTitle.lastIndexOf(' - ');
    const title = dashIdx !== -1 ? rawTitle.slice(0, dashIdx).trim() : rawTitle.trim();
    const source = dashIdx !== -1 ? rawTitle.slice(dashIdx + 3).trim() : '';

    const link = extractTag(item, 'link') || '';
    const pubDate = extractTag(item, 'pubDate') || '';
    const rawDesc = extractCDATA(item, 'description') || extractTag(item, 'description') || '';
    const description = stripHtml(rawDesc).trim().slice(0, 220);

    if (title) {
      articles.push({ title, source, description, link: link.trim(), pubDate: pubDate.trim(), thumbnail: null });
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
