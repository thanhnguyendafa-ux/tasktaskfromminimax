export function formatDuration(seconds: number): string {
  if (seconds < 0) return '0s';
  
  const units = [
    { value: 86400, label: 'd' },
    { value: 3600, label: 'h' },
    { value: 60, label: 'm' },
    { value: 1, label: 's' },
  ];
  
  const parts: string[] = [];
  let remaining = Math.round(seconds);
  
  for (const unit of units) {
    if (remaining >= unit.value) {
      const count = Math.floor(remaining / unit.value);
      parts.push(`${count}${unit.label}`);
      remaining %= unit.value;
      if (parts.length >= 2) break;
    }
  }
  
  if (parts.length === 0) return '0s';
  return parts.join(' ');
}

export function formatLongDuration(seconds: number): string {
  if (seconds < 0) return '0s';
  
  const days = Math.floor(seconds / 86400);
  const hours = Math.floor((seconds % 86400) / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const secs = Math.round(seconds % 60);
  
  const parts: string[] = [];
  if (days > 0) parts.push(`${days}d`);
  if (hours > 0) parts.push(`${hours}h`);
  if (minutes > 0) parts.push(`${minutes}m`);
  if (secs > 0 && seconds < 60) parts.push(`${secs}s`);
  
  return parts.length > 0 ? parts.join(' ') : '0s';
}

export function formatCompactDuration(seconds: number): string {
  if (seconds < 60) return `${Math.round(seconds)}s`;
  if (seconds < 3600) return `${Math.round(seconds / 60)}m`;
  if (seconds < 86400) {
    const h = Math.floor(seconds / 3600);
    const m = Math.round((seconds % 3600) / 60);
    return m > 0 ? `${h}h ${m}m` : `${h}h`;
  }
  const d = Math.floor(seconds / 86400);
  const h = Math.round((seconds % 86400) / 3600);
  return h > 0 ? `${d}d ${h}h` : `${d}d`;
}
