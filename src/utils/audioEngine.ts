/**
 * Web Audio API Acoustic Guitar Synthesizer
 * Uses Karplus-Strong string physical modeling synthesis with body resonance filtering
 * for rich, natural-sounding guitar strings and chords.
 */

// Base tuning frequencies (Standard Tuning: E2, A2, D3, G3, B3, E4)
// String 6 (lowest pitch) to String 1 (highest pitch)
export const OPEN_STRING_NOTES = ['E2', 'A2', 'D3', 'G3', 'B3', 'E4'];
export const OPEN_STRING_NAMES = ['6 (Low E)', '5 (A)', '4 (D)', '3 (G)', '2 (B)', '1 (High E)'];
export const OPEN_STRING_FREQS = [82.41, 110.00, 146.83, 196.00, 246.94, 329.63];

const NOTE_NAMES = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];

export function getNoteAt(stringIndex: number, fret: number): { note: string; freq: number; octave: number; fullName: string } {
  const baseFreq = OPEN_STRING_FREQS[stringIndex];
  const freq = baseFreq * Math.pow(2, fret / 12);
  
  // Base MIDI notes for open strings: E2=40, A2=45, D3=50, G3=55, B3=59, E4=64
  const baseMidi = [40, 45, 50, 55, 59, 64][stringIndex];
  const midi = baseMidi + fret;
  const noteName = NOTE_NAMES[midi % 12];
  const octave = Math.floor(midi / 12) - 1;
  const fullName = `${noteName}${octave}`;
  
  return { note: noteName, freq, octave, fullName };
}

class GuitarAudioEngine {
  private ctx: AudioContext | null = null;
  private masterGain: GainNode | null = null;
  private bodyFilter: BiquadFilterNode | null = null;
  private isMuted: boolean = false;
  private micStream: MediaStream | null = null;
  private micAnalyser: AnalyserNode | null = null;

  private initContext(): AudioContext {
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      this.ctx = new AudioCtx();

      // Master volume
      this.masterGain = this.ctx.createGain();
      this.masterGain.gain.setValueAtTime(0.85, this.ctx.currentTime);

      // Acoustic body resonance filter (simulates hollow wooden acoustic chamber)
      this.bodyFilter = this.ctx.createBiquadFilter();
      this.bodyFilter.type = 'peaking';
      this.bodyFilter.frequency.setValueAtTime(180, this.ctx.currentTime);
      this.bodyFilter.Q.setValueAtTime(1.2, this.ctx.currentTime);
      this.bodyFilter.gain.setValueAtTime(4.0, this.ctx.currentTime);

      this.bodyFilter.connect(this.masterGain);
      this.masterGain.connect(this.ctx.destination);
    }

    if (this.ctx.state === 'suspended') {
      this.ctx.resume();
    }

