/* =========================================================
   SNEHAKOOTA — SHARED NAVIGATION FOUNDATION
   Stage 2A / 4C-3 / 4D-1 / 4D-2A
   ========================================================= */
(function(){
  'use strict';

  /* Keep one browser Supabase client available to shared components.
     Account creates the client on ordinary pages; Control Panel can provide
     one before Account loads. No second auth/session system is introduced. */
  if (window.supabase && typeof window.supabase.createClient === 'function' && !window.__SK_SUPABASE_CLIENT_BRIDGED){
    var originalCreateClient=window.supabase.createClient.bind(window.supabase);
    window.supabase.createClient=function(){
      var client=originalCreateClient.apply(null,arguments);
      if (!window.SnehakootaSupabaseClient) window.SnehakootaSupabaseClient=client;
      return client;
    };
    window.__SK_SUPABASE_CLIENT_BRIDGED=true;
  }

  function installAccountManagementEntry(){
    if (!window.SnehakootaSupabaseClient) return;

    async function syncEntry(){
      var body=document.getElementById('skaBody');
      if (!body || !window.SK_AUTH || !window.SK_AUTH.signedIn) return removeEntry();

      try{
        var result=await window.SnehakootaSupabaseClient.rpc('controlpanel_get_context');
        var context=result && result.data ? result.data : null;
        if (!context || context.canAccess !== true) return removeEntry();

        if (body.querySelector('#skaManageSite')) return;
        var invite=body.querySelector('#skaInviteFriend');
        var row=document.createElement('a');
        row.id='skaManageSite';
        row.className='ska-action-row';
        row.href='controlpanel.html';
        row.innerHTML='<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 3v18M3 12h18"></path><circle cx="12" cy="12" r="8.5"></circle></svg><span><strong>ನಿರ್ವಹಣೆ</strong><small>ಸದಸ್ಯರು ಮತ್ತು ಸಮುದಾಯವನ್ನು ನೋಡಿಕೊಳ್ಳಿ</small></span>';
        if (invite && invite.parentNode) invite.parentNode.insertBefore(row,invite.nextSibling);
        else body.insertBefore(row,body.firstChild);
      }catch(error){
        console.warn('SnehaKoota management entry could not be resolved.',error);
        removeEntry();
      }
    }

    function removeEntry(){
      var existing=document.getElementById('skaManageSite');
      if (existing) existing.remove();
    }

    document.addEventListener('sk:auth-state',function(){ syncEntry(); });
    document.addEventListener('click',function(event){
      var closeTarget=event.target.closest && event.target.closest('#skaClose,#skaBackdrop');
      if (closeTarget) window.setTimeout(syncEntry,0);
    });
    window.setTimeout(syncEntry,0);
  }

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

  function makeBarahaItem(links){
    if (!links || links.querySelector('[data-sk-baraha]')) return;

    var story = links.querySelector('a[href="story.html"]');
    if (!story) return;

    var item = document.createElement('a');
    item.href = 'baraha.html';
    item.setAttribute('data-sk-baraha','true');
    item.textContent = 'ಬರಹ';
    links.insertBefore(item,story.nextSibling);
  }

  function addBaraha(root){
    makeBarahaItem(root && root.querySelector('.sk-nav-links'));
  }

  function markActivePage(root){
    var links = root && root.querySelectorAll('.sk-nav-links a');
    if (!links) return;

    var path = window.location.pathname.split('/').pop() || 'index.html';
    if (path === '') path = 'index.html';

    links.forEach(function(link){
      var href = link.getAttribute('href');
      if (!href || href === '#') return;
      var linkPath = href.split('/').pop() || 'index.html';
      var isActive = linkPath === path;
      link.classList.toggle('active', isActive);
      link.style.fontWeight = isActive ? '600' : '500';
    });
  }

  function isolatePageChrome(){
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
    addBaraha(root);
    markActivePage(root);
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

  function initLegacyIndex(){
    if (document.querySelector('[data-sk-nav-root]')) return;

    var opener=document.querySelector('button.bookmark-tab');
    var closer=document.querySelector('.side-panel .closer');
    var backdrop=document.querySelector('.backdrop');
    var panel=document.querySelector('.side-panel');
    var edge=document.querySelector('.edge-strip');

    if (!opener || !closer || !backdrop || !panel) return;

    if (edge) edge.remove();
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
    if (document.querySelector('[data-sk-nav-root]')){
      init(document.querySelector('[data-sk-nav-root]'));
    } else if (document.querySelector('button.bookmark-tab') && document.querySelector('.side-panel') && document.querySelector('.backdrop')){
      initLegacyIndex();
    } else {
      init(ensureSharedNavigation());
    }
    installAccountManagementEntry();
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
