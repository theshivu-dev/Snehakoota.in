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
            this.authorId = data.author_id || data.authorId || null;
            this.authorMembershipId = data.author_membership_id || data.authorMembershipId || null;
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
            this.author = data.author || null;
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
