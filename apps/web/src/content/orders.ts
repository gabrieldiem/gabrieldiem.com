export interface StandingOrder {
  order: string;
  detail: string;
}

export const STANDING_ORDERS: StandingOrder[] = [
  {
    order: 'Assume the replica dies mid-conversation.',
    detail:
      'State lives outside the process. LangGraph checkpoints in Postgres at Auronix, Redis and Blob Storage at Pyyne.',
  },
  {
    order: 'Send each task to the cheapest model that can do it.',
    detail: "The biggest model doesn't always win anyway. The tuner below has the numbers.",
  },
  {
    order: "If you can't trace it, don't ship it.",
    detail: 'Langfuse on agent runs and tool calls, before anyone asks why it did that.',
  },
  {
    order: 'Test against real inference.',
    detail:
      "Integration tests that call the live LLM in CI. Slower and more expensive, and they catch what mocks can't.",
  },
  {
    order: 'Keep one running at home.',
    detail: 'Ollama and llama.cpp for the bench, local Whisper for transcribing audio.',
  },
  {
    order: 'Put it where people already work.',
    detail: 'Teams, for the agent at Pyyne. AIforce, now.',
  },
  {
    order: 'Make the agents keep the docs.',
    detail:
      'Custom skills with scripts, examples and a style guide, so the documentation and diagrams stay current.',
  },
];
