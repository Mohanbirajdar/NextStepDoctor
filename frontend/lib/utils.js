export function cn(...classes) {
  return classes.filter(Boolean).join(' ');
}

export function formatYear(year) {
  return year || 'N/A';
}

export function truncate(str, n = 120) {
  if (!str) return '';
  return str.length > n ? str.slice(0, n) + '...' : str;
}

export function statusColor(status) {
  const map = {
    RECRUITING: 'bg-emerald-100 text-emerald-700 border-emerald-300',
    ACTIVE_NOT_RECRUITING: 'bg-blue-100 text-blue-700 border-blue-300',
    COMPLETED: 'bg-zinc-100 text-zinc-600 border-zinc-300',
    NOT_YET_RECRUITING: 'bg-amber-100 text-amber-700 border-amber-300',
    TERMINATED: 'bg-red-100 text-red-700 border-red-300',
    Unknown: 'bg-zinc-100 text-zinc-500 border-zinc-200',
  };
  return map[status] || map.Unknown;
}

export function confidenceColor(label) {
  if (label === 'High') return 'text-emerald-600 bg-emerald-50 border-emerald-200';
  if (label === 'Medium') return 'text-amber-600 bg-amber-50 border-amber-200';
  return 'text-red-600 bg-red-50 border-red-200';
}

export function detectCompareIntent(message) {
  const lower = message.toLowerCase();
  const compareRegex = /compare\s+(.+?)\s+(?:vs\.?|versus|and)\s+(.+)/i;
  const match = lower.match(compareRegex);
  if (match) return [match[1].trim(), match[2].trim()];
  return null;
}
