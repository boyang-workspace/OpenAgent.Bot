# Local Blog Workbench

This package supports a local-first blog workflow with:

- manual topic creation in `/admin/blog`
- editable drafts with review + human approval
- Prompt Lab in `/admin/blog-lab`
- optional local model generation and review via Ollama

## Local model setup

1. Start Ollama:

```bash
ollama serve
```

2. Pull at least one supported model:

```bash
ollama pull gemma4:e4b
ollama pull qwen3.5:9b
```

3. Copy `.dev.vars.example` to `.dev.vars` and adjust values if needed.

Important variables:

- `OLLAMA_BASE_URL=http://127.0.0.1:11434`
- `OLLAMA_DEFAULT_MODEL=gemma4:e4b`

If the local model is unavailable, the app falls back to deterministic template generation for topic drafts and structural review for draft review/debug steps.

## Run locally

One-click start on macOS:

```bash
./OpenAgent\ Blog\ Workbench.command
```

Or just click:

```text
OpenAgent Blog Workbench.app
```

The launcher will:

- copy `.dev.vars.example` to `.dev.vars` if needed
- start `ollama serve` if it is not already running
- auto-pick a local model, preferring `gemma4:e4b`
- run `npm install`
- apply local D1 migrations
- start the local admin runtime on port `8788`
- open `/admin/blog/` in your browser

Manual equivalent:

```bash
npm install
npm run d1:migrations:local
npm run dev:admin
```

## Prompt Lab

Use `/admin/blog-lab/` to:

- create prompt versions
- create outline template versions
- activate a version
- run sandbox outline, draft, or review steps against a topic or draft
- inspect the prompt, template, raw model output, and parsed output

Sandbox debug runs do not create publish PRs and do not mutate the formal publish queue.

## Local package

To generate a distributable tarball:

```bash
npm run package:local
```

The archive is written to:

```text
output/openagent-blog-workbench-local.tar.gz
```

After unpacking it, run:

```bash
./OpenAgent\ Blog\ Workbench.command
```
