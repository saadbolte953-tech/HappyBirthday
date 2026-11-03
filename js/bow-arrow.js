/**
 * SCREEN 1: BOW AND ARROW GIFT OPENING INTERACTION
 * Realistic drag-and-release mechanics with touch & pointer events.
 */

class BowArrowInteraction {
  constructor() {
    this.arena = document.getElementById('welcome-arena');
    this.bowSvg = document.getElementById('bow-svg');
    this.bowStation = document.getElementById('bow-station');
    this.giftBox = document.getElementById('gift-box-3d');
    this.trajectoryCanvas = document.getElementById('trajectory-canvas');
    this.continueBtn = document.getElementById('btn-continue-welcome');
    this.assistBtn = document.getElementById('btn-assist-shoot');

    this.isDragging = false;
    this.isShot = false;
    this.hitRegistered = false;

    // Anchor points within bow station
    this.originX = 50;  // Center X in SVG viewBox
    this.originY = 110; // Center Y in SVG viewBox
    this.pullX = this.originX;
    this.pullY = this.originY;

    this.maxPull = 60; // Max pullback distance

    this.initElements();
    this.attachEvents();
  }

  initElements() {
    if (!this.bowSvg) return;
    this.renderBow(0, 0);
  }

  renderBow(pullDistance = 0, angleRad = 0) {
    if (!this.bowSvg) return;

    // Bow coordinates (100 x 220 viewBox)
    const topX = 70;
    const topY = 20;
    const bottomX = 70;
    const bottomY = 200;

    // String notch pulled back
    const notchX = 70 - pullDistance;
    const notchY = 110;

    const bowString = document.getElementById('bow-string');
    const bowArrow = document.getElementById('bow-arrow-group');

    if (bowString) {
      bowString.setAttribute('d', `M ${topX} ${topY} Q ${notchX} ${notchY} ${bottomX} ${bottomY}`);
    }

    if (bowArrow) {
      if (pullDistance > 5) {
        bowArrow.setAttribute('transform', `translate(${-pullDistance * 0.95}, 0)`);
      } else {
        bowArrow.setAttribute('transform', `translate(0, 0)`);
      }
    }
  }

  attachEvents() {
    if (!this.bowStation) return;

    const onPointerDown = (e) => {
      if (this.isShot || this.hitRegistered) return;
      this.isDragging = true;
      this.bowStation.setPointerCapture(e.pointerId);
      window.audioController.handleFirstInteraction();
      window.audioController.playBowPull();
      this.updateDrag(e);
    };

    const onPointerMove = (e) => {
      if (!this.isDragging || this.isShot) return;
      this.updateDrag(e);
    };

    const onPointerUp = (e) => {
      if (!this.isDragging || this.isShot) return;
      this.isDragging = false;
      try {
        this.bowStation.releasePointerCapture(e.pointerId);
      } catch (err) {}

      // Calculate pull distance
      const pullDist = Math.max(0, 70 - this.pullX);
      if (pullDist > 20) {
        this.fireArrow();
      } else {
        // Reset bow smoothly
        this.renderBow(0, 0);
      }
    };

    this.bowStation.addEventListener('pointerdown', onPointerDown);
    this.bowStation.addEventListener('pointermove', onPointerMove);
    this.bowStation.addEventListener('pointerup', onPointerUp);
    this.bowStation.addEventListener('pointercancel', onPointerUp);

    // Auto assist button
    if (this.assistBtn) {
      this.assistBtn.addEventListener('click', () => {
        if (this.isShot || this.hitRegistered) return;
        window.audioController.handleFirstInteraction();
        this.autoShootSequence();
      });
    }

    // Direct gift click fallback as lovely bonus
    if (this.giftBox) {
      this.giftBox.addEventListener('click', () => {
        if (!this.hitRegistered) {
          window.audioController.handleFirstInteraction();
          this.autoShootSequence();
        }
      });
    }
  }

  updateDrag(e) {
    const rect = this.bowStation.getBoundingClientRect();
    const localX = e.clientX - rect.left;
    const localY = e.clientY - rect.top;

    // Constrain pull to leftward motion
    const normX = (localX / rect.width) * 100;
    const clampedX = Math.min(70, Math.max(15, normX));
    const pullDist = 70 - clampedX;

    this.pullX = clampedX;
    this.renderBow(pullDist);
    this.drawTrajectoryLine(pullDist);
  }

  drawTrajectoryLine(pullDist) {
    if (!this.trajectoryCanvas || !this.arena) return;
    const ctx = this.trajectoryCanvas.getContext('2d');
    const width = (this.trajectoryCanvas.width = this.arena.clientWidth);
    const height = (this.trajectoryCanvas.height = this.arena.clientHeight);

    ctx.clearRect(0, 0, width, height);
    if (pullDist < 10) return;

    // Draw animated guide dots towards target
    const startX = width * 0.16;
    const startY = height * 0.5;
    const targetX = width * 0.82;
    const targetY = height * 0.5;

    ctx.beginPath();
    ctx.setLineDash([6, 8]);
    ctx.lineWidth = 2.5;
    ctx.strokeStyle = 'rgba(168, 85, 247, 0.7)';

    ctx.moveTo(startX, startY);
    ctx.quadraticCurveTo((startX + targetX) / 2, startY - pullDist * 0.6, targetX, targetY);
    ctx.stroke();
  }

