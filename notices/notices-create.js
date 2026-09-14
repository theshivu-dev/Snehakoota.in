/* =========================================================
   SNEHAKOOTA — NOTICE CREATION PANEL
   ---------------------------------------------------------
   Creation UI/controller boundary. It never writes to Supabase
   directly; notices-create-service.js owns the RPC calls.
   ========================================================= */
(function(){
  "use strict";

  const state = { context: null, open: false, saving: false };

  function getElements() {
    return {
      openButton: document.getElementById("skNoticeCreateOpen"),
      panel: document.getElementById("skNoticeCreate"),
      backdrop: document.getElementById("skNoticeCreateBackdrop"),
      closeButton: document.getElementById("skNoticeCreateClose"),
      form: document.getElementById("skNoticeCreateForm"),
      status: document.getElementById("skNoticeCreateStatus"),
      type: document.getElementById("skNoticeCreateType"),
      visibility: document.getElementById("skNoticeCreateVisibility"),
      title: document.getElementById("skNoticeCreateTitle"),
      content: document.getElementById("skNoticeCreateContent"),
      publishedAt: document.getElementById("skNoticeCreatePublishedAt"),
      expiresAt: document.getElementById("skNoticeCreateExpiresAt"),
      targetsGroup: document.getElementById("skNoticeCreateTargetsGroup"),
      targets: document.getElementById("skNoticeCreateTargets"),
      eventFields: document.getElementById("skNoticeCreateEventFields"),
      eventStartsAt: document.getElementById("skNoticeCreateEventStartsAt"),
      eventEndsAt: document.getElementById("skNoticeCreateEventEndsAt"),
      eventLocationName: document.getElementById("skNoticeCreateEventLocationName"),
      eventLocationUrl: document.getElementById("skNoticeCreateEventLocationUrl"),
      relatedUrl: document.getElementById("skNoticeCreateRelatedUrl"),
      submitButton: document.getElementById("skNoticeCreateSubmit")
    };
  }

  function escapeHtml(value) {
    return String(value || "")
      .replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;").replace(/'/g, "&#039;");
  }

  function setStatus(message, kind) {
    const el = getElements().status;
    if (!el) return;
    el.textContent = message || "";
    el.classList.remove("is-error", "is-success", "is-info");
    if (kind) el.classList.add("is-" + kind);
  }

  function setSaving(saving) {
    state.saving = saving;
    const button = getElements().submitButton;
    if (!button) return;
    button.disabled = saving;
    button.textContent = saving ? "ಪ್ರಕಟಿಸಲಾಗುತ್ತಿದೆ…" : "ಪ್ರಕಟಿಸಿ";
  }

  function toIso(value) {
    if (!value) return null;
    const date = new Date(value);
    return Number.isNaN(date.getTime()) ? null : date.toISOString();
  }

  function renderTargets() {
    const elements = getElements();
    if (!elements.targets) return;
    const targets = state.context && Array.isArray(state.context.targetBatches)
      ? state.context.targetBatches : [];

    elements.targets.innerHTML = targets.length
      ? targets.map(function(target) {
          const label = [target.schoolName || "Snehakoota",
            Number.isFinite(target.batchYear) ? target.batchYear : ""]
            .filter(Boolean).join(" · ");
          return '<label class="sk-notice-create-target"><input type="checkbox" name="skNoticeCreateTarget" value="' +
            target.id + '"><span>' + escapeHtml(label) + '</span></label>';
        }).join("")
      : '<p class="sk-notice-create-help">ಈಗ ಆಯ್ಕೆ ಮಾಡಲು ನಿರ್ವಹಣಾ ಹಕ್ಕು ಇರುವ ಯಾವುದೇ ಬಳಗಗಳಿಲ್ಲ.</p>';
  }

  function syncVisibilityOptions() {
    const elements = getElements();
    if (!elements.visibility) return;
    const context = state.context || { canPublishPublic: false, targetBatches: [] };
    const publicOption = elements.visibility.querySelector('option[value="public"]');
    const membershipOption = elements.visibility.querySelector('option[value="membership_targeted"]');
    if (publicOption) publicOption.disabled = !context.canPublishPublic;
    if (membershipOption) membershipOption.disabled = !context.targetBatches.length;
    if (context.canPublishPublic) elements.visibility.value = "public";
    else if (context.targetBatches.length) elements.visibility.value = "membership_targeted";
  }

  function syncFormVisibility() {
    const elements = getElements();
    if (!elements.form) return;
    const isEvent = elements.type && elements.type.value === "event";
    const isMembership = elements.visibility && elements.visibility.value === "membership_targeted";
    if (elements.eventFields) elements.eventFields.hidden = !isEvent;
    if (elements.targetsGroup) elements.targetsGroup.hidden = !isMembership;
    if (elements.eventStartsAt) elements.eventStartsAt.required = !!isEvent;
    elements.form.querySelectorAll(".sk-notice-create-field").forEach(function(field) {
      field.classList.remove("has-error");
    });
  }

  function resetForm() {
    const elements = getElements();
    if (!elements.form) return;
    elements.form.reset();
    renderTargets();
    syncVisibilityOptions();
    syncFormVisibility();
    setStatus("", null);
  }

  async function refreshAccess() {
    const openButton = getElements().openButton;
    if (!openButton) return;
    const auth = window.SK_AUTH || {};
    if (!auth.signedIn || !window.SnehakootaNoticeCreateService) {
      state.context = null;
      openButton.hidden = true;
      return;
    }
    try {
      state.context = await window.SnehakootaNoticeCreateService.getCreateContext();
      openButton.hidden = !(state.context.canPublishPublic || state.context.targetBatches.length);
    } catch (error) {
      console.warn("Notice creation access is unavailable:", error);
      state.context = null;
      openButton.hidden = true;
    }
  }

  async function openPanel() {
    const elements = getElements();
    if (!elements.panel || state.saving) return;
    if (!state.context) await refreshAccess();
    const context = state.context;
    if (!context || (!context.canPublishPublic && !context.targetBatches.length)) return;
    resetForm();
    state.open = true;
    elements.panel.hidden = false;
    document.body.classList.add("sk-notice-create-open");
    window.requestAnimationFrame(function() {
      elements.panel.classList.add("is-open");
      if (elements.title) elements.title.focus({ preventScroll: true });
    });
  }

  function closePanel() {
    const elements = getElements();
    if (!elements.panel || state.saving) return;
    state.open = false;
    elements.panel.classList.remove("is-open");
    document.body.classList.remove("sk-notice-create-open");
    window.setTimeout(function() {
      if (!state.open) elements.panel.hidden = true;
    }, 220);
  }

  function markInvalid(element, message) {
    if (element) {
      const field = element.closest(".sk-notice-create-field");
      if (field) field.classList.add("has-error");
      if (typeof element.focus === "function") element.focus({ preventScroll: false });
    }
    setStatus(message, "error");
    return false;
  }

  function selectedTargetIds() {
    return Array.from(document.querySelectorAll('input[name="skNoticeCreateTarget"]:checked'))
      .map(function(input) { return Number(input.value); })
      .filter(Number.isFinite);
  }

  function validateForm() {
    const e = getElements();
    const title = e.title && e.title.value.trim();
    const visibility = e.visibility && e.visibility.value;
    const isEvent = e.type && e.type.value === "event";
    const targets = selectedTargetIds();

    if (!e.type || !e.type.value) return markInvalid(e.type, "ಪ್ರಕಟಣೆಯ ವಿಧವನ್ನು ಆಯ್ಕೆಮಾಡಿ.");
    if (!visibility) return markInvalid(e.visibility, "ಯಾರಿಗೆ ಕಾಣಬೇಕು ಎಂಬುದನ್ನು ಆಯ್ಕೆಮಾಡಿ.");
    if (!title) return markInvalid(e.title, "ಶೀರ್ಷಿಕೆಯನ್ನು ನಮೂದಿಸಿ.");
    if (visibility === "membership_targeted" && !targets.length)
      return markInvalid(e.targets, "ಕನಿಷ್ಠ ಒಂದು ಬಳಗವನ್ನು ಆಯ್ಕೆಮಾಡಿ.");

    const publishedAt = toIso(e.publishedAt && e.publishedAt.value);
    const expiresAt = toIso(e.expiresAt && e.expiresAt.value);
    if (e.publishedAt && e.publishedAt.value && !publishedAt)
      return markInvalid(e.publishedAt, "ಮಾನ್ಯವಾದ ಪ್ರಕಟಿಸುವ ದಿನಾಂಕ ಮತ್ತು ಸಮಯವನ್ನು ಆಯ್ಕೆಮಾಡಿ.");
    if (e.expiresAt && e.expiresAt.value && !expiresAt)
      return markInvalid(e.expiresAt, "ಮಾನ್ಯವಾದ ಕೊನೆಯ ದಿನಾಂಕ ಮತ್ತು ಸಮಯವನ್ನು ಆಯ್ಕೆಮಾಡಿ.");
    if (publishedAt && expiresAt && expiresAt <= publishedAt)
      return markInvalid(e.expiresAt, "ಕೊನೆಯ ಸಮಯವು ಪ್ರಕಟಿಸುವ ಸಮಯದ ನಂತರ ಇರಬೇಕು.");

    if (isEvent) {
      const start = toIso(e.eventStartsAt && e.eventStartsAt.value);
      const end = toIso(e.eventEndsAt && e.eventEndsAt.value);
      if (!start) return markInvalid(e.eventStartsAt, "ಕಾರ್ಯಕ್ರಮದ ಆರಂಭದ ದಿನಾಂಕ ಮತ್ತು ಸಮಯವನ್ನು ಆಯ್ಕೆಮಾಡಿ.");
      if (end && end < start) return markInvalid(e.eventEndsAt, "ಕಾರ್ಯಕ್ರಮದ ಸಮಯಗಳನ್ನು ಪರಿಶೀಲಿಸಿ.");
    }

    if (e.relatedUrl && e.relatedUrl.value.trim()) {
      try {
        const url = new URL(e.relatedUrl.value.trim());
        if (!/^https?:$/.test(url.protocol)) throw new Error("Unsupported protocol");
      } catch (error) {
        return markInvalid(e.relatedUrl, "ಸರಿಯಾದ http ಅಥವಾ https ಲಿಂಕ್ ಅನ್ನು ನಮೂದಿಸಿ.");
      }
    }
    return true;
  }

  function buildPayload() {
    const e = getElements();
    const isEvent = e.type.value === "event";
    return {
      updateType: e.type.value,
      visibilityScope: e.visibility.value,
      title: e.title.value.trim(),
      content: e.content.value.trim(),
      publishedAt: toIso(e.publishedAt.value),
      expiresAt: toIso(e.expiresAt.value),
      schoolBatchIds: e.visibility.value === "membership_targeted" ? selectedTargetIds() : [],
      eventStartsAt: isEvent ? toIso(e.eventStartsAt.value) : null,
      eventEndsAt: isEvent ? toIso(e.eventEndsAt.value) : null,
      eventLocationName: isEvent ? e.eventLocationName.value.trim() : "",
      eventLocationUrl: isEvent ? e.eventLocationUrl.value.trim() : "",
      relatedUrl: e.relatedUrl.value.trim()
    };
  }

  function friendlyError(error) {
    const message = String(error && (error.message || error.details || error.hint) || "");
    if (/Authentication is required/i.test(message)) return "ಮುಂದುವರಿಯಲು ಮೊದಲು ಸೈನ್ ಇನ್ ಆಗಿ.";
    if (/Not allowed|active admin|publish public/i.test(message)) return "ಈ ಪ್ರಕಟಣೆಯನ್ನು ಪ್ರಕಟಿಸಲು ನಿಮಗೆ ಅನುಮತಿ ಇಲ್ಲ.";
    if (/school-batch target/i.test(message)) return "ಆಯ್ಕೆ ಮಾಡಿದ ಬಳಗದ ಮಾಹಿತಿಯನ್ನು ಪರಿಶೀಲಿಸಿ.";
    if (/expires_at|after published_at/i.test(message)) return "ಕೊನೆಯ ಸಮಯವು ಪ್ರಕಟಿಸುವ ಸಮಯದ ನಂತರ ಇರಬೇಕು.";
    if (/Event start time/i.test(message)) return "ಕಾರ್ಯಕ್ರಮದ ಆರಂಭದ ದಿನಾಂಕ ಮತ್ತು ಸಮಯವನ್ನು ಆಯ್ಕೆಮಾಡಿ.";
    if (/Event end time/i.test(message)) return "ಕಾರ್ಯಕ್ರಮದ ಸಮಯಗಳನ್ನು ಪರಿಶೀಲಿಸಿ.";
    if (/Related URL/i.test(message)) return "ಸಂಬಂಧಿತ ಲಿಂಕ್ ಸರಿಯಾದ http ಅಥವಾ https ವಿಳಾಸವಾಗಿರಬೇಕು.";
    return "ಪ್ರಕಟಣೆಯನ್ನು ಉಳಿಸಲು ಸಾಧ್ಯವಾಗಲಿಲ್ಲ. ಮತ್ತೆ ಪ್ರಯತ್ನಿಸಿ.";
  }

  async function submitForm(event) {
    event.preventDefault();
    if (state.saving || !validateForm()) return;
    const payload = buildPayload();
    const confirmed = window.confirm(
      "ಈ ಪ್ರಕಟಣೆಯನ್ನು ಪ್ರಕಟಿಸಬೇಕೇ?\n\nಒಮ್ಮೆ ಪ್ರಕಟಿಸಿದ ನಂತರ ಇದು ಆಯ್ಕೆ ಮಾಡಿದ ಜನರಿಗೆ ಲಭ್ಯವಾಗುತ್ತದೆ."
    );
    if (!confirmed) return;

    setSaving(true);
    setStatus("ಪ್ರಕಟಣೆಯನ್ನು ಉಳಿಸಲಾಗುತ್ತಿದೆ…", "info");
    try {
      await window.SnehakootaNoticeCreateService.createUpdate(payload);
      setStatus("ಪ್ರಕಟಣೆ ಯಶಸ್ವಿಯಾಗಿ ಪ್ರಕಟಿಸಲಾಗಿದೆ.", "success");
      if (window.SnehakootaNoticeBoard
          && typeof window.SnehakootaNoticeBoard.refresh === "function") {
        await window.SnehakootaNoticeBoard.refresh();
      }
      window.setTimeout(function() { closePanel(); }, 650);
    } catch (error) {
      console.error("Notice creation failed:", error);
      setStatus(friendlyError(error), "error");
    } finally {
      setSaving(false);
    }
  }

  function bindActions() {
    const e = getElements();
    if (e.openButton) e.openButton.addEventListener("click", openPanel);
    if (e.closeButton) e.closeButton.addEventListener("click", closePanel);
    if (e.backdrop) e.backdrop.addEventListener("click", closePanel);
    if (e.type) e.type.addEventListener("change", syncFormVisibility);
    if (e.visibility) e.visibility.addEventListener("change", syncFormVisibility);
    if (e.form) e.form.addEventListener("submit", submitForm);
    document.addEventListener("keydown", function(event) {
      if (event.key === "Escape" && state.open) closePanel();
    });
    document.addEventListener("sk:auth-state", function() {
      refreshAccess();
      if (state.open && !(window.SK_AUTH && window.SK_AUTH.signedIn)) closePanel();
    });
  }

  function init() {
    bindActions();
    refreshAccess();
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init, { once: true });
  } else {
    init();
  }

  window.SnehakootaNoticeCreator = Object.freeze({
    refreshAccess: refreshAccess,
    open: openPanel,
    close: closePanel
  });
})();