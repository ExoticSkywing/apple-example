import './style.css';

type ActionMode = 'silent' | 'translate' | 'recognize' | 'shortcut' | 'magnify';

interface ModeDefinition {
  label: string;
  eyebrow: string;
  status: string;
  icon: string;
}

const modes: Record<ActionMode, ModeDefinition> = {
  silent: {
    label: 'Silent mode',
    eyebrow: 'Silent',
    status: 'Silent mode on',
    icon: 'bell',
  },
  translate: {
    label: 'Translation',
    eyebrow: 'Translate',
    status: 'Ready to translate',
    icon: 'translate',
  },
  recognize: {
    label: 'Music recognition',
    eyebrow: 'Listening…',
    status: 'Listening for music',
    icon: 'recognize',
  },
  shortcut: {
    label: 'Shortcuts',
    eyebrow: 'Shortcut',
    status: 'Shortcut launched',
    icon: 'shortcut',
  },
  magnify: {
    label: 'Magnifier',
    eyebrow: 'Magnifier',
    status: 'Magnifier opened',
    icon: 'magnify',
  },
};

const icon = (name: string): string => {
  const paths: Record<string, string> = {
    plus: '<path d="M12 5v14M5 12h14"/>',
    bell: '<path d="M8.2 17h7.6M10 20h4M6.6 15.7h10.8c-1.1-1.2-1.8-2.8-1.8-4.5V9a3.6 3.6 0 0 0-7.2 0v2.2c0 1.7-.7 3.3-1.8 4.5Z"/><path d="M4 4l16 16"/>',
    translate: '<path d="M4 5h10v9H8l-4 3V5Z"/><path d="M11 10h9v8h-4l-3 2v-6"/><path d="M7 8h4M9 6v4M15.5 13.5h2M16.5 12.5v3"/>',
    recognize: '<path d="M8.1 14.7a4.7 4.7 0 0 1 0-6.6l2.1-2.1a4.7 4.7 0 0 1 6.6 0M15.9 9.3a4.7 4.7 0 0 1 0 6.6L13.8 18a4.7 4.7 0 0 1-6.6 0"/><path d="M9.2 12.8l5.6-5.6M9.2 16.8l5.6-5.6"/>',
    shortcut: '<rect x="4" y="5" width="7" height="5" rx="2.5"/><rect x="13" y="5" width="7" height="5" rx="2.5"/><rect x="4" y="14" width="7" height="5" rx="2.5"/><rect x="13" y="14" width="7" height="5" rx="2.5"/>',
    magnify: '<circle cx="11" cy="11" r="6"/><path d="m16 16 4 4M11 8v6M8 11h6"/>',
    chevronDown: '<path d="m7 9 5 5 5-5"/>',
    chevronUp: '<path d="m7 15 5-5 5 5"/>',
  };

  return `<svg viewBox="0 0 24 24" aria-hidden="true">${paths[name] ?? ''}</svg>`;
};

const app = document.querySelector<HTMLDivElement>('#app');
if (!app) throw new Error('App root not found');

