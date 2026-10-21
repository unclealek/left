// Scoped to the navigation brief; the rest of Left keeps its established palette.
const moss = '#607B3F';
const ivory = '#F7F4EE';
const ink = '#171812';
const lime = '#D5EE91';

export const navigationColors = {
  light: {
    content: ink,
    inactive: '#50514B',
    active: moss,
    surface: ivory,
    selection: '#E5EBD9',
    selectionTint: 'rgba(96,123,63,0.12)',
    shadow: ink,
  },
  dark: {
    content: ivory,
    inactive: '#D0D1C9',
    active: lime,
    surface: '#24251F',
    selection: '#3B4630',
    selectionTint: 'rgba(213,238,145,0.12)',
    shadow: ink,
  },
} as const;
