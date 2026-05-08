import { defineCollection, z } from 'astro:content';
import { glob } from 'astro/loaders';

const CATEGORIES = [
  'keyboard',
  'monitor',
  'pc',
  'desk',
  'peripheral',
  'storage',
  'audio',
  'power',
] as const;

const baseFrontmatter = {
  title: z.string(),
  description: z.string(),
  pubDate: z.coerce.date(),
  updatedDate: z.coerce.date().optional(),
  heroImage: z.string().optional(),
  category: z.enum(CATEGORIES),
  tags: z.array(z.string()).default([]),
  draft: z.boolean().default(false),
};

const affiliateLinksSchema = z
  .object({
    amazon: z.string().url().optional(),
    rakuten: z.string().url().optional(),
    yodobashi: z.string().url().optional(),
    biccamera: z.string().url().optional(),
    official: z.string().url().optional(),
  })
  .optional();

const reviews = defineCollection({
  loader: glob({ pattern: '**/*.{md,mdx}', base: './src/content/reviews' }),
  schema: z.object({
    ...baseFrontmatter,
    productName: z.string(),
    productPrice: z.number().optional(),
    rating: z.number().min(1).max(5).optional(),
    pros: z.array(z.string()).default([]),
    cons: z.array(z.string()).default([]),
    affiliateLinks: affiliateLinksSchema,
  }),
});

const roundups = defineCollection({
  loader: glob({ pattern: '**/*.{md,mdx}', base: './src/content/roundups' }),
  schema: z.object({
    ...baseFrontmatter,
    productCount: z.number().optional(),
  }),
});

const news = defineCollection({
  loader: glob({ pattern: '**/*.{md,mdx}', base: './src/content/news' }),
  schema: z.object({
    ...baseFrontmatter,
    source: z.string().optional(),
    sourceUrl: z.string().url().optional(),
  }),
});

const guides = defineCollection({
  loader: glob({ pattern: '**/*.{md,mdx}', base: './src/content/guides' }),
  schema: z.object({
    ...baseFrontmatter,
  }),
});

const deals = defineCollection({
  loader: glob({ pattern: '**/*.{md,mdx}', base: './src/content/deals' }),
  schema: z.object({
    ...baseFrontmatter,
    saleEndsAt: z.coerce.date().optional(),
    discountPercent: z.number().optional(),
    affiliateLinks: affiliateLinksSchema,
  }),
});

export const collections = { reviews, roundups, news, guides, deals };

export const CATEGORY_LABELS: Record<(typeof CATEGORIES)[number], string> = {
  keyboard: 'キーボード',
  monitor: 'モニター',
  pc: 'PC・ノート',
  desk: 'デスク・椅子',
  peripheral: '周辺機器',
  storage: 'ストレージ',
  audio: 'オーディオ',
  power: '電源・ケーブル',
};

export const COLLECTION_LABELS: Record<keyof typeof collections, string> = {
  reviews: 'レビュー',
  roundups: 'まとめ・比較',
  news: 'ニュース',
  guides: '選び方ガイド',
  deals: 'セール情報',
};

export type Category = (typeof CATEGORIES)[number];
export type CollectionName = keyof typeof collections;