  clearTrajectory() {
    if (!this.trajectoryCanvas) return;
    const ctx = this.trajectoryCanvas.getContext('2d');
    ctx.clearRect(0, 0, this.trajectoryCanvas.width, this.trajectoryCanvas.height);
  }

  autoShootSequence() {
    this.isShot = true;
    window.audioController.playBowPull();
    
    // Animate pull back
    let step = 0;
    const pullTimer = setInterval(() => {
      step += 8;
      this.renderBow(step);
      this.drawTrajectoryLine(step);
      if (step >= 50) {
        clearInterval(pullTimer);
        setTimeout(() => this.fireArrow(), 100);
      }
    }, 20);
  }

  fireArrow() {
    this.isShot = true;
    this.clearTrajectory();
    window.audioController.playArrowShoot();

    // Reset bow string quickly
    this.renderBow(0);

    // Create flying arrow element
    const flyingArrow = document.createElement('div');
    flyingArrow.className = 'flying-arrow-projectile';
    flyingArrow.innerHTML = `
      <svg width="65" height="20" viewBox="0 0 65 20" fill="none">
        <line x1="0" y1="10" x2="52" y2="10" stroke="#7e22ce" stroke-width="3" stroke-linecap="round"/>
        <polygon points="52,4 64,10 52,16" fill="#9333ea"/>
        <polygon points="4,4 12,10 4,16" fill="#fde047"/>
        <polygon points="0,4 8,10 0,16" fill="#a855f7"/>
      </svg>
    `;
    flyingArrow.style.position = 'absolute';
    flyingArrow.style.zIndex = '30';
    flyingArrow.style.pointerEvents = 'none';

    const bowRect = this.bowStation.getBoundingClientRect();
    const arenaRect = this.arena.getBoundingClientRect();
    const giftRect = this.giftBox.getBoundingClientRect();

    const startX = bowRect.right - arenaRect.left - 10;
    const startY = bowRect.top - arenaRect.top + bowRect.height / 2 - 10;

    const destX = giftRect.left - arenaRect.left + giftRect.width * 0.4;
    const destY = giftRect.top - arenaRect.top + giftRect.height * 0.45;

    flyingArrow.style.left = `${startX}px`;
    flyingArrow.style.top = `${startY}px`;
    flyingArrow.style.transformOrigin = 'left center';

    this.arena.appendChild(flyingArrow);

    // Animate flight to gift box
    const duration = 400; // ms
    const startTime = performance.now();

    const animateFlight = (now) => {
      const elapsed = now - startTime;
      const progress = Math.min(1, elapsed / duration);

      // Arc curve
      const currentX = startX + (destX - startX) * progress;
      const arcY = -Math.sin(progress * Math.PI) * 35;
      const currentY = startY + (destY - startY) * progress + arcY;

      const angle = Math.atan2((destY - startY) + (progress > 0.5 ? 20 : -20), (destX - startX)) * (180 / Math.PI);

      flyingArrow.style.left = `${currentX}px`;
      flyingArrow.style.top = `${currentY}px`;
      flyingArrow.style.transform = `rotate(${angle}deg)`;

      if (progress < 1) {
        requestAnimationFrame(animateFlight);
      } else {
        flyingArrow.remove();
        this.triggerGiftHit();
      }
    };

    requestAnimationFrame(animateFlight);
  }

  triggerGiftHit() {
    this.hitRegistered = true;
    window.audioController.playGiftPop();

    // Shake box
    if (this.giftBox) {
      this.giftBox.classList.add('box-hit-shake');
      setTimeout(() => {
        this.giftBox.classList.add('opened');
      }, 250);
    }

    // Sparkle burst around gift box
    this.createHitSparkles();

    // Trigger confetti
    if (window.confettiEngine) {
      window.confettiEngine.burst(50);
    }

    // Reveal continue button smoothly
    if (this.continueBtn) {
      setTimeout(() => {
        this.continueBtn.classList.remove('hidden');
        this.continueBtn.style.animation = 'pulseGlow 2s infinite';
      }, 700);
    }

    // Update assist text
    const hint = document.querySelector('.bow-hint');
    if (hint) {
      hint.innerHTML = '✨ Bullseye! Happy Birthday, Ifrah! Tap Continue below 💜';
    }
  }

  createHitSparkles() {
    const giftRect = this.giftBox.getBoundingClientRect();
    const arenaRect = this.arena.getBoundingClientRect();
    const centerX = giftRect.left - arenaRect.left + giftRect.width / 2;
    const centerY = giftRect.top - arenaRect.top + giftRect.height / 2;

    const colors = ['#fde047', '#a855f7', '#ffffff', '#e9d5ff', '#c084fc'];
    for (let i = 0; i < 24; i++) {
      const p = document.createElement('div');
      p.className = 'pop-burst-particle';
      const angle = (i / 24) * Math.PI * 2;
      const dist = 50 + Math.random() * 70;
      const dx = Math.cos(angle) * dist;
      const dy = Math.sin(angle) * dist;

      p.style.left = `${centerX}px`;
      p.style.top = `${centerY}px`;
      p.style.width = `${6 + Math.random() * 8}px`;
      p.style.height = p.style.width;
      p.style.backgroundColor = colors[Math.floor(Math.random() * colors.length)];
      p.style.setProperty('--dx', `${dx}px`);
      p.style.setProperty('--dy', `${dy}px`);

      this.arena.appendChild(p);
      setTimeout(() => p.remove(), 700);
    }
  }
}

// Instantiate on DOM load
window.initBowArrow = () => {
  window.bowArrowInstance = new BowArrowInteraction();
};

