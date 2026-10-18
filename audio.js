(function () {
  'use strict';

  function silence(node) {
    if (!node) return;
    try { node.stop(); } catch (error) { void error; }
    try { node.disconnect(); } catch (error) { void error; }
  }

  function SynthAudio() {
    this.ctx = null;
    this.master = null;
    this.sfx = null;
    this.ambient = null;
    this.compressor = null;
    this.userMuted = false;
    this.ambientEnabled = true;
    this.unlocked = false;
    this.gatePaused = false;
    this._active = new Set();
    this._ambientNodes = [];
    this._ambientTimer = 0;
    this._ambientRunning = false;
    this._noiseCache = new Map();
    this._queue = [];
    this._combo = 0;
    this._comboAt = 0;
    this._targetGain = 0.78;
    this._boundUnlock = this._onGesture.bind(this);
  }

  SynthAudio.prototype.installUnlock = function () {
    window.addEventListener('pointerdown', this._boundUnlock, { passive: true });
    window.addEventListener('keydown', this._boundUnlock);
    window.addEventListener('touchend', this._boundUnlock, { passive: true });
  };

  SynthAudio.prototype._onGesture = function (event) {
    var fromAd = false;
    if (event && event.target && event.target.closest) {
      fromAd = !!event.target.closest('[data-ad-button], .ad-modal');
    }
    this.unlock({ allowAmbient: !fromAd });
  };

  SynthAudio.prototype._build = function () {
    if (this.ctx) return;
    var Ctx = window.AudioContext || window.webkitAudioContext;
    if (!Ctx) return;
    var ctx = new Ctx();
    var master = ctx.createGain();
    master.gain.value = 0.0001;
    var compressor = ctx.createDynamicsCompressor();
    compressor.threshold.value = -18;
    compressor.knee.value = 18;
    compressor.ratio.value = 3.2;
    compressor.attack.value = 0.004;
    compressor.release.value = 0.22;
    var sfx = ctx.createGain();
    sfx.gain.value = 0.9;
    var ambient = ctx.createGain();
    ambient.gain.value = 0.22;
    sfx.connect(compressor);
    ambient.connect(compressor);
    compressor.connect(master);
    master.connect(ctx.destination);
    this.ctx = ctx;
    this.master = master;
    this.sfx = sfx;
    this.ambient = ambient;
    this.compressor = compressor;
  };

  SynthAudio.prototype.unlock = function (options) {
    var allowAmbient = !options || options.allowAmbient !== false;
    this._build();
    if (!this.ctx) return;
    this.unlocked = true;
    if (this.gatePaused || this.userMuted) {
      this.master.gain.setValueAtTime(0, this.ctx.currentTime);
      return;
    }
    var self = this;
    var resume = this.ctx.state === 'suspended' ? this.ctx.resume() : Promise.resolve();
    resume.then(function () {
      if (!self.ctx || self.gatePaused || self.userMuted) return;
      self.master.gain.cancelScheduledValues(self.ctx.currentTime);
      self.master.gain.setValueAtTime(self._targetGain, self.ctx.currentTime);
      if (allowAmbient && self.ambientEnabled) self._startAmbient();
    }).catch(function () { /* autoplay policy */ });
  };

  SynthAudio.prototype.bindGate = function (pause) {
    var self = this;
    this.gatePaused = !!(pause && pause.active);
    if (this.gatePaused) this.hardPause();
    if (!pause || !pause.onChange) return;
    pause.onChange(function (paused) {
      if (paused) self.hardPause();
      else self.hardResume();
    });
  };

  SynthAudio.prototype.setMuted = function (muted) {
    this.userMuted = !!muted;
    if (!this.ctx) return;
    if (this.userMuted) {
      this._queue.length = 0;
      this.master.gain.cancelScheduledValues(this.ctx.currentTime);
      this.master.gain.setValueAtTime(0, this.ctx.currentTime);
      this._stopAmbient();
      if (this.ctx.state === 'running') this.ctx.suspend();
      return;
    }
    if (!this.gatePaused) this.hardResume();
  };

  SynthAudio.prototype.setAmbientEnabled = function (enabled) {
    this.ambientEnabled = !!enabled;
    if (!this.ambientEnabled) {
      this._stopAmbient();
      return;
    }
    if (this._canPlay()) this._startAmbient();
  };

  SynthAudio.prototype.toggleMuted = function () {
    this.setMuted(!this.userMuted);
    return this.userMuted;
  };

  SynthAudio.prototype.hardPause = function () {
    this.gatePaused = true;
    this._queue.length = 0;
    if (!this.ctx) return;
    var now = this.ctx.currentTime;
    this.master.gain.cancelScheduledValues(now);
    this.master.gain.setValueAtTime(0, now);
    this._active.forEach(silence);
    this._active.clear();
    this._stopAmbient();
    if (this.ctx.state === 'running') this.ctx.suspend();
  };

  SynthAudio.prototype.hardResume = function () {
    this.gatePaused = false;
    if (!this.ctx || !this.unlocked) return;
    if (this.userMuted) {
      this._queue.length = 0;
      this.master.gain.setValueAtTime(0, this.ctx.currentTime);
      return;
    }
    var self = this;
    var resume = this.ctx.state === 'suspended' ? this.ctx.resume() : Promise.resolve();
    resume.then(function () {
      if (!self.ctx || self.gatePaused || self.userMuted) return;
      self.master.gain.cancelScheduledValues(self.ctx.currentTime);
      self.master.gain.setValueAtTime(self._targetGain, self.ctx.currentTime);
      if (self.ambientEnabled) self._startAmbient();
      var queued = self._queue.splice(0, self._queue.length);
      queued.forEach(function (fn) { fn(); });
    }).catch(function () { /* resume rejected */ });
  };

  SynthAudio.prototype.playWhenAudible = function (fn) {
    if (this.userMuted || this.gatePaused) {
      if (!this.userMuted && this._queue.length < 4) this._queue.push(fn);
      return;
    }
    if (this._canPlay()) fn();
    else if (this._queue.length < 4) this._queue.push(fn);
  };

  SynthAudio.prototype._canPlay = function () {
    return !!(this.ctx && this.unlocked && !this.userMuted && !this.gatePaused && this.ctx.state === 'running');
  };

  SynthAudio.prototype._track = function (node) {
    this._active.add(node);
    var self = this;
    node.onended = function () { self._active.delete(node); };
    return node;
  };

  SynthAudio.prototype._noiseBuffer = function (seconds) {
    var key = String(seconds);
    var cached = this._noiseCache.get(key);
    if (cached) return cached;
    var length = Math.max(1, Math.floor(this.ctx.sampleRate * seconds));
    var buffer = this.ctx.createBuffer(1, length, this.ctx.sampleRate);
    var data = buffer.getChannelData(0);
    for (var i = 0; i < length; i += 1) data[i] = Math.random() * 2 - 1;
    this._noiseCache.set(key, buffer);
    return buffer;
  };

  SynthAudio.prototype._voice = function (spec) {
    if (!this._canPlay()) return;
    var ctx = this.ctx;
    var t0 = ctx.currentTime + (spec.delay || 0);
    var dur = spec.dur;
    var osc = ctx.createOscillator();
    osc.type = spec.type || 'sine';
    osc.frequency.setValueAtTime(Math.max(1, spec.freq), t0);
    if (spec.freqTo) osc.frequency.exponentialRampToValueAtTime(Math.max(1, spec.freqTo), t0 + dur);
    if (spec.detune) osc.detune.setValueAtTime(spec.detune, t0);
    var gain = ctx.createGain();
    var peak = spec.gain == null ? 0.18 : spec.gain;
    gain.gain.setValueAtTime(0.0001, t0);
    gain.gain.exponentialRampToValueAtTime(Math.max(0.0001, peak), t0 + (spec.attack || 0.012));
    gain.gain.exponentialRampToValueAtTime(0.0001, t0 + dur);
    if (spec.filter) {
      var filter = ctx.createBiquadFilter();
      filter.type = spec.filter.type || 'lowpass';
      filter.frequency.setValueAtTime(Math.max(1, spec.filter.freq), t0);
      if (spec.filter.freqTo) {
        filter.frequency.exponentialRampToValueAtTime(Math.max(1, spec.filter.freqTo), t0 + dur);
      }
      filter.Q.setValueAtTime(spec.filter.q == null ? 0.7 : spec.filter.q, t0);
      osc.connect(filter);
      filter.connect(gain);
    } else {
      osc.connect(gain);
    }
    gain.connect(this.sfx);
    osc.start(t0);
    osc.stop(t0 + dur + 0.03);
    this._track(osc);
  };

  SynthAudio.prototype._noise = function (spec) {
    if (!this._canPlay()) return;
    var ctx = this.ctx;
    var t0 = ctx.currentTime + (spec.delay || 0);
    var dur = spec.dur;
    var src = ctx.createBufferSource();
    src.buffer = this._noiseBuffer(Math.max(0.03, dur));
    var filter = ctx.createBiquadFilter();
    filter.type = spec.filterType || 'bandpass';
    filter.frequency.setValueAtTime(spec.freq || 1400, t0);
    filter.Q.setValueAtTime(spec.q == null ? 0.8 : spec.q, t0);
    var gain = ctx.createGain();
    gain.gain.setValueAtTime(0.0001, t0);
    gain.gain.exponentialRampToValueAtTime(spec.gain || 0.12, t0 + 0.006);
    gain.gain.exponentialRampToValueAtTime(0.0001, t0 + dur);
    src.connect(filter);
    filter.connect(gain);
    gain.connect(this.sfx);
    src.start(t0);
    src.stop(t0 + dur + 0.02);
    this._track(src);
  };

  SynthAudio.prototype._defer = function (fn) {
    if (this.userMuted || this.gatePaused || !this.unlocked || !this.ctx) return;
    var self = this;
    this.ctx.resume().then(function () {
      if (!self.userMuted && !self.gatePaused && self.ctx && self.ctx.state === 'running') fn();
    }).catch(function () { /* resume rejected */ });
  };

  SynthAudio.prototype.playSpawn = function (deferred) {
    if (!this._canPlay()) {
      if (!deferred) this._defer(this.playSpawn.bind(this, true));
      return;
    }
    this._voice({ type: 'sine', freq: 640, freqTo: 196, dur: 0.15, gain: 0.2, attack: 0.005 });
    this._voice({ type: 'triangle', freq: 980, freqTo: 320, dur: 0.09, gain: 0.06, attack: 0.004 });
    this._noise({ dur: 0.045, gain: 0.11, freq: 1700, q: 0.65 });
  };

  SynthAudio.prototype.playMerge = function (comboCount, deferred) {
    if (!this._canPlay()) {
      if (!deferred) this._defer(this.playMerge.bind(this, comboCount, true));
      return;
    }
    var now = (typeof performance !== 'undefined' ? performance.now() : Date.now());
    var step;
    if (typeof comboCount === 'number' && comboCount > 0) {
      step = Math.floor(comboCount);
    } else if (now - this._comboAt < 2200) {
      step = this._combo + 1;
    } else {
      step = 1;
    }
    step = Math.max(1, Math.min(12, step));
    this._combo = step;
    this._comboAt = now;
    var root = 220 * Math.pow(2, (step - 1) / 12);
    var ratios = step >= 6 ? [1, 5 / 4, 3 / 2, 2] : [1, 5 / 4, 3 / 2];
    var voiceGain = 0.11 / Math.sqrt(ratios.length);
    for (var i = 0; i < ratios.length; i += 1) {
      this._voice({
        type: 'triangle',
        freq: root * ratios[i],
        dur: 0.46,
        delay: i * 0.032,
        gain: voiceGain,
        attack: 0.012,
        detune: (i - 1) * 7,
        filter: { type: 'lowpass', freq: 1200 + step * 110, q: 0.55 }
      });
    }
    if (step >= 4) {
      this._voice({
        type: 'sine',
        freq: root * 4,
        dur: 0.28,
        delay: 0.07,
        gain: 0.035,
        attack: 0.01
      });
    }
    this._noise({ dur: 0.04, gain: 0.05, freq: 880 + step * 50, q: 1.15 });
  };

  SynthAudio.prototype.playNewLevelUnlock = function (deferred) {
    if (!this._canPlay()) {
      if (!deferred) this._defer(this.playNewLevelUnlock.bind(this, true));
      return;
    }
    var notes = [523.25, 659.25, 783.99, 1046.5];
    var delays = [0, 0.15, 0.3, 0.48];
    for (var i = 0; i < notes.length; i += 1) {
      var last = i === notes.length - 1;
      this._voice({
        type: 'sawtooth',
        freq: notes[i],
        dur: last ? 0.78 : 0.3,
        delay: delays[i],
        gain: last ? 0.07 : 0.055,
        attack: 0.018,
        filter: { type: 'lowpass', freq: 780, freqTo: last ? 3200 : 2200, q: 0.62 }
      });
      this._voice({
        type: 'triangle',
        freq: notes[i] * 2,
        dur: last ? 0.62 : 0.22,
        delay: delays[i],
        gain: 0.03,
        attack: 0.012
      });
    }
    this._voice({ type: 'triangle', freq: 1567.98, dur: 0.7, delay: 0.48, gain: 0.04, attack: 0.02 });
    this._voice({ type: 'sine', freq: 2093, dur: 0.45, delay: 0.56, gain: 0.025, attack: 0.02 });
    this._noise({ dur: 0.05, gain: 0.05, freq: 1900, q: 0.7 });
  };

  SynthAudio.prototype.playCoin = function (deferred) {
    if (!this._canPlay()) {
      if (!deferred) this._defer(this.playCoin.bind(this, true));
      return;
    }
    this._voice({ type: 'sine', freq: 1567.98, dur: 0.32, gain: 0.12, attack: 0.004 });
    this._voice({ type: 'sine', freq: 2093, dur: 0.4, delay: 0.045, gain: 0.08, attack: 0.004 });
    this._voice({ type: 'triangle', freq: 3135.96, dur: 0.24, delay: 0.08, gain: 0.028, attack: 0.004 });
  };

  SynthAudio.prototype.playUpgrade = function (deferred) {
    if (!this._canPlay()) {
      if (!deferred) this._defer(this.playUpgrade.bind(this, true));
      return;
    }
    this._voice({
      type: 'sawtooth',
      freq: 174.61,
      freqTo: 880,
      dur: 0.46,
      gain: 0.07,
      attack: 0.02,
      filter: { type: 'lowpass', freq: 380, freqTo: 2800, q: 0.78 }
    });
    this._voice({
      type: 'triangle',
      freq: 261.63,
      freqTo: 1318.5,
      dur: 0.4,
      delay: 0.06,
      gain: 0.055,
      attack: 0.018
    });
    this._voice({
      type: 'sine',
      freq: 523.25,
      freqTo: 1567.98,
      dur: 0.28,
      delay: 0.16,
      gain: 0.04,
      attack: 0.012
    });
  };

  SynthAudio.prototype._startAmbient = function () {
    if (!this._canPlay() || !this.ambientEnabled || this._ambientRunning) return;
    this._ambientRunning = true;
    var ctx = this.ctx;
    var filter = ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.value = 360;
    filter.Q.value = 0.65;
    var padGain = ctx.createGain();
    padGain.gain.value = 0.0001;
    var notes = [73.42, 110];
    var detunes = [-7, 8];
    for (var i = 0; i < notes.length; i += 1) {
      var osc = ctx.createOscillator();
      osc.type = 'sawtooth';
      osc.frequency.value = notes[i];
      osc.detune.value = detunes[i];
      osc.connect(filter);
      osc.start();
      this._ambientNodes.push(osc);
    }
    var lfo = ctx.createOscillator();
    lfo.frequency.value = 0.045;
    var lfoGain = ctx.createGain();
    lfoGain.gain.value = 70;
    lfo.connect(lfoGain);
    lfoGain.connect(filter.frequency);
    lfo.start();
    filter.connect(padGain);
    padGain.connect(this.ambient);
    var now = ctx.currentTime;
    padGain.gain.exponentialRampToValueAtTime(0.07, now + 1.4);
    this._ambientNodes.push(lfo, filter, padGain, lfoGain);

    var noise = ctx.createBufferSource();
    noise.buffer = this._noiseBuffer(2);
    noise.loop = true;
    var band = ctx.createBiquadFilter();
    band.type = 'bandpass';
    band.frequency.value = 900;
    band.Q.value = 0.35;
    var hiss = ctx.createGain();
    hiss.gain.value = 0.012;
    noise.connect(band);
    band.connect(hiss);
    hiss.connect(this.ambient);
    noise.start();
    this._ambientNodes.push(noise, band, hiss);
    this._scheduleAmbient();
  };

  SynthAudio.prototype._scheduleAmbient = function () {
    var self = this;
    if (!this._ambientRunning) return;
    this._playAmbientNote();
    var gap = 1500 + Math.random() * 1700;
    this._ambientTimer = window.setTimeout(function () {
      self._scheduleAmbient();
    }, gap);
  };

  SynthAudio.prototype._playAmbientNote = function () {
    if (!this._canPlay() || !this._ambientRunning) return;
    var scale = [146.83, 164.81, 185, 220, 246.94, 293.66, 329.63, 392];
    var freq = scale[Math.floor(Math.random() * scale.length)];
    var ctx = this.ctx;
    var t0 = ctx.currentTime + 0.05;
    var dur = 1.7 + Math.random() * 1.1;
    var osc = ctx.createOscillator();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(freq, t0);
    var twin = ctx.createOscillator();
    twin.type = 'triangle';
    twin.frequency.setValueAtTime(freq, t0);
    twin.detune.setValueAtTime(6, t0);
    var filter = ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(1400, t0);
    var gain = ctx.createGain();
    gain.gain.setValueAtTime(0.0001, t0);
    gain.gain.exponentialRampToValueAtTime(0.045, t0 + 0.09);
    gain.gain.exponentialRampToValueAtTime(0.0001, t0 + dur);
    osc.connect(filter);
    twin.connect(filter);
    filter.connect(gain);
    gain.connect(this.ambient);
    osc.start(t0);
    twin.start(t0);
    osc.stop(t0 + dur + 0.05);
    twin.stop(t0 + dur + 0.05);
    this._track(osc);
    this._track(twin);
    if (Math.random() < 0.45) {
      this._hat(t0 + dur * 0.5);
    }
  };

  SynthAudio.prototype._hat = function (time) {
    if (!this._canPlay()) return;
    var src = this.ctx.createBufferSource();
    src.buffer = this._noiseBuffer(0.08);
    var filter = this.ctx.createBiquadFilter();
    filter.type = 'highpass';
    filter.frequency.setValueAtTime(3200, time);
    var gain = this.ctx.createGain();
    gain.gain.setValueAtTime(0.0001, time);
    gain.gain.exponentialRampToValueAtTime(0.03, time + 0.005);
    gain.gain.exponentialRampToValueAtTime(0.0001, time + 0.07);
    src.connect(filter);
    filter.connect(gain);
    gain.connect(this.ambient);
    src.start(time);
    src.stop(time + 0.08);
    this._track(src);
  };

  SynthAudio.prototype._stopAmbient = function () {
    if (this._ambientTimer) {
      window.clearTimeout(this._ambientTimer);
      this._ambientTimer = 0;
    }
    this._ambientNodes.forEach(silence);
    this._ambientNodes = [];
    this._ambientRunning = false;
  };

  window.AureliaAudio = {
    SynthAudio: SynthAudio,
    create: function () { return new SynthAudio(); }
  };
})();
