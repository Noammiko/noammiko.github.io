import { defineConfig } from "astro/config";

import opengraphImages, { presets } from "astro-opengraph-images";

import icon from "astro-icon";

import plguins from "./lucide.config";
import sitemap from "@astrojs/sitemap";
import svelte from "@astrojs/svelte";
import react from "@astrojs/react";
import tailwindcss from "@tailwindcss/vite";
const { createLucideAstroImportOptimizer: lucideAstroImportOptimizer, lucideSvelteImportOptimizer } = plguins;

// https://astro.build/config
export default defineConfig({
  site: "https://miko-recordingstudio.ca",
  integrations: [
    opengraphImages({
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
    }),
    icon(),
    sitemap({
      filter(page) {
        const exclude = ["/tracking"];
        return !exclude.some((e) => page.includes(e));
      },
    }),
    svelte(),
    react(),
  ],
  vite: {
    plugins: [
      lucideAstroImportOptimizer(),
      // lucideSvelteImportOptimizer(),
      tailwindcss({
        applyBaseStyles: false,
      }),
    ],
    resolve: {
      conditions: ["browser"],
      alias: {},
    },
  },
});
