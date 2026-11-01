export interface Sound {
  setEnabled(on: boolean): void;
  /** A relay closing. */
  clunk(level?: number): void;
  /** One detent of the tuning knob. */
  tick(): void;
  /** 50 Hz mains and its harmonics, spinning up or down between two speed ratios. */
  hum(from: number, to: number, seconds: number): void;
}

type ContextClass = typeof AudioContext;

/** Everything is synthesised, so there is nothing to download. */
export function createSound(): Sound {
  let enabled = true;
  let context: AudioContext | undefined;

  const audio = (): AudioContext | null => {
    if (!enabled) return null;
    // Browsers refuse audio before the first gesture, and warn if you try.
    if (navigator.userActivation && !navigator.userActivation.hasBeenActive) return null;
    const Ctor: ContextClass | undefined =
      window.AudioContext ??
      (window as unknown as { webkitAudioContext?: ContextClass }).webkitAudioContext;
    if (!Ctor) return null;
    context ??= new Ctor();
    if (context.state === 'suspended') void context.resume();
    return context;
  };

  return {
    setEnabled(on) {
      enabled = on;
    },
    clunk(level = 1) {
      const a = audio();
      if (!a) return;
      const t = a.currentTime;
      const length = Math.floor(a.sampleRate * 0.05);
      const buffer = a.createBuffer(1, length, a.sampleRate);
      const data = buffer.getChannelData(0);
      for (let i = 0; i < length; i++) data[i] = (Math.random() * 2 - 1) * (1 - i / length) ** 3;
      const noise = a.createBufferSource();
      noise.buffer = buffer;
      const band = a.createBiquadFilter();
      band.type = 'bandpass';
      band.frequency.value = 1500;
      band.Q.value = 0.7;
      const noiseGain = a.createGain();
      noiseGain.gain.value = 0.55 * level;
      noise.connect(band).connect(noiseGain).connect(a.destination);
      noise.start(t);

      const thud = a.createOscillator();
      thud.frequency.setValueAtTime(130, t);
      thud.frequency.exponentialRampToValueAtTime(48, t + 0.11);
      const thudGain = a.createGain();
      thudGain.gain.setValueAtTime(0.45 * level, t);
      thudGain.gain.exponentialRampToValueAtTime(0.001, t + 0.14);
      thud.connect(thudGain).connect(a.destination);
      thud.start(t);
      thud.stop(t + 0.16);
    },
    tick() {
      const a = audio();
      if (!a) return;
      const t = a.currentTime;
      const osc = a.createOscillator();
      const gain = a.createGain();
      osc.type = 'square';
      osc.frequency.value = 1900;
      gain.gain.setValueAtTime(0.022, t);
      gain.gain.exponentialRampToValueAtTime(0.0005, t + 0.018);
      osc.connect(gain).connect(a.destination);
      osc.start(t);
      osc.stop(t + 0.02);
    },
    hum(from, to, seconds) {
      const a = audio();
      if (!a) return;
      const t = a.currentTime;
      const rising = to > from;
      for (const [hz, volume] of [
        [50, 0.2],
        [100, 0.13],
        [150, 0.05],
      ] as const) {
        const osc = a.createOscillator();
        const gain = a.createGain();
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(Math.max(hz * from, 8), t);
        osc.frequency.exponentialRampToValueAtTime(Math.max(hz * to, 8), t + seconds);
        gain.gain.setValueAtTime(rising ? 0.001 : volume, t);
        gain.gain.exponentialRampToValueAtTime(rising ? volume : 0.001, t + seconds * 0.92);
        if (rising) {
          gain.gain.setValueAtTime(volume, t + seconds);
          gain.gain.exponentialRampToValueAtTime(0.001, t + seconds + 0.9);
        }
        const low = a.createBiquadFilter();
        low.type = 'lowpass';
        low.frequency.value = 520;
        osc.connect(low).connect(gain).connect(a.destination);
        osc.start(t);
        osc.stop(t + seconds + 1);
      }
    },
  };
}
