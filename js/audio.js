/**
 * AUDIO CONTROLLER & SOUND FX ENGINE
 * - Background Music Player for "Blue -- Yung Kai"
 * - Web Audio API Synthesis Fallback (plays dreamy lofi chords if mp3 is not yet placed)
 * - Interactive Sound Effects (Bow stretch, Arrow swoosh, Pop, Cake cut, Envelope wax crack)
 */

class AudioController {
  constructor() {
    this.audioElement = new Audio();
    this.audioElement.src = 'assets/music.mp4';
    this.audioElement.loop = true;
    this.audioElement.volume = 0.65;

    this.isPlaying = false;
    this.isMuted = false;
    this.audioCtx = null;
    this.synthLoopInterval = null;
    this.usingSynthFallback = false;

    // Track user gesture
    this.hasInteracted = false;

    this.initAudioContext();
    this.initAudioElementListeners();
  }

  initAudioContext() {
    try {
      const AudioContextClass = window.AudioContext || window.webkitAudioContext;
      if (AudioContextClass) {
        this.audioCtx = new AudioContextClass();
      }
    } catch (e) {
      console.warn('Web Audio API not supported:', e);
    }
  }

  ensureAudioContext() {
    if (this.audioCtx && this.audioCtx.state === 'suspended') {
      this.audioCtx.resume();
    }
  }

  initAudioElementListeners() {
    // If the local MP3 file exists and loads, use it
    this.audioElement.addEventListener('canplaythrough', () => {
      this.usingSynthFallback = false;
      if (this.synthLoopInterval) {
        clearInterval(this.synthLoopInterval);
        this.synthLoopInterval = null;
      }
    });

    // If MP3 file is not found (e.g. fresh clone before placing Yung Kai mp3), switch to dreamy synth
    this.audioElement.addEventListener('error', () => {
      console.info('Custom MP3 not found. Activating dreamy ambient music synth fallback.');
      this.usingSynthFallback = true;
      if (this.isPlaying) {
        this.startDreamyLofiSynth();
      }
    });
  }

  // Handle first user interaction anywhere on the screen
  handleFirstInteraction() {
    if (this.hasInteracted) return;
    this.hasInteracted = true;
    this.ensureAudioContext();
    this.playMusic();
  }

  toggleMusic() {
    this.ensureAudioContext();
    if (this.isPlaying) {
      this.pauseMusic();
    } else {
      this.playMusic();
    }
  }

  playMusic() {
    this.ensureAudioContext();
    this.isPlaying = true;
    this.updateUI(true);

    if (this.usingSynthFallback) {
      this.startDreamyLofiSynth();
      return;
    }

    const playPromise = this.audioElement.play();
    if (playPromise !== undefined) {
      playPromise.catch((err) => {
        console.warn('Audio tag play blocked or failed. Starting dreamy synth.', err);
        this.usingSynthFallback = true;
        this.startDreamyLofiSynth();
      });
    }
  }

  pauseMusic() {
    this.isPlaying = false;
    this.updateUI(false);
    this.audioElement.pause();
    if (this.synthLoopInterval) {
      clearInterval(this.synthLoopInterval);
      this.synthLoopInterval = null;
    }
  }

  updateUI(playing) {
    const playerWidget = document.querySelector('.music-player-widget');
    if (playerWidget) {
      if (playing) {
        playerWidget.classList.add('playing');
        playerWidget.setAttribute('title', 'Pause Music');
      } else {
        playerWidget.classList.remove('playing');
        playerWidget.setAttribute('title', 'Play Music');
      }
    }
  }

  // Dreamy Lofi synth fallback inspired by Yung Kai - Blue (soft dreamy chords)
  startDreamyLofiSynth() {
    if (this.synthLoopInterval) return;
    this.ensureAudioContext();
    if (!this.audioCtx) return;

    // Chords: Emaj7, G#m7, F#m7, B7 (dreamy lavender tones)
    const chords = [
      [329.63, 415.3, 493.88, 622.25], // E4, G#4, B4, D#5
      [415.3, 493.88, 622.25, 830.61], // G#4, B4, D#5, G#5
      [369.99, 440.0, 554.37, 659.25], // F#4, A4, C#5, E5
      [246.94, 369.99, 493.88, 587.33]  // B3, F#4, B4, D5
    ];

    let chordIdx = 0;
    const playChordStep = () => {
      if (!this.isPlaying) return;
      const notes = chords[chordIdx];
      notes.forEach((freq, i) => {
        setTimeout(() => {
          if (this.isPlaying) this.playTone(freq, 2.8, 'sine', 0.045);
        }, i * 90);
      });
      chordIdx = (chordIdx + 1) % chords.length;
    };

    playChordStep();
    this.synthLoopInterval = setInterval(playChordStep, 3200);
  }

  playTone(freq, duration = 1.0, type = 'sine', volume = 0.08) {
    if (!this.audioCtx || this.isMuted) return;
    try {
      const osc = this.audioCtx.createOscillator();
      const gain = this.audioCtx.createGain();

      osc.type = type;
      osc.frequency.setValueAtTime(freq, this.audioCtx.currentTime);

      gain.gain.setValueAtTime(volume, this.audioCtx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.0001, this.audioCtx.currentTime + duration);

      osc.connect(gain);
      gain.connect(this.audioCtx.destination);

      osc.start();
      osc.stop(this.audioCtx.currentTime + duration);
    } catch (e) {
      console.warn(e);
    }
  }

