import { vitePreprocess,  } from '@astrojs/svelte';

/**
 * @type {import('@sveltejs/vite-plugin-svelte').Options}
 */
export default {
	preprocess: [vitePreprocess()],
  extensions: ['.svelte'],
}
