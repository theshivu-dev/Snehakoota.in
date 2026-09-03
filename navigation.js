/* =========================================================
   SNEHAKOOTA — SHARED NAVIGATION FOUNDATION
   Stage 2A / 4C-3 / 4D-1 / 4D-2A
   ========================================================= */
(function(){
  'use strict';

  /* Shared NAV binding state: OFF means no 7-dot strip and no reserved binding width. */
  var NAV_BINDING_ENABLED = false;

  function applyBindingState(root,panel){
    var binding = root.querySelector('.sk-nav-binding');
    if (!binding) return;

    if (NAV_BINDING_ENABLED){
      binding.style.display='';
      panel.style.width='';
      panel.style.maxWidth='';
      return;
    }

    binding.style.display='none';
    panel.style.width='calc(76% - var(--sk-edge-width,22px))';
    panel.style.maxWidth='calc(var(--sk-panel-max-width,300px) - var(--sk-edge-width,22px))';
  }

  function makeCollectionsItem(links){
    if (!links || links.querySelector('[data-sk-collections]')) return;

    var item = document.createElement('div');
    item.setAttribute('data-sk-collections','true');
    item.style.marginTop = '.12rem';

    var button = document.createElement('button');
    button.type = 'button';
    button.setAttribute('aria-expanded','false');
    button.setAttribute('aria-controls','sk-collections-soon');
    button.style.cssText = 'width:100%;display:flex;align-items:center;min-height:44px;padding:.62rem .75rem;border-radius:10px;border:1px solid transparent;background:transparent;color:var(--ink,#2B2118);font:inherit;font-size:.95rem;line-height:1.25;text-align:left;cursor:pointer;transition:background .18s ease,color .18s ease,border-color .18s ease;';

    var icon = document.createElement('span');
    icon.setAttribute('aria-hidden','true');
    icon.textContent = '▣';
    icon.style.cssText = 'width:21px;min-width:21px;margin-right:.72rem;text-align:center;font-size:17px;line-height:21px;opacity:.72;';

    var label = document.createElement('span');
    label.textContent = 'Collections';

    var tag = document.createElement('span');
    tag.textContent = ' (soon)';
    tag.style.cssText = 'font-size:.72rem;margin-left:.2em;color:var(--ink-soft,#6B5C4C);opacity:.8;';

    var arrow = document.createElement('span');
    arrow.textContent = '›';
    arrow.setAttribute('aria-hidden','true');
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

    button.addEventListener('mouseenter',function(){
      button.style.background='rgba(255,246,232,.48)';
      button.style.borderColor='rgba(181,80,46,.08)';
    });
    button.addEventListener('mouseleave',function(){
      button.style.background='transparent';
      button.style.borderColor='transparent';
    });
    button.addEventListener('click',function(){
      var open = button.getAttribute('aria-expanded') === 'true';
      button.setAttribute('aria-expanded',String(!open));
      submenu.hidden = open;
      arrow.style.transform = open ? 'rotate(0deg)' : 'rotate(90deg)';
    });

    item.appendChild(button);
    item.appendChild(submenu);
    links.appendChild(item);
  }

  function addCollections(root){
    makeCollectionsItem(root && root.querySelector('.sk-nav-links'));
  }

  function isolatePageChrome(){
    /* Samparka's vertical dots are page-progress controls, not global NAV. */
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

    /* Samparka's top brand is page chrome, not a NAV row. */
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

    root.dataset.skNavReady='true';
    applyBindingState(root,panel);
    addCollections(root);

    function setOpen(open){
      body.classList.toggle('sk-nav-open',open);
      panel.setAttribute('aria-hidden',open ? 'false' : 'true');
      opener.setAttribute('aria-expanded',open ? 'true' : 'false');
      if (open) closer.focus();
      else opener.focus();
    }

    opener.addEventListener('click',function(){
      setOpen(!body.classList.contains('sk-nav-open'));
    });
    opener.addEventListener('keydown',function(event){
      if (event.key==='Enter' || event.key===' '){
        event.preventDefault();
        setOpen(!body.classList.contains('sk-nav-open'));
      }
    });
    closer.addEventListener('click',function(){ setOpen(false); });
    backdrop.addEventListener('click',function(){ setOpen(false); });

    document.addEventListener('keydown',function(event){
      if (event.key==='Escape' && body.classList.contains('sk-nav-open')) setOpen(false);
    });

    panel.addEventListener('click',function(event){
      var link=event.target.closest('a');
      if (link && link.getAttribute('href') && link.getAttribute('href')!=='#') setOpen(false);
    });
  }

  /* =========================================================
     UNIVERSAL SHARED NAVIGATION
     ---------------------------------------------------------
     A page that loads navigation.css + navigation.js may use the
     canonical shared NAV without embedding NAV markup itself.
     Existing [data-sk-nav-root] markup is reused unchanged.
     ========================================================= */
  function ensureSharedNavigation(){
    var existing=document.querySelector('[data-sk-nav-root]');
    if (existing) return existing;

    var root=document.createElement('div');
    root.setAttribute('data-sk-nav-root','');
    root.innerHTML=`
      <div class="sk-nav-backdrop" data-sk-nav-backdrop></div>
      <nav class="sk-nav-panel" data-sk-nav-panel aria-hidden="true">
        <div class="sk-nav-binding">
          <span class="sk-nav-ring"></span><span class="sk-nav-ring"></span><span class="sk-nav-ring"></span>
          <span class="sk-nav-ring"></span><span class="sk-nav-ring"></span><span class="sk-nav-ring"></span><span class="sk-nav-ring"></span>
        </div>
        <div class="sk-nav-body">
          <div class="sk-nav-top">
            <span class="sk-nav-brand"><span class="sk-nav-sneha">ಸ್ನೇಹ</span><span class="sk-nav-koota">ಕೂಟ</span></span>
            <button class="sk-nav-close" data-sk-nav-close aria-label="Close menu">&#10005;</button>
          </div>
          <div class="sk-nav-links">
            <a href="index.html">ಸ್ನೇಹಕೂಟ</a>
            <a href="story.html">ಪಯಣ</a>
            <a href="samparka.html">ಸ್ನೇಹಸಂಪರ್ಕ</a>
            <a href="#" class="disabled">Gallery <span class="sk-nav-tag">(soon)</span></a>
            <a href="#" class="disabled">Contact <span class="sk-nav-tag">(soon)</span></a>
          </div>
        </div>
      </nav>
      <button class="sk-nav-opener sk-nav-pulsing" data-sk-nav-opener aria-label="Open menu" aria-expanded="false"></button>
    `;

    document.body.insertBefore(root,document.body.firstChild);
    return root;
  }

  /* =========================================================
     STAGE 4D-2A — INDEX TRUE SHARED-NAV MIGRATION
     ---------------------------------------------------------
     Index previously contained a second, legacy copy of the NAV.
     It was being styled by shared CSS, but it was NOT the shared NAV
     component. That is why its trigger/position could drift from the
     Story/Samparka implementation and why the binding dots were not
     reliably the same component.

     We now replace the legacy Index NAV DOM with the exact same shared
     [data-sk-nav-root] structure used by Story and Samparka. The home
     page content/game remains untouched.
     ========================================================= */
  function initLegacyIndex(){
    if (document.querySelector('[data-sk-nav-root]')) return;

    var opener=document.querySelector('button.bookmark-tab');
    var closer=document.querySelector('.side-panel .closer');
    var backdrop=document.querySelector('.backdrop');
    var panel=document.querySelector('.side-panel');
    var edge=document.querySelector('.edge-strip');

    if (!opener || !closer || !backdrop || !panel) return;

    /* Remove the legacy page-level strip entirely. It is not site NAV. */
    if (edge) edge.remove();

    /* Remove the legacy trigger/panel/backdrop. The inline Index script
       may already have attached listeners, but removing these nodes also
       removes those handlers with them. */
    var legacyNodes=[opener,panel,backdrop];
    legacyNodes.forEach(function(node){ if (node && node.parentNode) node.parentNode.removeChild(node); });

    var root=document.createElement('div');
    root.setAttribute('data-sk-nav-root','');
    root.innerHTML=`
      <div class="sk-nav-backdrop" data-sk-nav-backdrop></div>
      <nav class="sk-nav-panel" data-sk-nav-panel aria-hidden="true">
        <div class="sk-nav-binding">
          <span class="sk-nav-ring"></span><span class="sk-nav-ring"></span><span class="sk-nav-ring"></span>
          <span class="sk-nav-ring"></span><span class="sk-nav-ring"></span><span class="sk-nav-ring"></span><span class="sk-nav-ring"></span>
        </div>
        <div class="sk-nav-body">
          <div class="sk-nav-top">
            <span class="sk-nav-brand"><span class="sk-nav-sneha">ಸ್ನೇಹ</span><span class="sk-nav-koota">ಕೂಟ</span></span>
            <button class="sk-nav-close" data-sk-nav-close aria-label="Close menu">&#10005;</button>
          </div>
          <div class="sk-nav-links">
            <a href="index.html" class="active">ಸ್ನೇಹಕೂಟ</a>
            <a href="story.html">ಪಯಣ</a>
            <a href="samparka.html">ಸ್ನೇಹಸಂಪರ್ಕ</a>
            <a href="#" class="disabled">Gallery <span class="sk-nav-tag">(soon)</span></a>
            <a href="#" class="disabled">Contact <span class="sk-nav-tag">(soon)</span></a>
          </div>
        </div>
      </nav>
      <button class="sk-nav-opener sk-nav-pulsing" data-sk-nav-opener aria-label="Open menu" aria-expanded="false"></button>
    `;

    document.body.insertBefore(root,document.body.firstChild);
    init(root);
  }

  function boot(){
    isolatePageChrome();
    var root=ensureSharedNavigation();
    init(root);
    initLegacyIndex();
  }

  if (document.readyState==='loading'){
    document.addEventListener('DOMContentLoaded',boot,{once:true});
  } else {
    boot();
  }

  window.SnehaKootaNavigation={
    init:init,
    close:function(){
      var root=document.querySelector('[data-sk-nav-root]');
      if (root){
        var panel=root.querySelector('[data-sk-nav-panel]');
        var opener=root.querySelector('[data-sk-nav-opener]');
        document.body.classList.remove('sk-nav-open');
        if (panel) panel.setAttribute('aria-hidden','true');
        if (opener) opener.setAttribute('aria-expanded','false');
      }
    }
  };
})();
