/* =========================================================
   SNEHAKOOTA — SHARED NAVIGATION FOUNDATION
   Stage 2A
   ---------------------------------------------------------
   Purpose:
   - One small, reusable controller for the site navigation panel.
   - Handles open / close / keyboard access only.
   - Does NOT handle authentication, account state, memberships,
     Supabase, page authorization, or page-specific behaviour.

   Security rule:
   Frontend navigation visibility is never a security boundary.
   Protected content must still be enforced by the application/data layer.
   ========================================================= */
(function(){
  'use strict';

  function init(root){
    if (!root || root.dataset.skNavReady === 'true') return;

    var body = document.body;
    var opener = root.querySelector('[data-sk-nav-opener]');
    var closer = root.querySelector('[data-sk-nav-close]');
    var backdrop = root.querySelector('[data-sk-nav-backdrop]');
    var panel = root.querySelector('[data-sk-nav-panel]');

    if (!opener || !closer || !backdrop || !panel) return;

    root.dataset.skNavReady = 'true';

    function setOpen(open){
      body.classList.toggle('sk-nav-open', open);
      panel.setAttribute('aria-hidden', open ? 'false' : 'true');
      opener.setAttribute('aria-expanded', open ? 'true' : 'false');
      if (open) closer.focus();
      else opener.focus();
    }

    opener.addEventListener('click', function(){
      setOpen(!body.classList.contains('sk-nav-open'));
    });

    closer.addEventListener('click', function(){ setOpen(false); });
    backdrop.addEventListener('click', function(){ setOpen(false); });

    document.addEventListener('keydown', function(event){
      if (event.key === 'Escape' && body.classList.contains('sk-nav-open')){
        setOpen(false);
      }
    });

    panel.addEventListener('click', function(event){
      var link = event.target.closest('a');
      if (link && link.getAttribute('href') && link.getAttribute('href') !== '#'){
        setOpen(false);
      }
    });
  }

  function boot(){
    document.querySelectorAll('[data-sk-nav-root]').forEach(init);
  }

  if (document.readyState === 'loading'){
    document.addEventListener('DOMContentLoaded', boot, { once:true });
  } else {
    boot();
  }

  window.SnehaKootaNavigation = {
    init: init,
    close: function(){
      var root = document.querySelector('[data-sk-nav-root]');
      if (!root) return;
      var panel = root.querySelector('[data-sk-nav-panel]');
      var opener = root.querySelector('[data-sk-nav-opener]');
      document.body.classList.remove('sk-nav-open');
      if (panel) panel.setAttribute('aria-hidden', 'true');
      if (opener) opener.setAttribute('aria-expanded', 'false');
    }
  };
})();
