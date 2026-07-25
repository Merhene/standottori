/** Tiny procedural arcade SFX — no audio files required */

let ctx: AudioContext | null = null;

function getCtx(): AudioContext | null {
  if (typeof window === 'undefined') return null;
  if (!ctx) {
    const AC = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    if (!AC) return null;
    ctx = new AC();
  }
  return ctx;
}

function tone(
  audio: AudioContext,
  {
    type = 'square',
    freq,
    freqEnd,
    start,
    dur,
    gain = 0.08,
    attack = 0.005,
    decay,
  }: {
    type?: OscillatorType;
    freq: number;
    freqEnd?: number;
    start: number;
    dur: number;
    gain?: number;
    attack?: number;
    decay?: number;
  }
) {
  const osc = audio.createOscillator();
  const g = audio.createGain();
  osc.type = type;
  osc.frequency.setValueAtTime(freq, start);
  if (freqEnd != null) {
    osc.frequency.exponentialRampToValueAtTime(Math.max(freqEnd, 1), start + dur);
  }
  g.gain.setValueAtTime(0.0001, start);
  g.gain.exponentialRampToValueAtTime(gain, start + attack);
  g.gain.exponentialRampToValueAtTime(0.0001, start + (decay ?? dur));
  osc.connect(g);
  g.connect(audio.destination);
  osc.start(start);
  osc.stop(start + dur + 0.02);
}

/** Mechanical START button clack */
export function playClack() {
  const audio = getCtx();
  if (!audio) return;
  void audio.resume();
  const t = audio.currentTime;
  tone(audio, { type: 'triangle', freq: 180, freqEnd: 60, start: t, dur: 0.08, gain: 0.14 });
  tone(audio, { type: 'square', freq: 90, freqEnd: 40, start: t + 0.01, dur: 0.1, gain: 0.08 });
}

/** Coin hitting the slot */
export function playClink() {
  const audio = getCtx();
  if (!audio) return;
  void audio.resume();
  const t = audio.currentTime;
  tone(audio, { type: 'sine', freq: 1400, freqEnd: 900, start: t, dur: 0.12, gain: 0.1 });
  tone(audio, { type: 'triangle', freq: 2200, freqEnd: 1100, start: t + 0.02, dur: 0.18, gain: 0.06 });
  tone(audio, { type: 'sine', freq: 600, freqEnd: 200, start: t + 0.05, dur: 0.25, gain: 0.07 });
}

/** Soft power surge bloom */
export function playPowerSurge() {
  const audio = getCtx();
  if (!audio) return;
  void audio.resume();
  const t = audio.currentTime;
  tone(audio, { type: 'sawtooth', freq: 55, freqEnd: 120, start: t, dur: 0.45, gain: 0.05, attack: 0.02 });
  tone(audio, { type: 'sine', freq: 220, freqEnd: 440, start: t + 0.05, dur: 0.5, gain: 0.04 });
}

/** Panel lock thud */
export function playPanelLock() {
  const audio = getCtx();
  if (!audio) return;
  void audio.resume();
  const t = audio.currentTime;
  tone(audio, { type: 'triangle', freq: 140, freqEnd: 70, start: t, dur: 0.09, gain: 0.07 });
}