    return this.ctx;
  }

  public setMuted(muted: boolean) {
    this.isMuted = muted;
    if (this.masterGain && this.ctx) {
      this.masterGain.gain.setValueAtTime(muted ? 0 : 0.85, this.ctx.currentTime);
    }
  }

  public getMuted(): boolean {
    return this.isMuted;
  }

  /**
   * Karplus-Strong string synthesis:
   * Generates a realistic physical acoustic guitar pluck.
   */
  public pluck(frequency: number, duration: number = 2.5, velocity: number = 0.9): void {
    if (this.isMuted) return;
    try {
      const ctx = this.initContext();
      if (!this.bodyFilter) return;

      const sampleRate = ctx.sampleRate;
      const period = Math.round(sampleRate / frequency);
      const totalSamples = Math.floor(sampleRate * duration);

      // Create audio buffer
      const buffer = ctx.createBuffer(1, totalSamples, sampleRate);
      const output = buffer.getChannelData(0);

      // 1. Initial burst: noise burst filtered to simulate pick attack
      // Thicker strings (lower freq) have slightly softer pick attack
      const noiseBurstLength = period;
      for (let i = 0; i < noiseBurstLength; i++) {
        // Subtle triangular shaping to the noise burst
        const envelope = 1 - (i / noiseBurstLength) * 0.3;
        output[i] = (Math.random() * 2 - 1) * envelope;
      }

      // 2. Karplus-Strong recursive averaging loop with string damping
      // Higher frequencies damp faster than low bass strings
      const damping = Math.max(0.988, Math.min(0.997, 0.996 - (frequency / 3000) * 0.015));
      for (let i = noiseBurstLength; i < totalSamples; i++) {
        const prev1 = output[i - period];
        const prev2 = output[i - period - 1] || 0;
        // Two-point moving average lowpass filter with string loss
        output[i] = 0.5 * (prev1 + prev2) * damping;
      }

      const bufferSource = ctx.createBufferSource();
      bufferSource.buffer = buffer;

      // Note gain envelope
      const noteGain = ctx.createGain();
      const now = ctx.currentTime;
      noteGain.gain.setValueAtTime(Math.min(1, velocity), now);
      // Gentle natural fade at end
      noteGain.gain.exponentialRampToValueAtTime(0.0001, now + duration);

      // Lowpass filter for tone warmth (darker at lower velocity)
      const toneFilter = ctx.createBiquadFilter();
      toneFilter.type = 'lowpass';
      toneFilter.frequency.setValueAtTime(Math.min(10000, frequency * 8 + 1500), now);

      bufferSource.connect(toneFilter);
      toneFilter.connect(noteGain);
      noteGain.connect(this.bodyFilter);

      bufferSource.start(now);
      bufferSource.stop(now + duration);
    } catch {
      // AudioContext handling fallback
    }
  }

  /**
   * Plucks string by string index (0 to 5) and fret number (0 to 22)
   */
  public pluckString(stringIndex: number, fret: number, velocity: number = 0.85): void {
    const { freq } = getNoteAt(stringIndex, fret);
    this.pluck(freq, 2.8, velocity);
  }

  /**
   * Plays a reference pure tone for tuning
   */
  public playTuningReference(frequency: number, duration: number = 3.0): void {
    try {
      const ctx = this.initContext();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'triangle';
      osc.frequency.setValueAtTime(frequency, ctx.currentTime);

      gain.gain.setValueAtTime(0.4, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + duration);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start();
      osc.stop(ctx.currentTime + duration);
    } catch {
      // AudioContext fallback
    }
  }

  /**
   * Strums an entire chord (frets array [s6, s5, s4, s3, s2, s1], where -1 is muted)
   * direction: 'down' (string 6 to 1) or 'up' (string 1 to 6)
   * speedMs: stagger delay between strings in ms (e.g. 24ms for natural strum)
   */
  public strumChord(
    frets: number[],
    direction: 'down' | 'up' = 'down',
    speedMs: number = 24,
    onStringPlucked?: (stringIndex: number) => void
  ): void {
    const validStrings: { stringIndex: number; fret: number }[] = [];
    
    for (let s = 0; s < 6; s++) {
      if (frets[s] >= 0) {
        validStrings.push({ stringIndex: s, fret: frets[s] });
      }
    }

    if (direction === 'up') {
      validStrings.reverse();
    }

    validStrings.forEach((item, idx) => {
      setTimeout(() => {
        this.pluckString(item.stringIndex, item.fret, 0.82);
        if (onStringPlucked) {
          onStringPlucked(item.stringIndex);
        }
      }, idx * speedMs);
    });
  }

  /**
   * Plays a simple metronome click
   */
  public playClick(isAccent: boolean = false): void {
    if (this.isMuted) return;
    try {
      const ctx = this.initContext();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(isAccent ? 1200 : 800, ctx.currentTime);

      gain.gain.setValueAtTime(isAccent ? 0.6 : 0.35, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.04);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start();
      osc.stop(ctx.currentTime + 0.05);
    } catch {
      // AudioContext fallback
    }
  }

  /**
   * Setup microphone input for chromatic guitar tuner
   */
  public async startMicListening(onPitchDetected: (freq: number | null, note: string | null, cents: number) => void): Promise<boolean> {
    try {
      const ctx = this.initContext();
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        return false;
      }

      this.micStream = await navigator.mediaDevices.getUserMedia({
        audio: {
          echoCancellation: false,
          autoGainControl: false,
          noiseSuppression: false,
        },
      });

      const source = ctx.createMediaStreamSource(this.micStream);
      this.micAnalyser = ctx.createAnalyser();
      this.micAnalyser.fftSize = 2048;
      source.connect(this.micAnalyser);

      const buffer = new Float32Array(this.micAnalyser.fftSize);

      const detectLoop = () => {
        if (!this.micAnalyser || !this.micStream) return;
        this.micAnalyser.getFloatTimeDomainData(buffer);
        const pitch = autoCorrelate(buffer, ctx.sampleRate);

        if (pitch !== -1 && pitch >= 60 && pitch <= 600) {
          const { note, cents } = frequencyToNote(pitch);
          onPitchDetected(pitch, note, cents);
        } else {
          onPitchDetected(null, null, 0);
        }

        requestAnimationFrame(detectLoop);
      };

      requestAnimationFrame(detectLoop);
      return true;
    } catch (err) {
      console.warn('Microphone access for guitar tuner not granted or unavailable:', err);
      return false;
    }
  }

  public stopMicListening(): void {
    if (this.micStream) {
      this.micStream.getTracks().forEach((track) => track.stop());
      this.micStream = null;
    }
    this.micAnalyser = null;
  }
}

