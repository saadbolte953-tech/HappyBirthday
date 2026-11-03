/**
 * MAIN APPLICATION CONTROLLER
 * - Multi-Screen State Machine (Screens 1 to 7)
 * - Screen Transitions & Back / Continue Handling
 * - Ambient Twinkling Stars & Bow Canvas
 * - Global High-Performance Confetti Engine
 */

class ConfettiEngine {
  constructor() {
    this.canvas = document.getElementById('confetti-canvas');
    this.ctx = this.canvas ? this.canvas.getContext('2d') : null;
    this.particles = [];
    this.animating = false;

    this.colors = ['#c084fc', '#9333ea', '#fde047', '#f472b6', '#ffffff', '#e9d5ff', '#a855f7'];

    this.resize();
    window.addEventListener('resize', () => this.resize());
  }

  resize() {
    if (!this.canvas) return;
    this.canvas.width = window.innerWidth;
    this.canvas.height = window.innerHeight;
  }

  burst(count = 50, originX = window.innerWidth / 2, originY = window.innerHeight / 2) {
    if (!this.canvas) return;

    for (let i = 0; i < count; i++) {
      const angle = Math.random() * Math.PI * 2;
      const speed = 4 + Math.random() * 9;
      this.particles.push({
        x: originX,
        y: originY,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed - 3,
        size: 5 + Math.random() * 7,
        color: this.colors[Math.floor(Math.random() * this.colors.length)],
        rotation: Math.random() * 360,
        rotSpeed: Math.random() * 10 - 5,
        alpha: 1,
        life: 0.9 + Math.random() * 0.4
      });
    }

    if (!this.animating) {
      this.animating = true;
      this.loop();
    }
  }

  loop() {
    if (!this.ctx) return;
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

    for (let i = this.particles.length - 1; i >= 0; i--) {
      const p = this.particles[i];
      p.x += p.vx;
      p.y += p.vy;
      p.vy += 0.22; // gravity
      p.vx *= 0.98; // air drag
      p.rotation += p.rotSpeed;
      p.alpha -= 0.012;

      if (p.alpha <= 0 || p.y > this.canvas.height + 50) {
        this.particles.splice(i, 1);
        continue;
      }

      this.ctx.save();
      this.ctx.translate(p.x, p.y);
      this.ctx.rotate((p.rotation * Math.PI) / 180);
      this.ctx.globalAlpha = Math.max(0, p.alpha);
      this.ctx.fillStyle = p.color;
      this.ctx.fillRect(-p.size / 2, -p.size / 2, p.size, p.size * 0.7);
      this.ctx.restore();
    }

    if (this.particles.length > 0) {
      requestAnimationFrame(() => this.loop());
    } else {
      this.animating = false;
      this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    }
  }
}

class AmbientBackground {
  constructor() {
    this.canvas = document.getElementById('ambient-canvas');
    this.ctx = this.canvas ? this.canvas.getContext('2d') : null;
    this.stars = [];

    this.resize();
    window.addEventListener('resize', () => this.resize());
    this.initStars();
    this.loop();
  }

  resize() {
    if (!this.canvas) return;
    this.canvas.width = window.innerWidth;
    this.canvas.height = window.innerHeight;
  }

  initStars() {
    this.stars = [];
    const count = Math.floor(window.innerWidth / 25);
    for (let i = 0; i < count; i++) {
      this.stars.push({
        x: Math.random() * window.innerWidth,
        y: Math.random() * window.innerHeight,
        size: 1 + Math.random() * 2.5,
        alpha: Math.random(),
        speed: 0.01 + Math.random() * 0.025,
        growing: Math.random() > 0.5
      });
    }
  }

  loop() {
    if (!this.ctx) return;
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

    this.stars.forEach((s) => {
      if (s.growing) {
        s.alpha += s.speed;
        if (s.alpha >= 0.85) s.growing = false;
      } else {
        s.alpha -= s.speed;
        if (s.alpha <= 0.15) s.growing = true;
      }

      this.ctx.beginPath();
      this.ctx.arc(s.x, s.y, s.size, 0, Math.PI * 2);
      this.ctx.fillStyle = `rgba(255, 255, 255, ${s.alpha})`;
      this.ctx.shadowBlur = 6;
      this.ctx.shadowColor = '#d8b4fe';
      this.ctx.fill();
    });

    requestAnimationFrame(() => this.loop());
  }
}

