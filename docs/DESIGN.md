# Design

The subject is a 1950s power-station control room, seen through someone who actually trained on this equipment. It should feel built and handled, not rendered. Every effect has a job in that world.

## Colour

Tokens live in `apps/web/src/styles/tokens.css`.

| Token | Hex | Role |
|---|---|---|
| `--sea` | `#A8C8B6` | Control-room enamel, the main panel paint |
| `--hammer` | `#47564E` | Hammertone cabinet around the recorder |
| `--bake` | `#241710` | Bakelite: breakers, line casings, plate backs |
| `--paper` | `#EDF0DF` | Chart paper, with `--grid` red rules and `--pen` ink |
| `--ballpoint` | `#1E3F9A` | Handwritten notes |
| `--g1` `--g2` `--g3` | `#F5B800` `#FF5A2E` `#5CC8FF` | One colour per replica. Colour says which replica feeds a letter |
| `--amber` | `#F8D27A` | Backlit radio dial |
| `--phos` | `#B9F6C4` | Glow-in-the-dark paint, only in the blackout |

Avoid cream with a terracotta accent, near-black with one acid accent, and soft grey card shadows. They read as generated, and none of them exist in this room.

## Type

| Face | Job |
|---|---|
| Besley | Headings and reading text, like an equipment manual |
| B612 | Engraved plates and instrument labels. It's the Airbus cockpit face |
| Courier Prime | The teleprinter and the code card. Don't use B612 Mono: its parentheses look like brackets, which misleads in code |
| Reenie Beanie | Ballpoint notes in the margins |

All caps is for engraved plates only, because that's what plates look like. Everything else is sentence case. Body text stays under 80 characters a line.

## Layout and materials

- Each section is a different piece of equipment: enamel panel, recorder cabinet, walnut-and-bakelite radio, plate wall.
- Light comes from overhead. Shadows fall down and slightly right.
- Hardware has wear: streaked paint, screws with their slots at random angles, paper taped slightly off square. Keep it subtle.
- Structure carries meaning. Plate colour means personal or coursework, line colour means which replica, and tie breakers light up only while they carry current. Numbers appear only on the standing orders, which real orders would have.

## Motion

- Only the current in the name and the meter needles move on their own. Everything else answers the visitor.
- The black start is the one big moment. Don't add a second one.
- Reveal-on-scroll, fade-and-slide entrances and hover transitions on every element are out. A loose plate tilting on its screw is the kind of hover that fits.
- Reduced motion keeps every behaviour and drops the theatre.
