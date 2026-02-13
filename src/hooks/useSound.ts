import { useCallback } from 'react';
import type { SoundPreset } from '../core/types';

export type SoundEvent = 'click' | 'flag' | 'win' | 'lose';

interface Note {
  freq: number;
  at: number;
  dur: number;
}

const SOUNDS: Record<SoundPreset, Record<SoundEvent, Note[]>> = {
  soft: {
    click: [{ freq: 440, at: 0, dur: 0.05 }],
    flag: [{ freq: 330, at: 0, dur: 0.06 }],
    win: [
      { freq: 523.25, at: 0, dur: 0.06 },
      { freq: 659.25, at: 0.07, dur: 0.08 }
    ],
    lose: [{ freq: 196, at: 0, dur: 0.12 }]
  },
  retro: {
    click: [{ freq: 523.25, at: 0, dur: 0.05 }],
    flag: [{ freq: 392, at: 0, dur: 0.06 }],
    win: [
      { freq: 659.25, at: 0, dur: 0.06 },
      { freq: 783.99, at: 0.07, dur: 0.08 }
    ],
    lose: [{ freq: 164.81, at: 0, dur: 0.12 }]
  },
  arcade: {
    click: [{ freq: 600, at: 0, dur: 0.04 }],
    flag: [
      { freq: 500, at: 0, dur: 0.04 },
      { freq: 750, at: 0.05, dur: 0.05 }
    ],
    win: [
      { freq: 523.25, at: 0, dur: 0.05 },
      { freq: 659.25, at: 0.06, dur: 0.05 },
      { freq: 783.99, at: 0.12, dur: 0.1 }
    ],
    lose: [
      { freq: 392, at: 0, dur: 0.06 },
      { freq: 246.94, at: 0.08, dur: 0.12 }
    ]
  }
};

const waveByPreset: Record<SoundPreset, OscillatorType> = {
  soft: 'sine',
  retro: 'square',
  arcade: 'triangle'
};

export const useSound = (preset: SoundPreset, volume: number, enabled: boolean) => {
  return useCallback((event: SoundEvent) => {
    if (!enabled || volume <= 0) return;
    const AudioCtx = window.AudioContext || (window as typeof window & { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
    if (!AudioCtx) return;

    const ctx = new AudioCtx();
    const notes = SOUNDS[preset][event];
    for (const note of notes) {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      const startAt = ctx.currentTime + note.at;
      const endAt = startAt + note.dur;

      osc.type = waveByPreset[preset];
      osc.frequency.value = note.freq;
      gain.gain.setValueAtTime(Math.min(0.08, volume * 0.08), startAt);
      gain.gain.exponentialRampToValueAtTime(0.001, endAt);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(startAt);
      osc.stop(endAt);
    }

    const total = notes.reduce((max, n) => Math.max(max, n.at + n.dur), 0);
    window.setTimeout(() => void ctx.close(), Math.ceil((total + 0.05) * 1000));
  }, [enabled, preset, volume]);
};
