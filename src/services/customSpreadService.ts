import { Spread, SpreadPosition } from '../types';

const STORAGE_KEY = 'tarot-custom-spreads';

// 读取所有已保存的自定义牌阵
export function listCustomSpreads(): Spread[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

// 保存自定义牌阵：同名（标题相同）则覆盖更新，否则新增到最前面
export function saveCustomSpread(name: string, positions: SpreadPosition[]): Spread[] {
  const spreads = listCustomSpreads();
  const trimmedName = name.trim() || '自定义牌阵';
  const existingIndex = spreads.findIndex(s => s.name === trimmedName);
  const saved: Spread = {
    id: existingIndex >= 0 ? spreads[existingIndex].id : `custom-spread-${Date.now()}`,
    name: trimmedName,
    description: positions.map(p => p.meaning || `第${p.position}张`).join('、'),
    category: '自定义',
    positions,
  };
  if (existingIndex >= 0) {
    spreads[existingIndex] = saved;
  } else {
    spreads.unshift(saved);
  }
  localStorage.setItem(STORAGE_KEY, JSON.stringify(spreads));
  return spreads;
}

// 删除指定自定义牌阵，返回删除后的列表
export function deleteCustomSpread(id: string): Spread[] {
  const spreads = listCustomSpreads().filter(s => s.id !== id);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(spreads));
  return spreads;
}
