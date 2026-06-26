export const APP_CONFIG = {
  name: 'Proximity',
  version: '1.0.0',
  center: {lat: 52.2919, lng: -1.5358},
  zoom: 13.5,
  proximityRadius: 80, // meters
  proximityDuration: 5 * 60 * 1000, // 5 minutes
};

export const CATEGORY_ICONS = {
  bar: '🍺',
  pub: '🍻',
  quick_munch: '🍔',
};

export const CATEGORY_KEYWORDS = {
  bar: ['bar', 'bars', 'cocktail', 'cocktails', 'drinks', 'spirits'],
  pub: ['pub', 'pubs', 'ale', 'ales', 'bitter', 'lager', 'tavern', 'inn'],
  quick_munch: [
    'quick',
    'munch',
    'food',
    'eat',
    'eats',
    'fast',
    'snack',
    'kebab',
    'burger',
    'pizza',
    'chicken',
    'takeaway',
  ],
};

export const RATING_COLORS = {
  1: '#e53935',
  2: '#fb8c00',
  3: '#fdd835',
  4: '#7cb342',
  5: '#2e7d32',
};
