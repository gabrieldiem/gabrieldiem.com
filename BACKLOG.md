# Backlog

One line per item. Sections: **Decide** needs Gabriel's answer, **Later** is planned work, **Tech debt** is known debt. See the `backlog` skill.

## Decide

- [ ] **Confirm the AI opinions** (product, S): "I like AI the way I like any machine", the seven standing orders and "Yes, I see the irony" were drafted from his resume, not said by him. He cut "Demos don't tell me much." on 2026-11-02, and "tells me what I need to know" replaced the sentence that answered it. Done when he has approved or rewritten them. _Added 2026-11-01_
- [ ] **Confirm the 2024 to 2025 gap** (product, S): "A year of coursework at UBA" is inferred from repos tagged 1Q2025. Done when confirmed or corrected. _Added 2026-11-01_
- [ ] **Confirm the judge caveat** (product, S): the page says the bench's judge is an OpenAI model, from the README's default. Check it was the judge for the published chart, and that he wants this said. _Added 2026-11-01_
- [ ] **Confirm three timeline lines** (product, S): "where I still coach capstone teams", "first job on the roll", and "leader elections first, replicated agents after", which hints the coursework led to the agents. _Added 2026-11-01_
- [ ] **Where the site is hosted** (infra, S): `gabrieldiem.com` points at 167.114.68.52, which wasn't answering on 2026-11-01. The deploy is built for the Portainer edge that runs GYMBROS and stays off until he chooses. _Added 2026-11-01_

## Later

- [ ] **Go live** (infra, M): the steps in the README's "Going live" section. Done when `DEPLOY_ENABLED` is on and a master push reaches https://gabrieldiem.com. _Added 2026-11-01_
- [ ] **Spanish version** (web, L): a rotary EN/ES switch on the board. GYMBROS has the pattern (`en.ts`, `es.ts`, `t()`), and `src/content/` keeps the copy ready to move. _Added 2026-11-01_
- [ ] **Prerender the page** (web, M): crawlers and no-JS visitors only get the noscript summary. Render the content into `index.html` at build time. _Added 2026-11-01_
- [ ] **Link preview image** (web, S): add `og:image`, a shot of the lit name on the panel. _Added 2026-11-01_
- [ ] **Publish the bench's raw results** (product, M): scores were read by eye off the leaderboard PNG because results aren't committed in `llm-bug-bench`. Some models in its README aren't on that chart, like `functiongemma:270m`. Regenerate `content/models.ts` from data. _Added 2026-11-01_
- [ ] **Check on real devices** (web, S): tested only in Chromium, including its phone emulation. Try a real phone, Safari and Firefox, and listen to the audio. _Added 2026-11-01_

## Tech debt

- [ ] **Content security policy** (infra, S): nginx copies the GYMBROS headers and has no CSP. With self-hosted fonts a strict one is easy. _Added 2026-11-01_
- [ ] **Axe can't judge contrast on textured panels** (web, S): it reports text over the noise backgrounds as "needs review", not as a pass. Check those pairs by hand or with a contrast script. `tests/e2e/a11y.spec.ts`. _Added 2026-11-01_

## Done

- [x] **Confirm MapaSMN**: closed 2026-11-02. He worked directly with SMN people to build it for them and modernize alert generation, so it's shown publicly on a black plate.
