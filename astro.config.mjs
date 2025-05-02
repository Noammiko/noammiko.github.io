import { defineConfig } from "astro/config";

import react from "@astrojs/react";

import tailwind from "@astrojs/tailwind";

import svelte from "@astrojs/svelte";

import opengraphImages, { presets } from "astro-opengraph-images";

import icon from "astro-icon";

import plguins from "./lucide.config";
import sitemap from "@astrojs/sitemap";
const { createLucideAstroImportOptimizer: lucideAstroImportOptimizer, lucideSvelteImportOptimizer } = plguins;

// https://astro.build/config
export default defineConfig({
  site: "https://miko-recordingstudio.ca",
  integrations: [react(), tailwind({
    applyBaseStyles: false,
  }), svelte(), opengraphImages({
    options: {
      fonts: [
        {
          name: "Roboto",
          weight: 400,
          style: "normal",
          data: fs.readFileSync(
            "node_modules/@fontsource/roboto/files/roboto-latin-400-normal.woff",
          ),
        },
      ],
    },
    render: presets.blackAndWhite,
  }), icon(), sitemap()],
  vite: {
    plugins: [
      lucideAstroImportOptimizer(),
      lucideSvelteImportOptimizer(),
    ],
    resolve: {
      conditions: ["browser"],
      alias: {
        // Force resolution to the Svelte build file
        "bits-ui": "node_modules/bits-ui/dist/index.js",
        "@melt-ui/svelte": "node_modules/@melt-ui/svelte/dist/index.js",
      },
    },
  },
});