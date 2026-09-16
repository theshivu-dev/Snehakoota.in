/* =========================================================
   SNEHAKOOTA — CONTROL PANEL SERVICE
   ---------------------------------------------------------
   Database boundary for owner/admin management.
   Uses the page's existing authenticated Supabase client.
   ========================================================= */
(function(window){
  'use strict';

  class ControlPanelService {
    constructor(client){ this.supabase = client || null; }

    setClient(client){ this.supabase = client || null; }

    requireClient(){
      if(!this.supabase) throw new Error('Control Panel Supabase client is unavailable.');
      return this.supabase;
    }

    async getContext(){
      const result = await this.requireClient().rpc('controlpanel_get_context');
      if(result.error) throw result.error;
      return result.data || {isAuthenticated:false,isOwner:false,isAdmin:false,canAccess:false,scopes:[]};
    }

    async listMemberships(filters){
      filters = filters || {};
      const result = await this.requireClient().rpc('controlpanel_list_memberships', {
        p_batch_id: filters.batchId || null,
        p_status: filters.status || null,
        p_membership_type: filters.membershipType || null,
        p_search: filters.search || null
      });
      if(result.error) throw result.error;
      return Array.isArray(result.data) ? result.data : [];
    }

    async listUnassignedUsers(search){
      const result = await this.requireClient().rpc('controlpanel_list_unassigned_users', {
        p_search: search || null
      });
      if(result.error) throw result.error;
      return Array.isArray(result.data) ? result.data : [];
    }

    async setMembershipStatus(membershipId,status){
      const result = await this.requireClient().rpc('controlpanel_set_membership_status', {
        p_membership_id: membershipId,
        p_status: status
      });
      if(result.error) throw result.error;
      return result.data;
    }

    async setMembershipType(membershipId,membershipType){
      const result = await this.requireClient().rpc('controlpanel_set_membership_type', {
        p_membership_id: membershipId,
        p_membership_type: membershipType
      });
      if(result.error) throw result.error;
      return result.data;
    }

    async listPosts(filters){
      filters = filters || {};
      const result = await this.requireClient().rpc('controlpanel_list_posts', {
        p_batch_id: filters.batchId || null,
        p_status: filters.status || null,
        p_search: filters.search || null
      });
      if(result.error) throw result.error;
      return Array.isArray(result.data) ? result.data : [];
    }

    async approvePost(postId){
      const result = await this.requireClient().rpc('baraha_approve_post',{p_post_id:postId});
      if(result.error) throw result.error;
      return result.data;
    }

    async hidePost(postId){
      const result = await this.requireClient().rpc('baraha_hide_post',{p_post_id:postId});
      if(result.error) throw result.error;
      return result.data;
    }
  }

  window.SnehakootaControlPanelService = ControlPanelService;
})(window);
