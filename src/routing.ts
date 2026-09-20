import type { ChatMessage, ModelPreference } from "./types";

export const GATEWAY_ID = "opencode-hermes";
export const DYNAMIC_ROUTE = "dynamic/remo-openai";

export function normalizeModelPreference(value: unknown): ModelPreference {
	return value === "openai" ? "openai" : "default";
}

export function buildGatewayRequest(
	messages: ChatMessage[],
	preference: ModelPreference,
) {
	const headers: Record<string, string> = {};
	if (preference === "openai") {
		headers["cf-aig-metadata"] = JSON.stringify({ provider: "openai" });
	}

	return {
		provider: "compat",
		endpoint: "chat/completions",
		headers,
		query: {
			model: DYNAMIC_ROUTE,
			messages,
			max_tokens: 1024,
			stream: true,
		},
	};
}
