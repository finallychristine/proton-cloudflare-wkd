/**
 * Welcome to Cloudflare Workers! This is your first worker.
 *
 * - Run `npm run dev` in your terminal to start a development server
 * - Open a browser tab at http://localhost:8787/ to see your worker in action
 * - Run `npm run deploy` to publish your worker
 *
 * Bind resources to your worker in `wrangler.jsonc`. After adding bindings, a type definition for the
 * `Env` object can be regenerated with `npm run cf-typegen`.
 *
 * Learn more at https://developers.cloudflare.com/workers/
 */

const ALLOWED_PATH = /^\/\.well-known\/openpgpkey\//
const PROTON_BASE_URL = "https://api.protonmail.ch"
const ALLOWED_METHODS = ['GET', 'HEAD']

export default {
	async fetch(request, env, ctx): Promise<Response> {
		if (!ALLOWED_METHODS.includes(request.method)) {
			return new Response(`Request method '${request.method}' is not in allowed methods: ${ALLOWED_METHODS}`, { status: 405 });
		}

		const requestUrl = URL.parse(request.url);
		if (requestUrl == null) {
			throw new Error('Could not parse request URL');
		}

		const path = requestUrl.pathname

		if (!path.match(ALLOWED_PATH)) {
			return new Response('URL should start with: /.well-known/openpgpkey/example.com', { status: 400 });
		}

		const proxyUrl = new URL(PROTON_BASE_URL)
		proxyUrl.pathname = requestUrl.pathname
		proxyUrl.search = requestUrl.search


		console.log(`Querying: ${proxyUrl}`)

		const proxyResp = await fetch(proxyUrl, {
			method: request.method,
			headers: {
				'User-Agent': 'github.com/finallychristine/proton-cloudflare-wkd',
			}
		})

		const response = new Response(proxyResp.body, proxyResp)
		response.headers.set('Access-Control-Allow-Origin', '*')

		return response
	},
} satisfies ExportedHandler<Env>;
