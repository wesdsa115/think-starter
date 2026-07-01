import { useAgentChat } from '@cloudflare/ai-chat/react';
import { useAgent } from 'agents/react';
import { useState } from 'react';
import { createRoot } from 'react-dom/client';
import './styles.css';

function Chat() {
	// Generate initial session ID
	const [sessionId, setSessionId] = useState(() => `session-${Date.now()}`);
	const agent = useAgent({ agent: 'MyAgent', id: sessionId });
	const { messages, sendMessage, status } = useAgentChat({ agent });

	const handleClear = async () => {
		try {
			// Reset the Durable Object state on the server (clears SQLite storage)
			const response = await fetch('/reset-session', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ sessionId }),
			});

			if (response.ok) {
				// Generate new session ID to create a fresh Durable Object instance
				const newSessionId = `session-${Date.now()}`;
				setSessionId(newSessionId);
			} else {
				console.error('Failed to reset session:', await response.text());
			}
		} catch (error) {
			console.error('Error clearing chat:', error);
		}
	};

	return (
		<div className="mx-auto flex h-screen max-w-2xl flex-col p-4">
			<div className="mb-4 flex items-center justify-between">
				<h1 className="text-xl font-semibold">Think Agent</h1>
				<button
					onClick={handleClear}
					className="rounded-lg bg-red-600 px-3 py-2 text-sm font-medium text-white hover:bg-red-700"
				>
					Clear
				</button>
			</div>

			<div className="flex-1 space-y-3 overflow-y-auto">
				{messages.map((msg) => (
					<div key={msg.id} className="rounded-lg border border-gray-200 p-3">
						<div className="mb-1 text-xs font-medium uppercase tracking-wide text-gray-500">{msg.role}</div>
						<div className="whitespace-pre-wrap">
							{msg.parts.map((part, i) => (part.type === 'text' ? <span key={i}>{part.text}</span> : null))}
						</div>
					</div>
				))}
			</div>

			<form
				className="mt-4 flex gap-2"
				onSubmit={(e) => {
					e.preventDefault();
					const input = e.currentTarget.elements.namedItem('input') as HTMLInputElement;
					if (!input.value.trim()) return;
					sendMessage({ text: input.value });
					input.value = '';
				}}
			>
				<input
					name="input"
					autoComplete="off"
					placeholder="Send a message..."
					className="flex-1 rounded-lg border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
				/>
				<button type="submit" className="rounded-lg bg-blue-600 px-4 py-2 font-medium text-white hover:bg-blue-700">
					Send
				</button>
			</form>

			<p className="mt-2 text-xs text-gray-500">Status: {status}</p>
		</div>
	);
}

const root = document.getElementById('root');
if (root) {
	createRoot(root).render(<Chat />);
}
