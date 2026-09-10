/*
 * Baraha controller layer.
 *
 * Purpose:
 * - Coordinate context, model, service and view.
 * - Keep user actions and page flow out of the HTML.
 * - Provide small methods that can be improved independently.
 *
 * The controller does not contain Supabase queries and does not own DOM
 * rendering details. Those responsibilities stay in their own layers.
 */
(function (window) {
    "use strict";

    class BarahaController {
        constructor(options) {
            options = options || {};
            this.context = options.context || null;
            this.model = options.model || null;
            this.service = options.service || null;
            this.view = options.view || null;
            this.feedCursor = null;
            this.hasMorePosts = true;
            this.feedLoading = false;
            this.feedAuthorId = null;
        }

        async init() {
            if (!this.context || !this.model || !this.service) {
                throw new Error("BarahaController requires context, model and service.");
            }

            const session = await this.service.getSession();
            this.context.setSession(session);

            await this.loadMemberships();
            await this.loadCapabilities();

            // All authoritative feed entries, including real re-entry and BFCache
            // restoration, reset through this one pagination path.
            const posts = await this.refreshPosts();

            if (this.view && typeof this.view.render === "function") {
                this.view.render(this.model, this.context);
            }

            return {
                session,
                memberships: this.context.memberships,
                capabilities: this.context.capabilities,
                posts
            };
        }

        async loadMemberships() {
            if (!this.context || !this.model || !this.service) {
                throw new Error("BarahaController requires context, model and service.");
            }

            if (!this.context.session) {
                this.context.setMemberships([]);
                this.model.setMemberships([]);
                return [];
            }

            const memberships = await this.service.getMemberships();
            this.context.setMemberships(memberships);
            this.model.setMemberships(memberships);

            return this.context.memberships;
        }

        async loadCapabilities() {
            if (!this.context || !this.service) {
                throw new Error("BarahaController requires context and service.");
            }

            const remoteCapabilities = await this.service.getCapabilities();
            const activeMemberships = (Array.isArray(this.context.memberships)
                ? this.context.memberships
                : [])
                .filter((membership) => membership.status === "active");
            const isAuthenticated = Boolean(remoteCapabilities && remoteCapabilities.isAuthenticated);
            const isOwner = Boolean(remoteCapabilities && remoteCapabilities.isOwner);
            // Current normal Baraha UI requires authentication and at least one active membership.
            // OWNER remains available in the capability snapshot for future owner-specific UI.
            const canWrite = isAuthenticated && activeMemberships.length > 0;

            const capabilities = {
                isAuthenticated,
                isOwner,
                activeMemberships,
                canWrite,
                canPublishPrivate: canWrite,
                canPublishPublic: canWrite,
                canPublishMembers: canWrite
            };

            this.context.setCapabilities(capabilities);
            return this.context.capabilities;
        }

        async refreshPosts() {
            this.feedCursor = null;
            this.hasMorePosts = true;
            return this.loadPosts();
        }

        async setMyPostsMode(enabled) {
            const authorId = enabled && this.context && this.context.user
                ? this.context.user.id
                : null;

            if (enabled && !authorId) {
                throw new Error("My Posts requires an authenticated user.");
            }

            if (this.feedAuthorId === authorId) {
                return null;
            }

            this.feedAuthorId = authorId;
            return this.refreshPosts();
        }

        isMyPostsMode() {
            return Boolean(this.feedAuthorId);
        }

        async loadPosts() {
            if (this.feedLoading || !this.hasMorePosts) return;

            this.feedLoading = true;
            try {
                const result = await this.service.getPosts({
                    cursor: this.feedCursor,
                    limit: 20,
                    authorId: this.feedAuthorId
                });

                this.model.setLivePosts(result.posts);
                this.feedCursor = result.nextCursor;
                this.hasMorePosts = result.hasMore;

                if (this.view && typeof this.view.renderFeed === "function") {
                    this.view.renderFeed(this.model, this.context);
                }

                return result;
            } finally {
                this.feedLoading = false;
            }
        }

        async openPost(postOrId) {
            if (!this.model || typeof this.model.setCurrentPost !== "function") {
                throw new Error("BarahaController requires a model with setCurrentPost().");
            }

            if (postOrId && typeof postOrId === "object") {
                this.model.setCurrentPost(postOrId);
                return this.model.currentPost;
            }

            if (postOrId === null || postOrId === undefined || postOrId === "") {
                this.model.setCurrentPost(null);
                return null;
            }

            const localPost = typeof this.model.findPostById === "function"
                ? this.model.findPostById(postOrId)
                : null;

            if (localPost) {
                this.model.setCurrentPost(localPost);
                return this.model.currentPost;
            }

            return this.loadPostById(postOrId);
        }

        async loadPostById(postId) {
            if (!this.service || typeof this.service.getPostById !== "function") {
                throw new Error("BarahaController requires a service with getPostById().");
            }

            const post = await this.service.getPostById(postId);

            this.model.setCurrentPost(post);

            return this.model.currentPost;
        }

        validatePostPayload(editorData) {
            const data = editorData || {};
            const errors = [];

            if (!String(data.title || "").trim()) {
                errors.push("title");
            }

            if (!String(data.content || "").trim()) {
                errors.push("content");
            }

            if (data.visibility === "members"
                && (!Array.isArray(data.membershipIds) || !data.membershipIds.filter(Boolean).length)) {
                errors.push("membershipIds");
            }

            return {
                valid: errors.length === 0,
                errors
            };
        }

        async publishPost(editorData) {
            if (!this.service || typeof this.service.createPost !== "function") {
                throw new Error("BarahaController requires a service with createPost().");
            }

            const validation = this.validatePostPayload(editorData);
            if (!validation.valid) {
                return {
                    published: false,
                    validation
                };
            }

            const preparedPost = this.preparePostPayload(editorData);
            const publishingPost = await this.populatePublishingContext(preparedPost);
            const post = await this.service.createPost(publishingPost);
            const publishedPost = await this.service.enrichPosts([post]);
            const modelPost = this.model && typeof this.model.addLivePost === "function"
                ? this.model.addLivePost(publishedPost[0] || post)
                : (publishedPost[0] || post);

            return {
                published: true,
                post: modelPost
            };
        }

        async populatePublishingContext(postData) {
            if (!this.service || typeof this.service.getCurrentAuthorContext !== "function") {
                throw new Error("BarahaController requires a service with getCurrentAuthorContext().");
            }

            const post = Object.assign({}, postData || {});
            const author = await this.service.getCurrentAuthorContext();

            return Object.assign(post, {
                authorId: author.authorId,
                authorDisplayName: author.authorDisplayName,
                authorMembershipId: post.authorMembershipId || null
            });
        }

        preparePostPayload(editorData) {
            const data = editorData || {};
            const categoryMap = {
                "ಬರಹ": "baraha",
                "ಕವನ": "poem",
                "ನೆನಪು": "memory",
                "ಲೇಖನ": "article"
            };
            const category = categoryMap[data.category] || data.category || null;
            const visibility = data.visibility || "private";
            const membershipIds = visibility === "members"
                ? (Array.isArray(data.membershipIds) ? data.membershipIds.filter(Boolean) : [])
                : [];

            return {
                id: data.id || null,
                title: typeof data.title === "string" ? data.title.trim() : "",
                content: typeof data.content === "string" ? data.content : "",
                category,
                visibility,
                membershipIds,
                authorMembershipId: data.authorMembershipId || null
            };
        }

        async loadMorePosts() {
            if (this.feedLoading || !this.hasMorePosts) return null;

            this.feedLoading = true;
            try {
                const result = await this.service.getPosts({
                    cursor: this.feedCursor,
                    limit: 20
                });

                this.model.appendLivePosts(result.posts || []);
                this.feedCursor = result.nextCursor;
                this.hasMorePosts = result.hasMore;

                if (this.view && typeof this.view.renderFeed === "function") {
                    this.view.renderFeed(this.model, this.context);
                }

                return result;
            } finally {
                this.feedLoading = false;
            }
        }

        selectMembership(membershipId) {
            const membership = this.model.memberships.find((item) => item.id === membershipId) || null;
            this.model.setCurrentMembership(membership);
            this.context.setCurrentMembership(membership);

            if (this.view && typeof this.view.renderMembershipState === "function") {
                this.view.renderMembershipState(membership, this.context);
            }
        }
    }

    window.BarahaController = BarahaController;
})(window);
