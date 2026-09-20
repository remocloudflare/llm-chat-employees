import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

import {
	buildGatewayRequest,
	normalizeModelPreference,
} from "../src/routing.ts";

const messages = [{ role: "user", content: "Hello" }];

test("OpenAI preference selects the OpenAI dynamic-route branch", async () => {
	const request = buildGatewayRequest(messages, "openai", "gateway-token");
	const payload = await request.json();

	assert.equal(
		request.url,
		"https://gateway.ai.cloudflare.com/v1/815b94af8be996b270364b66fa166aad/opencode-hermes/compat/chat/completions",
	);
	assert.equal(request.method, "POST");
	assert.equal(request.headers.get("cf-aig-authorization"), "Bearer gateway-token");
	assert.deepEqual(JSON.parse(request.headers.get("cf-aig-metadata")), {
		provider: "openai",
	});
	assert.equal(payload.model, "dynamic/remo-openai");
	assert.equal(payload.stream, true);
});

test("company default omits provider metadata and takes the false branch", async () => {
	const request = buildGatewayRequest(messages, "default", "gateway-token");
	const payload = await request.json();

	assert.equal(payload.model, "dynamic/remo-openai");
	assert.equal(request.headers.get("cf-aig-metadata"), null);
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

test("chat UI includes a persistent accessible theme toggle", async () => {
	const [html, script] = await Promise.all([
		readFile(new URL("../public/index.html", import.meta.url), "utf8"),
		readFile(new URL("../public/chat.js", import.meta.url), "utf8"),
	]);

	assert.match(html, /id="theme-toggle"/);
	assert.match(html, /data-theme="dark"/);
	assert.match(html, /aria-label="Switch to light mode"/);
	assert.match(script, /localStorage\.setItem\("theme"/);
	assert.match(script, /document\.documentElement\.dataset\.theme/);
	assert.match(script, /try[\s\S]*localStorage\.getItem\("theme"\)[\s\S]*catch/);
	assert.match(script, /try[\s\S]*localStorage\.setItem\("theme"[\s\S]*catch/);
});

test("chat messages are rendered as text rather than executable HTML", async () => {
	const script = await readFile(
		new URL("../public/chat.js", import.meta.url),
		"utf8",
	);

	assert.doesNotMatch(script, /\.innerHTML\s*=/);
	assert.match(script, /textContent = content/);
});
