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
 * - Uses the stored post author display name when available and keeps the
 *   existing batched profile lookup as a compatibility fallback.
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
            if (!this.supabase) {
                throw new Error("BarahaService.getMemberships requires a Supabase client.");
            }

            const result = await this.supabase.rpc("get_my_memberships");
            if (result.error) {
                throw result.error;
            }

            return (Array.isArray(result.data) ? result.data : []).map((membership) => ({
                id: membership.membership_id || null,
                schoolId: membership.school_id || null,
                batchId: membership.batch_id || null,
                membershipType: membership.membership_type || null,
                status: membership.status || null,
                school: {
                    id: membership.school_id || null,
                    name: membership.school_name || ""
                },
                batch: {
                    id: membership.batch_id || null,
                    year: membership.batch_year || null
                },
                createdAt: membership.created_at || null
            }));
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
            const authorIds = Array.from(new Set(
                posts.map((post) => post.author_id).filter(Boolean)
            ));

            const authorsById = {};
            if (authorIds.length) {
                const authorResult = await this.supabase.rpc(
                    "baraha_get_author_profiles",
                    { p_post_ids: posts.map((post) => post.id) }
                );

                if (authorResult.error) {
                    throw authorResult.error;
                }

                (authorResult.data || []).forEach((author) => {
                    authorsById[author.author_id] = {
                        id: author.author_id,
                        displayName: author.display_name || author.full_name || "Member",
                        avatarUrl: author.avatar_url || null
                    };
                });
            }

            const enrichedPosts = posts.map((post) => Object.assign({}, post, {
                author: {
                    id: post.author_id || null,
                    displayName: post.author_display_name ||
                        (authorsById[post.author_id] && authorsById[post.author_id].displayName) ||
                        "Member",
                    avatarUrl: (authorsById[post.author_id] && authorsById[post.author_id].avatarUrl) || null
                }
            }));

            const last = enrichedPosts.length ? enrichedPosts[enrichedPosts.length - 1] : null;

            return {
                posts: enrichedPosts,
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
