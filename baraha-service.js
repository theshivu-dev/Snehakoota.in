/*
 * Baraha data/service boundary.
 *
 * Purpose:
 * - Own communication with Supabase and other external data sources.
 * - Keep database details out of the controller and view.
 * - Add focused methods as Baraha grows.
 *
 * This foundation deliberately contains no database operations yet.
 * Each method is an explicit extension point for a verified Supabase query
 * or RPC. Do not duplicate authorization rules here; the database remains
 * the security boundary.
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
            throw new Error("BarahaService.getMemberships is not wired to Supabase yet.");
        }

        async getPosts() {
            throw new Error("BarahaService.getPosts is not wired to Supabase yet.");
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
