/* ===================================================================
   SNEHAKOOTA ACCOUNT WIDGET — logic
   Version: 5
   =================================================================== */
(function(){
  "use strict";
  var mount = document.getElementById('sk-account-root');
  if (!mount) return;

  var SUPABASE_URL = 'https://hukfpoxvtutvhjfdzcuh.supabase.co';
  var SUPABASE_PUBLISHABLE_KEY = 'sb_publishable_6_9Fc319vRsSZSksFlhzSw_28-glehH';

  /* -----------------------------------------------------------------
     Invitation UI behaviour
     These are UX switches only. Supabase remains authoritative.
     "optional" = membership may be selected or a general invitation
     may be created. Change here later without redesigning the flow.
     ----------------------------------------------------------------- */
  var INVITATION_MEMBERSHIP_MODE = 'optional';
  var INVITATION_SHOW_GENERAL_OPTION = true;

  if (!window.supabase) {
    console.error('account.js: supabase-js must be loaded before this script.');
    return;
  }

  var supabaseClient = window.supabase.createClient(
    SUPABASE_URL,
    SUPABASE_PUBLISHABLE_KEY,
    { auth:{ persistSession:true, autoRefreshToken:true, detectSessionInUrl:true, flowType:'pkce', experimental:{passkey:true} } }
  );

  var GOOGLE_ICON = '<svg viewBox="0 0 24 24" aria-hidden="true"><path fill="#4285F4" d="M21.35 12.23c0-.72-.06-1.42-.18-2.09H12v3.96h5.23a4.47 4.47 0 0 1-1.94 2.93v2.43h3.14c1.84-1.69 2.92-4.18 2.92-7.23z"/><path fill="#34A853" d="M12 21.5c2.63 0 4.84-.87 6.45-2.37l-3.14-2.43c-.87.58-1.98.92-3.31.92-2.54 0-4.69-1.72-5.46-4.03H3.3v2.5A9.74 9.74 0 0 0 12 21.5z"/><path fill="#FBBC05" d="M6.54 13.59A5.86 5.86 0 0 1 6.23 12c0-.55.11-1.08.31-1.59v-2.5H3.3A9.75 9.75 0 0 0 2.25 12c0 1.57.38 3.05 1.05 4.09l3.24-2.5z"/><path fill="#EA4335" d="M12 6.38c1.43 0 2.71.49 3.72 1.46l2.79-2.79C16.84 3.5 14.63 2.5 12 2.5a9.74 9.74 0 0 0-8.7 5.41l3.24 2.5C7.31 8.1 9.46 6.38 12 6.38z"/></svg>';
  var PASSKEY_ICON = '<svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="8.5" cy="8.5" r="3.5"></circle><path d="M11 11l8 8M15 15l2-2M17 17l2-2"></path></svg>';
  var INVITE_ICON = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M16 21v-2a4 4 0 0 0-4-4H7a4 4 0 0 0-4 4v2"></path><circle cx="9.5" cy="7" r="4"></circle><path d="M19 8v6M22 11h-6"></path></svg>';

  var providers = [
    { id:'google',label:'Continue with Google',style:'ska-primary',icon:GOOGLE_ICON,action:function(btn){
      if(btn)btn.disabled=true;
      var redirectTo=window.location.origin+window.location.pathname;
      var message=document.getElementById('skaMessage');
      if(message)message.textContent='Google ಮೂಲಕ ಸುರಕ್ಷಿತವಾಗಿ ಸೈನ್ ಇನ್ ಮಾಡಲಾಗುತ್ತಿದೆ…';
      supabaseClient.auth.signInWithOAuth({provider:'google',options:{redirectTo:redirectTo,queryParams:{prompt:'select_account'}}}).then(function(res){
        if(res.error){
          console.error('Google sign-in error:',res.error);
          if(message)message.textContent='ಸೈನ್ ಇನ್ ಮಾಡಲು ಸಾಧ್ಯವಾಗಲಿಲ್ಲ. ದಯವಿಟ್ಟು ಮತ್ತೆ ಪ್ರಯತ್ನಿಸಿ.';
          if(btn)btn.disabled=false;
        }
      });
    }},
    { id:'passkey',label:'Sign in with passkey',style:'ska-secondary',icon:PASSKEY_ICON,action:function(btn){
      if(btn)btn.disabled=true;
      var message=document.getElementById('skaMessage');
      if(message)message.textContent='Passkey ಮೂಲಕ ಸುರಕ್ಷಿತವಾಗಿ ಸೈನ್ ಇನ್ ಮಾಡಲಾಗುತ್ತಿದೆ…';
      if(!window.PublicKeyCredential||!navigator.credentials){
        if(message)message.textContent='ಈ ಸಾಧನ ಅಥವಾ ಬ್ರೌಸರ್‌ನಲ್ಲಿ Passkey ಬೆಂಬಲವಿಲ್ಲ.';
        if(btn)btn.disabled=false;
        return;
      }
      supabaseClient.auth.signInWithPasskey().then(function(res){
        if(res.error){
          console.error('Passkey sign-in error:',res.error);
          if(message){
            if(res.error.code==='webauthn_credential_not_found')message.textContent='ಈ ಖಾತೆಗೆ ಇನ್ನೂ Passkey ಸೇರಿಸಿಲ್ಲ. ಮೊದಲು ಖಾತೆ ಒಳಗೆ Passkey ಸೇರಿಸಿ.';
            else message.textContent='Passkey ಮೂಲಕ ಸೈನ್ ಇನ್ ಮಾಡಲು ಸಾಧ್ಯವಾಗಲಿಲ್ಲ. ಮತ್ತೆ ಪ್ರಯತ್ನಿಸಿ.';
          }
          if(btn)btn.disabled=false;
        }else{closeSheet();}
      });
    }}
  ];

  mount.innerHTML='<div class="ska-backdrop" id="skaBackdrop"></div><div class="ska-tray" id="skaTray"><button class="ska-trigger" id="skaTrigger" type="button" aria-label="Account" aria-expanded="false" aria-controls="skaSheet"><span class="ska-icon" id="skaIcon"><svg viewBox="0 0 24 24"><circle cx="12" cy="8" r="3.2"></circle><path d="M5.5 19c.7-3.1 3-4.8 6.5-4.8s5.8 1.7 6.5 4.8"></path></svg><span class="ska-status" id="skaStatus"></span></span></button></div><div class="ska-sheet" id="skaSheet" role="dialog" aria-modal="true" aria-hidden="true"><div class="ska-sheet-top"><span class="ska-sheet-title">SnehaKoota Account</span><button class="ska-close" id="skaClose" type="button" aria-label="Close">&#10005;</button></div><div class="ska-sheet-body" id="skaBody"></div></div>';

  var trigger=document.getElementById('skaTrigger'),status=document.getElementById('skaStatus'),backdrop=document.getElementById('skaBackdrop'),sheet=document.getElementById('skaSheet'),closeBtn=document.getElementById('skaClose'),body=document.getElementById('skaBody');

  function openSheet(){backdrop.classList.add('ska-show');sheet.classList.add('ska-show');sheet.setAttribute('aria-hidden','false');trigger.setAttribute('aria-expanded','true');}
  function closeSheet(){backdrop.classList.remove('ska-show');sheet.classList.remove('ska-show');sheet.setAttribute('aria-hidden','true');trigger.setAttribute('aria-expanded','false');}
  trigger.addEventListener('click',function(){if(sheet.classList.contains('ska-show'))closeSheet();else openSheet();});
  closeBtn.addEventListener('click',closeSheet);
  backdrop.addEventListener('click',closeSheet);
  document.addEventListener('keydown',function(e){if(e.key==='Escape')closeSheet();});

  function displayName(user){var m=(user&&user.user_metadata)||{};return m.full_name||m.name||m.user_name||'SnehaKoota Member';}
  function inviteEntry(){return '<button type="button" class="ska-action-row" id="skaInviteFriend">'+INVITE_ICON+'<span><strong>Invite a friend</strong><small>Share SnehaKoota with your friends</small></span></button>';}

  function invitationUrl(path){
    return window.location.origin + (path || '/');
  }

  function setInvitationButtons(disabled){
    var copy=document.getElementById('skaCopyInvite');
    var share=document.getElementById('skaShareInvite');
    if(copy)copy.disabled=disabled;
    if(share)share.disabled=disabled;
  }

  function copyInvitationLink(){
    var input=document.getElementById('skaInviteLink');
    var message=document.getElementById('skaInviteMessage');
    if(!input || !input.value || input.value==='Link will appear here')return;
    navigator.clipboard.writeText(input.value).then(function(){
      if(message)message.textContent='Invitation link copied.';
    }).catch(function(){
      input.focus();input.select();
      try{document.execCommand('copy');if(message)message.textContent='Invitation link copied.';}
      catch(e){if(message)message.textContent='Copy ಮಾಡಲು ಸಾಧ್ಯವಾಗಲಿಲ್ಲ. Link ಅನ್ನು manually copy ಮಾಡಿ.';}
    });
  }

  function shareInvitationLink(){
    var input=document.getElementById('skaInviteLink');
    var message=document.getElementById('skaInviteMessage');
    if(!input || !input.value || input.value==='Link will appear here')return;
    if(navigator.share){
      navigator.share({title:'SnehaKoota Invitation',text:'You are invited to SnehaKoota.',url:input.value}).then(function(){
        if(message)message.textContent='Invitation shared.';
      }).catch(function(err){
        if(err && err.name==='AbortError')return;
        if(message)message.textContent='Share ಮಾಡಲು ಸಾಧ್ಯವಾಗಲಿಲ್ಲ. Copy ಬಳಸಿ ಪ್ರಯತ್ನಿಸಿ.';
      });
    }else{
      copyInvitationLink();
    }
  }

  function generateInvitation(){
    var select=document.getElementById('skaMembershipSelect');
    var input=document.getElementById('skaInviteLink');
    var message=document.getElementById('skaInviteMessage');
    var membershipId=select ? select.value : '';
    var pMembershipId=membershipId ? Number(membershipId) : null;
    var copy=document.getElementById('skaCopyInvite');
    var share=document.getElementById('skaShareInvite');

    if(INVITATION_MEMBERSHIP_MODE==='required' && !pMembershipId){
      if(message)message.textContent='Choose a membership to create an invitation.';
      return;
    }

    if(input)input.value='Generating...';
    setInvitationButtons(true);
    if(select)select.disabled=true;
    if(message)message.textContent='Creating your invitation…';

    supabaseClient.rpc('create_invitation',{p_membership_id:pMembershipId}).then(function(res){
      if(res.error){
        console.error('Invitation RPC error:',res.error);
        if(input)input.value='Link will appear here';
        if(message)message.textContent='Invitation could not be created. Please try again.';
        if(select)select.disabled=false;
        setInvitationButtons(true);
        return;
      }

      var data=res.data;
      if(!data || !data.success){
        if(input)input.value='Link will appear here';
        if(message)message.textContent=(data&&data.message)||'Invitation could not be created. Please try again.';
        if(select)select.disabled=false;
        setInvitationButtons(true);
        return;
      }

      var url=invitationUrl(data.path);
      if(input)input.value=url;
      if(message){
        var kind=data.invitation_kind==='general'?'general Snehakoota invitation':'membership invitation';
        message.textContent='Your '+kind+' is ready. Expires in 5 days.';
      }
      if(select)select.disabled=false;
      if(copy)copy.disabled=false;
      if(share)share.disabled=false;
    }).catch(function(err){
      console.error('Invitation generation error:',err);
      if(input)input.value='Link will appear here';
      if(message)message.textContent='Invitation could not be created. Please try again.';
      if(select)select.disabled=false;
      setInvitationButtons(true);
    });
  }

  function populateMemberships(rows){
    var select=document.getElementById('skaMembershipSelect');
    if(!select)return;
    var current=select.value;
    select.innerHTML='';

    if(INVITATION_MEMBERSHIP_MODE!=='required' && INVITATION_SHOW_GENERAL_OPTION){
      var general=document.createElement('option');
      general.value='';
      general.textContent='General Snehakoota invitation';
      select.appendChild(general);
    }else{
      var placeholder=document.createElement('option');
      placeholder.value='';
      placeholder.textContent='Select your membership';
      select.appendChild(placeholder);
    }

    (rows||[]).forEach(function(row){
      if(row.status!=='active')return;
      var option=document.createElement('option');
      option.value=String(row.membership_id);
      option.textContent=(row.school_name||'Snehakoota')+' '+(row.batch_year||'');
      select.appendChild(option);
    });

    if(current && Array.prototype.some.call(select.options,function(o){return o.value===current;}))select.value=current;
  }

  function loadInvitationMemberships(){
    var select=document.getElementById('skaMembershipSelect');
    var message=document.getElementById('skaInviteMessage');
    if(!select)return;
    select.disabled=true;
    if(message)message.textContent='Loading your memberships…';

    supabaseClient.rpc('get_my_memberships').then(function(res){
      if(res.error){
        console.error('Membership loading error:',res.error);
        populateMemberships([]);
        if(message)message.textContent='Could not load memberships. You can try again.';
        select.disabled=false;
        return;
      }
      populateMemberships(res.data||[]);
      select.disabled=false;
      if(message)message.textContent=INVITATION_MEMBERSHIP_MODE==='required'?'Choose a membership to create an invitation.':'Choose a membership or create a general invitation.';
    });
  }

  function renderInvitationPanel(){
    body.innerHTML='<div class="ska-invite-panel"><button type="button" class="ska-back-btn" id="skaInviteBack" aria-label="Back">&#8592;<span>Account</span></button><h3 class="ska-auth-title">Invite a friend</h3><p class="ska-auth-sub">Create a reusable invitation link to share with your friends.</p><label class="ska-field-label" for="skaMembershipSelect">Membership</label><select class="ska-field" id="skaMembershipSelect"></select><div class="ska-invite-link-wrap"><label class="ska-field-label" for="skaInviteLink">Invitation link</label><input class="ska-field ska-invite-link" id="skaInviteLink" type="text" value="Link will appear here" readonly></div><div class="ska-invite-actions"><button type="button" class="ska-invite-btn" id="skaCopyInvite" disabled>Copy</button><button type="button" class="ska-invite-btn ska-invite-share" id="skaShareInvite" disabled>Share</button></div><div class="ska-message" id="skaInviteMessage">Loading…</div></div>';

    document.getElementById('skaInviteBack').addEventListener('click',function(){renderSignedIn(currentSession);});
    document.getElementById('skaMembershipSelect').addEventListener('change',function(){generateInvitation();});
    document.getElementById('skaCopyInvite').addEventListener('click',copyInvitationLink);
    document.getElementById('skaShareInvite').addEventListener('click',shareInvitationLink);

    loadInvitationMemberships();
  }

  var currentSession=null;

  function renderSignedOut(){
    body.innerHTML='<h3 class="ska-auth-title">Sign in to SnehaKoota</h3><p class="ska-auth-sub">Save your contributions and come back anytime.</p><div class="ska-providers">'+providers.map(function(p){return '<button type="button" class="ska-provider-btn '+p.style+'" data-provider="'+p.id+'">'+p.icon+'<span>'+p.label+'</span></button>';}).join('')+'</div><div class="ska-message" id="skaMessage"></div>';
    body.querySelectorAll('[data-provider]').forEach(function(btn){
      btn.addEventListener('click',function(){
        var p=providers.filter(function(pr){return pr.id===btn.getAttribute('data-provider');})[0];
        if(p&&typeof p.action==='function')p.action(btn);
      });
    });
  }

  function renderSignedIn(session){
    currentSession=session;
    var user=session.user;
    body.innerHTML='<h3 class="ska-auth-title">Signed in</h3><div class="ska-identity"><strong>'+displayName(user)+'</strong><span>'+ (user.email||'Google account')+'</span></div>'+inviteEntry()+'<button type="button" class="ska-provider-btn ska-secondary" id="skaRegisterPasskey">'+PASSKEY_ICON+'<span>Add a passkey to this device</span></button><button type="button" class="ska-signout-btn" id="skaSignOut">Sign out</button><div class="ska-message" id="skaMessage"></div>';

    var inviteBtn=document.getElementById('skaInviteFriend');
    var passkeyBtn=document.getElementById('skaRegisterPasskey');
    var signOutBtn=document.getElementById('skaSignOut');
    var message=document.getElementById('skaMessage');

    inviteBtn.addEventListener('click',function(){renderInvitationPanel();});

    passkeyBtn.addEventListener('click',function(){
      passkeyBtn.disabled=true;
      message.textContent='Passkey ಹೊಂದಿಸಲಾಗುತ್ತಿದೆ…';
      if(!window.PublicKeyCredential||!navigator.credentials){
        message.textContent='ಈ ಸಾಧನ ಅಥವಾ ಬ್ರೌಸರ್‌ನಲ್ಲಿ Passkey ಬೆಂಬಲವಿಲ್ಲ.';
        passkeyBtn.disabled=false;
        return;
      }
      supabaseClient.auth.registerPasskey().then(function(res){
        if(res.error){
          console.error('Passkey registration error:',res.error);
          var duplicatePasskey=res.error.name==='InvalidStateError'||res.error.code==='invalid_state'||/already\s*(registered|exists)|credential.*already|already.*credential/i.test(res.error.message||'');
          if(duplicatePasskey){message.textContent='Passkey is already registered on this device.';passkeyBtn.disabled=false;setTimeout(closeSheet,1400);return;}
          message.textContent='Passkey ಹೊಂದಿಸಲು ಸಾಧ್ಯವಾಗಲಿಲ್ಲ. ಮತ್ತೆ ಪ್ರಯತ್ನಿಸಿ.';
          passkeyBtn.disabled=false;
          return;
        }
        message.textContent='Passkey ಯಶಸ್ವಿಯಾಗಿ ಸೇರಿಸಲಾಗಿದೆ.';
        passkeyBtn.disabled=false;
        setTimeout(closeSheet,1400);
      });
    });

    signOutBtn.addEventListener('click',function(){
      signOutBtn.disabled=true;
      message.textContent='ಸೈನ್ ಔಟ್ ಮಾಡಲಾಗುತ್ತಿದೆ…';
      supabaseClient.auth.signOut().then(function(res){
        if(res.error){
          console.error('Sign-out error:',res.error);
          message.textContent='ಸೈನ್ ಔಟ್ ಮಾಡಲು ಸಾಧ್ಯವಾಗಲಿಲ್ಲ. ಮತ್ತೆ ಪ್ರಯತ್ನಿಸಿ.';
          signOutBtn.disabled=false;
          return;
        }
        updateAccount(null);
      });
    });
  }

  function updateAccount(session){
    currentSession=session;
    var signedIn=!!(session&&session.user);
    trigger.classList.toggle('ska-signed-in',signedIn);
    status.title=signedIn?'Signed in':'Signed out';
    if(signedIn)renderSignedIn(session);else renderSignedOut();
  }

  var lastAuthState=null;
  function handleAuthStateChange(event,session){
    var signedIn=!!(session&&session.user);
    trigger.classList.toggle('ska-signed-in',signedIn);
    status.title=signedIn?'Signed in':'Signed out';
    if(event==='SIGNED_IN'||event==='SIGNED_OUT'||event==='INITIAL_SESSION'||lastAuthState===null||signedIn!==lastAuthState){
      if(signedIn)renderSignedIn(session);else renderSignedOut();
    }
    if(event==='SIGNED_IN')closeSheet();
    lastAuthState=signedIn;
    currentSession=session;
  }

  supabaseClient.auth.onAuthStateChange(handleAuthStateChange);
  supabaseClient.auth.getSession().then(function(res){
    if(res.error){
      console.error('Initial session error:',res.error);
      lastAuthState=false;
      updateAccount(null);
      return;
    }
    var session=res.data.session;
    lastAuthState=!!(session&&session.user);
    updateAccount(session);
  });
})();
