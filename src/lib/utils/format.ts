/**
 * Convert number to Roman numerals
 */
export function toRoman(num: number): string {
  if (num <= 0 || num === -1) return '';

  const digits = String(num).split('');
  const key = [
    '',
    'C',
    'CC',
    'CCC',
    'CD',
    'D',
    'DC',
    'DCC',
    'DCCC',
    'CM',
    '',
    'X',
    'XX',
    'XXX',
    'XL',
    'L',
    'LX',
    'LXX',
    'LXXX',
    'XC',
    '',
    'I',
    'II',
    'III',
    'IV',
    'V',
    'VI',
    'VII',
    'VIII',
    'IX'
  ];

  let roman = '';
  let i = 3;
  while (i--) {
    const digit = digits.pop();
    roman = (key[+(digit ?? '0') + i * 10] || '') + roman;
  }
  return Array(+digits.join('') + 1).join('M') + roman;
}

/**
 * Format file size in human-readable form
 */
export function formatSize(bytes: number): string {
  const units = ['B', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB'];
  if (bytes === 0) return '0 B';
  const digitGroups = Math.floor(Math.log10(bytes) / Math.log10(1024));
  return (bytes / Math.pow(1024, digitGroups)).toFixed(1) + ' ' + units[digitGroups];
}

/**
 * Format length in human-readable form
 */
export function formatLength(mins: number): string {
  if (mins === 0) return '0 min';

  let result = '';

  const fullmins = mins % 60;
  mins = Math.floor(mins / 60);
  const fullhours = mins % 24;
  mins = Math.floor(mins / 24);
  const fulldays = mins % 365;
  mins = Math.floor(mins / 365);
  const fullyears = mins;

  let render = false;
  if (fullyears !== 0) {
    result += fullyears + (fullyears !== 1 ? ' Years, ' : ' Year, ');
    render = true;
  }
  if (fulldays !== 0 || render) {
    result += fulldays + (fulldays !== 1 ? ' Days, ' : ' Day, ');
    render = true;
  }
  if (fullhours !== 0 || render) {
    result += fullhours + ' h, ';
    render = true;
  }
  if (fullmins !== 0 || render) {
    result += fullmins + ' min';
  }

  return result;
}

/**
 * Format length in short form (hours:minutes)
 */
export function formatLengthShort(mins: number): string {
  if (mins === 0) return '0m';
  const hours = Math.floor(mins / 60);
  const minutes = mins % 60;
  if (hours === 0) return `${minutes}m`;
  if (minutes === 0) return `${hours}h`;
  return `${hours}h ${minutes}m`;
}

/**
 * Parse viewed history string
 * Format: "UNSPECIFIED,2017-06-17 21:29:00,2022-02-26 15:51:00"
 */
export function parseViewedHistory(value: string): { viewed: boolean; history: string[] } {
  if (!value || value === '') {
    return { viewed: false, history: [] };
  }
  const parts = value.split(',');
  const history = parts.filter((p) => p !== 'UNSPECIFIED' && p !== '');
  return {
    viewed: history.length > 0,
    history
  };
}

/**
 * Format date as YYYY-MM-DD
 */
export function formatDate(dateStr: string): string {
  if (!dateStr) return '';
  // Already in YYYY-MM-DD format from SQLite
  return dateStr.split(' ')[0];
}

/**
 * Parse JSON array safely
 */
export function parseJsonArray<T>(value: string | null | undefined): T[] {
  if (!value || value === '') return [];
  try {
    const parsed = JSON.parse(value);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

/**
 * Calculate online score as percentage (0-100)
 */
export function calculateOnlineScore(num: number, denom: number): number {
  if (denom === 0) return 0;
  return Math.round((num / denom) * 100);
}

/**
 * Get star count (0-10) from online score
 */
export function getStarCount(num: number, denom: number): number {
  if (denom === 0) return 0;
  return Math.round((num / denom) * 10);
}
