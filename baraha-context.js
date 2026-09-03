/*
 * Baraha application context.
 *
 * Purpose:
 * - Keep session/user/membership state in one place.
 * - Keep authentication context separate from membership context.
 * - Provide a stable object for the controller and future UI work.
 *
 * This file intentionally does not call Supabase. The service layer owns
 * external communication; the context only stores application state.
 */
(function (window) {
    "use strict";

    class BarahaContext {
        constructor() {
            this.session = null;
            this.user = null;
            this.memberships = [];
            this.currentMembership = null;
        }

        setSession(session) {
            this.session = session || null;
            this.user = session && session.user ? session.user : null;
        }

        setMemberships(memberships) {
            this.memberships = Array.isArray(memberships) ? memberships : [];

            if (
                this.currentMembership &&
                !this.memberships.some((item) => item.id === this.currentMembership.id)
            ) {
                this.currentMembership = null;
            }
        }

        setCurrentMembership(membership) {
            this.currentMembership = membership || null;
        }

        clear() {
            this.session = null;
            this.user = null;
            this.memberships = [];
            this.currentMembership = null;
        }
    }

    window.BarahaContext = BarahaContext;
})(window);
