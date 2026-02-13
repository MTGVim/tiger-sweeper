import { useCallback } from 'react';
import type { SoundPreset } from '../core/types';

export type SoundEvent = 'click' | 'flag' | 'explode' | 'win' | 'lose';

interface Note {
  freq: number;
  at: number;
  dur: number;
}

const SOUNDS: Record<SoundPreset, Record<SoundEvent, Note[]>> = {
  soft: {
    click: [{ freq: 440, at: 0, dur: 0.05 }],
    flag: [
      { freq: 380, at: 0, dur: 0.03 },
      { freq: 520, at: 0.035, dur: 0.04 },
      { freq: 700, at: 0.085, dur: 0.05 }
    ],
    explode: [
      { freq: 980, at: 0, dur: 0.04 },
      { freq: 860, at: 0.03, dur: 0.05 },
      { freq: 700, at: 0.07, dur: 0.07 },
      { freq: 540, at: 0.13, dur: 0.1 }
    ],
    win: [
      { freq: 1260, at: 0, dur: 0.02 },
      { freq: 980, at: 0.025, dur: 0.02 },
      { freq: 1320, at: 0.07, dur: 0.02 },
      { freq: 1020, at: 0.095, dur: 0.02 },
      { freq: 1380, at: 0.14, dur: 0.022 },
      { freq: 1080, at: 0.168, dur: 0.022 }
    ],
    lose: [
      { freq: 880, at: 0, dur: 0.06 },
      { freq: 784, at: 0.07, dur: 0.07 },
      { freq: 659.25, at: 0.15, dur: 0.08 },
      { freq: 523.25, at: 0.24, dur: 0.2 }
    ]
  },
  retro: {
    click: [{ freq: 523.25, at: 0, dur: 0.05 }],
    flag: [
      { freq: 420, at: 0, dur: 0.03 },
      { freq: 590, at: 0.035, dur: 0.04 },
      { freq: 780, at: 0.085, dur: 0.05 }
    ],
    explode: [
      { freq: 1040, at: 0, dur: 0.035 },
      { freq: 900, at: 0.03, dur: 0.05 },
      { freq: 730, at: 0.07, dur: 0.07 },
      { freq: 560, at: 0.13, dur: 0.1 }
    ],
    win: [
      { freq: 1300, at: 0, dur: 0.018 },
      { freq: 1020, at: 0.024, dur: 0.018 },
      { freq: 1360, at: 0.068, dur: 0.02 },
      { freq: 1060, at: 0.094, dur: 0.02 },
      { freq: 1420, at: 0.138, dur: 0.022 },
      { freq: 1110, at: 0.166, dur: 0.022 }
    ],
    lose: [
      { freq: 987.77, at: 0, dur: 0.05 },
      { freq: 880, at: 0.06, dur: 0.06 },
      { freq: 739.99, at: 0.13, dur: 0.07 },
      { freq: 587.33, at: 0.21, dur: 0.19 }
    ]
  },
  arcade: {
    click: [{ freq: 600, at: 0, dur: 0.04 }],
    flag: [
      { freq: 520, at: 0, dur: 0.03 },
      { freq: 760, at: 0.03, dur: 0.035 },
      { freq: 980, at: 0.075, dur: 0.045 }
    ],
    explode: [
      { freq: 1100, at: 0, dur: 0.035 },
      { freq: 940, at: 0.03, dur: 0.05 },
      { freq: 760, at: 0.07, dur: 0.075 },
      { freq: 590, at: 0.135, dur: 0.11 }
    ],
    win: [
      { freq: 1340, at: 0, dur: 0.018 },
      { freq: 1040, at: 0.023, dur: 0.018 },
      { freq: 1400, at: 0.066, dur: 0.02 },
      { freq: 1100, at: 0.092, dur: 0.02 },
      { freq: 1460, at: 0.135, dur: 0.022 },
      { freq: 1160, at: 0.163, dur: 0.022 }
    ],
    lose: [
      { freq: 1046.5, at: 0, dur: 0.05 },
      { freq: 932.33, at: 0.06, dur: 0.06 },
      { freq: 783.99, at: 0.13, dur: 0.07 },
      { freq: 622.25, at: 0.21, dur: 0.22 }
    ]
  }
};

const waveByPreset: Record<SoundPreset, OscillatorType> = {
  soft: 'sine',
  retro: 'square',
  arcade: 'triangle'
};

const waveByEvent: Partial<Record<SoundEvent, OscillatorType>> = {
  explode: 'sawtooth',
  win: 'square'
};

const EXTERNAL_SOUND_URLS: Partial<Record<SoundEvent, string>> = {
  explode: '/sounds/vine-boom.mp3',
  win: '/sounds/yahoo-yodel.mp3',
  lose: '/sounds/ocean-meme.mp3'
};

export const useSound = (preset: SoundPreset, volume: number, enabled: boolean) => {
  const playSynth = useCallback((event: SoundEvent) => {
    const AudioCtx = window.AudioContext || (window as typeof window & { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
    if (!AudioCtx) return;

    const ctx = new AudioCtx();
    const notes = SOUNDS[preset][event];
    const eventGainMultiplier: Record<SoundEvent, number> = {
      click: 1,
      flag: 1,
      explode: 1.85,
      win: 1.25,
      lose: 1.15
    };
    for (const note of notes) {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      const startAt = ctx.currentTime + note.at;
      const endAt = startAt + note.dur;

      osc.type = waveByEvent[event] ?? waveByPreset[preset];
      osc.frequency.value = note.freq;
      gain.gain.setValueAtTime(Math.min(0.22, volume * 0.11 * eventGainMultiplier[event]), startAt);
      gain.gain.exponentialRampToValueAtTime(0.001, endAt);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(startAt);
      osc.stop(endAt);
    }

    const total = notes.reduce((max, n) => Math.max(max, n.at + n.dur), 0);
    window.setTimeout(() => void ctx.close(), Math.ceil((total + 0.05) * 1000));
  }, [preset, volume]);

  return useCallback((event: SoundEvent) => {
    if (!enabled || volume <= 0) return;
    const externalUrl = EXTERNAL_SOUND_URLS[event];
    if (!externalUrl) {
      playSynth(event);
      return;
    }

    const audio = new Audio(externalUrl);
    audio.preload = 'auto';
    audio.volume = Math.min(1, volume * 1.1);
    const p = audio.play();
    if (p && typeof p.catch === 'function') {
      p.catch(() => playSynth(event));
    }
  }, [enabled, playSynth, volume]);
};
