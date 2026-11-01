# Product

An About Me page for Gabriel Diem that also says what he likes about AI. It has to work for a recruiter reading on a phone and for an engineer who wants to break something. The current role and what he does are in the first screen, in plain words. Everything else rewards staying.

## Sections, in order

1. **Board.** The name as a live circuit, three breakers, load meters, the plant log. Tripping a breaker fails its letters over to a neighbour. Tripping all three blacks out the page, and the visitor restarts it with the knife switch.
2. **Recorder.** The career on a strip chart, latest first. The pen starts at today and rewinds to high school. Left is the metal, right is the model, and the page says the swing is an opinion.
3. **Orders.** How he likes AI: standing orders, each backed by something he built.
4. **Tuner.** `llm-bug-bench` results as a radio dial, and one real test from the bench that puts the visitor on the dial with their own score.
5. **Plates.** Other projects. Black is personal, blue is coursework.
6. **Phone.** Public profile links and the note about what's simulated.

## Content rules

- **No personal email on the site.** Contact goes through LinkedIn, GitHub and dev.to. `tests/content.test.ts` enforces it.
- **The timeline runs latest first.** Copy reads as a rewind: each entry leads back to the one below it. Enforced by the same test.
- **Be honest about the simulation.** The replicas are simulated and the page says so. The checkpoint and the other windows are real.
- **Numbers are real.** Bench scores come from the `llm-bug-bench` leaderboard. Remarks that quote a number are checked against the data in tests.
- **Say the awkward part.** The bench's judge is an OpenAI model and OpenAI holds the top five places, so the page says that next to the results.
- **Writing.** First person, plain verbs, specific. No em dashes or curly quotes (tested). Run the `unslop` skill on new copy.
- **Facts come from Gabriel.** His resume and repos are the sources. Inferred or drafted lines that he hasn't confirmed are `decide` items in `BACKLOG.md`.

## Behaviour rules

- A section is fed by its own replica while that replica is alive. When it dies, the section goes dark for about a second, then a neighbour takes over: replica 1 and 3 prefer 2, replica 2 prefers 1.
- The name stays lit as long as one replica lives.
- Load is shared: each live replica's meter shows 94% divided by the live count.
- The on-site clock stops in the dark and resumes from the same value.
- Session ID, visits, on-site seconds, trips, the sound setting and the visitor's score persist in `localStorage`.
- Breakers and blackouts are shared across windows of the same browser.
- Bug test: wrong line 3, close line 9, right line 15, then a follow-up question for 20, 13 or 12. Scores use the bench's rubric, and the page notes the visitor did one question against the models' twelve.
