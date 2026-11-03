/**
 * SCREEN 6: PERSONAL BIRTHDAY LETTER INTERACTION
 * - Wax seal break & envelope opening.
 * - Smooth letter unfolding animation.
 * - Exact wording strictly preserved.
 */

class BirthdayEnvelope {
  constructor() {
    this.wrapper = document.getElementById('envelope-wrapper');
    this.paperModal = document.getElementById('letter-paper-modal');
    this.continueBtn = document.getElementById('btn-continue-letter');
    this.isOpen = false;

    this.init();
  }

  init() {
    if (!this.wrapper) return;

    this.wrapper.addEventListener('click', () => {
      this.openEnvelope();
    });
  }

  openEnvelope() {
    if (this.isOpen) return;
    this.isOpen = true;

    window.audioController.playEnvelopeOpen();

    // Wax seal & flap animation
    this.wrapper.classList.add('open');

    // Create sparkles around envelope
    this.createSealSparkles();

    // Unfold letter paper
    setTimeout(() => {
      if (this.wrapper) {
        this.wrapper.style.display = 'none';
      }
      if (this.paperModal) {
        this.paperModal.style.display = 'block';
      }

      // Confetti burst
      if (window.confettiEngine) {
        window.confettiEngine.burst(35);
      }

      // Show Continue button
      if (this.continueBtn) {
        setTimeout(() => {
          this.continueBtn.classList.remove('hidden');
          this.continueBtn.style.animation = 'pulseGlow 2s infinite';
        }, 600);
      }
    }, 750);
  }

  createSealSparkles() {
    const rect = this.wrapper.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;

    for (let i = 0; i < 16; i++) {
      const p = document.createElement('div');
      p.className = 'pop-burst-particle';

      const angle = (i / 16) * Math.PI * 2;
      const dist = 30 + Math.random() * 45;
      const dx = Math.cos(angle) * dist;
      const dy = Math.sin(angle) * dist;

      p.style.position = 'fixed';
      p.style.left = `${centerX}px`;
      p.style.top = `${centerY}px`;
      p.style.width = `${5 + Math.random() * 5}px`;
      p.style.height = p.style.width;
      p.style.background = '#fde047';
      p.style.setProperty('--dx', `${dx}px`);
      p.style.setProperty('--dy', `${dy}px`);
      p.style.zIndex = '999';

      document.body.appendChild(p);
      setTimeout(() => p.remove(), 600);
    }
  }
}

window.initEnvelope = () => {
  window.envelopeInstance = new BirthdayEnvelope();
};

