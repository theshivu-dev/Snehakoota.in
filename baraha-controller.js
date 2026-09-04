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
