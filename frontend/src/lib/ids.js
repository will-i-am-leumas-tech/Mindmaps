export function nextId(prefix, items = []) {
  const max = items.reduce((highest, item) => {
    const value = Number(String(item.id || '').replace(`${prefix}_`, ''));
    return Number.isFinite(value) ? Math.max(highest, value) : highest;
  }, 0);
  return `${prefix}_${max + 1}`;
}
