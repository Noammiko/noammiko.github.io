import { defineConfig } from 'astro/config';

import react from '@astrojs/react';

import tailwind from '@astrojs/tailwind';

import svelte from '@astrojs/svelte';

import opengraphImages, { presets } from 'astro-opengraph-images';

// https://astro.build/config
export default defineConfig({
    site: 'https://noam.shalit.name',
    integrations: [react(), tailwind({
        applyBaseStyles: false,
    }), svelte(), opengraphImages({
        options: {
            fonts: [
                {
                    name: "Roboto",
                    weight: 400,
                    style: "normal",
                    data: fs.readFileSync("node_modules/@fontsource/roboto/files/roboto-latin-400-normal.woff"),
                },
            ],
        },
        render: presets.blackAndWhite
    })],
});