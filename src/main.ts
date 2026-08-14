import './style.css';

type Mode = 'collapsed' | 'expanded';

const root = document.querySelector<HTMLElement>('#app')!;

root.innerHTML = `
  <main class="page-shell">
    <nav class="localnav" aria-label="本地导航">
      <div class="localnav-inner">
        <strong>iPhone 17 Pro</strong>
        <div class="localnav-actions">
          <button class="localnav-menu" type="button">概览 <span>⌄</span></button>
          <a class="buy" href="#">购买</a>
        </div>
      </div>
    </nav>

    <section class="focus-section" aria-labelledby="focus-title">
      <header class="section-header">
        <h1 id="focus-title">定睛细看</h1>
        <a class="ar-link" href="#viewer">摆在眼前看看 <span>⌁</span></a>
      </header>

      <section id="viewer" class="product-viewer is-expanded" data-mode="expanded" aria-label="iPhone 17 Pro 操作按钮产品展示窗口">
        <picture class="product-media">
          <source media="(max-width: 734px)" srcset="/media/cn/action-button-small.webp">
          <source media="(max-width: 1068px)" srcset="/media/cn/action-button-medium.webp">
          <img src="/media/cn/action-button-large.webp" alt="星宇橙色 iPhone 17 Pro，正面外观，展示操作按钮、音量按钮和锁定屏幕。">
        </picture>

        <div class="tour-card" data-tour-card>
          <button class="tour-trigger" type="button" aria-expanded="true" data-open>
            <span class="plus-icon" aria-hidden="true">＋</span>
            <span>操作按钮</span>
          </button>
          <div class="tour-content" data-content>
            <p><strong>操作按钮。</strong>支持自定义，带你抄近道，直达常用功能。只要长按就能启动想用的功能，比如静音模式、翻译、快捷指令等。</p>
            <div class="paddles">
              <button type="button" aria-label="产品展示窗口上一项功能" data-prev>‹</button>
              <button type="button" aria-label="产品展示窗口下一项功能" data-next>›</button>
            </div>
          </div>
        </div>

        <button class="close-button" type="button" aria-label="关闭操作按钮介绍" data-close>×</button>
        <p class="sr-only" aria-live="polite" data-status>操作按钮已展开</p>
      </section>
    </section>
  </main>`;

const viewer = document.querySelector<HTMLElement>('[data-mode]')!;
const trigger = document.querySelector<HTMLButtonElement>('[data-open]')!;
const status = document.querySelector<HTMLElement>('[data-status]')!;

function setMode(mode: Mode) {
  viewer.dataset.mode = mode;
  viewer.classList.toggle('is-expanded', mode === 'expanded');
  viewer.classList.toggle('is-collapsed', mode === 'collapsed');
  trigger.setAttribute('aria-expanded', String(mode === 'expanded'));
  status.textContent = mode === 'expanded' ? '操作按钮已展开' : '操作按钮已收起';
}

document.querySelector('[data-close]')?.addEventListener('click', () => setMode('collapsed'));
trigger.addEventListener('click', () => setMode(viewer.dataset.mode === 'expanded' ? 'collapsed' : 'expanded'));
document.querySelector('[data-prev]')?.addEventListener('click', () => { status.textContent = '已到上一项，当前仍展示操作按钮'; });
document.querySelector('[data-next]')?.addEventListener('click', () => { status.textContent = '已到下一项，当前仍展示操作按钮'; });
