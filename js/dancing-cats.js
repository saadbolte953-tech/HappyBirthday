/**
 * SCREEN 7: DANCING CATS CELEBRATION & VIDEO PLAYER
 * - Live 60fps HTML5 Canvas animated dancing cats party
 * - Replaceable HTML5 video player for `assets/dancing-cats.mp4`
 * - Video controls (play, pause, replay, fullscreen, upload)
 * - Final celebration burst with "Happy Birthday, Ifrah! 🤍"
 */

class DancingCatsCelebration {
  constructor() {
    this.canvas = document.getElementById('cats-canvas');
    this.playBtn = document.getElementById('btn-video-play');
    this.replayBtn = document.getElementById('btn-video-replay');
    this.cannonBtn = document.getElementById('btn-confetti-cannon');
    this.restartBtn = document.getElementById('btn-replay-journey');

    this.isPlaying = true;
    this.animationFrameId = null;

    // Cat dance state
    this.danceTick = 0;
    this.confettiParticles = [];
    this.musicNotes = [];

    this.init();
  }

  init() {
    // Play/Pause button
    if (this.playBtn) {
      this.playBtn.addEventListener('click', () => {
        this.togglePlayback();
      });
    }

    // Replay button
    if (this.replayBtn) {
      this.replayBtn.addEventListener('click', () => {
        this.replay();
      });
    }

    // Confetti Cannon
    if (this.cannonBtn) {
      this.cannonBtn.addEventListener('click', () => {
        window.audioController.playCelebrationCheer();
        if (window.confettiEngine) {
          window.confettiEngine.burst(80);
        }
      });
    }

    // Restart entire website journey
    if (this.restartBtn) {
      this.restartBtn.addEventListener('click', () => {
        if (window.appInstance) {
          window.appInstance.goToScreen(1);
        }
      });
    }

    // Init canvas particles
    this.initCanvasEffects();
    this.startCanvasAnimation();
  }

  togglePlayback() {
    this.isPlaying = !this.isPlaying;
    if (this.playBtn) {
      this.playBtn.innerHTML = this.isPlaying ? '<span>Pause</span> ⏸' : '<span>Play</span> ▶';
    }
  }

  replay() {
    this.isPlaying = true;
    this.danceTick = 0;

    if (this.playBtn) {
      this.playBtn.innerHTML = '<span>Pause</span> ⏸';
    }

    if (window.confettiEngine) {
      window.confettiEngine.burst(50);
    }
  }

  initCanvasEffects() {
    for (let i = 0; i < 35; i++) {
      this.confettiParticles.push({
        x: Math.random() * 800,
        y: Math.random() * 450,
        size: 4 + Math.random() * 6,
        color: ['#a855f7', '#d8b4fe', '#fde047', '#f472b6', '#ffffff'][Math.floor(Math.random() * 5)],
        speedY: 1 + Math.random() * 2,
        rot: Math.random() * 360,
        rotSpeed: Math.random() * 4 - 2
      });
    }
  }

  startCanvasAnimation() {
    if (!this.canvas) return;
    const ctx = this.canvas.getContext('2d');

    const render = () => {
      if (this.mode === 'canvas') {
        const width = (this.canvas.width = 800);
        const height = (this.canvas.height = 450);

        if (this.isPlaying) {
          this.danceTick += 0.05;
        }

        // Draw Stage Background
        const grad = ctx.createRadialGradient(400, 225, 50, 400, 225, 450);
        grad.addColorStop(0, '#faf5ff');
        grad.addColorStop(0.5, '#f3e8ff');
        grad.addColorStop(1, '#e9d5ff');
        ctx.fillStyle = grad;
        ctx.fillRect(0, 0, width, height);

        // Stage floor glow
        ctx.beginPath();
        ctx.ellipse(400, 390, 320, 40, 0, 0, Math.PI * 2);
        ctx.fillStyle = 'rgba(168, 85, 247, 0.2)';
        ctx.fill();

        // Confetti falling
        this.renderConfetti(ctx, width, height);

        // Draw 3 Dancing Cats & Cake
        const beat = Math.sin(this.danceTick * 4);
        const sway = Math.cos(this.danceTick * 3);

        // Left Cat (Lavender Lilac Kitty)
        this.drawCat(ctx, 230 + sway * 12, 340 + beat * 8, '#d8b4fe', '#6b21a8', sway, beat, '#f472b6');

        // Right Cat (Pearl White Kitty)
        this.drawCat(ctx, 570 - sway * 12, 340 - beat * 8, '#ffffff', '#7e22ce', -sway, -beat, '#9333ea');

        // Center Cat (Lead Dancing Cat holding Cake)
        this.drawCat(ctx, 400, 325 + Math.abs(beat) * 12, '#f3e8ff', '#581c87', 0, beat, '#fde047');

        // Cake in the center
        this.drawCenterCake(ctx, 400, 350 + Math.abs(beat) * 12);

        // Floating Musical notes
        this.renderMusicNotes(ctx);

        // Banner on top
        ctx.save();
        ctx.font = 'bold 22px "Plus Jakarta Sans", sans-serif';
        ctx.fillStyle = '#4c1d95';
        ctx.textAlign = 'center';
        ctx.fillText('✨ Happy Birthday Ifrah! 🐾🎂', 400, 48);
        ctx.restore();
      }

      this.animationFrameId = requestAnimationFrame(render);
    };

    if (this.animationFrameId) cancelAnimationFrame(this.animationFrameId);
    this.animationFrameId = requestAnimationFrame(render);
  }

