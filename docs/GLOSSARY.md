# Glossary

Use these names in code, docs and conversation.

| Term | Meaning |
|---|---|
| **Plant** | The simulated cluster behind the page. `features/plant/plant.ts` |
| **Replica** | One of G1, G2, G3. Simulated, and feeds part of the name |
| **Section** | The part of the name a replica feeds. Each has one owner |
| **Owner** | The replica feeding a section right now. 0 means nobody |
| **Breaker** | The switch that kills or restores a replica |
| **Trip** | Opening a breaker. Counted in the checkpoint |
| **Feeder** | A replica's cabinet: tag plate, load meter, breaker |
| **Bus** | The lines joining letters to a feed. There's a middle bus and a low bus |
| **Riser** | A vertical line joining the two buses |
| **Stub** | The line from the low bus down to a feeder |
| **Tie** | The link between neighbouring sections. It carries current only during a takeover |
| **Failover** | A section passing to another replica after its owner dies |
| **Blackout** | All replicas down. The full-screen dark state |
| **Black start** | Restarting from nothing with the knife switch. A real power-grid term |
| **Checkpoint** | The session state in `localStorage`. The real part of the simulation |
| **Session** | One visitor's checkpoint, identified by a four-character ID |
| **Tape** | The teleprinter log on the board |
| **Recorder** | The strip chart section with the career |
| **Paper** / **pen** / **carriage** | The chart surface, the marker, and the sticky rail that holds it |
| **Trace** | The pen's line. Seeded, so it never changes between visits |
| **The metal** / **the model** | The chart's left and right: close to hardware, close to LLMs |
| **Standing orders** | The typed sheet with Gabriel's rules for AI systems |
| **Tuner** | The radio section |
| **Station** | A model on the dial, or the visitor once they have a score |
| **Bug test** | The one bench test visitors can take |
| **Plate** | An engraved project label |
| **Bench** | `llm-bug-bench`, Gabriel's benchmark repo |