/**
 * Autocorrelation algorithm for accurate pitch detection from time-domain audio
 */
function autoCorrelate(buf: Float32Array, sampleRate: number): number {
  const SIZE = buf.length;
  let rms = 0;

  for (let i = 0; i < SIZE; i++) {
    const val = buf[i];
    rms += val * val;
  }
  rms = Math.sqrt(rms / SIZE);
  // Volume gate to ignore room noise
  if (rms < 0.015) {
    return -1;
  }

  let r1 = 0;
  let r2 = SIZE - 1;
  const thres = 0.2;
  for (let i = 0; i < SIZE / 2; i++) {
    if (Math.abs(buf[i]) < thres) {
      r1 = i;
      break;
    }
  }
  for (let i = 1; i < SIZE / 2; i++) {
    if (Math.abs(buf[SIZE - i]) < thres) {
      r2 = SIZE - i;
      break;
    }
  }

  const trimmedBuf = buf.slice(r1, r2);
  const c = new Float32Array(trimmedBuf.length);
  for (let i = 0; i < trimmedBuf.length; i++) {
    for (let j = 0; j < trimmedBuf.length - i; j++) {
      c[i] = c[i] + trimmedBuf[j] * trimmedBuf[j + i];
    }
  }

  let d = 0;
  while (c[d] > c[d + 1]) d++;
  let maxval = -1;
  let maxpos = -1;
  for (let i = d; i < trimmedBuf.length; i++) {
    if (c[i] > maxval) {
      maxval = c[i];
      maxpos = i;
    }
  }
  let T0 = maxpos;

  // Parabolic interpolation for fine frequency resolution
  const x1 = c[T0 - 1];
  const x2 = c[T0];
  const x3 = c[T0 + 1];
  const a = (x1 + x3 - 2 * x2) / 2;
  const b = (x3 - x1) / 2;
  if (a) {
    T0 = T0 - b / (2 * a);
  }

  return sampleRate / T0;
}

/**
 * Converts frequency in Hz to closest Note and cents deviation (-50 to +50 cents)
 */
export function frequencyToNote(freq: number): { note: string; cents: number; diffHz: number } {
  // A4 = 440Hz, MIDI 69
  const midiNote = Math.round(12 * (Math.log(freq / 440) / Math.log(2))) + 69;
  const noteName = NOTE_NAMES[midiNote % 12];
  const octave = Math.floor(midiNote / 12) - 1;
  const idealFreq = 440 * Math.pow(2, (midiNote - 69) / 12);
  const cents = Math.round(1200 * (Math.log(freq / idealFreq) / Math.log(2)));
  return {
    note: `${noteName}${octave}`,
    cents,
    diffHz: freq - idealFreq,
  };
}

export const audioEngine = new GuitarAudioEngine();
