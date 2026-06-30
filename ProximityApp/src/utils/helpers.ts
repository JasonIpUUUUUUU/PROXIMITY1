export const haversineDistance = (lat1: number, lng1: number, lat2: number, lng2: number): number => {
  const R = 6371000;
  const φ1 = (lat1 * Math.PI) / 180;
  const φ2 = (lat2 * Math.PI) / 180;
  const Δφ = ((lat2 - lat1) * Math.PI) / 180;
  const Δλ = ((lng2 - lng1) * Math.PI) / 180;
  const a = Math.sin(Δφ / 2) ** 2 + Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
};

export const formatCategory = (category: string): string => {
  return category.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase());
};

export const generateUserId = (): string => {
  return 'user_' + Math.random().toString(36).substring(2, 15);
};

export const debounce = <T extends (...args: any[]) => any>(
  func: T,
  wait: number
): ((...args: Parameters<T>) => void) => {
  let timeout: ReturnType<typeof setTimeout> | null = null;
  return (...args: Parameters<T>) => {
    if (timeout) clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  };
};

export const getRatingColor = (rating: number): string => {
  const v = Math.max(1, Math.min(5, rating || 3));
  const stops: [number, [number, number, number]][] = [
    [1.0, [229, 57, 53]],
    [2.0, [251, 140, 0]],
    [3.0, [253, 216, 53]],
    [4.0, [124, 179, 66]],
    [5.0, [46, 125, 50]],
  ];

  for (let i = 0; i < stops.length - 1; i++) {
    const [r1, c1] = stops[i];
    const [r2, c2] = stops[i + 1];
    if (v <= r2) {
      const t = (v - r1) / (r2 - r1);
      const rgb = c1.map((c, idx) => Math.round(c + t * (c2[idx] - c)));
      return `#${rgb.map(n => n.toString(16).padStart(2, '0')).join('')}`;
    }
  }
  return '#2e7d32';
};