/* =========================================================
   SNEHAKOOTA — NOTICE BOARD
   ---------------------------------------------------------
   Read-side controller/rendering boundary for Community Updates.
   ========================================================= */
(function(){
  "use strict";

  const HOME_NOTICE_LIMIT = 5;
  const CREATE_REFRESH_ATTEMPTS = 3;
  const CREATE_REFRESH_DELAY_MS = 250;
  const state = {
    updates: [],
    fullBoardOpen: false
  };

  const typeMeta = {
    notice: { label: "ಸೂಚನೆ", icon: "●" },
    announcement: { label: "ಪ್ರಕಟಣೆ", icon: "📣" },
    event: { label: "ಕೂಟ / ಕಾರ್ಯಕ್ರಮ", icon: "▣" }
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
      .replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;").replace(/'/g, "&#039;");
  }

  function formatDate(value) {
    if (!value) return "";
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return "";
    return new Intl.DateTimeFormat("en-IN", { day: "numeric", month: "short", year: "numeric" }).format(date);
  }

  function formatEventDate(update) {
    if (!update.event || !update.event.startsAt) return "";
    const date = new Date(update.event.startsAt);
    if (Number.isNaN(date.getTime())) return "";
    return new Intl.DateTimeFormat("en-IN", { day: "numeric", month: "short" }).format(date);
  }

  function metaFor(update) { return typeMeta[update.type] || typeMeta.notice; }

  function renderPreviewItem(update) {
    const meta = metaFor(update);
    const eventDate = update.type === "event" ? formatEventDate(update) : "";
    const eventClass = update.type === "event" ? " sk-notice-preview-item--event" : "";
    return [
      '<article class="sk-notice-preview-item', eventClass, '" data-notice-id="', update.id, '">',
        '<button class="sk-notice-preview-trigger" type="button" data-notice-open="', update.id, '" aria-label="Open ', escapeHtml(update.title), '">',
          '<span class="sk-notice-type sk-notice-type--', escapeHtml(update.type), '"><span class="sk-notice-type-icon" aria-hidden="true">', meta.icon, '</span><span>', escapeHtml(meta.label), '</span></span>',
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
      ? '<div class="sk-notice-event-location">📍 ' + escapeHtml(update.event.locationName) + '</div>' : "";
    const eventInfo = eventDate
      ? '<div class="sk-notice-event-date">📅 ' + escapeHtml(eventDate) + '</div>' : "";
    const eventMeaning = update.type === "event"
      ? '<div class="sk-notice-event-meaning">ಮತ್ತೆ ಒಂದಾಗಿ ಭೇಟಿಯಾಗಲು, ಮಾತುಕತೆ–ಸಂತೋಷ ಹಂಚಿಕೊಳ್ಳಲು ಮತ್ತು ನಮ್ಮ ಮುಂದಿನ ಕೂಟವನ್ನು ರೂಪಿಸಿಕೊಳ್ಳಲು ಇಂತಹ ಕಾರ್ಯಕ್ರಮಗಳು ಒಂದು ನೆಪ.</div>' : "";
    const eventClass = update.type === "event" ? " sk-notice-full-item--event" : "";
    return [
      '<article class="sk-notice-full-item', eventClass, '" data-notice-id="', update.id, '">',
        '<button class="sk-notice-full-trigger" type="button" aria-expanded="false" data-notice-toggle="', update.id, '">',
          '<span class="sk-notice-type sk-notice-type--', escapeHtml(update.type), '"><span class="sk-notice-type-icon" aria-hidden="true">', meta.icon, '</span><span>', escapeHtml(meta.label), '</span></span>',
          '<strong>', escapeHtml(update.title), '</strong>',
          '<span class="sk-notice-chevron" aria-hidden="true">⌄</span>',
        '</button>',
        '<div class="sk-notice-full-detail" hidden>',
          update.content ? '<p>' + escapeHtml(update.content).replace(/\n/g, "<br>") + '</p>' : '',
          eventMeaning,
          eventInfo,
          location,
          update.linkedBarahaPostId ? '<span class="sk-notice-linked-note">Related community story available</span>' : '',
          '<div class="sk-notice-full-actions" data-notice-actions hidden>',
            '<button class="sk-notice-delete" type="button" data-notice-delete="', update.id, '" aria-label="Delete ', escapeHtml(update.title), '">',
              '<svg class="sk-notice-delete-icon" aria-hidden="true" viewBox="0 0 24 24" focusable="false"><path d="M4 7h16M9 7V5.5h6V7M7 7l.8 12h8.4L17 7M10 10.5v5.5M14 10.5v5.5" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"/></svg>',
              '<span>Delete notice</span>',
            '</button>',
            '<span class="sk-notice-delete-status" data-notice-delete-status aria-live="polite"></span>',
          '</div>',
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
      if (elements.previewStatus) elements.previewStatus.textContent = "No current updates";
      if (elements.fullStatus) elements.fullStatus.textContent = "";
      return;
    }

    elements.preview.innerHTML = state.updates.slice(0, HOME_NOTICE_LIMIT).map(renderPreviewItem).join("");
    elements.fullList.innerHTML = state.updates.map(renderFullItem).join("");
    loadManageCapabilities();

    if (elements.previewStatus) {
      elements.previewStatus.textContent = state.updates.length === 1 ? "1 current update" : state.updates.length + " current updates";
    }
    if (elements.fullStatus) elements.fullStatus.textContent = "";
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
        const item = elements.fullBoard.querySelector('[data-notice-id="' + String(focusId) + '"]');
        if (item) {
          item.scrollIntoView({ block: "start", behavior: "smooth" });
          const trigger = item.querySelector("[data-notice-toggle]");
          if (trigger) { setExpanded(item, true); trigger.focus({ preventScroll: true }); }
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
      if (!state.fullBoardOpen) elements.fullBoard.hidden = true;
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

  async function loadManageCapabilities() {
    const elements = getElements();
    if (!elements.fullList || !window.SnehakootaNoticesService) return;
    try {
      const ids = state.updates.map(function(update) { return update.id; });
      const capabilities = await window.SnehakootaNoticesService.getManageCapabilities(ids);
      elements.fullList.querySelectorAll('[data-notice-actions]').forEach(function(actions) {
        const item = actions.closest('[data-notice-id]');
        if (!item) return;
        const id = Number(item.getAttribute('data-notice-id'));
        actions.hidden = capabilities.get(id) !== true;
      });
    } catch (error) {
      console.error("Community Update management capabilities load failed:", error);
    }
  }

  async function handleDelete(button) {
    const item = button.closest('.sk-notice-full-item');
    const status = item && item.querySelector('[data-notice-delete-status]');
    const updateId = button.getAttribute('data-notice-delete');
    const update = state.updates.find(function(row) { return String(row.id) === String(updateId); });
    if (!item || !update || button.disabled) return;
    if (!window.confirm('Delete this notice? This cannot be undone.\n\n' + update.title)) return;
    button.disabled = true;
    button.setAttribute('aria-busy', 'true');
    if (status) status.textContent = 'Deleting…';
    try {
      await window.SnehakootaNoticesService.deleteUpdate(updateId);
      state.updates = state.updates.filter(function(row) { return String(row.id) !== String(updateId); });
      render();
    } catch (error) {
      console.error("Community Update delete failed:", error);
      button.disabled = false;
      button.removeAttribute('aria-busy');
      if (status) status.textContent = 'Could not delete. Please try again.';
    }
  }

  function bindItemActions() {
    const elements = getElements();
    elements.preview.querySelectorAll("[data-notice-open]").forEach(function(button) {
      button.addEventListener("click", function() { openFullBoard(button.getAttribute("data-notice-open")); });
    });
    elements.fullList.querySelectorAll("[data-notice-delete]").forEach(function(button) {
      button.addEventListener("click", function(event) { event.stopPropagation(); handleDelete(button); });
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
      return false;
    }
    if (elements.previewStatus) elements.previewStatus.textContent = "Loading updates…";
    try {
      state.updates = await window.SnehakootaNoticesService.getVisibleUpdates({ limit: null });
      render();
      return true;
    } catch (error) {
      console.error("Community Updates load failed:", error);
      state.updates = [];
      if (elements.preview) elements.preview.innerHTML = '<div class="sk-notice-empty sk-notice-empty--compact"><span>ಪ್ರಕಟಣೆಗಳನ್ನು ಈಗ ಲೋಡ್ ಮಾಡಲು ಸಾಧ್ಯವಾಗಲಿಲ್ಲ.</span></div>';
      if (elements.fullList) elements.fullList.innerHTML = '<div class="sk-notice-empty"><strong>Updates could not be loaded.</strong><span>Please try again shortly.</span></div>';
      if (elements.previewStatus) elements.previewStatus.textContent = "Unavailable";
      return false;
    }
  }

  async function refreshAfterCreate(createdUpdate) {
    const createdId = createdUpdate && Number(createdUpdate.id);
    for (let attempt = 0; attempt < CREATE_REFRESH_ATTEMPTS; attempt += 1) {
      const refreshed = await refreshNotices();
      if (refreshed && (!Number.isFinite(createdId) || state.updates.some(function(update) { return Number(update.id) === createdId; }))) {
        return true;
      }
      if (attempt < CREATE_REFRESH_ATTEMPTS - 1) {
        await new Promise(function(resolve) { window.setTimeout(resolve, CREATE_REFRESH_DELAY_MS); });
      }
    }
    return false;
  }

  function ensureRuntimeStyles() {
    if (document.querySelector('link[data-sk-notice-runtime]')) return;
    const link = document.createElement("link");
    link.rel = "stylesheet";
    link.href = "notices/notices-runtime.css";
    link.setAttribute("data-sk-notice-runtime", "true");
    document.head.appendChild(link);
  }

  function bindBoardActions() {
    const elements = getElements();
    if (elements.openButton) elements.openButton.addEventListener("click", function() { openFullBoard(); });
    if (elements.closeButton) elements.closeButton.addEventListener("click", closeFullBoard);
    if (elements.backdrop) elements.backdrop.addEventListener("click", closeFullBoard);
    document.addEventListener("keydown", function(event) { if (event.key === "Escape" && state.fullBoardOpen) closeFullBoard(); });
    document.addEventListener("sk:auth-state", function() { refreshNotices(); });
    window.addEventListener("pageshow", function(event) { if (event.persisted) refreshNotices(); });
  }

  function init() {
    ensureRuntimeStyles();
    bindBoardActions();
    refreshNotices();
  }

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", init, { once: true });
  else init();

  window.SnehakootaNoticeBoard = Object.freeze({
    refresh: refreshNotices,
    refreshAfterCreate: refreshAfterCreate,
    open: openFullBoard,
    close: closeFullBoard,
    HOME_NOTICE_LIMIT: HOME_NOTICE_LIMIT
  });
})();