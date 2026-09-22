import type { ChatMessage, ModelPreference } from "./types";

export const GATEWAY_ID = "opencode-hermes";
export const DYNAMIC_ROUTE = "dynamic/remo-openai";

export function normalizeModelPreference(value: unknown): ModelPreference {
	return value === "openai" ? "openai" : "default";
}

export function buildGatewayRequest(
	messages: ChatMessage[],
	preference: ModelPreference,
	gatewayToken: string,
	accountId: string,
): Request {
	const gatewayUrl = `https://gateway.ai.cloudflare.com/v1/${accountId}/${GATEWAY_ID}/compat/chat/completions`;
	const headers = new Headers({
		"cf-aig-authorization": `Bearer ${gatewayToken}`,
		"content-type": "application/json",
	});
	if (preference === "openai") {
		headers.set("cf-aig-metadata", JSON.stringify({ provider: "openai" }));
	}

	return new Request(gatewayUrl, {
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
