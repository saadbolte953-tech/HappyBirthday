/**
 * SCREEN 3: CHOCOLATE BIRTHDAY CAKE
 * - Intuitive, zero-command, smooth visual interactions.
 * - Tap candles / button to blow out with smoke particles.
 * - Slice cake with golden knife & slice separation animation.
 */

class ChocolateCakeInteraction {
  constructor() {
    this.cakeStage = document.getElementById('cake-stage');
    this.flames = document.querySelectorAll('.candle-flame');
    this.actionBtn = document.getElementById('btn-cake-action');
    this.statusText = document.getElementById('cake-status-text');
    this.continueBtn = document.getElementById('btn-continue-cake');
    this.cakeSlice = document.getElementById('cake-slice-group');
    this.knifeElem = document.getElementById('cake-knife-indicator');

    this.blownCandlesCount = 0;
    this.candlesBlown = false;
    this.cakeCut = false;

    this.init();
  }

  init() {
    // Candle individual click listeners
    this.flames.forEach((flame, index) => {
      flame.addEventListener('click', (e) => {
        e.stopPropagation();
        this.extinguishSingleCandle(flame);
      });
    });

    // Action button (smart contextual button: "Blow Candles" -> "Cut Cake")
    if (this.actionBtn) {
      this.actionBtn.addEventListener('click', () => {
        if (!this.candlesBlown) {
          this.blowAllCandles();
        } else if (!this.cakeCut) {
          this.cutTheCake();
        }
      });
    }

    // Direct cake click
    if (this.cakeStage) {
      this.cakeStage.addEventListener('click', () => {
        if (!this.candlesBlown) {
          this.blowAllCandles();
        } else if (!this.cakeCut) {
          this.cutTheCake();
        }
      });
    }
  }

  extinguishSingleCandle(flame) {
    if (flame.classList.contains('flame-extinguished')) return;

    window.audioController.playBlowCandle();
    flame.classList.add('flame-extinguished');
    this.createSmoke(flame);
    this.blownCandlesCount++;

    if (this.blownCandlesCount >= this.flames.length) {
      this.onAllCandlesBlown();
    } else {
      if (this.statusText) {
        this.statusText.textContent = `Keep going! ${this.flames.length - this.blownCandlesCount} candle(s) left 💨`;
      }
    }
  }

  blowAllCandles() {
    if (this.candlesBlown) return;

    window.audioController.playBlowCandle();
    this.flames.forEach((flame) => {
      flame.classList.add('flame-extinguished');
      this.createSmoke(flame);
    });

    this.blownCandlesCount = this.flames.length;
    this.onAllCandlesBlown();
  }

  onAllCandlesBlown() {
    this.candlesBlown = true;
    window.audioController.playTone(880, 0.4, 'sine', 0.1);

    if (this.statusText) {
      this.statusText.textContent = '✨ Yay! Now cut your chocolate cake! 🍰';
    }

    if (this.actionBtn) {
      this.actionBtn.innerHTML = '<span>Cut Cake</span> 🔪';
      this.actionBtn.classList.add('action-ready-cut');
    }

    // Show golden knife hint
    if (this.knifeElem) {
      this.knifeElem.style.display = 'block';
    }
  }

  cutTheCake() {
    if (this.cakeCut || !this.candlesBlown) return;
    this.cakeCut = true;

    window.audioController.playCutCake();

    // Knife slice animation
    if (this.knifeElem) {
      this.knifeElem.style.animation = 'knifeSlice 0.7s ease-in-out forwards';
    }

    // Reveal chocolate wedge on plate
    const cutWedge = document.getElementById('cut-wedge-visual');
    if (cutWedge) {
      setTimeout(() => {
        cutWedge.style.opacity = '1';
      }, 250);
    }

    // Slide cake slice out
    setTimeout(() => {
      if (this.cakeSlice) {
        this.cakeSlice.classList.add('cake-slice-separated');
      }

      // Sparkles and celebration
      if (window.confettiEngine) {
        window.confettiEngine.burst(45);
      }

      if (this.statusText) {
        this.statusText.innerHTML = '🍫 Sweet! A slice of your favorite chocolate cake for you! ✨';
      }

      if (this.actionBtn) {
        this.actionBtn.style.display = 'none';
      }

      if (this.continueBtn) {
        this.continueBtn.classList.remove('hidden');
        this.continueBtn.style.animation = 'pulseGlow 2s infinite';
      }
    }, 400);
  }

  createSmoke(element) {
    if (!this.cakeStage) return;
    const rect = element.getBoundingClientRect();
    const stageRect = this.cakeStage.getBoundingClientRect();
    const x = rect.left - stageRect.left + rect.width / 2;
    const y = rect.top - stageRect.top;

    for (let i = 0; i < 4; i++) {
      const smoke = document.createElement('div');
      smoke.className = 'smoke-particle';
      smoke.style.left = `${x + (Math.random() * 8 - 4)}px`;
      smoke.style.top = `${y}px`;
      smoke.style.animationDelay = `${i * 0.1}s`;
      this.cakeStage.appendChild(smoke);

      setTimeout(() => smoke.remove(), 1300);
    }
  }
}

window.initChocolateCake = () => {
  window.cakeInstance = new ChocolateCakeInteraction();
};
