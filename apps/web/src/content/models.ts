export interface BenchModel {
  /** Short name printed on the dial. */
  name: string;
  /** Full model name shown when tuned. */
  full: string;
  score: number;
  kind: 'cloud' | 'local';
  remark: string;
}

type Row = [name: string, score: number, kind: BenchModel['kind'], remark?: string, full?: string];

/**
 * Best average per model, 1 to 20, read off llm-bug-bench's leaderboard chart
 * (docs/imgs/leaderboard_latest.png in that repo). The raw results aren't committed there.
 */
const ROWS: Row[] = [
  ['gpt-5.2', 19.5, 'cloud', 'Top of the dial.'],
  ['gpt-5.4-nano', 18.7, 'cloud', 'The nano beat the full gpt-5.4 by half a point.'],
  ['gpt-5.4', 18.2, 'cloud', 'Lost to its own nano.'],
  ['gpt-5.4-mini', 18.1, 'cloud'],
  ['gpt-5.1', 18.0, 'cloud'],
  ['gemini-2.5-flash', 17.2, 'cloud', 'Flash beat Pro on this suite.'],
  ['gemini-2.5-pro', 16.8, 'cloud', 'Flash beat it by 0.4.'],
  ['gpt-4.1-mini', 16.4, 'cloud'],
  [
    'gemma-4-E2B Q5_K_M',
    15.0,
    'local',
    'Best local model on the dial.',
    'unsloth/gemma-4-E2B-it-GGUF:Q5_K_M',
  ],
  ['gemma-4-E2B Q5_K_XL', 14.7, 'local', '', 'unsloth/gemma-4-E2B-it-GGUF:Q5_K_XL'],
  ['gemma-4-E2B Q6_K_XL', 14.5, 'local', '', 'unsloth/gemma-4-E2B-it-GGUF:Q6_K_XL'],
  ['gemma-4-E4B Q3_K_S', 14.5, 'local', '', 'unsloth/gemma-4-E4B-it-GGUF:Q3_K_S'],
  ['qwen3.5:4b', 14.1, 'local'],
  [
    'Ministral-3-14B Reasoning',
    12.9,
    'local',
    '',
    'unsloth/Ministral-3-14B-Reasoning-2512-GGUF:Q2_K_L',
  ],
  [
    'Qwen3.5-4B Opus-Distilled',
    12.6,
    'local',
    'A Qwen distilled on Claude 4.6 Opus reasoning. Plain qwen3.5:4b still beat it, 14.1 to 12.6.',
    'Jackrong/Qwen3.5-4B-Claude-4.6-Opus-Reasoning-Distilled-GGUF:Q4_K_M',
  ],
  ['gemini-2.5-flash-lite', 12.2, 'cloud'],
  ['granite4:3b-h', 12.1, 'local'],
  ['rnj-1:8b', 11.6, 'local'],
  [
    'gemma-4-E2B Q4_K_M',
    11.6,
    'local',
    'Same model as the 15.0, smaller quantization, 3.4 points lower.',
    'unsloth/gemma-4-E2B-it-GGUF:Q4_K_M',
  ],
  ['Qwen3.5-4B Q5_K_XL', 10.5, 'local', '', 'unsloth/Qwen3.5-4B-GGUF:Q5_K_XL'],
  ['gemma3:4b', 10.2, 'local'],
  ['ministral-3:3b', 10.2, 'local'],
  ['qwen2.5-coder:7b', 9.9, 'local'],
  ['granite4:3b', 9.4, 'local'],
  ['granite4:7b-a1b-h', 9.4, 'local'],
  [
    'Qwen2.5-Coder-7B Q4_K_M',
    9.0,
    'local',
    '',
    'unsloth/Qwen2.5-Coder-7B-Instruct-128K-GGUF:Q4_K_M',
  ],
  ['granite3.1-dense:8b', 8.8, 'local'],
  ['qwen3.5:2b', 8.8, 'local'],
  ['granite3.3:2b', 8.5, 'local'],
  ['glm-4-9b IQ4_XS', 8.1, 'local', '', 'bartowski/glm-4-9b-chat-GGUF:IQ4_XS'],
  ['granite4:1b', 7.5, 'local'],
  ['granite-code:8b', 6.9, 'local'],
  ['lfm2.5-thinking:1.2b', 6.9, 'local'],
  ['granite3.1-dense:2b', 6.8, 'local'],
  ['qwen2.5-coder:3b', 6.6, 'local'],
  ['granite4:1b-h', 5.8, 'local'],
  ['qwen2.5-coder:1.5b', 5.3, 'local'],
  ['granite3.1-moe:3b', 5.2, 'local'],
  ['granite3.1-moe:1b', 4.4, 'local'],
  ['gemma3:1b', 4.2, 'local'],
  ['granite-code:3b', 3.9, 'local'],
  ['granite4:350m', 3.5, 'local'],
  ['qwen2.5-coder:0.5b', 3.5, 'local'],
  ['qwen3.5:0.8b', 3.4, 'local'],
  ['granite4:350m-h', 3.2, 'local', 'Last on the dial.'],
];

export const MODELS: BenchModel[] = ROWS.map(([name, score, kind, remark, full]) => ({
  name,
  full: full ?? name,
  score,
  kind,
  remark: remark ?? '',
}));
