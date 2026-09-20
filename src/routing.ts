import type { ChatMessage, ModelPreference } from "./types";

export const ACCOUNT_ID = "815b94af8be996b270364b66fa166aad";
export const GATEWAY_ID = "opencode-hermes";
export const DYNAMIC_ROUTE = "dynamic/remo-openai";
export const GATEWAY_URL = `https://gateway.ai.cloudflare.com/v1/${ACCOUNT_ID}/${GATEWAY_ID}/compat/chat/completions`;

export function normalizeModelPreference(value: unknown): ModelPreference {
	return value === "openai" ? "openai" : "default";
}

export function buildGatewayRequest(
	messages: ChatMessage[],
	preference: ModelPreference,
	gatewayToken: string,
): Request {
	const headers = new Headers({
		"cf-aig-authorization": `Bearer ${gatewayToken}`,
		"content-type": "application/json",
	});
	if (preference === "openai") {
		headers.set("cf-aig-metadata", JSON.stringify({ provider: "openai" }));
	}

	return new Request(GATEWAY_URL, {
		method: "POST",
		headers,
		body: JSON.stringify({
			model: DYNAMIC_ROUTE,
			messages,
			max_tokens: 1024,
			stream: true,
		}),
	});
}
