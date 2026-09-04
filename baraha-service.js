/*
 * Baraha data/service boundary.
 *
 * Purpose:
 * - Own communication with Supabase and other external data sources.
 * - Keep database details out of the controller and view.
 * - Add focused methods as Baraha grows.
 *
 * Read contract for getPosts():
 * - Uses the authenticated Supabase client and existing RLS policies.
 * - Returns a bounded page ordered by (created_at DESC, id DESC).
 * - Uses an opaque application cursor represented internally as
 *   { created_at, id } for keyset pagination.
 * - Fetches one extra row to determine hasMore without a count query.
 * - Does not perform author/profile enrichment here because author_id has
 *   no direct FK to profiles and profiles are not generally readable under
 *   the current RLS policy. Author resolution can be added later through a
 *   separately approved read path without changing this feed contract.
 *
 * Database authorization remains the security boundary. This service does
 * not duplicate RLS rules in the frontend.
 */
(function (window) {
    "use strict";

    class BarahaService {
        constructor(supabaseClient) {
            this.supabase = supabaseClient || null;
        }

        setClient(supabaseClient) {
            this.supabase = supabaseClient || null;
        }

        async getSession() {
            if (!this.supabase) return null;
            const result = await this.supabase.auth.getSession();
            return result && result.data ? result.data.session : null;
        }

        async getMemberships() {
            throw new Error("BarahaService.getMemberships is not wired to Supabase yet.");
        }

        async getPosts(options) {
            if (!this.supabase) {
                throw new Error("BarahaService.getPosts requires a Supabase client.");
            }

            options = options || {};

            const requestedLimit = Number(options.limit);
            const limit = Number.isFinite(requestedLimit)
                ? Math.min(Math.max(Math.floor(requestedLimit), 1), 50)
                : 20;
            const cursor = options.cursor || null;

            if (cursor !== null &&
                (typeof cursor !== "object" ||
                 typeof cursor.created_at !== "string" ||
                 typeof cursor.id !== "number" ||
                 !Number.isFinite(cursor.id))) {
                throw new Error("BarahaService.getPosts received an invalid cursor.");
            }

            let query = this.supabase
                .from("baraha_posts")
                .select("*")
                .order("created_at", { ascending: false })
                .order("id", { ascending: false })
                .limit(limit + 1);

            if (cursor) {
                const createdAt = cursor.created_at.replace(/,/g, "");
                query = query.or(
                    "created_at.lt." + createdAt +
                    ",and(created_at.eq." + createdAt + ",id.lt." + cursor.id + ")"
                );
            }

            const result = await query;
            if (result.error) {
                throw result.error;
            }

            const rows = Array.isArray(result.data) ? result.data : [];
            const hasMore = rows.length > limit;
            const posts = hasMore ? rows.slice(0, limit) : rows;
            const last = posts.length ? posts[posts.length - 1] : null;

            return {
                posts: posts,
                hasMore: hasMore,
                nextCursor: hasMore && last
                    ? {
                        created_at: last.created_at,
                        id: last.id
                    }
                    : null
            };
        }

        async createPost() {
            throw new Error("BarahaService.createPost is not wired to Supabase yet.");
        }

        async publishPost() {
            throw new Error("BarahaService.publishPost is not wired to Supabase yet.");
        }
    }

    window.BarahaService = BarahaService;
})(window);
