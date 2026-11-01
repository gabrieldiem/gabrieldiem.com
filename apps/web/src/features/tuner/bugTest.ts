export type LineVerdict = 'hit' | 'near' | 'miss';

export interface CodeLine {
  text: string;
  verdict: LineVerdict | null;
}

const line = (text: string, verdict: LineVerdict | null = 'miss'): CodeLine => ({ text, verdict });

/** go_deadlock_002 from llm-bug-bench, shortened to fit a phone. */
export const CODE: CodeLine[] = [
  line('func transfer(from, to *Acct, amt int) {'),
  line('    from.mu.Lock()', 'near'),
  line('    defer from.mu.Unlock()'),
  line('    to.mu.Lock()', 'hit'),
  line('    defer to.mu.Unlock()'),
  line('    if from.balance >= amt {'),
  line('        from.balance -= amt'),
  line('        to.balance += amt'),
  line('    }'),
  line('}'),
  line('', null),
  line('go transfer(a, b, 100)'),
  line('go transfer(b, a, 50)', 'near'),
];

/** Scores follow the bench's own 1 to 20 rubric. */
export const LINE_SCORES: Record<LineVerdict, number> = { miss: 3, near: 9, hit: 15 };

export const LINE_TEXT: Record<LineVerdict, string> = {
  miss: 'The rubric calls this a hallucinated bug. Nothing can block on that line. Try another one.',
  near: "Right neighbourhood, this line is part of it, but it doesn't wait on anything. Which one does?",
  hit: 'Found it. One goroutine holds a and waits for b. The other holds b and waits for a. Neither lets go. How do you fix it?',
};

export interface FixOption {
  label: string;
  score: number;
  text: string;
}

export const FIXES: FixOption[] = [
  {
    label: 'Always lock the two accounts in the same order, by ID',
    score: 20,
    text: "Right. That's the full marks answer. Now look at the dial, you're past every model I tested.",
  },
  {
    label: 'Add a time.Sleep before the second lock',
    score: 13,
    text: 'Sleep only makes the race rarer, and rarer is worse because it passes your tests. Lock in a fixed order.',
  },
  {
    label: 'Buffer the channel',
    score: 12,
    text: "There's no channel in this program. That's the kind of confident answer the low end of the dial gives.",
  },
];
