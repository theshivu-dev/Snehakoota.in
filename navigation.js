/* =========================================================
   SNEHAKOOTA — SHARED NAVIGATION FOUNDATION
   Stage 2A / 4C-3 / 4D-1
   ========================================================= */
(function(){
  'use strict';

  function addCollections(root){
    var links = root.querySelector('.sk-nav-links');
    if (!links || links.querySelector('[data-sk-collections]')) return;

    var item = document.createElement('div');
    item.setAttribute('data-sk-collections', 'true');
    item.style.marginTop = '.12rem';

    var button = document.createElement('button');
    button.type = 'button';
    button.setAttribute('aria-expanded', 'false');
    button.setAttribute('aria-controls', 'sk-collections-soon');
    button.style.cssText = 'width:100%;display:flex;align-items:center;min-height:44px;padding:.62rem .75rem;border-radius:10px;border:1px solid transparent;background:transparent;color:var(--ink,#2B2118);font:inherit;font-size:.95rem;line-height:1.25;text-align:left;cursor:pointer;transition:background .18s ease,color .18s ease,border-color .18s ease;';

    var icon = document.createElement('span');
    icon.setAttribute('aria-hidden', 'true');
    icon.textContent = '▣';
    icon.style.cssText = 'width:21px;min-width:21px;margin-right:.72rem;text-align:center;font-size:17px;line-height:21px;opacity:.72;';

    var label = document.createElement('span');
    label.textContent = 'Collections';

    var tag = document.createElement('span');
    tag.textContent = ' (soon)';
    tag.style.cssText = 'font-size:.72rem;margin-left:.2em;color:var(--ink-soft,#6B5C4C);opacity:.8;';

    var arrow = document.createElement('span');
    arrow.textContent = '›';
    arrow.setAttribute('aria-hidden', 'true');
    arrow.style.cssText = 'margin-left:auto;font-size:1.25rem;line-height:1;opacity:.65;transition:transform .18s ease;';

    button.appendChild(icon);
    button.appendChild(label);
    button.appendChild(tag);
    button.appendChild(arrow);

    var submenu = document.createElement('div');
    submenu.id = 'sk-collections-soon';
    submenu.hidden = true;
    submenu.style.cssText = 'margin:.12rem 0 .28rem 2.55rem;padding:.45rem .7rem;border-left:1px solid rgba(181,80,46,.16);color:var(--ink-soft,#6B5C4C);font-size:.78rem;line-height:1.55;';
    submenu.innerHTML = '<div style="opacity:.78;">Quotes · Photos · Memories · Resources</div><div style="font-size:.7rem;margin-top:.15rem;opacity:.68;">Coming soon — these are future collection ideas.</div>';

    button.addEventListener('mouseenter', function(){
      button.style.background = 'rgba(255,246,232,.48)';
      button.style.borderColor = 'rgba(181,80,46,.08)';
    });
    button.addEventListener('mouseleave', function(){
      button.style.background = 'transparent';
      button.style.borderColor = 'transparent';
    });
    button.addEventListener('click', function(){
      var open = button.getAttribute('aria-expanded') === 'true';
      button.setAttribute('aria-expanded', String(!open));
      submenu.hidden = open;
      arrow.style.transform = open ? 'rotate(0deg)' : 'rotate(90deg)';
    });

    item.appendChild(button);
    item.appendChild(submenu);
    links.appendChild(item);
  }

  function isolatePageChrome(){
    /* Samparka's vertical dots are page-progress controls, not NAV. */
    var edge = document.querySelector('.edge-strip');
    if (edge){
      edge.querySelectorAll('.dot-btn').forEach(function(btn){
        btn.style.setProperty('appearance','none','important');
        btn.style.setProperty('-webkit-appearance','none','important');
        btn.style.setProperty('border','0','important');
        btn.style.setProperty('outline','0','important');
        btn.style.setProperty('background','transparent','important');
        btn.style.setProperty('box-shadow','none','important');
        btn.style.setProperty('padding','0','important');
        btn.style.setProperty('margin','0','important');
        btn.style.setProperty('width','10px','important');
        btn.style.setProperty('height','10px','important');
        btn.style.setProperty('min-width','10px','important');
        btn.style.setProperty('min-height','10px','important');
        btn.style.setProperty('border-radius','50%','important');
        btn.style.setProperty('display','flex','important');
        btn.style.setProperty('align-items','center','important');
        btn.style.setProperty('justify-content','center','important');
      });
      edge.querySelectorAll('.dot-btn .ring').forEach(function(ring){
        ring.style.setProperty('width','8px','important');
        ring.style.setProperty('height','8px','important');
        ring.style.setProperty('border-radius','50%','important');
        ring.style.setProperty('background','rgba(181,80,46,.40)','important');
        ring.style.setProperty('display','block','important');
        ring.style.setProperty('border','0','important');
        ring.style.setProperty('box-shadow','none','important');
      });
    }

    /* Samparka's top brand is a page link, not a NAV row. */
    var brand = document.querySelector('.topbar .brand');
    if (brand){
      brand.style.setProperty('text-decoration','none','important');
      brand.style.setProperty('color','var(--rust,#B5502E)','important');
    }
  }

  function init(root){
    if (!root || root.dataset.skNavReady === 'true') return;

    var body = document.body;
    var opener = root.querySelector('[data-sk-nav-opener]');
    var closer = root.querySelector('[data-sk-nav-close]');
    var backdrop = root.querySelector('[data-sk-nav-backdrop]');
    var panel = root.querySelector('[data-sk-nav-panel]');

    if (!opener || !closer || !backdrop || !panel) return;

    root.dataset.skNavReady = 'true';
    addCollections(root);

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
    isolatePageChrome();
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
