/**
 * Web Audio API synthesizer for Egyptian Kotshina & Ahwa sound effects.
 * No external audio files needed - immediate, zero latency, reliable.
 */

class SoundManager {
  private ctx: AudioContext | null = null;
  private ambientGain: GainNode | null = null;
  private ambientOscillators: OscillatorNode[] = [];
  private isAmbientPlaying = false;
  private volume = 0.8;
  private enabled = true;

  private initCtx() {
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      this.ctx = new AudioCtx();
    }
    if (this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  public setVolume(vol: number) {
    this.volume = Math.max(0, Math.min(1, vol));
  }

  public setEnabled(enabled: boolean) {
    this.enabled = enabled;
  }

  // Realistic card flick/slide on felt table
  public playCardSlide() {
    if (!this.enabled || this.volume <= 0) return;
    try {
      this.initCtx();
      if (!this.ctx) return;

      const bufferSize = this.ctx.sampleRate * 0.12;
      const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
      const output = buffer.getChannelData(0);
      for (let i = 0; i < bufferSize; i++) {
        // Filtered white noise for card sliding paper texture
        output[i] = (Math.random() * 2 - 1) * Math.exp(-i / (bufferSize * 0.4));
      }

      const whiteNoise = this.ctx.createBufferSource();
      whiteNoise.buffer = buffer;

      const filter = this.ctx.createBiquadFilter();
      filter.type = 'bandpass';
      filter.frequency.setValueAtTime(1400, this.ctx.currentTime);
      filter.Q.setValueAtTime(2.5, this.ctx.currentTime);

      const gain = this.ctx.createGain();
      gain.gain.setValueAtTime(this.volume * 0.4, this.ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, this.ctx.currentTime + 0.12);

      whiteNoise.connect(filter);
      filter.connect(gain);
      gain.connect(this.ctx.destination);

      whiteNoise.start();
    } catch {
      // Audio fallback
    }
  }

  // Soft card deal pop
  public playCardDeal() {
    if (!this.enabled || this.volume <= 0) return;
    try {
      this.initCtx();
      if (!this.ctx) return;

      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(320, this.ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(120, this.ctx.currentTime + 0.08);

      gain.gain.setValueAtTime(this.volume * 0.35, this.ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, this.ctx.currentTime + 0.08);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start();
      osc.stop(this.ctx.currentTime + 0.08);
    } catch {
      // Audio fallback
    }
  }

  // Eat (الأكل) swoosh and capture chime
  public playEat() {
    if (!this.enabled || this.volume <= 0) return;
    try {
      this.initCtx();
      if (!this.ctx) return;

      const now = this.ctx.currentTime;

      // Two ascending soft notes
      const notes = [440, 660];
      notes.forEach((freq, idx) => {
        const osc = this.ctx!.createOscillator();
        const gain = this.ctx!.createGain();

        osc.type = 'triangle';
        osc.frequency.setValueAtTime(freq, now + idx * 0.06);

        gain.gain.setValueAtTime(0, now + idx * 0.06);
        gain.gain.linearRampToValueAtTime(this.volume * 0.4, now + idx * 0.06 + 0.02);
        gain.gain.exponentialRampToValueAtTime(0.01, now + idx * 0.06 + 0.18);

        osc.connect(gain);
        gain.connect(this.ctx!.destination);

        osc.start(now + idx * 0.06);
        osc.stop(now + idx * 0.06 + 0.18);
      });
    } catch {
      // Audio fallback
    }
  }

  // Basra Fanfare! (Tada chord + joyous chime)
  public playBasra() {
    if (!this.enabled || this.volume <= 0) return;
    try {
      this.initCtx();
      if (!this.ctx) return;

      const now = this.ctx.currentTime;
      // Majestic oriental-friendly major triad chime
      const chord = [523.25, 659.25, 783.99, 1046.5]; // C5, E5, G5, C6
      chord.forEach((freq, i) => {
        const osc = this.ctx!.createOscillator();
        const gain = this.ctx!.createGain();

        osc.type = 'triangle';
        osc.frequency.setValueAtTime(freq, now + i * 0.07);

        gain.gain.setValueAtTime(0, now + i * 0.07);
        gain.gain.linearRampToValueAtTime(this.volume * 0.5, now + i * 0.07 + 0.03);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 1.2);

        osc.connect(gain);
        gain.connect(this.ctx!.destination);

        osc.start(now + i * 0.07);
        osc.stop(now + 1.2);
      });
    } catch {
      // Audio fallback
    }
  }

  // Jack / Kommy Sweep (قش الطاولة)
  public playSweep() {
    if (!this.enabled || this.volume <= 0) return;
    try {
      this.initCtx();
      if (!this.ctx) return;

      const now = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(200, now);
      osc.frequency.exponentialRampToValueAtTime(800, now + 0.25);

      gain.gain.setValueAtTime(0.01, now);
      gain.gain.linearRampToValueAtTime(this.volume * 0.35, now + 0.08);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.4);

      const filter = this.ctx.createBiquadFilter();
      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(1200, now);

      osc.connect(filter);
      filter.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start(now);
      osc.stop(now + 0.4);
    } catch {
      // Audio fallback
    }
  }

  // Gold coins clinking sound
  public playCoin() {
    if (!this.enabled || this.volume <= 0) return;
    try {
      this.initCtx();
      if (!this.ctx) return;

      const now = this.ctx.currentTime;
      const freqs = [1800, 2600];
      freqs.forEach((freq, idx) => {
        const osc = this.ctx!.createOscillator();
        const gain = this.ctx!.createGain();

        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, now + idx * 0.07);

        gain.gain.setValueAtTime(this.volume * 0.45, now + idx * 0.07);
        gain.gain.exponentialRampToValueAtTime(0.001, now + idx * 0.07 + 0.25);

        osc.connect(gain);
        gain.connect(this.ctx!.destination);

        osc.start(now + idx * 0.07);
        osc.stop(now + idx * 0.07 + 0.25);
      });
    } catch {
      // Audio fallback
    }
  }

  // Button click / UI tap
  public playClick() {
    if (!this.enabled || this.volume <= 0) return;
    try {
      this.initCtx();
      if (!this.ctx) return;

      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(800, this.ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(300, this.ctx.currentTime + 0.04);

      gain.gain.setValueAtTime(this.volume * 0.25, this.ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, this.ctx.currentTime + 0.04);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start();
      osc.stop(this.ctx.currentTime + 0.04);
    } catch {
      // Audio fallback
    }
  }
}

export const soundFx = new SoundManager();
