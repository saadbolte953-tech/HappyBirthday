/**
 * SCREEN 5: PERSONAL MEMORIES GALLERY
 * - 5 Replaceable photograph frames.
 * - Free Fire & Friendship aesthetic.
 * - Supports instant file upload and localStorage persistence.
 * - Lightbox modal view.
 */

class MemoriesGallery {
  constructor() {
    this.modal = document.getElementById('photo-modal');
    this.modalImg = document.getElementById('modal-img');
    this.modalCaption = document.getElementById('modal-caption');
    this.modalClose = document.getElementById('modal-close-btn');
    this.continueBtn = document.getElementById('btn-continue-memories');

    // Default SVG illustrations for Free Fire / Friendship aesthetic
    this.defaultIllustrations = [
      this.generateGamingSvg('🎮 Duo Match', 'Where it all started!'),
      this.generateGamingSvg('🏆 Booyah!', 'Victory & Clutch plays'),
      this.generateGamingSvg('💬 3 AM Talks', 'Random rants & laughs'),
      this.generateGamingSvg('😈 Roasting Duo', 'Teasing each other 24/7'),
      this.generateGamingSvg('🤍 HG & HB', 'To more shared memories!')
    ];

    this.init();
  }

  init() {
    const polaroids = document.querySelectorAll('.memory-polaroid');

    polaroids.forEach((card, index) => {
      const imgElem = card.querySelector('.memory-img');
      const uploadBtn = card.querySelector('.btn-change-photo');
      const fileInput = card.querySelector('.memory-file-input');
      const captionText = card.querySelector('.memory-caption').textContent;

      // Respect existing image src first, otherwise fallback
      if (!imgElem.getAttribute('src')) {
        const savedPhoto = localStorage.getItem(`ifrah_memory_photo_${index + 1}`);
        if (savedPhoto) {
          imgElem.src = savedPhoto;
        } else {
          imgElem.src = this.defaultIllustrations[index];
        }
      }

      // Card click opens modal
      card.addEventListener('click', (e) => {
        if (e.target.closest('.btn-change-photo') || e.target.closest('.memory-file-input')) return;
        this.openModal(imgElem.src, captionText);
      });

      // Change photo button triggers file input
      if (uploadBtn && fileInput) {
        uploadBtn.addEventListener('click', (e) => {
          e.stopPropagation();
          fileInput.click();
        });

        fileInput.addEventListener('change', (e) => {
          const file = e.target.files[0];
          if (file) {
            const reader = new FileReader();
            reader.onload = (uploadEvent) => {
              const dataUrl = uploadEvent.target.result;
              imgElem.src = dataUrl;
              try {
                localStorage.setItem(`ifrah_memory_photo_${index + 1}`, dataUrl);
              } catch (storageErr) {
                console.warn('Storage limit reached, photo shown in session only.');
              }
            };
            reader.readAsDataURL(file);
          }
        });
      }
    });

    // Modal close
    if (this.modalClose && this.modal) {
      this.modalClose.addEventListener('click', () => this.closeModal());
      this.modal.addEventListener('click', (e) => {
        if (e.target === this.modal) this.closeModal();
      });
    }
  }

  openModal(src, caption) {
    if (!this.modal || !this.modalImg || !this.modalCaption) return;
    this.modalImg.src = src;
    this.modalCaption.textContent = caption;
    this.modal.classList.add('active');
  }

  closeModal() {
    if (!this.modal) return;
    this.modal.classList.remove('active');
  }

  // Generates clean Free Fire friendship SVG placeholders
  generateGamingSvg(title, subtitle) {
    const svg = `
      <svg xmlns="http://www.w3.org/2000/svg" width="300" height="320" viewBox="0 0 300 320">
        <defs>
          <linearGradient id="grad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stop-color="#ede9fe"/>
            <stop offset="50%" stop-color="#d8b4fe"/>
            <stop offset="100%" stop-color="#c084fc"/>
          </linearGradient>
        </defs>
        <rect width="100%" height="100%" fill="url(#grad)"/>
        <circle cx="150" cy="130" r="60" fill="#ffffff" opacity="0.3"/>
        <text x="50%" y="135" font-family="sans-serif" font-size="38" text-anchor="middle" fill="#581c87">🎮</text>
        <text x="50%" y="195" font-family="'Plus Jakarta Sans', sans-serif" font-weight="700" font-size="18" text-anchor="middle" fill="#3b0764">${title}</text>
        <text x="50%" y="222" font-family="'Plus Jakarta Sans', sans-serif" font-weight="500" font-size="12" text-anchor="middle" fill="#6b21a8">${subtitle}</text>
        <text x="50%" y="280" font-family="sans-serif" font-size="11" text-anchor="middle" fill="#9333ea" opacity="0.7">📷 Tap camera to upload photo</text>
      </svg>
    `;
    return 'data:image/svg+xml;utf8,' + encodeURIComponent(svg);
  }
}

window.initMemories = () => {
  window.memoriesInstance = new MemoriesGallery();
};
