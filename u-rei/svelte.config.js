import adapter from '@sveltejs/adapter-node';

const basePath = process.env.BASE_PATH || '';

/** @type {import('@sveltejs/kit').Config} */
const config = {
	kit: {
		adapter: adapter(),
		paths: {
			base: basePath
		}
	}
};

export default config;
