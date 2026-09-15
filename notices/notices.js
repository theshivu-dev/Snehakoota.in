/* =========================================================
   SNEHAKOOTA — NOTICE BOARD
   ---------------------------------------------------------
   Read-side controller/rendering boundary for Community Updates.
   ========================================================= */
(function(){
  "use strict";

  const HOME_NOTICE_LIMIT = 5;
  const state = {
    updates: [],
    fullBoardOpen: false
  };

  const typeMeta = {
    notice: {
      label: "ಸೂಚನೆ",
      icon: "●"
    },
    announcement: {
      label: "ಪ್ರಕಟಣೆ",
      icon: "📣"
    },
    event: {
      label: "ಕಾರ್ಯಕ್ರಮ",
      icon: "▣"
    }
  };

  function getElements() {
    return {
      preview: document.getElementById("skNoticePreview"),
      previewStatus: document.getElementById("skNoticePreviewStatus"),
      fullBoard: document.getElementById("skNoticeBoard"),
      fullList: document.getElementById("skNoticeFullList"),
      fullStatus: document.getElementById("skNoticeFullStatus"),
      openButton: document.getElementById("skNoticeOpenAll"),
      closeButton: document.getElementById("skNoticeClose"),
      backdrop: document.getElementById("skNoticeBackdrop")
    };
  }

  function escapeHtml(value) {
    return String(value || "")
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#039;");
  }

  function formatDate(value) {
    if (!value) return "";
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return "";

    return new Intl.DateTimeFormat("en-IN", {
      day: "numeric",
      month: "short",
      year: "numeric"
    }).format(date);
  }

  function formatEventDate(update) {
    if (!update.event || !update.event.startsAt) return "";
    const date = new Date(update.event.startsAt);
    if (Number.isNaN(date.getTime())) return "";

    return new Intl.DateTimeFormat("en-IN", {
      day: "numeric",
      month: "short"
    }).format(date);
  }

  function metaFor(update) {
    return typeMeta[update.type] || typeMeta.notice;
  }

  function renderPreviewItem(update) {
    const meta = metaFor(update);
    const eventDate = update.type === "event" ? formatEventDate(update) : "";

    return [
      '<article class="sk-notice-preview-item" data-notice-id="', update.id, '">',
        '<button class="sk-notice-preview-trigger" type="button" data-notice-open="', update.id, '" aria-label="Open ', escapeHtml(update.title), '">',
          '<span class="sk-notice-type sk-notice-type--', escapeHtml(update.type), '">',
            '<span class="sk-notice-type-icon" aria-hidden="true">', meta.icon, '</span>',
            '<span>', escapeHtml(meta.label), '</span>',
          '</span>',
          eventDate ? '<span class="sk-notice-preview-date">' + escapeHtml(eventDate) + '</span>' : '',
          '<strong>', escapeHtml(update.title), '</strong>',
          '<span class="sk-notice-preview-more" aria-hidden="true">›</span>',
        '</button>',
      '</article>'
    ].join("");
  }

  function renderFullItem(update) {
    const meta = metaFor(update);
    const eventDate = update.type === "event" ? formatDate(update.event && update.event.startsAt) : "";
    const location = update.event && update.event.locationName
      ? '<div class="sk-notice-event-location">📍 ' + escapeHtml(update.event.locationName) + '</div>'
      : "";
    const eventInfo = eventDate
      ? '<div class="sk-notice-event-date">📅 ' + escapeHtml(eventDate) + '</div>'
      : "";

    return [
      '<article class="sk-notice-full-item" data-notice-id="', update.id, '">',
        '<button class="sk-notice-full-trigger" type="button" aria-expanded="false" data-notice-toggle="', update.id, '">',
          '<span class="sk-notice-type sk-notice-type--', escapeHtml(update.type), '">',
            '<span class="sk-notice-type-icon" aria-hidden="true">', meta.icon, '</span>',
            '<span>', escapeHtml(meta.label), '</span>',
          '</span>',
          '<strong>', escapeHtml(update.title), '</strong>',
          '<span class="sk-notice-chevron" aria-hidden="true">⌄</span>',
        '</button>',
        '<div class="sk-notice-full-detail" hidden>',
          update.content ? '<p>' + escapeHtml(update.content).replace(/\n/g, "<br>") + '</p>' : '',
          eventInfo,
          location,
          update.linkedBarahaPostId ? '<span class="sk-notice-linked-note">Related community story available</span>' : '',
        '</div>',
      '</article>'
    ].join("");
  }

  function renderEmpty(target, full) {
    target.innerHTML = full
      ? '<div class="sk-notice-empty"><strong>ಇನ್ನೂ ಯಾವುದೇ ಪ್ರಕಟಣೆಗಳಿಲ್ಲ.</strong><span>ಹೊಸ ಸಮುದಾಯದ ಮಾಹಿತಿ ಇಲ್ಲಿ ಕಾಣಿಸುತ್ತದೆ.</span></div>'
      : '<div class="sk-notice-empty sk-notice-empty--compact"><span>ಹೊಸ ಪ್ರಕಟಣೆಗಳು ಶೀಘ್ರದಲ್ಲೇ ಇಲ್ಲಿ ಕಾಣಿಸುತ್ತವೆ.</span></div>';
  }

  function render() {
    const elements = getElements();

    if (!elements.preview || !elements.fullList) return;

    if (!state.updates.length) {
      renderEmpty(elements.preview, false);
      renderEmpty(elements.fullList, true);
      if (elements.previewStatus) {
        elements.previewStatus.textContent = "No current updates";
      }
      if (elements.fullStatus) {
        elements.fullStatus.textContent = "";
      }
      return;
    }

    elements.preview.innerHTML = state.updates
      .slice(0, HOME_NOTICE_LIMIT)
      .map(renderPreviewItem)
      .join("");

    elements.fullList.innerHTML = state.updates
      .map(renderFullItem)
      .join("");

    if (elements.previewStatus) {
      elements.previewStatus.textContent = state.updates.length === 1
        ? "1 current update"
        : state.updates.length + " current updates";
    }

    if (elements.fullStatus) {
      elements.fullStatus.textContent = "";
    }

    bindItemActions();
  }

  function openFullBoard(focusId) {
    const elements = getElements();
    if (!elements.fullBoard) return;

    state.fullBoardOpen = true;
    elements.fullBoard.hidden = false;
    document.body.classList.add("sk-notice-board-open");

    window.requestAnimationFrame(function() {
      elements.fullBoard.classList.add("is-open");

      if (focusId) {
        const item = elements.fullBoard.querySelector(
          '[data-notice-id="' + String(focusId) + '"]'
        );
        if (item) {
          item.scrollIntoView({ block: "start", behavior: "smooth" });
          const trigger = item.querySelector("[data-notice-toggle]");
          if (trigger) {
            setExpanded(item, true);
            trigger.focus({ preventScroll: true });
          }
        }
      } else if (elements.closeButton) {
        elements.closeButton.focus({ preventScroll: true });
      }
    });
  }

  function closeFullBoard() {
    const elements = getElements();
    if (!elements.fullBoard) return;

    state.fullBoardOpen = false;
    elements.fullBoard.classList.remove("is-open");
    document.body.classList.remove("sk-notice-board-open");

    window.setTimeout(function() {
      if (!state.fullBoardOpen) {
        elements.fullBoard.hidden = true;
      }
    }, 220);
  }

  function setExpanded(item, expanded) {
    const trigger = item.querySelector("[data-notice-toggle]");
    const detail = item.querySelector(".sk-notice-full-detail");

    if (!trigger || !detail) return;

    trigger.setAttribute("aria-expanded", expanded ? "true" : "false");
    detail.hidden = !expanded;
    item.classList.toggle("is-expanded", expanded);
  }

  function bindItemActions() {
    const elements = getElements();

    elements.preview.querySelectorAll("[data-notice-open]").forEach(function(button) {
      button.addEventListener("click", function() {
        openFullBoard(button.getAttribute("data-notice-open"));
      });
    });

    elements.fullList.querySelectorAll("[data-notice-toggle]").forEach(function(button) {
      button.addEventListener("click", function() {
        const item = button.closest(".sk-notice-full-item");
        const expanded = button.getAttribute("aria-expanded") === "true";
        setExpanded(item, !expanded);
      });
    });
  }

  async function refreshNotices() {
    const elements = getElements();

    if (!window.SnehakootaNoticesService) {
      console.error("Notice service is unavailable.");
      return;
    }

    if (elements.previewStatus) {
      elements.previewStatus.textContent = "Loading updates…";
    }

    try {
      state.updates = await window.SnehakootaNoticesService.getVisibleUpdates({
        limit: null
      });
      render();
    } catch (error) {
      console.error("Community Updates load failed:", error);
      state.updates = [];

      if (elements.preview) {
        elements.preview.innerHTML =
          '<div class="sk-notice-empty sk-notice-empty--compact"><span>ಪ್ರಕಟಣೆಗಳನ್ನು ಈಗ ಲೋಡ್ ಮಾಡಲು ಸಾಧ್ಯವಾಗಲಿಲ್ಲ.</span></div>';
      }

      if (elements.fullList) {
        elements.fullList.innerHTML =
          '<div class="sk-notice-empty"><strong>Updates could not be loaded.</strong><span>Please try again shortly.</span></div>';
      }

      if (elements.previewStatus) {
        elements.previewStatus.textContent = "Unavailable";
      }
    }
  }

  function bindBoardActions() {
    const elements = getElements();

    if (elements.openButton) {
      elements.openButton.addEventListener("click", function() {
        openFullBoard();
      });
    }

    if (elements.closeButton) {
      elements.closeButton.addEventListener("click", closeFullBoard);
    }

    if (elements.backdrop) {
      elements.backdrop.addEventListener("click", closeFullBoard);
    }

    document.addEventListener("keydown", function(event) {
      if (event.key === "Escape" && state.fullBoardOpen) {
        closeFullBoard();
      }
    });

    document.addEventListener("sk:auth-state", function() {
      refreshNotices();
    });

    window.addEventListener("pageshow", function(event) {
      if (event.persisted) {
        refreshNotices();
      }
    });
  }

  function init() {
    bindBoardActions();
    refreshNotices();
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init, { once: true });
  } else {
    init();
  }

  window.SnehakootaNoticeBoard = Object.freeze({
    refresh: refreshNotices,
    open: openFullBoard,
    close: closeFullBoard,
    HOME_NOTICE_LIMIT: HOME_NOTICE_LIMIT
  });
})();
