// Responsive presentation only. Recording, audio routing and storage stay in app.js.
export class TabletLayout {
  constructor() {
    this.body = document.body;
    this.workspace = document.querySelector('.workspace');
    this.browser = document.querySelector('.take-browser');
    this.lyrics = document.querySelector('.lyrics');
    this.lyricsHome = document.createComment('lyrics home');
    this.lyrics.before(this.lyricsHome);
    document.getElementById('lyrics-slot').append(this.lyrics);
    this.lyrics.open = true;
    this.dock = document.getElementById('workspace-dock');
    this.tabs = [...document.querySelectorAll('[data-dock]')];
    const navigation = document.querySelector('.dock-tabs');
    navigation.setAttribute('role', 'group');
    navigation.setAttribute('aria-label', 'Jump to workspace section');
    this.tabs.forEach(tab => {
      tab.removeAttribute('role');
      tab.removeAttribute('aria-selected');
      tab.tabIndex = 0;
    });
    this.panels = ['mixer', 'effects', 'lyrics'];
    this.current = 'mixer';
    try {
      const saved = localStorage.getItem('booth-tablet-panel');
      if (this.panels.includes(saved)) this.current = saved;
    } catch {}
    this.tabs.forEach((tab, i) => {
      tab.onclick = () => this.select(tab.dataset.dock);
      tab.onkeydown = event => {
        let next;
        if (event.key === 'ArrowRight') next = (i + 1) % this.tabs.length;
        if (event.key === 'ArrowLeft') next = (i + this.tabs.length - 1) % this.tabs.length;
        if (event.key === 'Home') next = 0;
        if (event.key === 'End') next = this.tabs.length - 1;
        if (next !== undefined) {
          event.preventDefault();
          this.select(this.tabs[next].dataset.dock);
          this.tabs[next].focus();
        }
      };
    });
    document.getElementById('timeline-focus').onclick = () => this.focusTimeline(!this.body.classList.contains('timeline-focused'));
    document.getElementById('library-toggle').onclick = () => this.toggleBrowser();
    document.getElementById('take-browser-close').onclick = () => this.closeBrowser();
    document.getElementById('take-backdrop').onclick = () => this.closeBrowser();
    document.addEventListener('keydown', event => {
      if (event.key === 'Escape' && this.body.classList.contains('browser-open')) this.closeBrowser();
    });
    this.observer = new MutationObserver(() => this.syncBrowser());
    this.observer.observe(this.body, { attributes: true, attributeFilter: ['class'] });
    window.addEventListener('resize', () => this.resize());
    window.visualViewport?.addEventListener('resize', () => this.positionBrowser());
    this.resize();
  }

  resize() {
    const enabled = window.innerWidth >= 700;
    const wide = enabled && window.innerWidth >= 1000 && window.innerHeight >= 600;
    if (enabled !== this.enabled) {
      this.enabled = enabled;
      this.body.classList.toggle('tablet-layout', enabled);
      this.select(this.current, false);
    }
    if (wide !== this.wide) {
      this.wide = wide;
      this.body.classList.toggle('tablet-wide', wide);
      this.body.classList.remove('browser-open');
    }
    this.syncBrowser();
    this.positionBrowser();
  }

  select(name, save = true) {
    if (!this.panels.includes(name)) return;
    this.focusTimeline(false, false);
    this.current = name;
    this.dock.dataset.panel = name;
    this.tabs.forEach(tab => {
      const selected = tab.dataset.dock === name;
      tab.setAttribute('aria-pressed', String(selected));
    });
    for (const panel of this.panels) {
      const node = document.getElementById(panel + '-panel');
      node.hidden = false;
      node.setAttribute('role', 'region');
    }
    if (save) try { localStorage.setItem('booth-tablet-panel', name); } catch {}
    if (save) this.scrollWorkspace?.reveal(name);
  }

  focusTimeline(on, jump = true) {
    this.body.classList.toggle('timeline-focused', on);
    const button = document.getElementById('timeline-focus');
    button.setAttribute('aria-pressed', String(on));
    button.textContent = on ? '↓ Mixer / FX' : '↑ Timeline';
    this.scrollWorkspace?.queue();
    if (jump) this.scrollWorkspace?.reveal(on ? 'arrange' : 'mixer');
  }

  toggleBrowser() {
    if (this.wide) this.body.classList.toggle('browser-collapsed');
    else this.body.classList.toggle('browser-open');
    this.syncBrowser();
  }

  closeBrowser() {
    if (this.wide) this.body.classList.add('browser-collapsed');
    else this.body.classList.remove('browser-open');
    this.syncBrowser();
    document.getElementById('library-toggle').focus();
  }

  syncBrowser() {
    const open = this.wide ? !this.body.classList.contains('browser-collapsed') : this.body.classList.contains('browser-open');
    document.getElementById('library-toggle').setAttribute('aria-expanded', String(open));
    document.getElementById('take-backdrop').hidden = this.wide || !open;
  }

  positionBrowser() {
    if (this.wide) {
      this.browser.style.removeProperty('--drawer-top');
      return;
    }
    const transport = document.querySelector('.transport-bar');
    this.browser.style.setProperty('--drawer-top', transport.getBoundingClientRect().bottom + 'px');
  }
}
