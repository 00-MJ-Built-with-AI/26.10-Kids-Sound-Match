import { audioEngine } from './audioEngine';

/**
 * Sounds made on the phone, with no files: the notes of Make music (a xylophone bar, a soft piano,
 * a drum) and the sleep light's rain, waves and lullaby.
 */
const ctx = () => audioEngine.audioContext;

/** A C-major scale from middle C, the xylophone's 8 bars. */
export const SCALE = [261.63, 293.66, 329.63, 349.23, 392.0, 440.0, 493.88, 523.25];

export type Voice = 'xylo' | 'piano' | 'drum';

export function playNote(freq: number, voice: Voice = 'xylo', volume = 0.35): void {
  const c = ctx();
  if (c.state === 'suspended') void c.resume();
  const t = c.currentTime;
  const out = c.createGain();
  out.connect(c.destination);
  if (voice === 'drum') {
    // A soft round thump: a falling sine and a puff of noise.
    const o = c.createOscillator();
    o.type = 'sine';
    o.frequency.setValueAtTime(freq, t);
    o.frequency.exponentialRampToValueAtTime(freq * 0.45, t + 0.25);
    out.gain.setValueAtTime(volume * 1.6, t);
    out.gain.exponentialRampToValueAtTime(0.001, t + 0.4);
    o.connect(out);
    o.start(t);
    o.stop(t + 0.45);
    const n = c.createBufferSource();
    n.buffer = noiseBuffer(0.08);
    const ng = c.createGain();
    ng.gain.setValueAtTime(volume * 0.35, t);
    ng.gain.exponentialRampToValueAtTime(0.001, t + 0.08);
    n.connect(ng).connect(c.destination);
    n.start(t);
    return;
  }
  // Bell-like: the note and a quiet overtone, a quick strike, a gentle ring.
  const ring = voice === 'xylo' ? 0.9 : 1.4;
  for (const [mult, level] of voice === 'xylo' ? [[1, 1], [4, 0.18]] : [[1, 1], [2, 0.3], [3, 0.08]]) {
    const o = c.createOscillator();
    o.type = voice === 'xylo' ? 'sine' : 'triangle';
    o.frequency.value = freq * mult;
    const g = c.createGain();
    g.gain.setValueAtTime(0.0001, t);
    g.gain.exponentialRampToValueAtTime(volume * level, t + 0.008);
    g.gain.exponentialRampToValueAtTime(0.0001, t + ring / mult);
    o.connect(g).connect(out);
    o.start(t);
    o.stop(t + ring + 0.05);
  }
  out.gain.value = 1;
}

let noise: AudioBuffer | null = null;
function noiseBuffer(seconds = 2): AudioBuffer {
  const c = ctx();
  if (noise && noise.duration >= seconds) return noise;
  const b = c.createBuffer(1, Math.ceil(c.sampleRate * Math.max(seconds, 2)), c.sampleRate);
  const d = b.getChannelData(0);
  // Brown-ish noise: softer than white, closer to rain.
  let last = 0;
  for (let i = 0; i < d.length; i++) {
    const white = Math.random() * 2 - 1;
    last = (last + 0.04 * white) / 1.04;
    d[i] = last * 3.5;
  }
  noise = b;
  return b;
}

const _ = null;
/** Twinkle, twinkle (the lullaby she knows), as scale steps from middle C; null is a rest. */
export const TWINKLE: (number | null)[] = [0, 0, 4, 4, 5, 5, 4, _, 3, 3, 2, 2, 1, 1, 0, _, 4, 4, 3, 3, 2, 2, 1, _, 4, 4, 3, 3, 2, 2, 1, _, 0, 0, 4, 4, 5, 5, 4, _, 3, 3, 2, 2, 1, 1, 0, _];
/** Happy birthday (-3 is the G below middle C). */
export const BIRTHDAY: (number | null)[] = [-3, -3, -2, -3, 0, -1, _, -3, -3, -2, -3, 1, 0, _, -3, -3, 4, 2, 0, -1, -2, _, 3, 3, 2, 0, 1, 0, _];
/** A scale step (0 = C) as a frequency, any octave. */
export const stepFreq = (step: number) => 261.63 * Math.pow(2, ([0, 2, 4, 5, 7, 9, 11][((step % 7) + 7) % 7] + 12 * Math.floor(step / 7)) / 12);

export type Ambient = 'rain' | 'waves' | 'lullaby' | 'none';

/** Starts a sleep sound; returns a function that fades it out over `fadeSec` and stops it. */
export function startAmbient(kind: Ambient, volume = 0.5): (fadeSec?: number) => void {
  if (kind === 'none') return () => undefined;
  const c = ctx();
  if (c.state === 'suspended') void c.resume();
  const master = c.createGain();
  master.gain.setValueAtTime(0.0001, c.currentTime);
  master.gain.exponentialRampToValueAtTime(volume, c.currentTime + 3);
  master.connect(c.destination);
  const stops: (() => void)[] = [];

  if (kind === 'rain' || kind === 'waves') {
    const src = c.createBufferSource();
    src.buffer = noiseBuffer(4);
    src.loop = true;
    const filter = c.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.value = kind === 'rain' ? 1400 : 500;
    const swell = c.createGain();
    swell.gain.value = kind === 'rain' ? 0.6 : 0.35;
    src.connect(filter).connect(swell).connect(master);
    if (kind === 'waves') {
      // A slow swell, like waves coming in every 8 seconds.
      const lfo = c.createOscillator();
      lfo.frequency.value = 0.12;
      const depth = c.createGain();
      depth.gain.value = 0.3;
      lfo.connect(depth).connect(swell.gain);
      lfo.start();
      stops.push(() => lfo.stop());
    }
    src.start();
    stops.push(() => src.stop());
  } else {
    // The lullaby, slowly, over and over, on a soft piano.
    let i = 0;
    const tick = () => {
      const step = TWINKLE[i % TWINKLE.length];
      i++;
      if (step === null) return;
      const o = c.createOscillator();
      o.type = 'sine';
      o.frequency.value = stepFreq(step);
      const g = c.createGain();
      const t = c.currentTime;
      g.gain.setValueAtTime(0.0001, t);
      g.gain.exponentialRampToValueAtTime(0.22, t + 0.03);
      g.gain.exponentialRampToValueAtTime(0.0001, t + 1.6);
      o.connect(g).connect(master);
      o.start(t);
      o.stop(t + 1.7);
    };
    const timer = window.setInterval(tick, 700);
    stops.push(() => window.clearInterval(timer));
  }

  return (fadeSec = 2) => {
    const t = c.currentTime;
    master.gain.cancelScheduledValues(t);
    master.gain.setValueAtTime(Math.max(master.gain.value, 0.0001), t);
    master.gain.exponentialRampToValueAtTime(0.0001, t + fadeSec);
    window.setTimeout(() => {
      stops.forEach((s) => {
        try {
          s();
        } catch {
          /* already stopped */
        }
      });
      master.disconnect();
    }, fadeSec * 1000 + 100);
  };
}
