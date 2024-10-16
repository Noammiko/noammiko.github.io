import { defineConfig } from 'astro/config';

import react from '@astrojs/react';

import tailwind from '@astrojs/tailwind';

import svelte from '@astrojs/svelte';

// https://astro.build/config
export default defineConfig({
    site: 'https://noam.shalit.name',
    integrations: [
        react(),
        tailwind({
            applyBaseStyles: false,
        }),
        svelte()
    ],
});