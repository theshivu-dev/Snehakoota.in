/* =========================================================
   SNEHAKOOTA — COMMUNITY UPDATES CREATION SERVICE
   ---------------------------------------------------------
   Owns creation context and write RPC calls only.
   Read-side loading remains in notices-service.js.
   ========================================================= */
(function(){
  "use strict";

  const SUPABASE_URL = "https://hukfpoxvtutvhjfdzcuh.supabase.co";
  const SUPABASE_PUBLISHABLE_KEY = "sb_publishable_6_9Fc319vRsSZSksFlhzSw_28-glehH";

  if (!window.supabase) {
    console.error("notices-create-service.js: supabase-js must be loaded before the creation service.");
    return;
  }

  const client = window.SnehakootaNoticesSupabaseClient
    || window.supabase.createClient(
      SUPABASE_URL,
      SUPABASE_PUBLISHABLE_KEY,
      {
        auth: {
          persistSession: true,
          autoRefreshToken: true,
          detectSessionInUrl: true,
          flowType: "pkce"
        }
      }
    );

  window.SnehakootaNoticesSupabaseClient = client;

  function normalizeCreateContext(data) {
    const source = data && typeof data === "object" ? data : {};
    const targetBatches = Array.isArray(source.target_batches)
      ? source.target_batches.map(function(row) {
          return {
            id: Number(row && row.id),
            schoolName: String(row && row.school_name || ""),
            batchYear: Number(row && row.batch_year)
          };
        }).filter(function(row) {
          return Number.isFinite(row.id);
        })
      : [];

    return {
      canPublishPublic: source.can_publish_public === true,
      targetBatches: targetBatches
    };
  }

  async function getCreateContext() {
    const result = await client.rpc("community_updates_get_create_context");
    if (result.error) throw result.error;
    return normalizeCreateContext(result.data);
  }

  async function createUpdate(payload) {
    const result = await client.rpc("community_updates_save", {
      p_update_id: null,
      p_update_type: payload.updateType,
      p_visibility_scope: payload.visibilityScope,
      p_title: payload.title,
      p_content: payload.content || null,
      p_expires_at: payload.expiresAt || null,
      p_school_batch_ids: payload.schoolBatchIds || [],
      p_event_starts_at: payload.eventStartsAt || null,
      p_event_ends_at: payload.eventEndsAt || null,
      p_event_location_name: payload.eventLocationName || null,
      p_event_location_url: payload.eventLocationUrl || null,
      p_is_enabled: true,
      p_published_at: payload.publishedAt || null,
      p_linked_baraha_post_id: null,
      p_related_url: payload.relatedUrl || null
    });

    if (result.error) throw result.error;
    return result.data;
  }

  window.SnehakootaNoticeCreateService = Object.freeze({
    getCreateContext: getCreateContext,
    createUpdate: createUpdate
  });
})();