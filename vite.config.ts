import { sveltekit } from '@sveltejs/kit/vite';
import { presetUno } from 'unocss';
import type { UserConfig } from 'vite';
import UnoCSS from 'unocss/vite'
import { extractorSvelte } from '@unocss/core'

const config: UserConfig = {
	plugins: [
		UnoCSS({
			mode: 'svelte-scoped',
			extractors: [extractorSvelte],
			presets: [
				presetUno(),
			],
		}),
		sveltekit()
	],
};

export default config;
