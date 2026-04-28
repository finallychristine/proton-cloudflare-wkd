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

import https from 'node:https';

const wkdUrl = /\/\.well-known\/openpgpkey\/([a-zA-Z0-9.]+)\/policy/
const protonHostname = "https://api.protonmail.ch"

export default {
	async fetch(request, env, ctx): Promise<Response> {
		if (request.method !== 'GET') {
			return new Response('Method not allowed', { status: 405 });
		}

		const url = URL.parse(request.url);
		if (url == null) {
			throw new Error('null URL');
		}

		const path = url.pathname

		if (!path.match(wkdUrl)) {
			return new Response('URL should match: /.well-known/openpgpkey/example.com/policy', { status: 400 });
		}


		const proxyResp = await fetch(`https://${protonHostname}${path}`, {
			method: 'GET',
		})

		console.log(proxyResp.status)

		return new Response("Hello World!");
	},
} satisfies ExportedHandler<Env>;
