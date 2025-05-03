import { defineConfig } from "astro/config";

import react from "@astrojs/react";

import tailwind from "@astrojs/tailwind";

import opengraphImages, { presets } from "astro-opengraph-images";

import icon from "astro-icon";

import plguins from "./lucide.config";
import sitemap from "@astrojs/sitemap";
import svelte from "@astrojs/svelte";
const { createLucideAstroImportOptimizer: lucideAstroImportOptimizer, lucideSvelteImportOptimizer } = plguins;

// https://astro.build/config
export default defineConfig({
  site: "https://miko-recordingstudio.ca",
  integrations: [react(), tailwind({
    applyBaseStyles: false,
  }), opengraphImages({
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
  }), icon(), sitemap(), svelte()],
  vite: {
    plugins: [
      lucideAstroImportOptimizer(),
      // lucideSvelteImportOptimizer(),
    ],
    resolve: {
      conditions: ["browser"],
      alias: {
      },
    },
  },
});