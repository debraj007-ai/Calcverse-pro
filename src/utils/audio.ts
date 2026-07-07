/**
 * Utility to synthesize a realistic tactile button click sound using Web Audio API.
 * This guarantees zero external assets are needed, and offers custom frequency and volume options.
 */
let isSoundEnabled = true;
let soundVolume = 0.5; // Default volume: 50%
let cachedCtx: AudioContext | null = null;

export function setSoundEnabled(enabled: boolean) {
  isSoundEnabled = enabled;
}

export function getSoundEnabled(): boolean {
  return isSoundEnabled;
}

export function setSoundVolume(volume: number) {
  soundVolume = Math.max(0, Math.min(1, volume));
}

export function getSoundVolume(): number {
  return soundVolume;
}

export function playTactileClick() {
  if (!isSoundEnabled) return;

  try {
    const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
    if (!AudioContextClass) return;

    if (!cachedCtx) {
      cachedCtx = new AudioContextClass();
    }
    const ctx = cachedCtx;
    if (ctx.state === 'suspended') {
      ctx.resume();
    }

    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    const filter = ctx.createBiquadFilter();

    // High frequency transient pop for that plasticky click sound
    osc.type = 'sine';
    osc.frequency.setValueAtTime(200, ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(1600, ctx.currentTime + 0.015);
    osc.frequency.exponentialRampToValueAtTime(80, ctx.currentTime + 0.05);

    // Filter to suppress muddy low-end and accentuate structural snap
    filter.type = 'highpass';
    filter.frequency.setValueAtTime(300, ctx.currentTime);
    filter.Q.setValueAtTime(1, ctx.currentTime);

    // Gain envelope with extremely sharp decay
    gain.gain.setValueAtTime(soundVolume * 0.1, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 0.04);

    osc.connect(filter);
    filter.connect(gain);
    gain.connect(ctx.destination);

    osc.start();
    osc.stop(ctx.currentTime + 0.05);
  } catch (err) {
    // Fail silently to avoid breaking the UI in restrictive security environments
    console.warn('Web Audio click sound failed:', err);
  }
}