  drawCat(ctx, x, y, bodyColor, accentColor, sway, beat, hatColor) {
    ctx.save();
    ctx.translate(x, y);

    // Shadow
    ctx.beginPath();
    ctx.ellipse(0, 5, 38, 12, 0, 0, Math.PI * 2);
    ctx.fillStyle = 'rgba(88, 28, 135, 0.15)';
    ctx.fill();

    // Swishing Tail
    ctx.beginPath();
    ctx.moveTo(18, -25);
    ctx.quadraticCurveTo(45 + sway * 15, -45 - beat * 10, 35 + sway * 8, -65);
    ctx.lineWidth = 8;
    ctx.strokeStyle = bodyColor;
    ctx.lineCap = 'round';
    ctx.stroke();

    // Body
    ctx.beginPath();
    ctx.ellipse(0, -32, 32, 38, sway * 0.1, 0, Math.PI * 2);
    ctx.fillStyle = bodyColor;
    ctx.fill();
    ctx.lineWidth = 2.5;
    ctx.strokeStyle = accentColor;
    ctx.stroke();

    // Cute belly patch
    ctx.beginPath();
    ctx.ellipse(0, -30, 18, 24, 0, 0, Math.PI * 2);
    ctx.fillStyle = '#ffffff';
    ctx.fill();

    // Head
    const headY = -78 + beat * 4;
    ctx.beginPath();
    ctx.arc(0, headY, 28, 0, Math.PI * 2);
    ctx.fillStyle = bodyColor;
    ctx.fill();
    ctx.stroke();

    // Cat Ears
    ctx.beginPath();
    ctx.moveTo(-22, headY - 14);
    ctx.lineTo(-12, headY - 38);
    ctx.lineTo(-2, headY - 24);
    ctx.fillStyle = bodyColor;
    ctx.fill();
    ctx.stroke();

    ctx.beginPath();
    ctx.moveTo(22, headY - 14);
    ctx.lineTo(12, headY - 38);
    ctx.lineTo(2, headY - 24);
    ctx.fillStyle = bodyColor;
    ctx.fill();
    ctx.stroke();

    // Inner ears (pink)
    ctx.beginPath();
    ctx.moveTo(-18, headY - 16);
    ctx.lineTo(-12, headY - 32);
    ctx.lineTo(-6, headY - 22);
    ctx.fillStyle = '#f472b6';
    ctx.fill();

    ctx.beginPath();
    ctx.moveTo(18, headY - 16);
    ctx.lineTo(12, headY - 32);
    ctx.lineTo(6, headY - 22);
    ctx.fillStyle = '#f472b6';
    ctx.fill();

    // Party Hat!
    ctx.beginPath();
    ctx.moveTo(-10, headY - 27);
    ctx.lineTo(0, headY - 55);
    ctx.lineTo(10, headY - 27);
    ctx.closePath();
    ctx.fillStyle = hatColor;
    ctx.fill();
    ctx.stroke();

    // Hat pom-pom
    ctx.beginPath();
    ctx.arc(0, headY - 56, 4, 0, Math.PI * 2);
    ctx.fillStyle = '#ffffff';
    ctx.fill();

    // Happy closed smiling eyes (^ ^)
    ctx.lineWidth = 2.5;
    ctx.strokeStyle = accentColor;
    ctx.beginPath();
    ctx.arc(-9, headY - 4, 5, Math.PI, 0, false);
    ctx.stroke();

    ctx.beginPath();
    ctx.arc(9, headY - 4, 5, Math.PI, 0, false);
    ctx.stroke();

    // Cute pink nose
    ctx.beginPath();
    ctx.moveTo(-3, headY + 3);
    ctx.lineTo(3, headY + 3);
    ctx.lineTo(0, headY + 6);
    ctx.closePath();
    ctx.fillStyle = '#f472b6';
    ctx.fill();

    // Whiskers
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.moveTo(-14, headY + 5);
    ctx.lineTo(-28, headY + 3);
    ctx.moveTo(-14, headY + 8);
    ctx.lineTo(-26, headY + 11);
    ctx.moveTo(14, headY + 5);
    ctx.lineTo(28, headY + 3);
    ctx.moveTo(14, headY + 8);
    ctx.lineTo(26, headY + 11);
    ctx.stroke();

    // Dancing Paws
    ctx.beginPath();
    ctx.arc(-18 + sway * 8, -48 - beat * 8, 8, 0, Math.PI * 2);
    ctx.fillStyle = bodyColor;
    ctx.fill();
    ctx.stroke();

    ctx.beginPath();
    ctx.arc(18 - sway * 8, -48 + beat * 8, 8, 0, Math.PI * 2);
    ctx.fillStyle = bodyColor;
    ctx.fill();
    ctx.stroke();

    ctx.restore();
  }

