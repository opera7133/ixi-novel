import { defineCollection } from 'astro:content';

import { glob } from 'astro/loaders';

import { z } from 'astro/zod';

const novels = defineCollection({
  loader: glob({ pattern: ["**/*.md", "!sample.md"], base: "./src/content/novels" }),
  schema: z.object({
    id: z.union([z.string(), z.number()]).transform(String),
    title: z.string(),
    tags: z.array(z.string()).optional(),
    r18: z.boolean().default(false),
  }),
});

export const collections = { novels };
