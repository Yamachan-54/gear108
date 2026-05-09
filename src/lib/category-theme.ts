// カテゴリごとの色テーマ。OG画像生成と UI 表示で同じパレットを使う。
// 雑誌風のメリハリを出すため、彩度高めの色を選ぶ。

import type { Category } from '../content.config';

export const CATEGORY_COLOR: Record<Category, {
  hex: string;        // 表示用（バッジ、アクセントライン）
  bgClass: string;    // tailwind bg
  textClass: string;  // tailwind text
  borderClass: string;
  ringClass: string;
}> = {
  keyboard:   { hex: '#14b8a6', bgClass: 'bg-teal-500',    textClass: 'text-teal-500',    borderClass: 'border-teal-500',   ringClass: 'ring-teal-500/30' },
  monitor:    { hex: '#a855f7', bgClass: 'bg-purple-500',  textClass: 'text-purple-500',  borderClass: 'border-purple-500', ringClass: 'ring-purple-500/30' },
  pc:         { hex: '#64748b', bgClass: 'bg-slate-500',   textClass: 'text-slate-600',   borderClass: 'border-slate-500',  ringClass: 'ring-slate-500/30' },
  desk:       { hex: '#f97316', bgClass: 'bg-orange-500',  textClass: 'text-orange-500',  borderClass: 'border-orange-500', ringClass: 'ring-orange-500/30' },
  peripheral: { hex: '#22c55e', bgClass: 'bg-green-500',   textClass: 'text-green-500',   borderClass: 'border-green-500',  ringClass: 'ring-green-500/30' },
  storage:    { hex: '#3b82f6', bgClass: 'bg-blue-500',    textClass: 'text-blue-500',    borderClass: 'border-blue-500',   ringClass: 'ring-blue-500/30' },
  audio:      { hex: '#ec4899', bgClass: 'bg-pink-500',    textClass: 'text-pink-500',    borderClass: 'border-pink-500',   ringClass: 'ring-pink-500/30' },
  power:      { hex: '#f59e0b', bgClass: 'bg-amber-500',   textClass: 'text-amber-500',   borderClass: 'border-amber-500',  ringClass: 'ring-amber-500/30' },
};

// gear108 のブランドアクセント
export const BRAND = {
  primary: '#ec4899', // hot pink — Gizmodo風のメディア感
  primaryClass: 'bg-pink-500',
  primaryText: 'text-pink-500',
};