  drawCenterCake(ctx, x, y) {
    ctx.save();
    ctx.translate(x, y);

    // Cake stand / plate
    ctx.beginPath();
    ctx.ellipse(0, 8, 42, 10, 0, 0, Math.PI * 2);
    ctx.fillStyle = '#ffffff';
    ctx.fill();
    ctx.lineWidth = 2;
    ctx.strokeStyle = '#d8b4fe';
    ctx.stroke();

    // Chocolate cake tier
    ctx.beginPath();
    ctx.rect(-28, -22, 56, 26);
    ctx.fillStyle = '#451a03'; // Rich chocolate
    ctx.fill();

    // Chocolate frosting drip
    ctx.beginPath();
    ctx.ellipse(0, -22, 28, 8, 0, 0, Math.PI * 2);
    ctx.fillStyle = '#78350f';
    ctx.fill();

    // Candle
    ctx.beginPath();
    ctx.rect(-3, -38, 6, 16);
    ctx.fillStyle = '#f3e8ff';
    ctx.fill();

    // Flame
    const flicker = Math.sin(this.danceTick * 10) * 1.5;
    ctx.beginPath();
    ctx.ellipse(0 + flicker, -43, 4, 7, 0, 0, Math.PI * 2);
    ctx.fillStyle = '#fde047';
    ctx.fill();

    ctx.restore();
  }

  renderConfetti(ctx, width, height) {
    this.confettiParticles.forEach((p) => {
      p.y += p.speedY;
      p.rot += p.rotSpeed;
      if (p.y > height) {
        p.y = -10;
        p.x = Math.random() * width;
      }

      ctx.save();
      ctx.translate(p.x, p.y);
      ctx.rotate((p.rot * Math.PI) / 180);
      ctx.fillStyle = p.color;
      ctx.fillRect(-p.size / 2, -p.size / 2, p.size, p.size);
      ctx.restore();
    });
  }

  renderMusicNotes(ctx) {
    const notes = ['♪', '♫', '♩'];
    const time = this.danceTick * 1.5;

    for (let i = 0; i < 4; i++) {
      const x = 200 + i * 130 + Math.sin(time + i) * 20;
      const y = 140 - (Math.abs(Math.sin(time * 0.8 + i)) * 60);

      ctx.save();
      ctx.font = '22px sans-serif';
      ctx.fillStyle = '#a855f7';
      ctx.fillText(notes[i % notes.length], x, y);
      ctx.restore();
    }
  }
}

window.initDancingCats = () => {
  window.dancingCatsInstance = new DancingCatsCelebration();
};

