/*
 * Baraha view/presentation boundary.
 *
 * Purpose:
 * - Convert application BarahaPost rows into the existing UI feed contract.
 * - Keep UI-only derived values out of the model and database.
 * - Accept a collection of posts so feed mapping stays row-oriented.
 *
 * No Supabase calls belong here.
 */
(function (window) {
    "use strict";

    const PRESENTATION_BY_CATEGORY = {
        poem: "poem",
        memory: "memory",
        book: "book"
    };

    const CATEGORY_LABELS = {
        baraha: "ಬರಹ",
        poem: "ಕವನ",
        memory: "ನೆನಪು",
        article: "ಲೇಖನ",
        book: "ಪುಸ್ತಕ"
    };

    const VISIBILITY_LABELS = {
        private: "ಖಾಸಗಿ",
        members: "ಸದಸ್ಯರು",
        public: "ಸಾರ್ವಜನಿಕ"
    };

    function formatRelativeTime(createdAt) {
        if (!createdAt) return "";

        const created = new Date(createdAt);
        if (Number.isNaN(created.getTime())) return "";

        const elapsedSeconds = Math.round((created.getTime() - Date.now()) / 1000);
        const absoluteSeconds = Math.abs(elapsedSeconds);
        let value;
        let unit;

        if (absoluteSeconds < 60) {
            value = elapsedSeconds;
            unit = "second";
        } else if (absoluteSeconds < 3600) {
            value = Math.round(elapsedSeconds / 60);
            unit = "minute";
        } else if (absoluteSeconds < 86400) {
            value = Math.round(elapsedSeconds / 3600);
            unit = "hour";
        } else if (absoluteSeconds < 2592000) {
            value = Math.round(elapsedSeconds / 86400);
            unit = "day";
        } else if (absoluteSeconds < 31536000) {
            value = Math.round(elapsedSeconds / 2592000);
            unit = "month";
        } else {
            value = Math.round(elapsedSeconds / 31536000);
            unit = "year";
        }

        if (typeof Intl !== "undefined" && typeof Intl.RelativeTimeFormat === "function") {
            return new Intl.RelativeTimeFormat("kn", { numeric: "always" }).format(value, unit);
        }

        return created.toLocaleDateString("kn-IN");
    }

    function postToUi(post) {
        if (!post) return null;

        const author = post.author || {};
        const category = post.category || null;
        const visibility = post.visibility || null;
        const displayTime = post.displayTime || post.time || formatRelativeTime(post.createdAt);

        return {
            id: post.id,
            category: category,
            categoryLabel: CATEGORY_LABELS[category] || category || "",
            title: post.title,
            content: post.content,
            author: author.displayName || post.authorDisplayName || post.author || "Member",
            time: displayTime,
            displayTime: displayTime,
            visibility: visibility,
            visibilityLabel: VISIBILITY_LABELS[visibility] || visibility || "",
            presentation: post.presentation || PRESENTATION_BY_CATEGORY[category] || "default"
        };
    }

    function postsToUi(posts) {
        if (!Array.isArray(posts)) return [];
        return posts.map(postToUi).filter(Boolean);
    }

    window.BarahaView = {
        postToUi: postToUi,
        postsToUi: postsToUi,
        formatRelativeTime: formatRelativeTime
    };
})(window);
