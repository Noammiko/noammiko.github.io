import { defineCollection, z } from "astro:content";
import { glob } from "astro/loaders";

/** Site-level MDX pages (about, seasonal offer, etc.) */
const site = defineCollection({
  loader: glob({ pattern: "**/*.{md,mdx}", base: "./src/content/site" }),
  schema: z.object({
    title: z.string().optional(),
    description: z.string().optional(),
  }),
});

/** Individual FAQ entries */
const faq = defineCollection({
  loader: glob({ pattern: "**/*.{md,mdx}", base: "./src/content/faq" }),
  schema: z.object({
    question: z.string(),
    order: z.number(),
  }),
});

export const collections = { site, faq };
