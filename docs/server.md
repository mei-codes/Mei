# Server

`@odin/server` is a small Fastify service. It owns the OpenAI key and exposes
two routes.

## Environment

| Variable | Required | Default |
| --- | --- | --- |
| `OPENAI_API_KEY` | yes | — |
| `OPENAI_MODEL` | no | `gpt-4o-mini` |
| `OPENAI_MAX_OUTPUT_TOKENS` | no | `700` |
| `PORT` | no | `3030` |
| `HOST` | no | `0.0.0.0` |

## Routes

### `GET /api/health`

Returns runtime info — name, version, runtime, provider, protected flag, and
the active model.

### `POST /api/agent`

```json
{
  "prompt": "plan a Railway deploy",
  "messages": [
    { "role": "user", "content": "earlier turn" },
    { "role": "assistant", "content": "earlier reply" }
  ]
}
```

Success bodies have `ok: true`. Errors share one shape:

```json
{ "ok": false, "error": { "code": "rate_limited", "message": "..." } }
```

Common codes so far: `bad_request`, `upstream_failed`, `internal`, `not_found`.
