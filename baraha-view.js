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


    /*
     * Feed DOM projection.
     *
     * The controller remains the owner of feed state. This view receives that
     * state and projects it into the existing Baraha page DOM without fetching
     * data or changing application state.
     */
    class BarahaFeedView {
        constructor(options) {
            options = options || {};
            this.feedElement = options.feedElement || null;
            this.loadMoreElement = options.loadMoreElement || null;
            this.myPostsElement = options.myPostsElement || null;
        }

        renderFeed(model, context, feedState) {
            feedState = feedState || {};

            this.renderPosts(model);
            this.renderLoadMore(feedState);
            this.renderMyPosts(context, feedState);
        }

        renderPosts(model) {
            if (!this.feedElement) return;

            const posts = postsToUi((model && model.posts) || []);

            this.feedElement.innerHTML = posts.map((post) => {
                const cardClass = post.presentation === "default"
                    ? "card"
                    : `card ${post.presentation}`;
                const type = `${post.categoryLabel} · ${post.visibilityLabel}`;

                if (post.presentation === "memory") {
                    return `<article class="${cardClass}" data-category="${post.category}" data-post-id="${post.id}" tabindex="0">
                        <div class="memory-art">✦</div>
                        <div>
                            <div class="type">${type}</div>
                            <h2>${post.title}</h2>
                            <div class="meta"><span>${post.author} · ${post.time}</span><span class="card-open-cue" aria-hidden="true">→</span></div>
                        </div>
                    </article>`;
                }

                return `<article class="${cardClass}" data-category="${post.category}" data-post-id="${post.id}" tabindex="0">
                    <div class="type">${type}</div>
                    <h2>${post.title}</h2>
                    <div class="meta"><span>${post.author} · ${post.time}</span><span class="card-open-cue" aria-hidden="true">→</span></div>
                </article>`;
            }).join("");
        }

        renderLoadMore(feedState) {
            if (!this.loadMoreElement) return;

            if (feedState.feedLoading) {
                this.loadMoreElement.innerHTML = '<button class="baraha-load-more__button" type="button" disabled>ಇನ್ನಷ್ಟು ಬರಹಗಳನ್ನು ಲೋಡ್ ಮಾಡಲಾಗುತ್ತಿದೆ…</button>';
                return;
            }

            if (feedState.hasMorePosts === false) {
                this.loadMoreElement.innerHTML = "";
                return;
            }

            this.loadMoreElement.innerHTML = '<button class="baraha-load-more__button" type="button">ಇನ್ನಷ್ಟು ಬರಹಗಳನ್ನು ನೋಡಿ</button>';
        }

        renderMyPosts(context, feedState) {
            if (!this.myPostsElement) return;

            const isAuthenticated = Boolean(
                feedState.isAuthenticated !== undefined
                    ? feedState.isAuthenticated
                    : context && context.capabilities && context.capabilities.isAuthenticated
            );
            const isSelected = Boolean(feedState.isMyPostsMode);

            this.myPostsElement.disabled = !isAuthenticated;
            this.myPostsElement.classList.toggle("active", isSelected);
            this.myPostsElement.setAttribute("aria-pressed", isSelected ? "true" : "false");
        }
    }

    function createFeedView(options) {
        return new BarahaFeedView(options);
    }

    window.BarahaView = {
        postToUi: postToUi,
        postsToUi: postsToUi,
        formatRelativeTime: formatRelativeTime,
        BarahaFeedView: BarahaFeedView,
        createFeedView: createFeedView
    };
})(window);
