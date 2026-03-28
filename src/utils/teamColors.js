// MLB Team primary and secondary colors, keyed by team ID
export const teamColors = {
  108: { primary: '#BA0021', secondary: '#003263', name: 'Angels' },        // LA Angels
  109: { primary: '#A71930', secondary: '#E3D4AD', name: 'Diamondbacks' },  // AZ
  110: { primary: '#DF4601', secondary: '#000000', name: 'Orioles' },        // Baltimore
  111: { primary: '#BD3039', secondary: '#0C2340', name: 'Red Sox' },        // Boston
  112: { primary: '#0E3386', secondary: '#CC3433', name: 'Cubs' },           // Chicago Cubs
  113: { primary: '#C6011F', secondary: '#000000', name: 'Reds' },           // Cincinnati
  114: { primary: '#00385D', secondary: '#E50022', name: 'Guardians' },      // Cleveland
  115: { primary: '#333366', secondary: '#C4CED4', name: 'Rockies' },        // Colorado
  116: { primary: '#0C2C56', secondary: '#C0111F', name: 'Tigers' },         // Detroit
  117: { primary: '#EB6E1F', secondary: '#002D62', name: 'Astros' },         // Houston
  118: { primary: '#174885', secondary: '#C09A5B', name: 'Royals' },         // KC
  119: { primary: '#005A9C', secondary: '#EF3E42', name: 'Dodgers' },        // LA Dodgers
  120: { primary: '#AB0003', secondary: '#14225A', name: 'Nationals' },      // Washington
  121: { primary: '#002D72', secondary: '#FF5910', name: 'Mets' },           // NY Mets
  133: { primary: '#003831', secondary: '#EFB21E', name: 'Athletics' },      // Oakland
  134: { primary: '#003087', secondary: '#C41E3A', name: 'Pirates' },        // Pittsburgh
  135: { primary: '#2F241D', secondary: '#FFC425', name: 'Padres' },         // San Diego
  136: { primary: '#0C2C56', secondary: '#005C5C', name: 'Mariners' },       // Seattle
  137: { primary: '#FD5A1E', secondary: '#27251F', name: 'Giants' },         // SF Giants
  138: { primary: '#C41E3A', secondary: '#FEDB00', name: 'Cardinals' },      // St Louis
  139: { primary: '#092C5C', secondary: '#8FBCE6', name: 'Rays' },           // Tampa Bay
  140: { primary: '#003278', secondary: '#C0111F', name: 'Rangers' },        // Texas
  141: { primary: '#134A8E', secondary: '#1D2D5C', name: 'Blue Jays' },      // Toronto
  142: { primary: '#002B5C', secondary: '#D31145', name: 'Twins' },          // Minnesota
  143: { primary: '#E81828', secondary: '#002D72', name: 'Phillies' },       // Philadelphia
  144: { primary: '#CE1141', secondary: '#13274F', name: 'Braves' },         // Atlanta
  145: { primary: '#27251F', secondary: '#C4CED4', name: 'White Sox' },      // Chicago White Sox
  146: { primary: '#00A3E0', secondary: '#FF6600', name: 'Marlins' },        // Miami
  147: { primary: '#003087', secondary: '#E4002C', name: 'Yankees' },        // NY Yankees
  158: { primary: '#12284B', secondary: '#FFC52F', name: 'Brewers' },        // Milwaukee
};

export function getTeamColors(teamId) {
  return teamColors[teamId] || { primary: '#4a3728', secondary: '#c9a96e', name: 'Unknown' };
}
