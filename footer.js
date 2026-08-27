/* =========================================================
   SNEHAKOOTA — SHARED FOOTER BEHAVIOUR
   Stage 5 — first visual/interaction test
   ---------------------------------------------------------
   The page supplies the footer markup. This script owns only
   the shared Terms / Privacy / Contact panel behaviour.
   ========================================================= */

(() => {
  const root = document.querySelector('[data-sk-footer]');
  if (!root) return;

  const backdrop = root.querySelector('[data-sk-footer-backdrop]');
  const modals = root.querySelectorAll('[data-sk-footer-modal]');
  const triggers = root.querySelectorAll('[data-footer-panel]');
  const closeButtons = root.querySelectorAll('[data-sk-footer-close]');

  let activeModal = null;
  let lastFocused = null;

  function closePanel() {
    if (!activeModal) return;

    activeModal.classList.remove('is-open');
    activeModal.setAttribute('aria-hidden', 'true');
    backdrop?.classList.remove('is-open');
    document.body.classList.remove('sk-footer-modal-open');

    if (lastFocused && typeof lastFocused.focus === 'function') {
      lastFocused.focus();
    }

    activeModal = null;
    lastFocused = null;
  }

  function openPanel(name, trigger) {
    const modal = root.querySelector(`[data-sk-footer-modal="${name}"]`);
    if (!modal) return;

    if (activeModal) closePanel();

    lastFocused = trigger || document.activeElement;
    activeModal = modal;

    modal.classList.add('is-open');
    modal.setAttribute('aria-hidden', 'false');
    backdrop?.classList.add('is-open');
    document.body.classList.add('sk-footer-modal-open');

    const close = modal.querySelector('[data-sk-footer-close]');
    if (close) close.focus();
  }

  triggers.forEach(trigger => {
    trigger.addEventListener('click', () => {
      openPanel(trigger.dataset.footerPanel, trigger);
    });
  });

  closeButtons.forEach(button => {
    button.addEventListener('click', closePanel);
  });

  backdrop?.addEventListener('click', closePanel);

  modals.forEach(modal => {
    modal.addEventListener('click', event => {
      if (event.target === modal) closePanel();
    });
  });

  document.addEventListener('keydown', event => {
    if (event.key === 'Escape' && activeModal) {
      event.preventDefault();
      closePanel();
    }
  });

  // Keep the footer year current without requiring page edits each year.
  root.querySelectorAll('[data-sk-footer-year]').forEach(el => {
    el.textContent = new Date().getFullYear();
  });
})();
