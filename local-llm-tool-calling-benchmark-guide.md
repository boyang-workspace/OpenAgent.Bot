# Local LLM Tool Calling Benchmark: Why 27B Models Beat 397B at Real-World Agent Tasks

**Meta Description**: Discover how ToolCall-15 reveals the surprising truth about local LLM tool calling. Learn why Qwen3.5-27B outperforms 397B models in real agent workflows and how to benchmark your own models. (158 chars)

---

Bigger isn't always better. When @stevibe tested every Qwen3.5 model size from 0.8B to 397B on real-world tool calling tasks, the results upended conventional wisdom: **the 27B dense model scored a perfect 15/15, while the 397B giant failed two tests.**

The 122B failed one. The 35B failed two. The problem wasn't capability — it was trust. Large models ignored their own tool outputs and hallucinated from memory instead.

In this guide, you'll learn:
- What ToolCall-15 measures and why it matters for local AI agents
- The 5 categories of tool use failure that break real-world agents
- Why mid-size dense models dominate tool calling (and big models don't)
- How to run the benchmark on your own hardware
- Practical takeaways for building reliable local agent pipelines

---

## What Is ToolCall-15?

ToolCall-15 is an open-source benchmark framework created by [@stevibe](https://github.com/stevibe) for evaluating how well local LLMs handle tool calling. Unlike abstract academic benchmarks, ToolCall-15 tests practical scenarios that directly translate to real agent workloads.

The benchmark is built around three core principles:

| Principle | Why It Matters |
|-----------|---------------|
| **Deterministic** | Mocked tool responses and temperature 0 ensure reproducible results |
| **Inspectable** | Every prompt, tool definition, and scoring rule is versioned in the repo |
| **Balanced** | 15 scenarios spread across 5 distinct failure modes — not overfit to one skill |

### Supported Providers

ToolCall-15 works with any OpenAI-compatible endpoint:

- **OpenRouter** — cloud models for baseline comparison
- **Ollama** — most popular local inference engine
- **llama.cpp** — lightweight CPU/GPU inference
- **MLX** — Apple Silicon optimized
- **LM Studio** — GUI-friendly local serving

---

## The 5 Tool Calling Categories That Break Agents

ToolCall-15 tests 15 scenarios across 5 categories — 3 scenarios each. These aren't theoretical; they're the exact failure modes that plague production agent pipelines.

### 1. Tool Selection (3 scenarios)

Can the model pick the right tool from a set of available options?

**Why it fails**: Models confuse similar tool names or pick a "close enough" tool when the exact match exists. This is the most basic skill, yet many models stumble here.

### 2. Parameter Precision (3 scenarios)

Does the model extract and pass parameters correctly from user input?

**Why it fails**: Models round numbers, invent default values, or pass parameters in the wrong format. A weather tool expecting `"city": "Tokyo"` might receive `"location": "Tokyo"` instead.

### 3. Multi-Step Chains (3 scenarios)

Can the model sequence multiple tool calls where the second depends on the first?

**Why it fails**: The hardest category. Models often drop the dependency chain, hallucinate intermediate results, or call tools in the wrong order. This is where the 397B models collapsed.

### 4. Restraint and Refusal (3 scenarios)

Does the model refuse to call a tool when no tool applies?

**Why it fails**: Some models call tools unnecessarily — asking for weather when the user asked about the time, or making up data when they should say "I don't know."

### 5. Error Recovery (3 scenarios)

When a tool returns an error, does the model handle it gracefully?

**Why it fails**: Models either ignore the error and pretend the call succeeded, or crash into a retry loop that wastes tokens and time.

---

## The Surprising Benchmark Results

@stevibe tested every Qwen3.5 variant — 0.8B, 4B, 9B, 27B (dense), 27B (distilled), 35B (MoE), 122B (MoE), and 397B (MoE) — across all 15 scenarios.

| Model | Size | Score | Failure Mode |
|-------|------|-------|-------------|
| Qwen3.5-27B (dense) | 27B | **15/15** | — |
| Qwen3.5-27B (distilled) | 27B | **15/15** | — |
| Qwen3.5-122B (MoE) | 122B | 14/15 | Ignored tool result, used internal knowledge |
| Qwen3.5-35B (MoE) | 35B | 13/15 | Multi-step chain breakdown |
| Qwen3.5-397B (MoE) | 397B | 13/15 | Hallucinated data over tool output |
| Qwen3.5-9B | 9B | Partial | Timed out on complex chains |
| Qwen3.5-4B | 4B | Partial | Tool selection errors |

### The Killer Test

The scenario that exposed the most models: **"Search for Iceland's population, then calculate 2% of it."**

Simple. Two steps. Chain the result.

- **Qwen3.5-35B**: Used a rounded number from memory (332,000) instead of the search result.
- **Qwen3.5-122B**: Same — ignored the tool, used internal knowledge.
- **Qwen3.5-397B**: Same pattern. Didn't trust its own output.
- **Qwen3.5-27B**: Searched, got 393,000, calculated 2% = 7,860. Correct.

> **Key Insight**: Small models hallucinate data. Big models ignore data. The 27B just threaded it through.

---

## Why Mid-Size Dense Models Dominate Tool Calling

Three structural reasons explain the 27B's surprising victory:

### 1. MoE Routing Destroys Tool Focus

Mixture-of-Experts (MoE) models activate only a subset of parameters per token. This works well for general reasoning but creates a mismatch for tool calling: the "experts" that handle tool invocation are competing with the "experts" that hold parametric knowledge. When both activate simultaneously, the knowledge experts override the tool-use experts.

Dense models like the 27B don't have this problem — every parameter activates for every token, so tool-use and knowledge-use are integrated, not competing.

### 2. Confidence-Data Tradeoff

Larger models have more parametric knowledge, which makes them more confident in their internal answers. When a tool returns data that contradicts internal knowledge, the model "trusts" its training data over the tool output.

Mid-size models have enough capability to process tool output correctly but not so much knowledge that they override it.

### 3. Chain-of-Thought Contamination

In MoE architectures, tool calls that occur during thinking mode (`<think>` blocks) can be silently dropped or corrupted. vLLM's `--tool-call-parser` settings and custom chat templates are actively evolving to fix this — but dense models avoid the issue entirely.

---

## How to Run the Benchmark Yourself

ToolCall-15 is MIT-licensed and runs in under 30 minutes once configured.

### Prerequisites

- Node.js 18+
- A running inference provider (Ollama, llama.cpp, or any OpenAI-compatible endpoint)

### Setup

```bash
git clone https://github.com/stevibe/ToolCall-15
cd ToolCall-15
cp .env.example .env
npm install
```

### Configure Models

Edit `.env` to point to your providers:

```env
OLLAMA_HOST=http://localhost:11434
LLAMACPP_HOST=http://localhost:8080

LLM_MODELS=ollama:qwen3.5:27b,ollama:qwen3.5:35b,llamacpp:path/to/model.gguf
```

### Run

```bash
npm run dev
```

Open `http://localhost:3000` to see the live dashboard. The benchmark streams results as Server-Sent Events — you watch each scenario pass or fail in real time.

### Read the Results

The dashboard renders a color-coded matrix:
- **Green (🟢)** = Pass
- **Yellow (🟡)** = Partial pass
- **Red (🔴)** = Fail

Each cell is clickable to inspect the raw trace — every system prompt, tool call, and model response is recorded.

---

## Beyond ToolCall-15: The BenchLocal Ecosystem

Building on ToolCall-15's methodology, @stevibe released [BenchLocal](https://github.com/stevibe/BenchLocal) — a desktop app for running multiple Bench Packs:

| Bench Pack | Focus | Scenarios |
|-----------|-------|-----------|
| **ToolCall-15** | Tool selection and chaining | 15 |
| **BugFind-15** | Bug detection in code | 15 |
| **DataExtract-15** | Structured data extraction | 15 |
| **InstructFollow-15** | Instruction adherence | 15 |
| **ReasonMath-15** | Mathematical reasoning | 15 |
| **StructOutput-15** | Structured output formatting | 15 |
| **HermesAgent-20** | Full agentic workflow | 20 |

BenchLocal handles provider configuration, model registry, run execution, and result persistence — so you can benchmark holistically without scripting each pack separately.

---

## Practical Implications for Building Local AI Agents

### For Agent Pipelines

If you're building tool-calling agents with local models:

1. **Test your model on ToolCall-15 before shipping** — a model that fails multi-step chains today will fail them in production tomorrow.

2. **Prefer 27B dense models for judgment-sensitive tasks** — the Qwen3.5-27B dense is the current sweet spot for reliability.

3. **Watch for the "ignore tool output" failure** — if your agent has access to live data but returns cached answers, your model is overriding external results with parametric knowledge.

### For Hardware Planning

| Use Case | Recommended Model | VRAM Needed |
|----------|------------------|-------------|
| Tool-calling agent | Qwen3.5-27B (dense) | 14-16 GB |
| High-throughput chat | Qwen3.5-35B-A3B (MoE) | 12-15 GB |
| Coding + tool use | Qwen3.5-122B-A10B (MoE) | 48+ GB |
| Edge/phone deployment | Qwen3.5-4B | 4-6 GB |

### For Model Selection Strategy

The data suggests a simple decision tree:

```
Need tool calling?
├── Can run 27B dense? → Use Qwen3.5-27B (best reliability)
├── Need max speed? → Use Qwen3.5-9B (acceptable, faster)
└── Need max capability? → Use Qwen3.5-122B (more capable, verify chains)
```

> **Important**: MoE models aren't _bad_ at tool calling. The 122B scores 72.2 on BFCL-V4, beating GPT-5 mini. But for _reliable_ single-attempt tool use where you can't afford retries, the 27B dense is the safer choice.

---

## Frequently Asked Questions

### What makes ToolCall-15 different from other LLM benchmarks?

Most benchmarks test general intelligence or knowledge. ToolCall-15 isolates pure tool-use behavior — it doesn't measure what the model knows, it measures whether the model can use tools correctly. Mocked responses ensure you're testing orchestration, not external API quality.

### Should I use ToolCall-15 or BenchLocal?

Use ToolCall-15 directly if you want a quick, focused tool-calling evaluation. Use BenchLocal if you need to run multiple benchmark types (tool calling, bug finding, data extraction, etc.) with shared provider configuration and result history.

### Can I add my own scenarios?

Yes. ToolCall-15's scenarios are defined in `lib/benchmark.ts` — each scenario has a system prompt, tool definitions, expected tool calls, and scoring logic. The repo is MIT-licensed and designed for extension.

### Do these results apply to cloud APIs too?

The benchmark supports OpenRouter, so yes — you can compare GPT-4, Claude, and local models on the same 15 scenarios. The finding about tool-output trust is primarily a local model observation. Cloud models generally handle this better because they've been fine-tuned specifically for function calling.

### Does Qwen3.5 tool calling work with Ollama?

Ollama v0.17.3+ fixed parsing of tool calls emitted during thinking mode. However, Ollama still has known issues with multi-turn tool calling — prompts can contain unclosed `<think>` tags, corrupting subsequent turns. For reliable tool calling, use llama.cpp or vLLM.

---

## Conclusion

@stevibe's ToolCall-15 benchmark delivered a counterintuitive finding that matters for anyone building local AI agents: **bigger models don't mean better tool calling.**

The Qwen3.5-27B dense model scored a perfect 15/15 while larger models failed — not because they lacked capability, but because they couldn't trust their own tool outputs. They prioritized internal knowledge over external data, a failure mode that breaks agentic workflows where tool results are the single source of truth.

If you're evaluating models for a local agent pipeline, start with ToolCall-15. It's free, open source, and takes 30 minutes to run. The insight it surfaces — that tool-use reliability peaks at mid-scale — could save you weeks of debugging in production.

**Ready to benchmark your own models?** Clone [ToolCall-15 on GitHub](https://github.com/stevibe/ToolCall-15) and run your first comparison today. For deeper evaluation, install [BenchLocal](https://github.com/stevibe/BenchLocal) for multi-pack testing with persistent history.

---

*Further reading: [Run local LLMs with Ollama](https://ollama.ai) · [vLLM tool calling setup guide](https://docs.vllm.ai) · [Qwen3.5 model family overview](https://qwenlm.github.io)*

*Sources: [ToolCall-15 GitHub Repository](https://github.com/stevibe/ToolCall-15) · [BenchLocal Architecture Documentation](https://github.com/stevibe/BenchLocal) · [@stevibe on X](https://x.com/stevibe) · [InsiderLLM Qwen 3.5 Guide](https://insiderllm.com/guides/qwen-3-5-local-guide/) · [ArXiv 2605.17172 - Personal AI on Personal Devices](https://arxiv.org/html/2605.17172v1)*
