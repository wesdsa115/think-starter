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
		// Handle clear request
		if (request.method === 'POST' && new URL(request.url).pathname === '/clear') {
			const url = new URL(request.url);
			const agentId = url.searchParams.get('agentId') || 'default';
			
			try {
				// Get the Durable Object for the agent and reset it
				const durableObjectId = env.MyAgent.idFromName(agentId);
				const durableObject = env.MyAgent.get(durableObjectId);
				
				// Send a reset request to the Durable Object
				await durableObject.fetch(new Request(request.url, {
					method: 'POST',
					headers: { 'X-Clear-History': 'true' }
				}));
				
				return new Response(JSON.stringify({ success: true }), { 
					status: 200,
					headers: { 'Content-Type': 'application/json' }
				});
			} catch (error) {
				console.error('Error clearing history:', error);
				return new Response(JSON.stringify({ error: 'Failed to clear history' }), { 
					status: 500,
					headers: { 'Content-Type': 'application/json' }
				});
			}
		}

		return (await routeAgentRequest(request, env)) || new Response('Not found', { status: 404 });
	},
} satisfies ExportedHandler<Env>;
