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

        async getCurrentAuthorContext() {
            if (!this.supabase) {
                throw new Error("BarahaService.getCurrentAuthorContext requires a Supabase client.");
            }

            const userResult = await this.supabase.auth.getUser();
            if (userResult.error) {
                throw userResult.error;
            }

            const user = userResult.data ? userResult.data.user : null;
            if (!user) {
                throw new Error("Publishing requires an authenticated user.");
            }

            // The authenticated user is the publishing identity. Profile data is
            // enriched through the controlled author-profile RPC after publishing,
            // so this path must not directly read the protected profiles table.
            return {
                authorId: user.id,
                authorDisplayName: null
            };
        }

        // Reads the small, authoritative Baraha capability snapshot.
        // Membership data remains owned by getMemberships() to avoid duplicate queries.
        async getCapabilities() {
            if (!this.supabase) {
                throw new Error("BarahaService.getCapabilities requires a Supabase client.");
            }

            const result = await this.supabase.rpc("baraha_get_capabilities");
            if (result.error) {
                throw result.error;
            }

            return result.data || {
                isAuthenticated: false,
                isOwner: false
            };
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

        async getModerationCapabilities(postIds) {
            const ids = [...new Set((postIds || [])
                .map((postId) => Number(postId))
                .filter((postId) => Number.isFinite(postId)))];

            if (!ids.length) {
                return new Map();
            }

            const result = await this.supabase.rpc(
                "baraha_get_moderation_capabilities",
                { p_post_ids: ids }
            );

            if (result.error) {
                throw result.error;
            }

            return new Map(
                (result.data || []).map((row) => [
                    Number(row.post_id),
                    Boolean(row.can_moderate)
                ])
            );
        }

        async enrichPosts(posts) {
            const rows = Array.isArray(posts) ? posts : [];
            const authorIds = Array.from(new Set(
                rows.map((post) => post.author_id).filter(Boolean)
            ));

            if (!rows.length) {
                return [];
            }

            const moderationCapabilitiesPromise = this.getModerationCapabilities(
                rows.map((post) => post.id)
            );

            const authorResultPromise = authorIds.length
                ? this.supabase.rpc(
                    "baraha_get_author_profiles",
                    { p_post_ids: rows.map((post) => post.id) }
                )
                : Promise.resolve({ data: [], error: null });

            const [authorResult, moderationCapabilities] = await Promise.all([
                authorResultPromise,
                moderationCapabilitiesPromise
            ]);

            if (authorResult.error) {
                throw authorResult.error;
            }

            const authorsById = {};
            (authorResult.data || []).forEach((author) => {
                authorsById[author.author_id] = {
                    id: author.author_id,
                    displayName: author.display_name || author.full_name || "Member",
                    avatarUrl: author.avatar_url || null
                };
            });

            return rows.map((post) => Object.assign({}, post, {
                author: {
                    id: post.author_id || null,
                    displayName: post.author_display_name ||
                        (authorsById[post.author_id] && authorsById[post.author_id].displayName) ||
                        "Member",
                    avatarUrl: (authorsById[post.author_id] && authorsById[post.author_id].avatarUrl) || null
                },
                canModerate: moderationCapabilities.get(Number(post.id)) === true
            }));
        }

        async getPostMembershipIds(postId) {
            if (!this.supabase) {
                throw new Error("BarahaService.getPostMembershipIds requires a Supabase client.");
            }

            if (postId === null || postId === undefined || postId === "") {
                return [];
            }

            const result = await this.supabase
                .from("baraha_post_memberships")
                .select("membership_id")
                .eq("post_id", postId);

            if (result.error) {
                throw result.error;
            }

            return (result.data || [])
                .map((row) => row.membership_id)
                .filter((membershipId) => membershipId !== null && membershipId !== undefined);
        }

        async getPostById(postId) {
            if (!this.supabase) {
                throw new Error("BarahaService.getPostById requires a Supabase client.");
            }

            if (postId === null || postId === undefined || postId === "") {
                throw new Error("BarahaService.getPostById requires a post ID.");
            }

            const result = await this.supabase
                .from("baraha_posts")
                .select("*")
                .eq("id", postId)
                .maybeSingle();

            if (result.error) {
                throw result.error;
            }

            if (!result.data) {
                return null;
            }

            const posts = await this.enrichPosts([result.data]);
            return posts[0] || null;
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
                .select("*");

            if (options.authorId) {
                query = query.eq("author_id", options.authorId);
            }

            query = query
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
            const enrichedPosts = await this.enrichPosts(posts);

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

        async createPost(postData) {
            if (!this.supabase) {
                throw new Error("BarahaService.createPost requires a Supabase client.");
            }

            const post = postData || {};

            // The database owns publication status and membership-link changes.
            // This existing service boundary only forwards the publish request
            // through the controlled RPC.
            const result = await this.supabase.rpc("baraha_publish_post", {
                p_post_id: post.id || null,
                p_title: post.title,
                p_content: post.content,
                p_category: post.category || null,
                p_visibility: post.visibility || "private",
                p_author_membership_id: post.authorMembershipId || null,
                p_author_display_name: post.authorDisplayName || null,
                p_membership_ids: Array.isArray(post.membershipIds)
                    ? post.membershipIds.filter(Boolean)
                    : []
            });

            if (result.error) {
                throw result.error;
            }

            return result.data;
        }


        // Lifecycle actions stay behind the same service boundary as publishing.
        // Controllers call these focused methods; status changes remain enforced by
        // the controlled Supabase RPCs rather than frontend updates.
        async approvePost(postId) {
            return this.callLifecycleAction(
                "baraha_approve_post",
                postId,
                "BarahaService.approvePost"
            );
        }

        async hidePost(postId) {
            return this.callLifecycleAction(
                "baraha_hide_post",
                postId,
                "BarahaService.hidePost"
            );
        }

        async archivePost(postId) {
            return this.callLifecycleAction(
                "baraha_archive_post",
                postId,
                "BarahaService.archivePost"
            );
        }

        async callLifecycleAction(rpcName, postId, callerName) {
            if (!this.supabase) {
                throw new Error((callerName || "BarahaService lifecycle action") + " requires a Supabase client.");
            }

            if (postId === null || postId === undefined || postId === "") {
                throw new Error((callerName || "BarahaService lifecycle action") + " requires a post ID.");
            }

            const result = await this.supabase.rpc(rpcName, {
                p_post_id: postId
            });

            if (result.error) {
                throw result.error;
            }

            return result.data;
        }

    }

    window.BarahaService = BarahaService;
})(window);
