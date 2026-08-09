import './style.css';

const icon = (name: 'close' | 'left' | 'right'): string => {
  const paths: Record<'close' | 'left' | 'right', string> = {
    close: '<path d="M7 7l10 10M17 7 7 17"/>',
    left: '<path d="m14.5 6-6 6 6 6"/>',
    right: '<path d="m9.5 6 6 6-6 6"/>',
  };

  return `<svg viewBox="0 0 24 24" aria-hidden="true">${paths[name]}</svg>`;
};

document.querySelector<HTMLDivElement>('#app')!.innerHTML = `
  <main class="page" data-page>
    <div class="study-module">
      <nav class="localnav" aria-label="iPhone 17 local navigation">
        <strong class="localnav__title">iPhone 17</strong>
        <div class="localnav__actions">
          <button class="localnav__explore" type="button">Explore</button>
          <button class="localnav__buy" type="button">Buy</button>
        </div>
      </nav>

      <section class="viewer" data-viewer aria-label="Action button product viewer">
        <div class="media-stage">
          <video
            class="action-media"
            data-media
            muted
            playsinline
            preload="auto"
            poster="/media/action-button-poster.jpg"
            aria-label="Action button launches Silent mode, Live Translation, and Shazam"
          >
            <source src="/media/action-button-study.mp4" type="video/mp4">
          </video>
        </div>

        <button class="viewer-close" data-close type="button" aria-label="Close Action button detail">
          ${icon('close')}
        </button>

        <section class="feature-deck" data-deck aria-label="Action button description">
          <article class="feature-card">
            <p><strong>Action button.</strong> A customizable fast track to your favorite feature. Long press to launch the action you want — Silent mode, Translation, Shortcuts, and more.</p>
          </article>
          <button class="deck-arrow deck-arrow--prev" data-replay type="button" aria-label="Replay previous Action button state">${icon('left')}</button>
          <button class="deck-arrow deck-arrow--next" data-replay type="button" aria-label="Replay next Action button state">${icon('right')}</button>
        </section>

        <button class="collapsed-pill" data-open type="button" aria-label="Open Action button detail">
          <span>+</span><strong>Action button</strong>
        </button>
        <p class="sr-status" data-status aria-live="polite">Action button animation ready</p>
      </section>
    </div>
  </main>
`;

const viewer = document.querySelector<HTMLElement>('[data-viewer]')!;
const media = document.querySelector<HTMLVideoElement>('[data-media]')!;
const status = document.querySelector<HTMLElement>('[data-status]')!;

const replay = async (): Promise<void> => {
  viewer.classList.remove('is-collapsed');
  media.currentTime = 0;
  try {
    await media.play();
    status.textContent = 'Action button animation playing';
  } catch {
    status.textContent = 'Tap the product to play the Action button animation';
  }
};

const close = (): void => {
  media.pause();
  viewer.classList.add('is-collapsed');
  status.textContent = 'Action button detail closed';
};

const open = (): void => {
  void replay();
};

document.querySelectorAll<HTMLButtonElement>('[data-replay]').forEach((button) => {
  button.addEventListener('click', () => void replay());
});
document.querySelector<HTMLButtonElement>('[data-close]')!.addEventListener('click', close);
document.querySelector<HTMLButtonElement>('[data-open]')!.addEventListener('click', open);
media.addEventListener('click', () => void replay());
media.addEventListener('ended', () => {
  status.textContent = 'Action button animation complete';
});

const startWhenVisible = new IntersectionObserver((entries) => {
  if (entries.some((entry) => entry.isIntersecting)) {
    void replay();
    startWhenVisible.disconnect();
  }
}, { threshold: 0.45 });
startWhenVisible.observe(viewer);