  // ------------------------------------------------------------------------
  // SATISFYING SOUND EFFECTS (Web Audio API)
  // ------------------------------------------------------------------------
  playBowPull() {
    if (!this.audioCtx || this.isMuted) return;
    this.ensureAudioContext();
    try {
      const osc = this.audioCtx.createOscillator();
      const gain = this.audioCtx.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(140, this.audioCtx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(260, this.audioCtx.currentTime + 0.3);
      gain.gain.setValueAtTime(0.04, this.audioCtx.currentTime);
      gain.gain.linearRampToValueAtTime(0.001, this.audioCtx.currentTime + 0.35);
      osc.connect(gain);
      gain.connect(this.audioCtx.destination);
      osc.start();
      osc.stop(this.audioCtx.currentTime + 0.35);
    } catch(e) {}
  }

  playArrowShoot() {
    if (!this.audioCtx || this.isMuted) return;
    this.ensureAudioContext();
    try {
      // Swoosh noise
      const bufferSize = this.audioCtx.sampleRate * 0.25;
      const buffer = this.audioCtx.createBuffer(1, bufferSize, this.audioCtx.sampleRate);
      const data = buffer.getChannelData(0);
      for (let i = 0; i < bufferSize; i++) {
        data[i] = Math.random() * 2 - 1;
      }
      const noise = this.audioCtx.createBufferSource();
      noise.buffer = buffer;

      const filter = this.audioCtx.createBiquadFilter();
      filter.type = 'bandpass';
      filter.frequency.setValueAtTime(800, this.audioCtx.currentTime);
      filter.frequency.exponentialRampToValueAtTime(3200, this.audioCtx.currentTime + 0.15);
      filter.frequency.exponentialRampToValueAtTime(300, this.audioCtx.currentTime + 0.25);

      const gain = this.audioCtx.createGain();
      gain.gain.setValueAtTime(0.08, this.audioCtx.currentTime);
      gain.gain.linearRampToValueAtTime(0.001, this.audioCtx.currentTime + 0.25);

      noise.connect(filter);
      filter.connect(gain);
      gain.connect(this.audioCtx.destination);
      noise.start();
    } catch (e) {}
  }

  playGiftPop() {
    if (!this.audioCtx || this.isMuted) return;
    this.ensureAudioContext();
    // Chime & pop
    this.playTone(523.25, 0.4, 'triangle', 0.15); // C5
    setTimeout(() => this.playTone(659.25, 0.5, 'sine', 0.15), 80); // E5
    setTimeout(() => this.playTone(783.99, 0.6, 'sine', 0.18), 160); // G5
    setTimeout(() => this.playTone(1046.5, 0.8, 'sine', 0.2), 240); // C6
  }

  playBlowCandle() {
    if (!this.audioCtx || this.isMuted) return;
    this.ensureAudioContext();
    try {
      const bufferSize = this.audioCtx.sampleRate * 0.4;
      const buffer = this.audioCtx.createBuffer(1, bufferSize, this.audioCtx.sampleRate);
      const data = buffer.getChannelData(0);
      for (let i = 0; i < bufferSize; i++) {
        data[i] = Math.random() * 2 - 1;
      }
      const noise = this.audioCtx.createBufferSource();
      noise.buffer = buffer;
      const filter = this.audioCtx.createBiquadFilter();
      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(400, this.audioCtx.currentTime);
      filter.frequency.linearRampToValueAtTime(100, this.audioCtx.currentTime + 0.4);

      const gain = this.audioCtx.createGain();
      gain.gain.setValueAtTime(0.12, this.audioCtx.currentTime);
      gain.gain.linearRampToValueAtTime(0.001, this.audioCtx.currentTime + 0.4);

      noise.connect(filter);
      filter.connect(gain);
      gain.connect(this.audioCtx.destination);
      noise.start();
    } catch (e) {}
  }

  playCutCake() {
    if (!this.audioCtx || this.isMuted) return;
    this.ensureAudioContext();
    this.playTone(440, 0.25, 'triangle', 0.08);
    setTimeout(() => this.playTone(880, 0.35, 'sine', 0.1), 100);
  }

  playBalloonPop() {
    if (!this.audioCtx || this.isMuted) return;
    this.ensureAudioContext();
    try {
      const osc = this.audioCtx.createOscillator();
      const gain = this.audioCtx.createGain();
      osc.type = 'square';
      osc.frequency.setValueAtTime(180, this.audioCtx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(40, this.audioCtx.currentTime + 0.08);

      gain.gain.setValueAtTime(0.2, this.audioCtx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, this.audioCtx.currentTime + 0.08);

      osc.connect(gain);
      gain.connect(this.audioCtx.destination);
      osc.start();
      osc.stop(this.audioCtx.currentTime + 0.08);

      // Light sparkle chime
      setTimeout(() => this.playTone(880, 0.4, 'sine', 0.06), 60);
      setTimeout(() => this.playTone(1174.66, 0.4, 'sine', 0.06), 120);
    } catch(e) {}
  }

  playEnvelopeOpen() {
    if (!this.audioCtx || this.isMuted) return;
    this.ensureAudioContext();
    // Wax crack & paper slide
    this.playTone(320, 0.15, 'sawtooth', 0.06);
    setTimeout(() => this.playTone(640, 0.3, 'sine', 0.08), 80);
    setTimeout(() => this.playTone(960, 0.5, 'sine', 0.09), 160);
  }

  playCelebrationCheer() {
    if (!this.audioCtx || this.isMuted) return;
    this.ensureAudioContext();
    const fanfare = [523.25, 659.25, 783.99, 1046.5, 1318.51];
    fanfare.forEach((f, i) => {
      setTimeout(() => this.playTone(f, 0.5, 'triangle', 0.12), i * 90);
    });
  }
}

// Global Audio Instance
window.audioController = new AudioController();

