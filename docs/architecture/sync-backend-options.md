# Sync and Backend Options

POS should stay local-first: core capture, planning, habits, and review must work without a network. The backend exists for sync, durable automation, AI orchestration, integration webhooks, and shared accountability.

## Option A: Expo Client + Supabase

Use Supabase Postgres, auth, edge functions, and row-level security.

Best for the next MVP because it is fast to ship, keeps Postgres as the durable system of record, and can support simple sync tables before a more formal event log exists.

Trade-off: conflict handling, durable workflows, and integration orchestration still need explicit design.

## Option B: Custom Fastify/Nest API + Postgres

Use a TypeScript backend with Postgres, a sync API, and provider integration services.

Best when POS needs tighter control over domain events, contract validation, AI context assembly, and provider token handling.

Trade-off: more infrastructure and slower initial delivery.

## Option C: Local Event Log + Durable Workflow Backend

Use local immutable events on-device, sync them to Postgres, and run automations through a workflow engine such as Temporal.

Best long-term fit for reliable calendar/email/webhook work, retries, standing rules, and inspectable automation history.

Trade-off: too heavy until the core product contract is stable.

## Recommended Path

1. Keep `AsyncStorage` only as the temporary projection store.
2. Move secrets to SecureStore immediately.
3. Introduce local domain mutations before sync.
4. Add an append-only event table locally.
5. Sync events to a Postgres backend.
6. Add integration tokens server-side with narrow OAuth scopes.
7. Add durable workflows for provider ingestion, notifications, and AI planning.

## Minimum Backend Contract

The first backend should expose:

- `POST /sync/push` for local events.
- `GET /sync/pull?since=` for remote events.
- `POST /recommendations/evaluate` using the recommendation contract.
- `POST /plans/generate` using the planning contract.
- `GET /integrations/ledger` for connected providers, scopes, last sync, and last action.

No backend path should store OpenAI or Notion tokens inside the client projection store.
