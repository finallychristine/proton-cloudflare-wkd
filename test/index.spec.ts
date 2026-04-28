import { env } from "cloudflare:workers";
import {
	createExecutionContext,
	waitOnExecutionContext,
} from "cloudflare:test";
import { describe, it, expect, assert } from "vitest";
// Import your worker so you can unit test it
import worker from "../src";

// For now, you'll need to do something like this to get a correctly-typed
// `Request` to pass to `worker.fetch()`.
const IncomingRequest = Request;


const policyPath = "https://worker-url.example/.well-known/openpgpkey/protonmail.com/policy"
const keyPath = "https://worker-url.example/.well-known/openpgpkey/protonmail.com/hu/dj3498u4hyyarh35rkjfnghbjxug6b19?l=contact"

describe("worker", () => {
	it("forwards the policy", async () => {
		const response = await makeRequest(policyPath)
		expect(response.status).toBe(200)
	})

	it("forwards the key", async () => {
		const response = await makeRequest(keyPath);
		expect(response.status).toBe(200);
		const body = await response.text()
		assert.isNotEmpty(body);
	})

	it("rejects bad URLs", async () => {
		const response = await makeRequest("https://worker-url.example/bad/url");
		expect(response.status).toBe(400);
		const body = await response.text()
		expect(body).toBe('URL should start with: /.well-known/openpgpkey/example.com')
	})

	it("rejects bad http methods", async () => {
		const response = await makeRequest(policyPath, 'post');
		expect(response.status).toBe(405)
		const body = await response.text()
		expect(body).toBe(`Request method 'POST' is not in allowed methods: GET,HEAD`)
	})
});

async function makeRequest(url: string, method: string = 'get'): Promise<Response> {
	const request = new IncomingRequest(url, {
		method,
	});
	const ctx = createExecutionContext();
	const response = await worker.fetch(request, env, ctx);
	await waitOnExecutionContext(ctx);
	return response
}
