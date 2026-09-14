import { vitePreprocess } from '@sveltejs/vite-plugin-svelte'

/** @type {import("@sveltejs/vite-plugin-svelte").SvelteConfig} */
export default {
  // Consult https://svelte.dev/docs#compile-time-svelte-preprocess
  // for more information about preprocessors
  preprocess: vitePreprocess(),
  compilerOptions: {
    warningFilter: (warning) =>
        (warning.code !== 'a11y_invalid_attribute')
        && (warning.code !== 'a11y_missing_attribute'),
  }
}
