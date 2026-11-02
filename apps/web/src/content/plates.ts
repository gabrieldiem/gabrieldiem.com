export interface Plate {
  name: string;
  description: string;
  href: string;
  /** Coursework gets a blue plate, everything else is black. */
  school: boolean;
  /** Flex basis in px, so the wall doesn't read as a grid of identical cards. */
  width: number;
}

const repo = (name: string) => `https://github.com/gabrieldiem/${name}`;

export const PLATES: Plate[] = [
  {
    name: 'bucketlight',
    description:
      'Filelight for S3. Scans millions of objects into a SQLite snapshot you can zoom around in a sunburst.',
    href: repo('bucketlight'),
    school: false,
    width: 430,
  },
  {
    name: 'gymbros',
    description: 'Gym tracker for my friends. Every set moves you up a trail-map leaderboard.',
    href: repo('gymbros'),
    school: false,
    width: 340,
  },
  {
    name: 'MapaSMN',
    description:
      "Built with the people at SMN, Argentina's national weather service, to modernize how they generate alerts. Satellite, lightning and radar on one map.",
    href: 'https://github.com/fiuba-tp-g153-smn/mapasmn',
    school: false,
    width: 430,
  },
  {
    name: 'pedidos-rust',
    description:
      'Food delivery as a distributed system. Rust, actors, leader election, a data ring.',
    href: repo('pedidos-rust'),
    school: true,
    width: 360,
  },
  {
    name: 'Jazz Jackrabbit 2',
    description: 'The online multiplayer remake, in C++ with SDL2 and Qt5.',
    href: repo('JazzJackRabbit2'),
    school: true,
    width: 300,
  },
  {
    name: 'payload-as-text',
    description:
      'Wireshark plugin in Lua. Shows TCP and UDP payloads as text you can read in a column.',
    href: repo('payload-as-text-wireshark-plugin'),
    school: false,
    width: 380,
  },
  {
    name: 'maulhardt-restoration',
    description:
      "A math professor's course sites went down. I rebuilt a working copy so students could still use them.",
    href: repo('maulhardt-restoration'),
    school: false,
    width: 420,
  },
  {
    name: 'filesystem',
    description: 'In-memory FUSE filesystem in C that persists on unmount.',
    href: repo('filesystem'),
    school: true,
    width: 300,
  },
  {
    name: 'scheduler-jos',
    description: "Round-robin and priority scheduling on MIT's JOS.",
    href: repo('scheduler-jos'),
    school: true,
    width: 320,
  },
  {
    name: 'whisper-web-ui',
    description: 'Transcribes audio with Whisper. Chunks files that are too large to send whole.',
    href: repo('whisper-web-ui'),
    school: false,
    width: 420,
  },
  {
    name: 'reliable-data-transfer',
    description: 'File transfer over UDP, with the reliability written by hand.',
    href: repo('reliable-data-transfer-protocol-over-udp'),
    school: true,
    width: 420,
  },
];
