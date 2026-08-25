/* ===================================================================
   SNEHAKOOTA ACCOUNT WIDGET — logic
   Version: 1  (bump the ?v= on the <link>/<script> tags when you edit
   this file — browsers cache .js aggressively, and this file now runs
   sitewide, so a stale cached copy means EVERY page shows old behavior)

   Drop this + account.css into any page that has:
     <div id="sk-account-root"></div>
   right before </body>, then:
     <link rel="stylesheet" href="account.css?v=1">
     <script src="account.js?v=1" defer></script>

   The "Continue with Google" button now fires the tested Supabase
   Google OAuth flow directly from this widget. signin.html remains
   available as a backup/testing page, but is no longer part of the
   normal account-widget login flow.

   When a second provider (Apple, passkey, etc.) is added, give that
   provider an `action` function below. The render loop already supports
   both direct actions and links for future providers.
   =================================================================== */
(function(){
  "use strict";

  var mount = document.getElementById('sk-account-root');
  if (!mount) return;

  var SUPABASE_URL = 'https://hukfpoxvtutvhjfdzcuh.supabase.co';
  var SUPABASE_PUBLISHABLE_KEY = 'sb_publishable_6_9Fc319vRsSZSksFlhzSw_28-glehH';

  if (!window.supabase) {
    console.error('account.js: supabase-js must be loaded before this script.');
    return;
  }
  var supabaseClient = window.supabase.createClient(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY, {
    auth: { persistSession: true, autoRefreshToken: true, detectSessionInUrl: true, flowType: 'pkce' }
  });

  /* -----------------------------------------------------------------
     PROVIDERS — data-driven list. Add an entry here to add a sign-in
     option everywhere at once; nothing else in this file needs to
     change. `style` is 'ska-primary' (filled/first) or 'ska-secondary'.
     ----------------------------------------------------------------- */
  function currentPage(){
    var p = location.pathname.split('/').pop();
    return p && p.length ? p : 'index.html';
  }
  var GOOGLE_ICON =
    '<svg viewBox="0 0 24 24" aria-hidden="true">' +
    '<path fill="#4285F4" d="M21.35 12.23c0-.72-.06-1.42-.18-2.09H12v3.96h5.23a4.47 4.47 0 0 1-1.94 2.93v2.43h3.14c1.84-1.69 2.92-4.18 2.92-7.23z"/>' +
    '<path fill="#34A853" d="M12 21.5c2.63 0 4.84-.87 6.45-2.37l-3.14-2.43c-.87.58-1.98.92-3.31.92-2.54 0-4.69-1.72-5.46-4.03H3.3v2.5A9.74 9.74 0 0 0 12 21.5z"/>' +
    '<path fill="#FBBC05" d="M6.54 13.59A5.86 5.86 0 0 1 6.23 12c0-.55.11-1.08.31-1.59v-2.5H3.3A9.75 9.75 0 0 0 2.25 12c0 1.57.38 3.05 1.05 4.09l3.24-2.5z"/>' +
    '<path fill="#EA4335" d="M12 6.38c1.43 0 2.71.49 3.72 1.46l2.79-2.79C16.84 3.5 14.63 2.5 12 2.5a9.74 9.74 0 0 0-8.7 5.41l3.24 2.5C7.31 8.1 9.46 6.38 12 6.38z"/>' +
    '</svg>';

  var providers = [
    {
      id: 'google',
      label: 'Continue with Google',
      style: 'ska-primary',
      icon: GOOGLE_ICON,
      action: function(btn){
        if (btn) btn.disabled = true;

        var redirectTo = window.location.origin + window.location.pathname;
        var message = document.getElementById('skaMessage');
        if (message) message.textContent = 'Google ಮೂಲಕ ಸುರಕ್ಷಿತವಾಗಿ ಸೈನ್ ಇನ್ ಮಾಡಲಾಗುತ್ತಿದೆ…';

        supabaseClient.auth.signInWithOAuth({
          provider: 'google',
          options: {
            redirectTo: redirectTo,
            queryParams: { prompt: 'select_account' }
          }
        }).then(function(res){
          if (res.error) {
            console.error('Google sign-in error:', res.error);
            if (message) message.textContent = 'ಸೈನ್ ಇನ್ ಮಾಡಲು ಸಾಧ್ಯವಾಗಲಿಲ್ಲ. ದಯವಿಟ್ಟು ಮತ್ತೆ ಪ್ರಯತ್ನಿಸಿ.';
            if (btn) btn.disabled = false;
          }
        });
      }
    }
    /* Next provider goes here, e.g.:
    {
      id: 'apple',
      label: 'Continue with Apple',
      style: 'ska-secondary',
      icon: '<svg>...</svg>',
      action: function(btn){ ... }
    }
    */
  ];

  /* ----------------------------------------------------------------- */

  mount.innerHTML =
    '<div class="ska-backdrop" id="skaBackdrop"></div>' +
    '<div class="ska-tray" id="skaTray">' +
      '<button class="ska-trigger" id="skaTrigger" type="button" aria-label="ಖಾತೆ" aria-expanded="false" aria-controls="skaSheet">' +
        '<span class="ska-icon" id="skaIcon">' +
          '<svg viewBox="0 0 24 24"><circle cx="12" cy="8" r="3.2"></circle><path d="M5.5 19c.7-3.1 3-4.8 6.5-4.8s5.8 1.7 6.5 4.8"></path></svg>' +
          '<span class="ska-status" id="skaStatus"></span>' +
        '</span>' +
      '</button>' +
    '</div>' +
    '<div class="ska-sheet" id="skaSheet" role="dialog" aria-modal="true" aria-hidden="true">' +
      '<div class="ska-sheet-top">' +
        '<span class="ska-sheet-title">ನನ್ನ ಖಾತೆ</span>' +
        '<button class="ska-close" id="skaClose" type="button" aria-label="Close">&#10005;</button>' +
      '</div>' +
      '<div class="ska-sheet-body" id="skaBody"></div>' +
    '</div>';

  var trigger = document.getElementById('skaTrigger');
  var status = document.getElementById('skaStatus');
  var backdrop = document.getElementById('skaBackdrop');
  var sheet = document.getElementById('skaSheet');
  var closeBtn = document.getElementById('skaClose');
  var body = document.getElementById('skaBody');

  function openSheet(){
    backdrop.classList.add('ska-show');
    sheet.classList.add('ska-show');
    sheet.setAttribute('aria-hidden', 'false');
    trigger.setAttribute('aria-expanded', 'true');
  }
  function closeSheet(){
    backdrop.classList.remove('ska-show');
    sheet.classList.remove('ska-show');
    sheet.setAttribute('aria-hidden', 'true');
    trigger.setAttribute('aria-expanded', 'false');
  }
  trigger.addEventListener('click', function(){
    if (sheet.classList.contains('ska-show')) closeSheet(); else openSheet();
  });
  closeBtn.addEventListener('click', closeSheet);
  backdrop.addEventListener('click', closeSheet);
  document.addEventListener('keydown', function(e){ if (e.key === 'Escape') closeSheet(); });

  function displayName(user){
    var m = (user && user.user_metadata) || {};
    return m.full_name || m.name || m.user_name || 'SnehaKoota ಸದಸ್ಯ';
  }

  function providerButtonHTML(p){
    var attrs = 'class="ska-provider-btn ' + p.style + '"';
    if (p.href) {
      return '<a ' + attrs + ' href="' + p.href() + '">' + p.icon + '<span>' + p.label + '</span></a>';
    }
    return '<button type="button" ' + attrs + ' data-provider="' + p.id + '">' + p.icon + '<span>' + p.label + '</span></button>';
  }

  function renderSignedOut(){
    var html =
      '<div class="ska-avatar" id="skaAvatar">' +
        '<svg viewBox="0 0 24 24"><circle cx="12" cy="8" r="3.2"></circle><path d="M5.5 19c.7-3.1 3-4.8 6.5-4.8s5.8 1.7 6.5 4.8"></path></svg>' +
      '</div>' +
      '<p class="ska-note">ಸೈನ್ ಇನ್ ಮಾಡಿದರೆ ನಿಮ್ಮ ಖಾತೆ ಇಲ್ಲಿ ಕಾಣಿಸುತ್ತದೆ.</p>' +
      '<div class="ska-providers">' + providers.map(providerButtonHTML).join('') + '</div>';
    body.innerHTML = html;

    body.querySelectorAll('[data-provider]').forEach(function(btn){
      btn.addEventListener('click', function(){
        var p = providers.filter(function(pr){ return pr.id === btn.getAttribute('data-provider'); })[0];
        if (p && typeof p.action === 'function') p.action(btn);
      });
    });
  }

  function renderSignedIn(session){
    var user = session.user;
    body.innerHTML =
      '<div class="ska-avatar ska-signed-in" id="skaAvatar">' +
        '<svg viewBox="0 0 24 24"><circle cx="12" cy="8" r="3.2"></circle><path d="M5.5 19c.7-3.1 3-4.8 6.5-4.8s5.8 1.7 6.5 4.8"></path></svg>' +
      '</div>' +
      '<div class="ska-identity">' +
        '<strong>' + displayName(user) + '</strong>' +
        '<span>' + (user.email || 'Google ಖಾತೆ') + '</span>' +
      '</div>' +
      '<button type="button" class="ska-signout-btn" id="skaSignOut">ಸೈನ್ ಔಟ್</button>' +
      '<div class="ska-message" id="skaMessage"></div>';

    var signOutBtn = document.getElementById('skaSignOut');
    var message = document.getElementById('skaMessage');
    signOutBtn.addEventListener('click', function(){
      signOutBtn.disabled = true;
      message.textContent = 'ಸೈನ್ ಔಟ್ ಮಾಡಲಾಗುತ್ತಿದೆ…';
      supabaseClient.auth.signOut().then(function(res){
        if (res.error) {
          console.error('Sign-out error:', res.error);
          message.textContent = 'ಸೈನ್ ಔಟ್ ಮಾಡಲು ಸಾಧ್ಯವಾಗಲಿಲ್ಲ. ಮತ್ತೆ ಪ್ರಯತ್ನಿಸಿ.';
          signOutBtn.disabled = false;
          return;
        }
        updateAccount(null);
      });
    });
  }

  function updateAccount(session){
    var signedIn = !!(session && session.user);
    trigger.classList.toggle('ska-signed-in', signedIn);
    status.title = signedIn ? 'Signed in' : 'Signed out';
    if (signedIn) renderSignedIn(session); else renderSignedOut();
  }

  supabaseClient.auth.onAuthStateChange(function(event, session){
    updateAccount(session);
  });

  supabaseClient.auth.getSession().then(function(res){
    if (res.error) {
      console.error('Initial session error:', res.error);
      updateAccount(null);
      return;
    }
    updateAccount(res.data.session);
  });
})();
