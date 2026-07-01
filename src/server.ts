import { Think } from '@cloudflare/think';
import { routeAgentRequest } from 'agents';
import { createWorkersAI } from 'workers-ai-provider';

// Minimal Think chat agent. Override getModel/getSystemPrompt/getTools/configureSession to extend.
// https://developers.cloudflare.com/agents/harnesses/think/
export class MyAgent extends Think<Env> {
	getModel() {
		return createWorkersAI({ binding: this.env.AI })('@cf/moonshotai/kimi-k2.6');
	}

	getSystemPrompt() {
		return 'You are a helpful assistant with access to a workspace filesystem.';
	}
}

export default {
	async fetch(request, env) {
		return (await routeAgentRequest(request, env)) || new Response('Not found', { status: 404 });
	},
} satisfies ExportedHandler<Env>;
