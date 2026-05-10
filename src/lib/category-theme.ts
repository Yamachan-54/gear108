// Margin の戒律「色は1色のみ」に従い、カテゴリ別の色は廃止。
// カテゴリ識別は **タイポグラフィと配置** で行う。

import type { Category } from '../content.config';

// 単一のアクセント色（朱赤、編集者の赤ペン由来）
export const ACCENT = '#c1272d';        // 朱赤
export const INK = '#1a1a1a';
export const PAPER = '#fdfdfd';
export const RULE = '#e6e2d8';

// カテゴリの英字短縮ラベル（雑誌のセクション見出し風に使う）
export const CATEGORY_SHORT: Record<Category, string> = {
  keyboard:   'KEYBOARD',
  monitor:    'MONITOR',
  pc:         'PC / NOTE',
  desk:       'DESK',
  peripheral: 'PERIPHERAL',
  storage:    'STORAGE',
  audio:      'AUDIO',
  power:      'POWER',
};