app.innerHTML = `
  <main class="page-shell">
    <header class="topbar" aria-label="Project navigation">
      <a class="brand" href="#stage" aria-label="Action button interaction study">Action button</a>
      <p class="study-label">Interaction study</p>
      <button class="replay-top" type="button" data-replay>Replay</button>
    </header>

    <section class="stage" id="stage" aria-labelledby="feature-title">
      <div class="copy-zone">
        <p class="kicker">A direct path from intent to result</p>
        <h1 id="feature-title">Action button.</h1>
        <p class="intro">A customizable fast track to your favorite feature. Long press to launch the action you want — Silent mode, Translation, Shortcuts, and more.</p>

        <div class="feature-card" data-card>
          <button class="feature-card__toggle" type="button" aria-expanded="true" data-card-toggle>
            <span class="plus-icon">${icon('plus')}</span>
            <span>Action button</span>
          </button>
          <div class="feature-card__content" data-card-content>
            <p><strong>Long press the highlighted button.</strong> The screen responds immediately, so the connection between hardware and feature is never ambiguous.</p>
          </div>
        </div>

        <div class="mode-selector" role="group" aria-label="Choose an Action button feature">
          ${(Object.entries(modes) as [ActionMode, ModeDefinition][]).map(([key, mode]) => `
            <button class="mode-button${key === 'recognize' ? ' is-selected' : ''}" type="button" data-mode="${key}" aria-pressed="${key === 'recognize'}" aria-label="${mode.label}">
              ${icon(mode.icon)}
              <span>${mode.label}</span>
            </button>
          `).join('')}
        </div>

        <p class="instruction" data-instruction><span class="instruction-dot"></span> Press and hold the side button</p>
      </div>

      <div class="demo-zone" aria-label="Interactive phone demonstration">
        <div class="connector" aria-hidden="true">
          <span class="connector-rail">
            <i class="connector-mode connector-mode--silent">${icon('bell')}</i>
            <i class="connector-mode connector-mode--translate">${icon('translate')}</i>
            <i class="connector-mode connector-mode--recognize">${icon('recognize')}</i>
            <i class="connector-mode connector-mode--shortcut">${icon('shortcut')}</i>
            <i class="connector-mode connector-mode--magnify">${icon('magnify')}</i>
          </span>
          <span class="connector-line"></span>
        </div>
        <div class="phone-wrap" data-phone-wrap>
          <div class="phone" data-phone>
            <div class="phone-edge phone-edge--top"></div>
            <button class="action-key" type="button" aria-label="Press and hold Action button" data-action-key><span></span></button>
            <span class="volume-key volume-key--up" aria-hidden="true"></span>
            <span class="volume-key volume-key--down" aria-hidden="true"></span>
            <div class="screen">
              <div class="wallpaper" aria-hidden="true">
                <span class="ray ray--1"></span><span class="ray ray--2"></span><span class="ray ray--3"></span><span class="ray ray--4"></span><span class="ray ray--5"></span>
              </div>
              <time class="lock-time" datetime="09:41">9:41</time>
              <div class="island" data-island>
                <span class="island__icon" data-island-icon>${icon('recognize')}</span>
                <span class="island__label" data-island-label>Listening…</span>
                <span class="wave" aria-hidden="true"><i></i><i></i><i></i><i></i></span>
                <span class="island__close" aria-hidden="true">×</span>
              </div>
              <div class="success-toast" role="status" aria-live="polite" data-status>Listening for music</div>
            </div>
          </div>
        </div>
        <div class="hold-ring" aria-hidden="true" data-hold-ring><span></span></div>
      </div>

      <div class="tour-controls" aria-label="Demo controls">
        <button type="button" data-replay aria-label="Replay demonstration">${icon('chevronUp')}</button>
        <button type="button" data-replay aria-label="Replay demonstration">${icon('chevronDown')}</button>
      </div>
    </section>
  </main>
`;

const root = document.documentElement;
const status = document.querySelector<HTMLElement>('[data-status]');
const instruction = document.querySelector<HTMLElement>('[data-instruction]');
const islandLabel = document.querySelector<HTMLElement>('[data-island-label]');
const islandIcon = document.querySelector<HTMLElement>('[data-island-icon]');
const actionKey = document.querySelector<HTMLButtonElement>('[data-action-key]');
const phone = document.querySelector<HTMLElement>('[data-phone]');
const holdRing = document.querySelector<HTMLElement>('[data-hold-ring]');
const card = document.querySelector<HTMLElement>('[data-card]');
const cardToggle = document.querySelector<HTMLButtonElement>('[data-card-toggle]');
const cardContent = document.querySelector<HTMLElement>('[data-card-content]');

let activeMode: ActionMode = 'recognize';
let holdTimer = 0;
let holdStart = 0;
let isHolding = false;
let activated = false;

