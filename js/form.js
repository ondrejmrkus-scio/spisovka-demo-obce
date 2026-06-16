/* =====================================================================
   Spisovka — formulář zájmu
   - Validace na frontendu (před odesláním)
   - Loading / úspěch / chyba
   - Pluggable cíl: SPISOVKA_CONFIG.FORM_ENDPOINT
       null → lokální mock (zaloguje do konzole), jinak fetch POST (JSON)
   - Jednotný JSON tvar dat pro libovolnou variantu napojení
   ===================================================================== */
(function () {
  "use strict";

  var CONFIG = window.SPISOVKA_CONFIG || {};
  var form = document.getElementById("lead-form");
  if (!form) return;

  var submitBtn = document.getElementById("submit-btn");
  var submitLabel = form.querySelector("[data-submit-label]");
  var spinner = form.querySelector("[data-submit-spinner]");
  var successBox = document.getElementById("form-success");
  var errorBox = document.getElementById("form-error");

  var EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  // Volný, ale rozumný formát telefonu (povolí mezery, +, závorky, pomlčky)
  var PHONE_RE = /^[+]?[\d\s().-]{6,}$/;

  /* ---- Pravidla validace (pořadí = pořadí polí) -------------------- */
  var RULES = [
    { id: "name",       validate: function (v) { return v.trim() ? "" : "Vyplňte prosím jméno a příjmení."; } },
    { id: "email",      validate: function (v) {
        if (!v.trim()) return "Vyplňte prosím e-mail.";
        return EMAIL_RE.test(v.trim()) ? "" : "Zkontrolujte prosím formát e-mailu.";
      } },
    { id: "phone",      validate: function (v) {
        if (!v.trim()) return ""; // nepovinné
        return PHONE_RE.test(v.trim()) ? "" : "Zkontrolujte prosím telefonní číslo.";
      } },
    { id: "org",        validate: function (v) { return v.trim() ? "" : "Vyplňte prosím název obce nebo organizace."; } },
    { id: "subjectType",validate: function (v) { return v ? "" : "Vyberte prosím typ subjektu."; } },
    { id: "role",       validate: function (v) { return v ? "" : "Vyberte prosím vaši roli."; } },
    { id: "gdpr",       validate: function (_v, el) { return el.checked ? "" : "Bez souhlasu vás bohužel nemůžeme kontaktovat."; } },
  ];

  function fieldEl(id) { return document.getElementById(id); }
  function errorEl(id) { return form.querySelector('[data-error-for="' + id + '"]'); }

  function showError(id, msg) {
    var el = fieldEl(id);
    var err = errorEl(id);
    if (err) {
      err.textContent = msg;
      err.classList.remove("hidden");
      err.id = err.id || id + "-error";
    }
    if (el) {
      el.setAttribute("aria-invalid", "true");
      if (err) el.setAttribute("aria-describedby", err.id);
    }
  }

  function clearError(id) {
    var el = fieldEl(id);
    var err = errorEl(id);
    if (err) { err.textContent = ""; err.classList.add("hidden"); }
    if (el) { el.removeAttribute("aria-invalid"); el.removeAttribute("aria-describedby"); }
  }

  function validate() {
    var firstInvalid = null;
    RULES.forEach(function (rule) {
      var el = fieldEl(rule.id);
      if (!el) return;
      var msg = rule.validate(el.value, el);
      if (msg) {
        showError(rule.id, msg);
        if (!firstInvalid) firstInvalid = el;
      } else {
        clearError(rule.id);
      }
    });
    return firstInvalid;
  }

  /* Vyčistí chybu daného pole, jakmile ho uživatel začne opravovat */
  RULES.forEach(function (rule) {
    var el = fieldEl(rule.id);
    if (!el) return;
    var evt = el.type === "checkbox" || el.tagName === "SELECT" ? "change" : "input";
    el.addEventListener(evt, function () {
      if (el.getAttribute("aria-invalid") === "true") clearError(rule.id);
    });
  });

  function setLoading(on) {
    submitBtn.disabled = on;
    submitBtn.setAttribute("aria-busy", on ? "true" : "false");
    if (submitLabel) submitLabel.textContent = on ? "Odesílám…" : "Odeslat zájem";
    if (spinner) spinner.classList.toggle("hidden", !on);
  }

  function buildPayload() {
    return {
      timestamp: new Date().toISOString(),
      name: fieldEl("name").value.trim(),
      email: fieldEl("email").value.trim(),
      phone: fieldEl("phone").value.trim(),
      org: fieldEl("org").value.trim(),
      subjectType: fieldEl("subjectType").value,
      role: fieldEl("role").value,
      gdprConsent: fieldEl("gdpr").checked,
      source: "spisovka-obce-landing",
    };
  }

  function trackConversion() {
    var evt = CONFIG.CONVERSION_EVENT || "lead_submit";
    if (window.dataLayer && typeof window.dataLayer.push === "function") {
      window.dataLayer.push({ event: evt });
    }
    // (Plausible/jiný nástroj lze napojit zde — viz README → Analytika)
  }

  /* Odeslání: reálný endpoint, nebo lokální mock když je FORM_ENDPOINT null */
  function send(payload) {
    if (!CONFIG.FORM_ENDPOINT) {
      // MOCK pro lokální test — žádný backend, jen log do konzole
      console.info("[Spisovka mock] FORM_ENDPOINT není nastaven. Data, která by se odeslala:", payload);
      return new Promise(function (resolve) { setTimeout(resolve, 600); });
    }
    return fetch(CONFIG.FORM_ENDPOINT, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    }).then(function (res) {
      if (!res.ok) throw new Error("HTTP " + res.status);
      return res;
    });
  }

  form.addEventListener("submit", function (e) {
    e.preventDefault();
    errorBox.classList.add("hidden");

    var firstInvalid = validate();
    if (firstInvalid) { firstInvalid.focus(); return; }

    setLoading(true);
    send(buildPayload())
      .then(function () {
        form.classList.add("hidden");
        successBox.classList.remove("hidden");
        successBox.focus && successBox.setAttribute("tabindex", "-1");
        successBox.focus();
        successBox.scrollIntoView({ behavior: "smooth", block: "center" });
        trackConversion();
      })
      .catch(function (err) {
        console.error("[Spisovka] Odeslání selhalo:", err);
        errorBox.classList.remove("hidden");
        errorBox.scrollIntoView({ behavior: "smooth", block: "center" });
        setLoading(false);
      });
  });
})();
