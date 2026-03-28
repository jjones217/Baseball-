// Maps MLB team ID -> mlb.com URL slug (used for RSS news feeds)
export const teamSlugs = {
  108: 'angels',
  109: 'd-backs',
  110: 'orioles',
  111: 'red-sox',
  112: 'cubs',
  113: 'reds',
  114: 'guardians',
  115: 'rockies',
  116: 'tigers',
  117: 'astros',
  118: 'royals',
  119: 'dodgers',
  120: 'nationals',
  121: 'mets',
  133: 'athletics',
  134: 'pirates',
  135: 'padres',
  136: 'mariners',
  137: 'giants',
  138: 'cardinals',
  139: 'rays',
  140: 'rangers',
  141: 'blue-jays',
  142: 'twins',
  143: 'phillies',
  144: 'braves',
  145: 'white-sox',
  146: 'marlins',
  147: 'yankees',
  158: 'brewers',
};

export function getTeamSlug(teamId) {
  return teamSlugs[teamId] || null;
}
