import './style.css';

type Mode = 'silent' | 'translate' | 'recognize' | 'shortcut' | 'magnify';

interface ModeView {
  label: string;
  icon: string;
  tone: string;
}

const icon = (name: string): string => {
  const paths: Record<string, string> = {
    bell: '<path d="M8.3 17.4h7.4M9.4 20h5.2M5.8 14.9h12.4c-1.5-1.7-2.2-3.5-2.2-5.5A4 4 0 0 0 9.3 6.5c-.8.8-1.3 1.8-1.3 2.9 0 2-.7 3.8-2.2 5.5Z"/><path d="M4 4l16 16"/>',
    translate: '<path d="M4.5 5.5h9v7h-5l-3.8 3v-3h-.2v-7Z"/><path d="M10.5 11.5h9v7h-.2v3l-3.8-3h-5v-7Z"/><path d="M7 8.7h4M9 7v3.4M14 14.2h3.1M14.7 16.6l.9-2.4.9 2.4"/>',
    recognize: '<path d="M8.1 14.7a4.7 4.7 0 0 1 0-6.6l2.1-2.1a4.7 4.7 0 0 1 6.6 0M15.9 9.3a4.7 4.7 0 0 1 0 6.6L13.8 18a4.7 4.7 0 0 1-6.6 0"/><path d="M9.2 12.8l5.6-5.6M9.2 16.8l5.6-5.6"/>',
    shortcut: '<rect x="5" y="5" width="5" height="5" rx="2"/><rect x="14" y="5" width="5" height="5" rx="2"/><rect x="5" y="14" width="5" height="5" rx="2"/><rect x="14" y="14" width="5" height="5" rx="2"/>',
    magnify: '<circle cx="10.5" cy="10.5" r="5.8"/><path d="m15 15 4.5 4.5M10.5 8v5M8 10.5h5"/>',
    chevronLeft: '<path d="m14.5 6-6 6 6 6"/>',
    chevronRight: '<path d="m9.5 6 6 6-6 6"/>',
    close: '<path d="m7 7 10 10M17 7 7 17"/>',
  };
  return `<svg viewBox="0 0 24 24" aria-hidden="true">${paths[name] ?? ''}</svg>`;
};

const modes: Record<Mode, ModeView> = {
  silent: { label: 'Silent mode', icon: 'bell', tone: '#ff453a' },
  translate: { label: 'Translation', icon: 'translate', tone: '#8ee8de' },
  recognize: { label: 'Music recognition', icon: 'recognize', tone: '#0a84ff' },
  shortcut: { label: 'Shortcuts', icon: 'shortcut', tone: '#bf5af2' },
  magnify: { label: 'Magnifier', icon: 'magnify', tone: '#ff9f0a' },
};

const order: Mode[] = ['silent', 'translate', 'recognize', 'shortcut', 'magnify'];

document.querySelector<HTMLDivElement>('#app')!.innerHTML = `
  <main class="page" data-page data-mode="recognize" data-scope="action-button">
    <div class="mobile-module">
    <nav class="localnav" aria-label="iPhone 17 local navigation">
      <strong class="localnav__title">iPhone 17</strong>
      <div class="localnav__actions">
        <button class="localnav__explore" type="button">Explore</button>
        <button class="localnav__buy" type="button">Buy</button>
      </div>
    </nav>

    <section class="product-viewer" aria-label="Action button product viewer" data-viewer>
      <div class="media-stage" aria-hidden="true">
        <div class="function-rail" data-function-rail>
          ${order.map((mode) => `
            <span class="rail-icon rail-icon--${mode}" data-rail-mode="${mode}">
              ${icon(modes[mode].icon)}
            </span>
          `).join('')}
        </div>
        <span class="hardware-link"></span>

        <div class="phone" data-phone>
          <div class="phone__metal"></div>
          <button class="action-key" data-action-key type="button" aria-label="Replay Action button animation"><span></span></button>
          <span class="volume-key volume-key--up"></span>
          <span class="volume-key volume-key--down"></span>

          <div class="screen">
            <div class="wallpaper"></div>
            <div class="lock-date">Tue Apr 1</div>
            <div class="lock-time"><span>9</span><span>:</span><span>41</span></div>
            <div class="dynamic-island" data-island>
              <span class="island-icon" data-island-icon>${icon('recognize')}</span>
              <span class="island-copy" data-island-copy>Listening...</span>
              <span class="island-wave"><i></i><i></i><i></i><i></i></span>
              <span class="island-dismiss">${icon('close')}</span>
            </div>
            <span class="screen-orb" data-screen-orb>${icon('translate')}</span>
          </div>
        </div>
      </div>

      <button class="viewer-close" data-close type="button" aria-label="Close Action button detail">
        ${icon('close')}
      </button>

      <section class="feature-deck" data-deck aria-label="Action button description carousel">
        <article class="feature-card" data-card>
          <p><strong>Action button.</strong><br><span data-card-copy>A customizable fast track to your favorite feature. Long press to launch the action you want — Silent mode, Translation, Shortcuts, and more.</span></p>
        </article>
        <button class="deck-arrow deck-arrow--prev" data-prev type="button" aria-label="Previous Action button animation state">${icon('chevronLeft')}</button>
        <button class="deck-arrow deck-arrow--next" data-next type="button" aria-label="Next Action button animation state">${icon('chevronRight')}</button>
      </section>

      <button class="collapsed-pill" data-open type="button" aria-label="Open Action button detail">
        <span class="plus">+</span><span>Action button</span>
      </button>
      <p class="sr-status" data-status aria-live="polite">Music recognition selected</p>
    </section>
    </div>
  </main>
`;

