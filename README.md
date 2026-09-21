# LLM Chat Application Template

A simple, ready-to-deploy chat application template powered by Cloudflare Workers AI. This template provides a clean starting point for building AI chat applications with streaming responses.

[![Deploy to Cloudflare](https://deploy.workers.cloudflare.com/button)](https://deploy.workers.cloudflare.com/?url=https://github.com/cloudflare/templates/tree/main/llm-chat-app-template)

<!-- dash-content-start -->

## Demo

This template demonstrates how to build an AI-powered chat interface using Cloudflare Workers AI with streaming responses. It features:

- Real-time streaming of AI responses using Server-Sent Events (SSE)
- Easy customization of models and system prompts
- Support for AI Gateway integration
- Clean, responsive UI that works on mobile and desktop

## Features

- 💬 Simple and responsive chat interface
- ⚡ Server-Sent Events (SSE) for streaming responses
- 🧠 Powered by Cloudflare Workers AI LLMs
- 🛠️ Built with TypeScript and Cloudflare Workers
- 📱 Mobile-friendly design
- 🔄 Maintains chat history on the client
- 🔎 Built-in Observability logging
<!-- dash-content-end -->

## Getting Started

### Prerequisites

- [Node.js](https://nodejs.org/) (v18 or newer)
- [Wrangler CLI](https://developers.cloudflare.com/workers/wrangler/install-and-update/)
- A Cloudflare account with Workers AI access
- An active Cloudflare zone if you want a custom hostname
- An Access identity provider, or One-time PIN for a simpler workshop setup
- An OpenAI API key only if you want to exercise the OpenAI branch

### Student bootstrap credentials

Use separate credentials for provisioning and runtime. Do not commit tokens, provider keys, or secrets to Git.

#### 1. Terraform/bootstrap API token

In **My Profile → API Tokens → Create Custom Token**, create a least-privilege token with these permissions.

**Account permissions**

| Permission | Level | Purpose |
| --- | --- | --- |
| AI Gateway | Edit | Create and manage the gateway, provider configuration, and Dynamic Routes |
| AI Gateway | Read | Read-back verification and Terraform state refresh |
| AI Gateway | Run | Test the authenticated gateway |
| Workers Scripts | Edit | Deploy the chat Worker and manage Worker secrets |
| Workers AI | Read | Invoke Workers AI models |
| Access: Apps and Policies | Edit | Create the Access application and Allow policy |
| Access: Organizations, Identity Providers, and Groups | Read | Discover the configured IdP and groups |
| Secrets Store | Edit | Automate AI Gateway BYOK configuration, if required |

**Zone permissions**

| Permission | Level | Purpose |
| --- | --- | --- |
| Zone | Read | Find the workshop zone |
| DNS | Edit | Create the chat hostname DNS record |
| Workers Routes | Edit | Associate the hostname with the Worker |

Scope the token to the student's specific account and zone:

```text
Account resources: Include → Specific account → <student account>
Zone resources:    Include → Specific zone    → <student zone>
```

Avoid granting access to every account or zone unless the environment is disposable.

Set the token for Terraform or Wrangler. In Nushell:

```nu
$env.CLOUDFLARE_API_TOKEN = "<bootstrap token>"
$env.CLOUDFLARE_ACCOUNT_ID = "<account id>"
```

Do not place the token in `terraform.tfvars` or commit it to the repository.

#### 2. AI Gateway runtime token

In **AI → AI Gateway → your gateway → Settings**, enable **Authenticated Gateway** and select **Create authentication token**. This runtime token needs AI Gateway **Run** access and is stored only as a Worker secret:

```nu
$env.CF_AIG_TOKEN = "<AI Gateway runtime token>"
$env.CF_AIG_TOKEN | ^npx wrangler secret put CF_AIG_TOKEN
hide-env CF_AIG_TOKEN
```

The browser never receives this token. The Worker uses it server-side when calling the Dynamic Route.

#### 3. OpenAI provider key

The OpenAI key is independent of both Cloudflare tokens. Add it under:

```text
AI → AI Gateway → your gateway → Provider Keys → Add API Key → OpenAI
```

For workshops, prefer adding the provider key in the dashboard. Passing it through Terraform can place a sensitive value in Terraform state. Students without an OpenAI API account can use the Workers AI default branch only.

#### Responsibility split

| Mechanism | Recommended responsibility |
| --- | --- |
| Terraform | AI Gateway, Dynamic Route, Access application/policy, hostname/DNS, supported DLP settings |
| Wrangler | Worker deployment and `CF_AIG_TOKEN` secret |
| Dashboard | OpenAI BYOK key and optional GitHub Builds connection |

### Installation

1. Clone this repository:

   ```bash
   git clone https://github.com/cloudflare/templates.git
   cd templates/llm-chat-app
   ```

2. Install dependencies:

   ```bash
   npm install
   ```

3. Generate Worker type definitions:
   ```bash
   npm run cf-typegen
   ```

### Development

Start a local development server:

```bash
npm run dev
```

This will start a local server at http://localhost:8787.

Note: Using Workers AI accesses your Cloudflare account even during local development, which will incur usage charges.

### Deployment

Deploy to Cloudflare Workers:

```bash
npm run deploy
```

### Monitor

View real-time logs associated with any deployed Worker:

```bash
npm wrangler tail
```

## Project Structure

```
/
├── public/             # Static assets
│   ├── index.html      # Chat UI HTML
│   └── chat.js         # Chat UI frontend script
├── src/
│   ├── index.ts        # Main Worker entry point
│   └── types.ts        # TypeScript type definitions
├── test/               # Test files
├── wrangler.jsonc      # Cloudflare Worker configuration
├── tsconfig.json       # TypeScript configuration
└── README.md           # This documentation
```

## How It Works

### Backend

The backend is built with Cloudflare Workers and uses the Workers AI platform to generate responses. The main components are:

1. **API Endpoint** (`/api/chat`): Accepts POST requests with chat messages and streams responses
2. **Streaming**: Uses Server-Sent Events (SSE) for real-time streaming of AI responses
3. **Workers AI Binding**: Connects to Cloudflare's AI service via the Workers AI binding

### Frontend

The frontend is a simple HTML/CSS/JavaScript application that:

1. Presents a chat interface
2. Sends user messages to the API
3. Processes streaming responses in real-time
4. Maintains chat history on the client side

## Customization

### Changing the Model

To use a different AI model, update the `MODEL_ID` constant in `src/index.ts`. You can find available models in the [Cloudflare Workers AI documentation](https://developers.cloudflare.com/workers-ai/models/).

### Using AI Gateway

The template includes commented code for AI Gateway integration, which provides additional capabilities like rate limiting, caching, and analytics.

To enable AI Gateway:

1. [Create an AI Gateway](https://dash.cloudflare.com/?to=/:account/ai/ai-gateway) in your Cloudflare dashboard
2. Uncomment the gateway configuration in `src/index.ts`
3. Replace `YOUR_GATEWAY_ID` with your actual AI Gateway ID
4. Configure other gateway options as needed:
   - `skipCache`: Set to `true` to bypass gateway caching
   - `cacheTtl`: Set the cache time-to-live in seconds

Learn more about [AI Gateway](https://developers.cloudflare.com/ai-gateway/).

### Modifying the System Prompt

The default system prompt can be changed by updating the `SYSTEM_PROMPT` constant in `src/index.ts`.

### Styling

The UI styling is contained in the `<style>` section of `public/index.html`. You can modify the CSS variables at the top to quickly change the color scheme.

## Resources

- [Cloudflare Workers Documentation](https://developers.cloudflare.com/workers/)
- [Cloudflare Workers AI Documentation](https://developers.cloudflare.com/workers-ai/)
- [Workers AI Models](https://developers.cloudflare.com/workers-ai/models/)
