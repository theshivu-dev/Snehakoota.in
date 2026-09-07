/*
 * Baraha model layer.
 *
 * Purpose:
 * - Represent application data as predictable objects.
 * - Keep raw Supabase row shapes out of the view.
 * - Keep collections/state in one model container.
 *
 * No DOM and no Supabase calls belong here.
 */
(function (window) {
    "use strict";

    class BarahaPost {
        constructor(data) {
            data = data || {};
            this.id = data.id || null;
            const authorData = data.author || null;
            const authorObject = authorData && typeof authorData === "object" ? authorData : null;
            const authorText = typeof authorData === "string" ? authorData : null;

            this.authorId = data.author_id || data.authorId || (authorObject && authorObject.id) || null;
            this.authorMembershipId = data.author_membership_id || data.authorMembershipId || null;
            this.authorDisplayName =
                data.author_display_name ||
                data.authorDisplayName ||
                (authorObject && authorObject.displayName) ||
                authorText ||
                null;
            this.title = data.title || "";
            this.content = data.content || "";
            this.category = data.category || null;
            this.contentStatus = data.content_status || data.contentStatus || null;
            this.visibility = data.visibility || null;
            this.collectionKey = data.collection_key || data.collectionKey || null;
            this.collectionPart = data.collection_part || data.collectionPart || null;
            this.collectionOrder = data.collection_order || data.collectionOrder || null;
            this.createdAt = data.created_at || data.createdAt || null;
            this.updatedAt = data.updated_at || data.updatedAt || null;
            this.displayTime = data.time || data.displayTime || null;
            this.presentation = data.presentation || null;
            this.author = authorObject || (this.authorDisplayName
                ? {
                    id: this.authorId,
                    displayName: this.authorDisplayName,
                    avatarUrl: null
                }
                : null);
            this.memberships = Array.isArray(data.memberships) ? data.memberships : [];
        }
    }

    class BarahaMembership {
        constructor(data) {
            data = data || {};
            this.id = data.id || null;
            this.userId = data.user_id || data.userId || null;
            this.schoolId = data.school_id || data.schoolId || null;
            this.batchId = data.batch_id || data.batchId || null;
            this.invitationId = data.invitation_id || data.invitationId || null;
            this.membershipType = data.membership_type || data.membershipType || null;
            this.status = data.status || null;
            this.school = data.school || null;
            this.batch = data.batch || null;
        }
    }

    class BarahaModel {
        constructor() {
            this.posts = [];
            this.currentPost = null;
            this.memberships = [];
            this.categories = [];
            this.modes = [];
            this.visibilityOptions = [];
            this.currentMembership = null;
            this.selectedCategory = "all";
        }

        setPosts(rows) {
            this.posts = Array.isArray(rows) ? rows.map((row) => row instanceof BarahaPost ? row : new BarahaPost(row)) : [];
        }

        setCurrentPost(row) {
            this.currentPost = row
                ? (row instanceof BarahaPost ? row : new BarahaPost(row))
                : null;
        }

        addPost(row) {
            const post = row instanceof BarahaPost ? row : new BarahaPost(row);
            this.posts = [post].concat(
                (Array.isArray(this.posts) ? this.posts : []).filter((item) => item.id !== post.id)
            );
            return post;
        }

        setMemberships(rows) {
            this.memberships = Array.isArray(rows) ? rows.map((row) => row instanceof BarahaMembership ? row : new BarahaMembership(row)) : [];
        }

        setCurrentMembership(membership) {
            this.currentMembership = membership || null;
        }
    }

    window.BarahaPost = BarahaPost;
    window.BarahaMembership = BarahaMembership;
    window.BarahaModel = BarahaModel;
})(window);
