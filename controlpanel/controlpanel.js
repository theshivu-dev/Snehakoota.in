/* =========================================================
   SNEHAKOOTA — CONTROL PANEL V1
   Capability-driven owner/admin management surface.
   ========================================================= */
(function(window,document){
  'use strict';

  const STATUS_LABELS={pending:'ಬಾಕಿ',active:'ಸಕ್ರಿಯ',rejected:'ತಿರಸ್ಕೃತ',suspended:'ಸ್ಥಗಿತ'};
  const TYPE_LABELS={member:'ಸದಸ್ಯ',admin:'ನಿರ್ವಾಹಕ'};
  const POST_STATUS_LABELS={pending:'ಪರಿಶೀಲನೆಗೆ ಬಾಕಿ',published:'ಪ್ರಕಟಿತ',hide:'ಮರೆಮಾಡಲಾಗಿದೆ',draft:'ಕರಡು',archived:'ಆರ್ಕೈವ್'};

  class ControlPanel {
    constructor(){
      this.service=new window.SnehakootaControlPanelService(window.SnehakootaSupabaseClient||null);
      this.context=null; this.memberships=[]; this.posts=[];
      this.activeSection='users'; this.loading=false;
      this.refs={};
    }

    init(){
      this.cache();
      this.bind();
      return this.refreshContext();
    }

    cache(){
      ['gate','app','identity','scope','status','users','posts','unassigned','userSearch','userStatus','userType','postSearch','postStatus','refreshUsers','refreshPosts','message','usersList','postsList','unassignedList','sectionUsers','sectionPosts','sectionAdmins','adminList'].forEach(id=>this.refs[id]=document.getElementById(id));
    }

    bind(){
      this.refs.sectionUsers.addEventListener('click',()=>this.showSection('users'));
      this.refs.sectionPosts.addEventListener('click',()=>this.showSection('posts'));
      this.refs.sectionAdmins.addEventListener('click',()=>this.showSection('admins'));
      this.refs.scope.addEventListener('change',()=>this.loadCurrentSection());
      this.refs.userSearch.addEventListener('input',()=>this.scheduleUsers());
      this.refs.userStatus.addEventListener('change',()=>this.loadUsers());
      this.refs.userType.addEventListener('change',()=>this.loadUsers());
      this.refs.postSearch.addEventListener('input',()=>this.schedulePosts());
      this.refs.postStatus.addEventListener('change',()=>this.loadPosts());
      this.refs.refreshUsers.addEventListener('click',()=>this.loadUsers());
      this.refs.refreshPosts.addEventListener('click',()=>this.loadPosts());
      this.refs.usersList.addEventListener('click',e=>this.handleUserAction(e));
      this.refs.adminList.addEventListener('click',e=>this.handleAdminAction(e));
      this.refs.postsList.addEventListener('click',e=>this.handlePostAction(e));
      window.addEventListener('pageshow',e=>{if(e.persisted)this.refreshContext();});
      window.addEventListener('focus',()=>this.refreshContext());
      document.addEventListener('sk:auth-state',()=>this.refreshContext());
    }

    async refreshContext(){
      try{
        const context=await this.service.getContext();
        this.context=context;
        if(!context.isAuthenticated || !context.canAccess){
          this.refs.app.hidden=true; this.refs.gate.hidden=false;
          this.refs.gate.innerHTML='<h1>ಈ ಭಾಗಕ್ಕೆ ಅನುಮತಿ ಇಲ್ಲ</h1><p>ಸಕ್ರಿಯ ನಿರ್ವಹಣಾ ಹಕ್ಕು ಹೊಂದಿರುವ ಸದಸ್ಯರಿಗೆ ಮಾತ್ರ ಈ ಪುಟ ಲಭ್ಯ.</p><a href="index.html">ಸ್ನೇಹಕೂಟಕ್ಕೆ ಹಿಂತಿರುಗಿ</a>';
          return;
        }
        this.refs.gate.hidden=true; this.refs.app.hidden=false;
        this.renderContext();
        await this.loadCurrentSection();
      }catch(error){
        console.error('Control Panel context failed:',error);
        this.refs.app.hidden=true; this.refs.gate.hidden=false;
        this.refs.gate.innerHTML='<h1>ಈ ಪುಟವನ್ನು ತೆರೆಯಲು ಸಾಧ್ಯವಾಗಲಿಲ್ಲ</h1><p>ದಯವಿಟ್ಟು ಮತ್ತೆ ಪ್ರಯತ್ನಿಸಿ.</p><a href="index.html">ಹಿಂತಿರುಗಿ</a>';
      }
    }

    renderContext(){
      const owner=Boolean(this.context.isOwner);
      this.refs.identity.textContent=owner?'ಸೈಟ್ ಮಾಲೀಕರು':'ನಿರ್ವಹಣಾ ಹಕ್ಕು ಹೊಂದಿರುವ ಸದಸ್ಯ';
      this.refs.status.textContent=owner?'ಮಾಲೀಕ':'ಸಕ್ರಿಯ ನಿರ್ವಾಹಕ';
      this.refs.scope.innerHTML=(this.context.scopes||[]).map(s=>`<option value="${s.batchId}">${this.escape(s.schoolName)} · ${s.batchYear}</option>`).join('');
      this.refs.scope.hidden=owner || !(this.context.scopes||[]).length;
      this.refs.sectionAdmins.hidden=!owner;
      if(owner){
        const option=document.createElement('option'); option.value=''; option.textContent='ಎಲ್ಲಾ ಬಳಗಗಳು'; this.refs.scope.prepend(option); this.refs.scope.value='';
      }else if(this.context.scopes?.length){this.refs.scope.value=String(this.context.scopes[0].batchId);}
      this.showSection(this.activeSection);
    }

    showSection(section){
      if(section==='admins'&&!this.context?.isOwner)section='users';
      this.activeSection=section;
      [this.refs.users,this.refs.posts,this.refs.unassigned].forEach(el=>el.hidden=true);
      this.refs.sectionUsers.classList.toggle('active',section==='users');
      this.refs.sectionPosts.classList.toggle('active',section==='posts');
      this.refs.sectionAdmins.classList.toggle('active',section==='admins');
      if(section==='users')this.refs.users.hidden=false;
      if(section==='posts')this.refs.posts.hidden=false;
      if(section==='admins')this.refs.unassigned.hidden=false;
      this.loadCurrentSection();
    }

    loadCurrentSection(){
      if(this.activeSection==='users')return this.loadUsers();
      if(this.activeSection==='posts')return this.loadPosts();
      return this.loadAdmins();
    }

    currentBatch(){const value=this.refs.scope.value;return value?Number(value):null;}

    async loadUsers(){
      if(this.loading)return;
      this.loading=true; this.setMessage('ಸದಸ್ಯರ ಮಾಹಿತಿಯನ್ನು ತರಲಾಗುತ್ತಿದೆ…'); this.refs.usersList.innerHTML='<div class="cp-empty">Loading…</div>';
      try{
        this.memberships=await this.service.listMemberships({batchId:this.currentBatch(),status:this.refs.userStatus.value,membershipType:this.refs.userType.value,search:this.refs.userSearch.value});
        this.renderUsers(); this.setMessage('');
      }catch(error){this.setMessage(this.errorMessage(error));this.refs.usersList.innerHTML='<div class="cp-empty">ಮಾಹಿತಿ ಪಡೆಯಲು ಸಾಧ್ಯವಾಗಲಿಲ್ಲ.</div>';}
      finally{this.loading=false;}
    }

    async loadAdmins(){
      if(!this.context?.isOwner)return;
      this.refs.unassignedList.innerHTML='<div class="cp-empty">Loading…</div>';
      try{
        const [admins,unassigned]=await Promise.all([
          this.service.listMemberships({membershipType:'admin',status:'active',batchId:this.currentBatch(),search:this.refs.userSearch.value}),
          this.service.listUnassignedUsers(this.refs.userSearch.value)
        ]);
        this.refs.adminList.innerHTML=admins.length?admins.map(row=>this.renderAdmin(row)).join(''):'<div class="cp-empty">ಸಕ್ರಿಯ ನಿರ್ವಾಹಕರು ಇಲ್ಲ.</div>';
        this.refs.unassignedList.innerHTML=unassigned.length?unassigned.map(row=>`<div class="cp-row"><div><strong>${this.escape(row.display_name||row.full_name||'Member')}</strong><small>${this.escape(row.email||'')}</small></div></div>`).join(''):'<div class="cp-empty">ಸದಸ್ಯತ್ವವಿಲ್ಲದ ಖಾತೆಗಳು ಇಲ್ಲ.</div>';
      }catch(error){this.refs.adminList.innerHTML='<div class="cp-empty">ನಿರ್ವಾಹಕರ ಮಾಹಿತಿ ಪಡೆಯಲು ಸಾಧ್ಯವಾಗಲಿಲ್ಲ.</div>';this.refs.unassignedList.innerHTML='';this.setMessage(this.errorMessage(error));}
    }

    renderUsers(){
      this.refs.usersList.innerHTML=this.memberships.length?this.memberships.map(row=>this.renderUser(row)).join(''):'<div class="cp-empty">ಈ ಆಯ್ಕೆಗೆ ಹೊಂದುವ ಸದಸ್ಯರು ಇಲ್ಲ.</div>';
    }

    renderUser(row){
      const name=this.escape(row.display_name||row.full_name||row.email||'ಸದಸ್ಯ');
      const scope=this.escape((row.school_name||'')+(row.batch_year?' · '+row.batch_year:''));
      const canActivate=row.status==='pending';
      const canPending=row.status==='active'&&row.membership_type==='member';
      const canPromote=this.context.isOwner&&row.status==='active'&&row.membership_type==='member';
      const canDemote=this.context.isOwner&&row.status==='active'&&row.membership_type==='admin';
      return `<article class="cp-row"><div class="cp-avatar">${name.charAt(0)}</div><div class="cp-main"><strong>${name}</strong><small>${scope}</small><div class="cp-meta"><span>${TYPE_LABELS[row.membership_type]||row.membership_type}</span><span>${STATUS_LABELS[row.status]||row.status}</span>${this.context.isOwner&&row.email?`<span>${this.escape(row.email)}</span>`:''}</div></div><div class="cp-actions">${canActivate?`<button data-action="status" data-id="${row.membership_id}" data-value="active">ಸಕ್ರಿಯಗೊಳಿಸಿ</button>`:''}${canPending?`<button data-action="status" data-id="${row.membership_id}" data-value="pending">ಬಾಕಿಗೆ</button>`:''}${canPromote?`<button data-action="type" data-id="${row.membership_id}" data-value="admin">ನಿರ್ವಾಹಕ ಮಾಡಿ</button>`:''}${canDemote?`<button data-action="type" data-id="${row.membership_id}" data-value="member">ನಿರ್ವಾಹಕ ಹಕ್ಕು ತೆಗೆದುಹಾಕಿ</button>`:''}</div></article>`;
    }

    renderAdmin(row){return `<article class="cp-row"><div class="cp-avatar">${this.escape((row.display_name||row.full_name||'ನ').charAt(0))}</div><div class="cp-main"><strong>${this.escape(row.display_name||row.full_name||'ಸದಸ್ಯ')}</strong><small>${this.escape((row.school_name||'')+(row.batch_year?' · '+row.batch_year:''))}</small><div class="cp-meta"><span>ನಿರ್ವಾಹಕ</span><span>ಸಕ್ರಿಯ</span></div></div></article>`;}

    async handleUserAction(event){
      const button=event.target.closest('button[data-action]'); if(!button)return;
      const id=Number(button.dataset.id), action=button.dataset.action, value=button.dataset.value;
      if(!Number.isFinite(id))return;
      if(action==='type'&&!window.confirm(value==='admin'?'ಈ ಸದಸ್ಯರನ್ನು ನಿರ್ವಾಹಕರನ್ನಾಗಿ ಮಾಡಬೇಕೇ?':'ಈ ಸದಸ್ಯರ ನಿರ್ವಾಹಕ ಹಕ್ಕನ್ನು ತೆಗೆದುಹಾಕಬೇಕೇ?'))return;
      button.disabled=true;
      try{if(action==='status')await this.service.setMembershipStatus(id,value);else await this.service.setMembershipType(id,value);this.setMessage('ಬದಲಾವಣೆ ಉಳಿಸಲಾಗಿದೆ.');await this.loadCurrentSection();}
      catch(error){this.setMessage(this.errorMessage(error));button.disabled=false;}
    }

    async handleAdminAction(){ }

    async loadPosts(){
      if(this.loading)return;
      this.loading=true;this.refs.postsList.innerHTML='<div class="cp-empty">Loading…</div>';
      try{this.posts=await this.service.listPosts({batchId:this.currentBatch(),status:this.refs.postStatus.value,search:this.refs.postSearch.value});this.renderPosts();this.setMessage('');}
      catch(error){this.refs.postsList.innerHTML='<div class="cp-empty">ಬರಹಗಳನ್ನು ಪಡೆಯಲು ಸಾಧ್ಯವಾಗಲಿಲ್ಲ.</div>';this.setMessage(this.errorMessage(error));}
      finally{this.loading=false;}
    }

    renderPosts(){this.refs.postsList.innerHTML=this.posts.length?this.posts.map(row=>`<article class="cp-row"><div class="cp-main"><strong>${this.escape(row.title||'ಶೀರ್ಷಿಕೆ ಇಲ್ಲ')}</strong><small>${this.escape(row.author_name||'ಸದಸ್ಯ')} · ${this.escape(row.category||'')}</small><div class="cp-meta"><span>${POST_STATUS_LABELS[row.content_status]||row.content_status}</span><span>${this.escape(row.target_scopes||'')}</span></div></div><div class="cp-actions">${row.content_status==='pending'&&row.can_moderate?`<button data-post-action="approve" data-id="${row.post_id}">ಪ್ರಕಟಿಸಿ</button>`:''}${row.content_status==='published'&&row.can_moderate?`<button data-post-action="hide" data-id="${row.post_id}">ಮರೆಮಾಡಿ</button>`:''}</div></article>`).join(''):'<div class="cp-empty">ಈ ಆಯ್ಕೆಗೆ ಹೊಂದುವ ಬರಹಗಳಿಲ್ಲ.</div>';}

    async handlePostAction(event){
      const button=event.target.closest('button[data-post-action]');if(!button)return;
      const id=Number(button.dataset.id),action=button.dataset.postAction;if(!Number.isFinite(id))return;
      if(!window.confirm(action==='approve'?'ಈ ಬರಹವನ್ನು ಪ್ರಕಟಿಸಬೇಕೇ?':'ಈ ಬರಹವನ್ನು ಮರೆಮಾಡಬೇಕೇ?'))return;
      button.disabled=true;
      try{if(action==='approve')await this.service.approvePost(id);else await this.service.hidePost(id);this.setMessage('ಬದಲಾವಣೆ ಉಳಿಸಲಾಗಿದೆ.');await this.loadPosts();}
      catch(error){this.setMessage(this.errorMessage(error));button.disabled=false;}
    }

    scheduleUsers(){clearTimeout(this.userTimer);this.userTimer=setTimeout(()=>this.loadUsers(),250);}
    schedulePosts(){clearTimeout(this.postTimer);this.postTimer=setTimeout(()=>this.loadPosts(),250);}
    setMessage(text){this.refs.message.textContent=text||'';}
    errorMessage(error){return error?.message||'ಕಾರ್ಯ ಪೂರ್ಣಗೊಳಿಸಲು ಸಾಧ್ಯವಾಗಲಿಲ್ಲ. ಮತ್ತೆ ಪ್ರಯತ್ನಿಸಿ.';}
    escape(value){return String(value??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));}
  }

  window.SnehakootaControlPanel=new ControlPanel();
  window.SnehakootaControlPanel.init().catch(error=>console.error('Control Panel initialization failed:',error));
})(window,document);
