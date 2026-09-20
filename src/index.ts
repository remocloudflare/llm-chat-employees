/**
 * LLM Chat Application Template
 *
 * A simple chat application using Cloudflare Workers AI.
 * This template demonstrates how to implement an LLM-powered chat interface with
 * streaming responses using Server-Sent Events (SSE).
 *
 * @license MIT
 */
import { Env, ChatMessage } from "./types";
import {
	buildGatewayRequest,
	normalizeModelPreference,
} from "./routing";

// Default system prompt
const SYSTEM_PROMPT =
	"You are a helpful, friendly assistant. Provide concise and accurate responses.";

export default {
	/**
	 * Main request handler for the Worker
	 */
	async fetch(
		request: Request,
		env: Env,
		ctx: ExecutionContext,
	): Promise<Response> {
		const url = new URL(request.url);

		// Handle static assets (frontend)
		if (url.pathname === "/" || !url.pathname.startsWith("/api/")) {
			return env.ASSETS.fetch(request);
		}

		// API Routes
		if (url.pathname === "/api/chat") {
			// Handle POST requests for chat
			if (request.method === "POST") {
				return handleChatRequest(request, env);
			}

			// Method not allowed for other request types
			return new Response("Method not allowed", { status: 405 });
		}

		// Handle 404 for unmatched routes
		return new Response("Not found", { status: 404 });
	},
} satisfies ExportedHandler<Env>;

/**
 * Handles chat API requests
 */
async function handleChatRequest(
	request: Request,
	env: Env,
): Promise<Response> {
	try {
		// Parse JSON request body
		const { messages = [], modelPreference } = (await request.json()) as {
			messages: ChatMessage[];
			modelPreference?: unknown;
		};

		// Add system prompt if not present
		if (!messages.some((msg) => msg.role === "system")) {
			messages.unshift({ role: "system", content: SYSTEM_PROMPT });
		}

		if (!env.CF_AIG_TOKEN) {
			return new Response(
				JSON.stringify({ error: "AI Gateway is not configured" }),
				{
					status: 503,
					headers: { "content-type": "application/json" },
				},
			);
		}

		const gatewayRequest = buildGatewayRequest(
			messages,
			normalizeModelPreference(modelPreference),
			env.CF_AIG_TOKEN,
		);
		const response = await fetch(gatewayRequest);

		if (!response.ok) {
			const detail = await response.text();
			console.error("AI Gateway request failed:", response.status, detail);
			return new Response(
				JSON.stringify({ error: "AI Gateway request failed" }),
				{
					status: response.status,
					headers: { "content-type": "application/json" },
				},
			);
		}

		return response;
	} catch (error) {
		console.error("Error processing chat request:", error);
		return new Response(
			JSON.stringify({ error: "Failed to process request" }),
			{
				status: 500,
				headers: { "content-type": "application/json" },
			},
		);
	}
}
