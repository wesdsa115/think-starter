# Think Starter

A starter for building AI chat agents on Cloudflare with the
[Think](https://developers.cloudflare.com/agents/harnesses/think/) framework: a
stateful chat agent (streaming, persistent memory, tool calls) served with a
minimal React UI, built and deployed with Vite.

## Stack

- [`@cloudflare/think`](https://developers.cloudflare.com/agents/harnesses/think/) — chat agent framework
- [Cloudflare Agents](https://developers.cloudflare.com/agents/) on [Durable Objects](https://developers.cloudflare.com/durable-objects/)
- [Workers AI](https://developers.cloudflare.com/workers-ai/) — the model
- [Vite plugin](https://developers.cloudflare.com/workers/vite-plugin/) + React for the client

## Prerequisites

- Node.js 24+
- A Cloudflare account with Workers AI access
- `npx wrangler login` (Workers AI runs remotely, even in dev)

## Develop

```sh
npm install
npm run dev
```

Open the printed URL (default http://localhost:5173) and start chatting. If your
login has more than one account, set `CLOUDFLARE_ACCOUNT_ID`.

## Deploy

```sh
npm run deploy
```

## Scripts

| Command | Description |
| --- | --- |
| `npm run dev` | Start the Vite dev server |
| `npm run build` | Build the Worker + client |
| `npm run preview` | Preview the build in the Workers runtime |
| `npm run deploy` | Build and deploy to Cloudflare |
| `npm run cf-typegen` | Regenerate `worker-configuration.d.ts` after editing `wrangler.jsonc` |

## Layout

- `src/server.ts` — the Think agent (`MyAgent`) and the Worker entry
- `src/client.tsx` — React chat UI (`useAgent` + `useAgentChat`)
- `wrangler.jsonc` — bindings (AI, Durable Object), assets, migrations
- `tsconfig.*.json` — separate TS projects for worker / client / node

## Customize

Extend the agent in `src/server.ts` by overriding `getModel`,
`getSystemPrompt`, `getTools`, `configureSession`, or the lifecycle hooks. See
the [Think docs](https://developers.cloudflare.com/agents/harnesses/think/) and
[Getting started](https://developers.cloudflare.com/agents/harnesses/think/getting-started/).

The agent name must match in three places — the class in `src/server.ts`, the
Durable Object binding in `wrangler.jsonc`, and `useAgent({ agent: '...' })` in
`src/client.tsx`. Run `npm run cf-typegen` after changing bindings.
