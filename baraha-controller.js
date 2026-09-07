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
        }

        async init() {
            if (!this.context || !this.model || !this.service) {
                throw new Error("BarahaController requires context, model and service.");
            }

            const session = await this.service.getSession();
            this.context.setSession(session);

            await this.loadPosts();

            if (this.view && typeof this.view.render === "function") {
                this.view.render(this.model, this.context);
            }
        }

        async refreshPosts() {
            this.feedCursor = null;
            this.hasMorePosts = true;
            return this.loadPosts();
        }

        async loadPosts() {
            if (this.feedLoading || !this.hasMorePosts) return;

            this.feedLoading = true;
            try {
                const result = await this.service.getPosts({
                    cursor: this.feedCursor,
                    limit: 20
                });

                this.model.setPosts(result.posts);
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
            const modelPost = this.model && typeof this.model.addPost === "function"
                ? this.model.addPost(publishedPost[0] || post)
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
                authorMembershipId: post.authorMembershipId || null,
                contentStatus: "published"
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

                const currentPosts = Array.isArray(this.model.posts) ? this.model.posts : [];
                this.model.setPosts(currentPosts.concat(result.posts || []));
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
