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
        },
        render: presets.simpleBlog
    })],
});