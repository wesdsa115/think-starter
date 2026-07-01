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
		const url = new URL(request.url);
		const pathname = url.pathname;

		// Handle DELETE request to clear agent session
		if (request.method === 'DELETE' && pathname.startsWith('/api/agent/')) {
			const agentId = pathname.split('/').pop();
			
			if (!agentId) {
				return new Response(JSON.stringify({ error: 'Invalid agent ID' }), {
					status: 400,
					headers: { 'Content-Type': 'application/json' }
				});
			}

			try {
				// Get and delete the Durable Object to reset it
				const durableObjectId = env.MyAgent.idFromName(agentId);
				const durableObject = env.MyAgent.get(durableObjectId);
				
				// Delete the storage to clear all session data
				await durableObject.fetch(new Request('http://localhost/delete', {
					method: 'DELETE'
				}));
				
				return new Response(JSON.stringify({ success: true, message: 'Chat history cleared' }), {
					status: 200,
					headers: { 'Content-Type': 'application/json' }
				});
			} catch (error) {
				console.error('Error clearing chat:', error);
				return new Response(JSON.stringify({ error: 'Failed to clear chat history' }), {
					status: 500,
					headers: { 'Content-Type': 'application/json' }
				});
			}
		}

		return (await routeAgentRequest(request, env)) || new Response('Not found', { status: 404 });
	},
} satisfies ExportedHandler<Env>;
