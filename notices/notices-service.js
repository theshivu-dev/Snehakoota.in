/* =========================================================
   SNEHAKOOTA — COMMUNITY UPDATES SERVICE
   ---------------------------------------------------------
   Owns Community Updates reads only.
   UI modules must not call Supabase directly.
   ========================================================= */
(function(){
  "use strict";

  const SUPABASE_URL = "https://hukfpoxvtutvhjfdzcuh.supabase.co";
  const SUPABASE_PUBLISHABLE_KEY = "sb_publishable_6_9Fc319vRsSZSksFlhzSw_28-glehH";

  if (!window.supabase) {
    console.error("notices-service.js: supabase-js must be loaded before the Notice service.");
    return;
  }

  const client = window.supabase.createClient(
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

  function normalizeUpdate(row) {
    const eventDetails = Array.isArray(row.community_update_event_details)
      ? row.community_update_event_details[0] || null
      : row.community_update_event_details || null;

    return {
      id: Number(row.id),
      type: row.update_type,
      visibility: row.visibility_scope,
      title: row.title || "",
      content: row.content || "",
      publishedAt: row.published_at,
      expiresAt: row.expires_at,
      linkedBarahaPostId: row.linked_baraha_post_id || null,
      event: eventDetails
        ? {
            startsAt: eventDetails.starts_at,
            endsAt: eventDetails.ends_at,
            locationName: eventDetails.location_name || "",
            locationUrl: eventDetails.location_url || ""
          }
        : null
    };
  }

  async function getVisibleUpdates(options) {
    const limit = options && Number.isFinite(options.limit)
      ? Math.max(1, Math.floor(options.limit))
      : null;

    const now = new Date().toISOString();

    let query = client
      .from("community_updates")
      .select(
        "id, update_type, visibility_scope, title, content, published_at, expires_at, linked_baraha_post_id, community_update_event_details(starts_at, ends_at, location_name, location_url)"
      )
      .eq("is_enabled", true)
      .lte("published_at", now)
      .or("expires_at.is.null,expires_at.gt." + now)
      .order("published_at", { ascending: false });

    if (limit) {
      query = query.limit(limit);
    }

    const { data, error } = await query;

    if (error) {
      throw error;
    }

    return (data || []).map(normalizeUpdate);
  }

  window.SnehakootaNoticesService = Object.freeze({
    getVisibleUpdates
  });
})();