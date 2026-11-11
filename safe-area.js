// Layout only: protect Apple's Home Screen status-bar feathering even when
// WebKit reports a zero top inset. Normal browser/desktop pages use env() only.
(() => {
  const mode = window.matchMedia('(display-mode: standalone)');
  const appleTouch = /iPad|iPhone|iPod/.test(navigator.userAgent) ||
    (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);
  const update = () => document.documentElement.classList.toggle(
    'rr-apple-home-screen', appleTouch && (navigator.standalone === true || mode.matches));
  update();
  mode.addEventListener?.('change', update);
  window.addEventListener('pageshow', update);
})();
