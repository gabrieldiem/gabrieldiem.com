export type TimelineBlock = { kind: 'text'; text: string } | { kind: 'note'; text: string };

export interface TimelineEntry {
  /** Pen position when it reaches this entry: 0 is the metal, 1 is the model. */
  x: number;
  /** Year the entry starts, used to keep the roll in latest-first order. */
  startYear: number;
  when: string;
  title: string;
  body: TimelineBlock[];
}

const text = (value: string): TimelineBlock => ({ kind: 'text', text: value });
const note = (value: string): TimelineBlock => ({ kind: 'note', text: value });

/** Latest first: the pen starts at today and rewinds. */
export const TIMELINE: TimelineEntry[] = [
  {
    x: 0.97,
    startYear: 2026,
    when: 'September 2026 to now',
    title: 'Principal Data & AI Architect at Salesforce',
    body: [
      text(
        'Data 360 for the data, Agentforce for the agents, and AIforce to get them into the tools people already use. Everything below this is how I got here.',
      ),
      note('the pen starts here, today'),
    ],
  },
  {
    x: 0.92,
    startYear: 2026,
    when: 'March to September 2026',
    title: 'AI Engineer and consultant at Pyyne',
    body: [
      text(
        'An agent in Microsoft Teams, built on the Claude Agent SDK, for the whole company. It writes reports with charts and runs long web research. Its replicas hand sessions over through Redis and Blob Storage.',
      ),
      note('the three replicas up top come from here'),
      text(
        'Also Databricks pipelines on Prefect, with an LLM layer that picks the model and reasoning level for each task to keep inference costs down.',
      ),
      text(
        'Same month at UBA, I moved to Distributed Systems I, where I still coach capstone teams and research how to tell when a model wrote the assignment.',
      ),
    ],
  },
  {
    x: 0.84,
    startYear: 2025,
    when: 'August 2025 to March 2026',
    title: 'AI Engineer at Auronix',
    body: [
      text(
        'The same failure problem, one job earlier. Shopping agents in LangGraph and FastAPI, with conversation checkpoints in Postgres so any replica can carry on. I tried ChromaDB and Qdrant, then shipped pgvector with HNSW to cut infrastructure cost on large catalogs.',
      ),
      text(
        'Teaching starts here too. As a teaching assistant for Software Engineering II, I played product owner on the final project and signed off student releases to production.',
      ),
    ],
  },
  {
    x: 0.12,
    startYear: 2024,
    when: 'September 2024 to August 2025',
    title: 'A year back at the metal',
    body: [
      text(
        'Between IBM and Auronix, a year of coursework at UBA. A delivery system in Rust built on actors, with leader election over TCP and UDP. Reliable data transfer over UDP. Parallel parsing with fork-join in Rust.',
      ),
      note('leader elections first, replicated agents after'),
    ],
  },
  {
    x: 0.78,
    startYear: 2023,
    when: 'September 2023 to September 2024',
    title: 'AI Engineer at IBM, Client Engineering',
    body: [
      text(
        'RAG pipelines on Elasticsearch with multilingual E5 embeddings and hybrid search, for conversational search at enterprise clients across Latin America.',
      ),
      note('where the pen first crossed over to the model side'),
    ],
  },
  {
    x: 0.46,
    startYear: 2022,
    when: 'October 2022 to September 2023',
    title: 'Developer at IBM, Client Engineering',
    body: [
      text(
        "No models yet. A MERN app that writes cold-chain logistics records to IBM's blockchain, so clients can check the history. A Kotlin Android app with passkey sign-in for a bank.",
      ),
      note('first job on the roll'),
    ],
  },
  {
    x: 0.2,
    startYear: 2019,
    when: '2019 to 2026',
    title: 'Software Engineering at the University of Buenos Aires',
    body: [
      text(
        "The degree runs under every job above. It started with data structures in C, then a car dealer in Rails themed after GTA V's Legendary Motorsport, then a Starcraft-style strategy game in Java.",
      ),
    ],
  },
  {
    x: 0.05,
    startYear: 2013,
    when: '2013 to 2018',
    title: 'Technician in electromechanical equipment',
    body: [
      text(
        'The end of the roll, and the far left of the chart. High school at Instituto Línea Cuchilla 1104, equipment and installations, and an Outstanding Recognition at the 2018 National Electromechanics Olympiad.',
      ),
      note('this is why the page is a switchboard'),
    ],
  },
];
