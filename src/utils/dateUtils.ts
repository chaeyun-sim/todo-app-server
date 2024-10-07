export function getDateString(date?: Date): string {
  if (!date) return '';
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export function getDates(target: 'today' | 'yesterday'): string {
  const now = new Date();
  const kstTime = new Date(now.getTime() + 9 * 60 * 60 * 1000);

  if (target === 'yesterday') {
    kstTime.setDate(kstTime.getDate() - 1);
  }

  return kstTime.toISOString().split('T')[0];
}
