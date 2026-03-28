// Maps MLB Stats API team ID -> ESPN team ID
const ESPN_TEAM_IDS = {
  108: 12,  // Angels
  109: 30,  // D-backs
  110: 1,   // Orioles
  111: 2,   // Red Sox
  112: 16,  // Cubs
  113: 17,  // Reds
  114: 7,   // Guardians
  115: 27,  // Rockies
  116: 8,   // Tigers
  117: 11,  // Astros
  118: 9,   // Royals
  119: 26,  // Dodgers
  120: 25,  // Nationals
  121: 23,  // Mets
  133: 13,  // Athletics
  134: 19,  // Pirates
  135: 29,  // Padres
  136: 14,  // Mariners
  137: 28,  // Giants
  138: 20,  // Cardinals
  139: 4,   // Rays
  140: 15,  // Rangers
  141: 5,   // Blue Jays
  142: 10,  // Twins
  143: 24,  // Phillies
  144: 21,  // Braves
  145: 6,   // White Sox
  146: 22,  // Marlins
  147: 3,   // Yankees
  158: 18,  // Brewers
};

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');

  const teamId = Number(req.query.teamId);
  if (!teamId) {
    return res.status(400).json({ error: 'teamId is required' });
  }

  const espnId = ESPN_TEAM_IDS[teamId];
  if (!espnId) {
    return res.status(400).json({ error: 'Unknown teamId' });
  }

  try {
    const url = `https://site.api.espn.com/apis/site/v2/sports/baseball/mlb/news?limit=8&teams=${espnId}`;
    const response = await fetch(url);

    if (!response.ok) {
      return res.status(502).json({ error: `ESPN fetch failed: ${response.status}` });
    }

    const data = await response.json();

    const articles = (data.articles || []).map((a) => ({
      title: a.headline || '',
      description: a.description || '',
      link: a.links?.web?.href || '',
      pubDate: a.published || '',
      thumbnail: a.images?.[0]?.url || null,
    }));

    res.setHeader('Cache-Control', 's-maxage=300, stale-while-revalidate=600');
    return res.status(200).json({ articles });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
}