class BirthdayApp {
  constructor() {
    this.currentScreen = 1;
    this.totalScreens = 7;
    this.screens = document.querySelectorAll('.screen');
    this.stepDots = document.querySelectorAll('.step-dot');
    this.backBtn = document.getElementById('btn-top-back');
    this.musicWidget = document.getElementById('music-player-widget');

    this.initNavigation();
    this.initScreenModules();
    this.goToScreen(1);
  }

  initNavigation() {
    // Back button
    if (this.backBtn) {
      this.backBtn.addEventListener('click', () => {
        if (this.currentScreen > 1) {
          this.goToScreen(this.currentScreen - 1);
        }
      });
    }

    // Music Player widget toggle
    if (this.musicWidget) {
      this.musicWidget.addEventListener('click', () => {
        window.audioController.toggleMusic();
      });
    }

    // Screen Continue Buttons
    const continueButtons = {
      'btn-continue-welcome': 2,
      'btn-continue-intro': 3,
      'btn-continue-cake': 4,
      'btn-continue-balloons': 5,
      'btn-continue-memories': 6,
      'btn-continue-letter': 7
    };

    Object.keys(continueButtons).forEach((btnId) => {
      const btn = document.getElementById(btnId);
      if (btn) {
        btn.addEventListener('click', () => {
          this.goToScreen(continueButtons[btnId]);
        });
      }
    });

    // Step dots can navigate back to already visited screens
    this.stepDots.forEach((dot) => {
      dot.addEventListener('click', () => {
        const targetScreen = parseInt(dot.getAttribute('data-step'), 10);
        if (targetScreen <= this.currentScreen) {
          this.goToScreen(targetScreen);
        }
      });
    });

    // Global click listener to unlock audio autoplay
    document.addEventListener('click', () => {
      window.audioController.handleFirstInteraction();
    }, { once: true });
  }

  goToScreen(screenNum) {
    if (screenNum < 1 || screenNum > this.totalScreens) return;

    this.currentScreen = screenNum;

    // Switch active screen class
    this.screens.forEach((screen) => {
      const sNum = parseInt(screen.getAttribute('data-screen-number'), 10);
      if (sNum === screenNum) {
        screen.classList.add('active');
        screen.scrollTop = 0;
      } else {
        screen.classList.remove('active');
      }
    });

    // Update Progress Indicator
    this.stepDots.forEach((dot) => {
      const dotNum = parseInt(dot.getAttribute('data-step'), 10);
      dot.classList.remove('active', 'passed');
      if (dotNum === screenNum) {
        dot.classList.add('active');
      } else if (dotNum < screenNum) {
        dot.classList.add('passed');
      }
    });

    // Update Back button visibility
    if (this.backBtn) {
      if (screenNum > 1) {
        this.backBtn.removeAttribute('disabled');
      } else {
        this.backBtn.setAttribute('disabled', 'true');
      }
    }

    // Fire screen enter animations / triggers
    this.onScreenEnter(screenNum);
  }

  onScreenEnter(screenNum) {
    if (screenNum === 7) {
      // Grand Finale!
      if (window.confettiEngine) {
        setTimeout(() => window.confettiEngine.burst(70), 300);
      }
      if (window.audioController) {
        window.audioController.playCelebrationCheer();
      }
    }
  }

  initScreenModules() {
    if (window.initBowArrow) window.initBowArrow();
    if (window.initChocolateCake) window.initChocolateCake();
    if (window.initBalloons) window.initBalloons();
    if (window.initMemories) window.initMemories();
    if (window.initEnvelope) window.initEnvelope();
    if (window.initDancingCats) window.initDancingCats();
  }
}

// Global initialization
window.addEventListener('DOMContentLoaded', () => {
  window.confettiEngine = new ConfettiEngine();
  window.ambientBg = new AmbientBackground();
  window.appInstance = new BirthdayApp();
});

