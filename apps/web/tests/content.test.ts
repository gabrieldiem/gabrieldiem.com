import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';

import { describe, expect, it } from 'vitest';

import { CONTACT_LINKS } from '../src/content/links';
import { MODELS } from '../src/content/models';
import { STANDING_ORDERS } from '../src/content/orders';
import { PLATES } from '../src/content/plates';
import { TIMELINE } from '../src/content/timeline';
import { CODE, FIXES, LINE_SCORES } from '../src/features/tuner/bugTest';

const allCopy = JSON.stringify({ CONTACT_LINKS, STANDING_ORDERS, PLATES, TIMELINE, MODELS, FIXES });

describe('content rules', () => {
  it('keeps the timeline latest first', () => {
    const years = TIMELINE.map(({ startYear }) => startYear);
    expect(years).toEqual([...years].sort((a, b) => b - a));
    expect(TIMELINE[0]?.title).toContain('Salesforce');
    expect(TIMELINE.at(-1)?.title).toContain('Technician');
  });

  it('keeps pen positions on the chart', () => {
    for (const { x } of TIMELINE) {
      expect(x).toBeGreaterThanOrEqual(0);
      expect(x).toBeLessThanOrEqual(1);
    }
  });

  it('never publishes a personal email address', () => {
    const page = readFileSync(resolve(__dirname, '../index.html'), 'utf8');
    for (const text of [allCopy, page]) {
      expect(text).not.toMatch(/mailto:|[\w.+-]+@[\w-]+\.[\w.]+/);
    }
  });

  it('writes copy without em dashes or curly quotes', () => {
    expect(allCopy).not.toMatch(/[—“”‘’]/);
  });

  it('keeps project links on https', () => {
    for (const { href } of [...PLATES, ...CONTACT_LINKS]) expect(href).toMatch(/^https:\/\//);
  });

  it('keeps bench scores on the 1 to 20 rubric and names unique', () => {
    for (const { score } of MODELS) {
      expect(score).toBeGreaterThanOrEqual(1);
      expect(score).toBeLessThanOrEqual(20);
    }
    expect(new Set(MODELS.map(({ name }) => name)).size).toBe(MODELS.length);
    expect(new Set(MODELS.map(({ full }) => full)).size).toBe(MODELS.length);
  });

  it('backs up the claim about OpenAI holding the top five places', () => {
    const top = [...MODELS].sort((a, b) => b.score - a.score).slice(0, 5);
    for (const { name } of top) expect(name).toMatch(/^gpt-/);
    expect(MODELS[5]?.name).not.toMatch(/^gpt-/);
  });

  it('backs up the numbers quoted in the remarks', () => {
    const score = (name: string) => MODELS.find((model) => model.name === name)?.score ?? NaN;
    expect(score('gpt-5.4-nano') - score('gpt-5.4')).toBeCloseTo(0.5);
    expect(score('gemini-2.5-flash') - score('gemini-2.5-pro')).toBeCloseTo(0.4);
    expect(score('gemma-4-E2B Q5_K_M') - score('gemma-4-E2B Q4_K_M')).toBeCloseTo(3.4);
    expect(score('qwen3.5:4b')).toBe(14.1);
    expect(score('Qwen3.5-4B Opus-Distilled')).toBe(12.6);
  });

  it('has one right line and one right fix in the bug test', () => {
    expect(CODE.filter(({ verdict }) => verdict === 'hit')).toHaveLength(1);
    expect(CODE.find(({ verdict }) => verdict === 'hit')?.text.trim()).toBe('to.mu.Lock()');
    expect(FIXES.filter(({ score }) => score === 20)).toHaveLength(1);
    expect(LINE_SCORES.hit).toBeGreaterThan(LINE_SCORES.near);
  });
});
