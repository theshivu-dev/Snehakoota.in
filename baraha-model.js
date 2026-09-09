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

    // Optional local seed content belongs to the model, not the page.
    // These are presentation/test records and can be omitted through
    // BarahaModel({ includeStaticPosts: false }) without changing feed flow.
    const BARAHA_STATIC_POSTS = [
        {
            id: "demo-1",
            category: "baraha",
            title: "ನಮ್ಮ ಶಾಲೆಯ ದಿನಗಳು",
            content: "ಕ್ಲಾಸ್‌ರೂಮ್, ಗಂಟೆ, ಆಟದ ಮೈದಾನ… ಮರೆಯಲಾಗದ ದಿನಗಳ ಕೆಲವು ಪುಟಗಳು.",
            author: "ಶಿವ",
            time: "2 ದಿನಗಳ ಹಿಂದೆ",
            visibility: "members",
            presentation: "default"
        },
        {
            id: "demo-2",
            category: "poem",
            title: "ಮತ್ತೊಮ್ಮೆ ಮೊಳೆಯಲ್ಲಿ",
            content: "ಹಳೆಯ ದಾರಿಯಲಿ\nಹೊಸ ಹೆಜ್ಜೆಗಳ ಸದ್ದು…",
            author: "ರೇಖಾ",
            time: "4 ದಿನಗಳ ಹಿಂದೆ",
            visibility: "public",
            presentation: "poem"
        },
        {
            id: "demo-3",
            category: "memory",
            title: "ನಮ್ಮ ಮೊದಲ ಸ್ನೇಹಕೂಟ",
            content: "ಮೊದಲ ಬಾರಿ ಎಲ್ಲರೂ ಮತ್ತೆ ಒಂದೇ ಜಾಗದಲ್ಲಿ ಕೂತ ದಿನ.",
            author: "ನೀವು",
            time: "1 ವಾರದ ಹಿಂದೆ",
            visibility: "private",
            presentation: "memory"
        },
        {
            id: "demo-4",
            category: "book",
            title: "Why old friendships still matter",
            content: "ಒಂದು ದೊಡ್ಡ ಬರಹದ ಮೊದಲ ಅಧ್ಯಾಯ.",
            author: "ವಿನಯ್",
            time: "2 ವಾರಗಳ ಹಿಂದೆ",
            visibility: "members",
            presentation: "book"
        },
        {
            id: "demo-5",
            category: "article",
            title: "ಬಂಧಗಳ ಅರ್ಥ",
            content: "ಸ್ನೇಹ ಎಂದರೆ ಕೇವಲ ನೆನಪುಗಳಲ್ಲ. ಅದು ನಮ್ಮನ್ನು ರೂಪಿಸಿದ ಸಂಬಂಧಗಳ ಕಥೆ.",
            author: "ಅನಿಲ್",
            time: "3 ವಾರಗಳ ಹಿಂದೆ",
            visibility: "public",
            presentation: "default"
        }
    ];

    class BarahaModel {
        constructor(options) {
            options = options || {};
            this.includeStaticPosts = options.includeStaticPosts !== false;
            this.seedPosts = this.includeStaticPosts
                ? BARAHA_STATIC_POSTS.map((row) => new BarahaPost(row))
                : [];
            this.livePosts = [];
            this.currentPost = null;
            this.memberships = [];
            this.categories = [];
            this.modes = [];
            this.visibilityOptions = [];
            this.currentMembership = null;
            this.selectedCategory = "all";
        }

        get posts() {
            return this.seedPosts.concat(this.livePosts);
        }

        setPosts(rows) {
            this.livePosts = Array.isArray(rows)
                ? rows.map((row) => row instanceof BarahaPost ? row : new BarahaPost(row))
                : [];
            return this.posts;
        }

        appendPosts(rows) {
            const additions = Array.isArray(rows)
                ? rows.map((row) => row instanceof BarahaPost ? row : new BarahaPost(row))
                : [];
            const existingIds = new Set(this.livePosts.map((post) => post.id));
            additions.forEach((post) => {
                if (!existingIds.has(post.id)) {
                    this.livePosts.push(post);
                    existingIds.add(post.id);
                }
            });
            return this.posts;
        }

        setCurrentPost(row) {
            this.currentPost = row
                ? (row instanceof BarahaPost ? row : new BarahaPost(row))
                : null;
        }

        addPost(row) {
            const post = row instanceof BarahaPost ? row : new BarahaPost(row);
            this.livePosts = [post].concat(
                this.livePosts.filter((item) => item.id !== post.id)
            );
            return post;
        }

        findPostById(postId) {
            return this.posts.find((post) => String(post.id) === String(postId)) || null;
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
