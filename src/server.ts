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

		// Handle clear/reset endpoint - deletes the Durable Object state
		if (request.method === 'POST' && url.pathname === '/reset-session') {
			try {
				const { sessionId } = await request.json();
				if (!sessionId) {
					return new Response(JSON.stringify({ error: 'sessionId required' }), { status: 400 });
				}

				// Get the Durable Object stub and delete its state
				const durableObjectId = env.MyAgent.idFromName(sessionId);
				const durableObject = env.MyAgent.get(durableObjectId);

				// Send a DELETE request to clear the Durable Object's internal state
				await durableObject.fetch(new Request('http://localhost/reset', { method: 'POST' }));

				return new Response(JSON.stringify({ success: true, message: 'Session reset successfully' }), {
					status: 200,
					headers: { 'Content-Type': 'application/json' },
				});
			} catch (error) {
				console.error('Error resetting session:', error);
				return new Response(JSON.stringify({ error: 'Failed to reset session' }), {
					status: 500,
					headers: { 'Content-Type': 'application/json' },
				});
			}
		}

		return (await routeAgentRequest(request, env)) || new Response('Not found', { status: 404 });
	},
} satisfies ExportedHandler<Env>;
