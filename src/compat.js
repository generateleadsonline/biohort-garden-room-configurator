// Small gaps in older mobile browsers that the designer would otherwise trip over. Imported first
// by app.js; each patch applies only where the feature is missing. (From the SMART configurator.)

// Safari before 15.4: Array/String .at() and Object.hasOwn().
for (const C of [Array, String]) {
  if (!C.prototype.at) {
    Object.defineProperty(C.prototype, 'at', {
      value(i) { i = Math.trunc(i) || 0; if (i < 0) i += this.length; return i < 0 || i >= this.length ? undefined : this[i]; },
      writable: true, configurable: true
    });
  }
}
if (!Object.hasOwn) Object.defineProperty(Object, 'hasOwn', {value: (o, k) => Object.prototype.hasOwnProperty.call(o, k), writable: true, configurable: true});
// Safari before 14: replaceChildren (the SVG fallback renderer clears itself with it).
if (typeof Element !== 'undefined' && !Element.prototype.replaceChildren) {
  Element.prototype.replaceChildren = function (...nodes) { while (this.lastChild) this.removeChild(this.lastChild); this.append(...nodes); };
}

// Safari before 15.4 has no <dialog>: show the forms as fixed panels instead (dialog.is-shim).
export function shimDialogs(root = document) {
  if (typeof window.HTMLDialogElement === 'function') return;
  for (const d of root.querySelectorAll('dialog')) {
    d.classList.add('is-shim');
    d.showModal = () => { d.setAttribute('open', ''); document.documentElement.classList.add('has-shim-dialog'); };
    d.close = () => {
      if (!d.hasAttribute('open')) return;
      d.removeAttribute('open');
      document.documentElement.classList.remove('has-shim-dialog');
      d.dispatchEvent(new Event('close'));
    };
    d.addEventListener('keydown', e => { if (e.key === 'Escape') d.close(); });
    d.querySelectorAll('form[method=dialog] button').forEach(b => b.addEventListener('click', e => { e.preventDefault(); d.close(); }));
  }
}