const setMode = (mode: ActionMode): void => {
  activeMode = mode;
  root.dataset.mode = mode;
  document.querySelectorAll<HTMLButtonElement>('[data-mode]').forEach((button) => {
    const selected = button.dataset.mode === mode;
    button.classList.toggle('is-selected', selected);
    button.setAttribute('aria-pressed', String(selected));
  });
  if (islandLabel) islandLabel.textContent = modes[mode].eyebrow;
  if (islandIcon) islandIcon.innerHTML = icon(modes[mode].icon);
  if (status) status.textContent = activated ? modes[mode].status : 'Hold to launch';
  if (instruction) instruction.lastChild!.textContent = ` Press and hold for ${modes[mode].label}`;
};

const cancelHold = (): void => {
  window.clearTimeout(holdTimer);
  isHolding = false;
  phone?.classList.remove('is-pressing');
  holdRing?.classList.remove('is-holding');
};

const activate = (): void => {
  if (!isHolding) return;
  activated = true;
  cancelHold();
  phone?.classList.add('is-active');
  actionKey?.classList.add('is-confirmed');
  if (status) status.textContent = modes[activeMode].status;
  if (instruction) instruction.innerHTML = '<span class="instruction-dot is-complete"></span> Launched — the on-screen response confirms it';
  window.setTimeout(() => actionKey?.classList.remove('is-confirmed'), 900);
};

const beginHold = (event: PointerEvent): void => {
  if (event.button !== 0 && event.pointerType === 'mouse') return;
  event.preventDefault();
  actionKey?.setPointerCapture(event.pointerId);
  activated = false;
  isHolding = true;
  holdStart = performance.now();
  phone?.classList.remove('is-active');
  phone?.classList.add('is-pressing');
  holdRing?.classList.add('is-holding');
  if (status) status.textContent = 'Keep holding…';
  if (instruction) instruction.innerHTML = '<span class="instruction-dot"></span> Keep holding until the screen responds';
  holdTimer = window.setTimeout(activate, 720);
};

const endHold = (): void => {
  const heldFor = performance.now() - holdStart;
  if (isHolding && heldFor < 720) {
    cancelHold();
    phone?.classList.remove('is-active');
    if (status) status.textContent = 'Hold a little longer';
    if (instruction) instruction.innerHTML = '<span class="instruction-dot is-warning"></span> Released early — press and hold again';
  }
};

const replay = (): void => {
  cancelHold();
  activated = false;
  phone?.classList.remove('is-active');
  actionKey?.classList.remove('is-confirmed');
  if (status) status.textContent = 'Hold to launch';
  if (instruction) instruction.innerHTML = '<span class="instruction-dot"></span> Press and hold the side button';
  const phoneWrap = document.querySelector<HTMLElement>('[data-phone-wrap]');
  phoneWrap?.classList.remove('replaying');
  void phoneWrap?.offsetWidth;
  phoneWrap?.classList.add('replaying');
};

document.querySelectorAll<HTMLButtonElement>('[data-mode]').forEach((button) => {
  button.addEventListener('click', () => setMode(button.dataset.mode as ActionMode));
});

actionKey?.addEventListener('pointerdown', beginHold);
actionKey?.addEventListener('pointerup', endHold);
actionKey?.addEventListener('pointercancel', cancelHold);
actionKey?.addEventListener('lostpointercapture', () => {
  if (isHolding) endHold();
});
actionKey?.addEventListener('contextmenu', (event) => event.preventDefault());

document.querySelectorAll<HTMLButtonElement>('[data-replay]').forEach((button) => button.addEventListener('click', replay));

cardToggle?.addEventListener('click', () => {
  const isExpanded = cardToggle.getAttribute('aria-expanded') === 'true';
  cardToggle.setAttribute('aria-expanded', String(!isExpanded));
  card?.classList.toggle('is-collapsed', isExpanded);
  if (cardContent) cardContent.hidden = isExpanded;
});

window.addEventListener('keydown', (event) => {
  if (event.key === 'Escape') replay();
});

setMode(activeMode);
window.setTimeout(() => document.querySelector<HTMLElement>('[data-phone-wrap]')?.classList.add('is-ready'), 80);
