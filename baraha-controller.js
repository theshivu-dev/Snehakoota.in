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
        }

        async init() {
            if (!this.context || !this.model || !this.service) {
                throw new Error("BarahaController requires context, model and service.");
            }

            const session = await this.service.getSession();
            this.context.setSession(session);

            if (this.view && typeof this.view.render === "function") {
                this.view.render(this.model, this.context);
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
