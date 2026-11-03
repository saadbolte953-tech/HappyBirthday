/**
 * SCREEN 4: EXACTLY FIVE INTERACTIVE BALLOONS
 * Exactly five balloons, gentle floating physics, pop audio & particle explosion,
 * and exact verbatim messages as requested.
 */

class BirthdayBalloons {
  constructor() {
    this.container = document.getElementById('balloons-screen-container');
    this.counterElem = document.getElementById('balloons-counter-text');
    this.activeCard = document.getElementById('balloon-active-message-card');
    this.quoteText = document.getElementById('balloon-quote-text');
    this.continueBtn = document.getElementById('btn-continue-balloons');

    // EXACT CAPTIONS -- DO NOT ALTER
    this.balloonMessages = [
      "Happy birthday to my HG. 🤍",
      "Aap khush raha karo, twin. That's an order. 😈🫵🏻",
      "Lowkey grateful that you're in my life. 🫶🏻",
      "More smiles, less overthinking, shawty. 😭🤍",
      "Your HB wishes nothing but the best for you. 🤍"
    ];

    this.poppedCount = 0;
    this.poppedState = [false, false, false, false, false];

    this.init();
  }

  init() {
    const balloonItems = document.querySelectorAll('.balloon-item');

    balloonItems.forEach((balloon) => {
      const index = parseInt(balloon.getAttribute('data-balloon-index'), 10) - 1;

      balloon.addEventListener('click', (e) => {
        this.popBalloon(balloon, index, e);
      });
    });
  }

  popBalloon(balloonElem, index, event) {
    if (this.poppedState[index]) {
      // If already popped, allow re-reading this message
      this.displayMessage(index);
      return;
    }

    this.poppedState[index] = true;
    this.poppedCount++;

    // Audio SFX
    window.audioController.playBalloonPop();

    // Visual pop particles
    this.createPopParticles(balloonElem);

    // Add popped CSS class
    balloonElem.classList.add('popped');

    // Display revealed message
    this.displayMessage(index);

    // Update counter
    this.updateCounter();

    // Check if all 5 are popped
    if (this.poppedCount === 5) {
      this.onAllBalloonsPopped();
    }
  }

  displayMessage(index) {
    if (!this.quoteText || !this.activeCard) return;

    const message = this.balloonMessages[index];

    // Card pop animation
    this.activeCard.style.transform = 'scale(0.92)';
    this.activeCard.style.opacity = '0.7';

    setTimeout(() => {
      this.quoteText.textContent = message;
      this.activeCard.style.transform = 'scale(1)';
      this.activeCard.style.opacity = '1';
    }, 150);
  }

  updateCounter() {
    if (this.counterElem) {
      this.counterElem.textContent = `Balloons Popped: ${this.poppedCount} of 5`;
    }
  }

  createPopParticles(balloonElem) {
    const sphere = balloonElem.querySelector('.balloon-sphere');
    if (!sphere) return;

    const rect = sphere.getBoundingClientRect();
    const computedStyle = window.getComputedStyle(sphere);
    const bg = computedStyle.backgroundColor || '#c084fc';

    for (let i = 0; i < 20; i++) {
      const p = document.createElement('div');
      p.className = 'pop-burst-particle';

      const angle = (i / 20) * Math.PI * 2;
      const dist = 35 + Math.random() * 50;
      const dx = Math.cos(angle) * dist;
      const dy = Math.sin(angle) * dist;

      p.style.left = `${rect.left + rect.width / 2}px`;
      p.style.top = `${rect.top + rect.height / 2}px`;
      p.style.width = `${5 + Math.random() * 6}px`;
      p.style.height = p.style.width;
      p.style.background = i % 2 === 0 ? bg : '#ffffff';
      p.style.setProperty('--dx', `${dx}px`);
      p.style.setProperty('--dy', `${dy}px`);
      p.style.position = 'fixed';
      p.style.zIndex = '999';

      document.body.appendChild(p);
      setTimeout(() => p.remove(), 650);
    }
  }

  onAllBalloonsPopped() {
    window.audioController.playCelebrationCheer();

    if (window.confettiEngine) {
      window.confettiEngine.burst(55);
    }

    if (this.continueBtn) {
      setTimeout(() => {
        this.continueBtn.classList.remove('hidden');
        this.continueBtn.style.animation = 'pulseGlow 2s infinite';
      }, 500);
    }
  }
}

window.initBalloons = () => {
  window.balloonsInstance = new BirthdayBalloons();
};

