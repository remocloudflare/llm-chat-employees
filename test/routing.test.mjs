import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

import {
	buildGatewayRequest,
	normalizeModelPreference,
} from "../src/routing.ts";

const messages = [{ role: "user", content: "Hello" }];

test("OpenAI preference selects the OpenAI dynamic-route branch", () => {
	const request = buildGatewayRequest(messages, "openai");

	assert.equal(request.provider, "compat");
	assert.equal(request.endpoint, "chat/completions");
	assert.equal(request.query.model, "dynamic/remo-openai");
	assert.equal(request.query.stream, true);
	assert.deepEqual(JSON.parse(request.headers["cf-aig-metadata"]), {
		provider: "openai",
	});
});

test("company default omits provider metadata and takes the false branch", () => {
	const request = buildGatewayRequest(messages, "default");

	assert.equal(request.query.model, "dynamic/remo-openai");
	assert.deepEqual(request.headers, {});
});

test("unknown model preferences cannot select arbitrary providers", () => {
	assert.equal(normalizeModelPreference("anthropic"), "default");
	assert.equal(normalizeModelPreference(undefined), "default");
});

test("chat UI offers an explicit OpenAI preference and sends it to the API", async () => {
	const [html, script] = await Promise.all([
		readFile(new URL("../public/index.html", import.meta.url), "utf8"),
		readFile(new URL("../public/chat.js", import.meta.url), "utf8"),
	]);

	assert.match(html, /<option value="default">Company default<\/option>/);
	assert.match(html, /<option value="openai">OpenAI \(GPT-4o mini\)<\/option>/);
	assert.match(script, /modelPreference: modelPreference\.value/);
});
