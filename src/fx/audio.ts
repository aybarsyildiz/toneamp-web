import { state } from '../state';

/**
 * "Hear the gain." An opt-in Web Audio drone: three detuned sawtooth voices
 * (a low power-chord) through a waveshaper whose distortion amount and a
 * lowpass whose brightness both track the page's gain. Off by default.
 */
export class ToneEngine {
  private ctx: AudioContext | null = null;
  private master: GainNode | null = null;
  private shaper: WaveShaperNode | null = null;
  private filter: BiquadFilterNode | null = null;
  private voices: OscillatorNode[] = [];
  private lfo: OscillatorNode | null = null;
  on = false;

  private makeCurve(amount: number): Float32Array<ArrayBuffer> {
    const n = 1024;
    const curve = new Float32Array(new ArrayBuffer(n * 4));
    const k = amount * 100;
    for (let i = 0; i < n; i++) {
      const x = (i / (n - 1)) * 2 - 1;
      curve[i] = ((1 + k) * x) / (1 + k * Math.abs(x));
    }
    return curve;
  }

  private build() {
    const ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
    this.ctx = ctx;

    this.master = ctx.createGain();
    this.master.gain.value = 0;
    this.master.connect(ctx.destination);

    this.filter = ctx.createBiquadFilter();
    this.filter.type = 'lowpass';
    this.filter.frequency.value = 700;
    this.filter.Q.value = 0.8;
    this.filter.connect(this.master);

    this.shaper = ctx.createWaveShaper();
    this.shaper.curve = this.makeCurve(0.1);
    this.shaper.oversample = '4x';
    this.shaper.connect(this.filter);

    // Root E2 power chord: E2, B2, E3.
    const freqs = [82.41, 123.47, 164.81];
    const mix = ctx.createGain();
    mix.gain.value = 0.3;
    mix.connect(this.shaper);
    freqs.forEach((f, i) => {
      const osc = ctx.createOscillator();
      osc.type = 'sawtooth';
      osc.frequency.value = f;
      osc.detune.value = (i - 1) * 6;
      osc.connect(mix);
      osc.start();
      this.voices.push(osc);
    });

    // Slow amp-tremolo so the drone breathes.
    this.lfo = ctx.createOscillator();
    this.lfo.frequency.value = 0.15;
    const lfoGain = ctx.createGain();
    lfoGain.gain.value = 0.05;
    this.lfo.connect(lfoGain);
    lfoGain.connect(this.master.gain);
    this.lfo.start();
  }

  async toggle(): Promise<boolean> {
    if (!this.ctx) this.build();
    if (this.ctx!.state === 'suspended') await this.ctx!.resume();
    this.on = !this.on;
    const t = this.ctx!.currentTime;
    this.master!.gain.cancelScheduledValues(t);
    this.master!.gain.linearRampToValueAtTime(this.on ? 0.12 : 0.0001, t + 0.5);
    return this.on;
  }

  /** Called each frame from the scroll loop. */
  update() {
    if (!this.on || !this.ctx || !this.shaper || !this.filter) return;
    const g = state.gain;
    // Refresh the distortion curve only when it moves meaningfully.
    this.shaper.curve = this.makeCurve(0.05 + g * 0.9);
    const t = this.ctx.currentTime;
    this.filter.frequency.setTargetAtTime(600 + g * g * 4200, t, 0.15);
  }
}
