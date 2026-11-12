// Panel navigation stays independent of microphone permission and recording state.
export class InputPanel {
  constructor() {
    this.panel = document.getElementById('mic-panel');
    this.toggle = document.getElementById('mic-panel-toggle');
    this.close = document.getElementById('mic-panel-close');
    this.toggle.onclick = () => this.setOpen(this.panel.hidden);
    this.close.onclick = () => this.setOpen(false, true);
    const dismissOutside = event => {
      if (document.getElementById('record-setup')?.open) return;
      if (!this.panel.hidden && !this.panel.contains(event.target) && !this.toggle.contains(event.target)) {
        this.setOpen(false);
      }
    };
    document.addEventListener('pointerdown', dismissOutside, true);
    document.addEventListener('click', dismissOutside, true);
    document.addEventListener('keydown', event => {
      if (event.key === 'Escape' && !this.panel.hidden) {
        event.preventDefault();
        this.setOpen(false, true);
      }
    });
    document.addEventListener('scroll', () => this.position(), true);
    window.addEventListener('resize', () => this.position());
    window.visualViewport?.addEventListener('resize', () => this.position());
    window.visualViewport?.addEventListener('scroll', () => this.position());
    this.setOpen(!this.panel.hidden);
  }

  setOpen(open, restoreFocus = false) {
    this.panel.hidden = !open;
    this.toggle.setAttribute('aria-expanded', String(open));
    if (open) this.position();
    else if (restoreFocus) this.toggle.focus({preventScroll:true});
  }

  position() {
    if (this.panel.hidden) return;
    const viewport = window.visualViewport;
    const viewportTop = viewport?.offsetTop || 0;
    const viewportHeight = viewport?.height || window.innerHeight;
    const bottom = viewportTop + viewportHeight - 8;
    const anchor = document.querySelector('.transport-bar').getBoundingClientRect().bottom + 4;
    const top = Math.max(viewportTop + 8, Math.min(anchor, bottom - 120));
    this.panel.style.position = 'fixed';
    this.panel.style.top = top + 'px';
    this.panel.style.maxHeight = Math.max(80, bottom - top) + 'px';
  }
}