const page = document.querySelector<HTMLElement>('[data-page]')!;
const viewer = document.querySelector<HTMLElement>('[data-viewer]')!;
const card = document.querySelector<HTMLElement>('[data-card]')!;
const status = document.querySelector<HTMLElement>('[data-status]')!;
const islandIcon = document.querySelector<HTMLElement>('[data-island-icon]')!;
const islandCopy = document.querySelector<HTMLElement>('[data-island-copy]')!;
const actionKey = document.querySelector<HTMLButtonElement>('[data-action-key]')!;
const closeButton = document.querySelector<HTMLButtonElement>('[data-close]')!;
const openButton = document.querySelector<HTMLButtonElement>('[data-open]')!;

let modeIndex = 2;
let timeline: number[] = [];
let gestureStart = 0;

const clearTimeline = (): void => {
  timeline.forEach(window.clearTimeout);
  timeline = [];
};

const setMode = (mode: Mode, announce = true): void => {
  modeIndex = order.indexOf(mode);
  page.dataset.mode = mode;
  document.documentElement.style.setProperty('--mode-tone', modes[mode].tone);
  islandIcon.innerHTML = icon(modes[mode].icon);
  islandCopy.textContent = mode === 'silent'
    ? 'Silent'
    : mode === 'translate'
      ? 'Listening'
      : mode === 'recognize'
        ? 'Listening...'
        : mode === 'shortcut'
          ? 'Running shortcut'
          : 'Magnifier';
  if (announce) status.textContent = `${modes[mode].label} selected`;
};

const pulseKey = (): void => {
  actionKey.classList.remove('is-pressed');
  void actionKey.offsetWidth;
  actionKey.classList.add('is-pressed');
};

const replay = (): void => {
  clearTimeline();
  viewer.classList.remove('is-collapsed');
  closeButton.focus({ preventScroll: true });
  card.classList.add('is-entering');
  setMode('silent', false);
  pulseKey();
  timeline.push(window.setTimeout(() => {
    setMode('translate', false);
    pulseKey();
  }, 1050));
  timeline.push(window.setTimeout(() => {
    setMode('recognize');
    pulseKey();
  }, 2250));
  timeline.push(window.setTimeout(() => card.classList.remove('is-entering'), 2650));
};

const seek = (direction: -1 | 1): void => {
  clearTimeline();
  const nextIndex = (modeIndex + direction + order.length) % order.length;
  card.classList.remove('swipe-left', 'swipe-right');
  void card.offsetWidth;
  card.classList.add(direction > 0 ? 'swipe-left' : 'swipe-right');
  setMode(order[nextIndex]);
  pulseKey();
  timeline.push(window.setTimeout(() => card.classList.remove('swipe-left', 'swipe-right'), 430));
};

document.querySelector<HTMLButtonElement>('[data-prev]')!.addEventListener('click', () => seek(-1));
document.querySelector<HTMLButtonElement>('[data-next]')!.addEventListener('click', () => seek(1));
actionKey.addEventListener('click', replay);

closeButton.addEventListener('click', () => {
  clearTimeline();
  viewer.classList.add('is-collapsed');
  status.textContent = 'Action button detail closed';
  openButton.focus({ preventScroll: true });
});
openButton.addEventListener('click', replay);

viewer.addEventListener('pointerdown', (event) => {
  gestureStart = event.clientX;
});
viewer.addEventListener('pointerup', (event) => {
  const delta = event.clientX - gestureStart;
  if (Math.abs(delta) > 54 && !viewer.classList.contains('is-collapsed')) seek(delta < 0 ? 1 : -1);
});

window.addEventListener('keydown', (event) => {
  if (event.key === 'ArrowLeft') seek(-1);
  if (event.key === 'ArrowRight') seek(1);
  if (event.key === 'Escape') closeButton.click();
});

window.setTimeout(replay, 250);
