// js/store.js
// -----------------------------------------------------------------------------
// Tiny, shared localStorage “backend” for the static demo.
// Exposes a global `STORE` (data access) and `fmt` (date/time helpers).
// -----------------------------------------------------------------------------

(function () {
  const KEYS = {
    CHILDREN:      "mss_vax_children",     // [{ childId, name, dob, vaccines: [...] }]
    VACCINATIONS:  "mss_vaccinations",     // [{ id, childId, code, dose, administeredAt, lot, manufacturer, route, site, providerName, clinicName, createdAt }]
    CORRECTIONS:   "mss_vax_corrections",  // [{ id, childId, code, dose, reason, status, createdAt }]
    APPOINTMENTS:  "mss_appointments",     // optional: used by your appointment module
    ROLE:          "mss_role",             // "mother" | "provider" (for demo auth)
    PROVIDER_PIN:  "mss_provider_pin"      // optional: if you use a PIN workflow
  };

  // ---------- Safe JSON helpers ----------
  function safeParse(raw, fallback) {
    try {
      const val = JSON.parse(raw);
      return val == null ? fallback : val;
    } catch {
      return fallback;
    }
  }
  function load(key, fallback) {
    const raw = localStorage.getItem(key);
    if (raw == null) return fallback;
    return safeParse(raw, fallback);
  }
  function save(key, value) {
    localStorage.setItem(key, JSON.stringify(value));
  }

  // ---------- ID helper ----------
  function uid() {
    if (window.crypto && crypto.randomUUID) return crypto.randomUUID();
    return Math.random().toString(36).slice(2) + Date.now().toString(36);
  }

  // ---------- Children ----------
  function getChildren() {
    const arr = load(KEYS.CHILDREN, []);
    return Array.isArray(arr) ? arr : [];
  }
  function setChildren(arr) {
    save(KEYS.CHILDREN, Array.isArray(arr) ? arr : []);
  }
  function upsertChild(child) {
    const kids = getChildren();
    const i = kids.findIndex(c => c.childId === child.childId);
    if (i >= 0) kids[i] = { ...kids[i], ...child };
    else kids.push(child);
    setChildren(kids);
    return child;
  }

  // ---------- Vaccinations (provider-verified records) ----------
  function getVaccinations() {
    const arr = load(KEYS.VACCINATIONS, []);
    return Array.isArray(arr) ? arr : [];
  }
  function setVaccinations(arr) {
    save(KEYS.VACCINATIONS, Array.isArray(arr) ? arr : []);
  }

  // ---------- Correction Requests (mother -> provider) ----------
  function getCorrections() {
    const arr = load(KEYS.CORRECTIONS, []);
    return Array.isArray(arr) ? arr : [];
  }
  function setCorrections(arr) {
    save(KEYS.CORRECTIONS, Array.isArray(arr) ? arr : []);
  }

  // ---------- Appointments (optional; used by your appointment module) ----------
  function getAppointments() {
    const arr = load(KEYS.APPOINTMENTS, []);
    return Array.isArray(arr) ? arr : [];
  }
  function setAppointments(arr) {
    save(KEYS.APPOINTMENTS, Array.isArray(arr) ? arr : []);
  }

  // ---------- Role / PIN (demo-only auth flags) ----------
  function getRole() {
    return localStorage.getItem(KEYS.ROLE) || "mother";
  }
  function setRole(role) {
    localStorage.setItem(KEYS.ROLE, role);
  }
  function getPin() {
    // Default PIN for demos; change via setPin if you use PIN flow
    return localStorage.getItem(KEYS.PROVIDER_PIN) || "1234";
  }
  function setPin(pin) {
    localStorage.setItem(KEYS.PROVIDER_PIN, String(pin || "").trim());
  }

  // ---------- Date/Time helpers ----------
  const fmt = {
    // Normalize to YYYY-MM-DD (from Date or string)
    ymd(input) {
      const d = input instanceof Date ? input : new Date(input);
      const y = d.getFullYear();
      const m = String(d.getMonth() + 1).padStart(2, "0");
      const day = String(d.getDate()).padStart(2, "0");
      return `${y}-${m}-${day}`;
    },
    // Pretty full date, e.g., "Monday, August 25, 2025"
    pretty(ymd) {
      const [y, m, d] = (ymd || "").split("-").map(Number);
      if (!y || !m || !d) return ymd || "";
      const dt = new Date(y, m - 1, d);
      return dt.toLocaleDateString("en-US", {
        weekday: "long",
        year: "numeric",
        month: "long",
        day: "numeric"
      });
    },
    // Pretty time from "HH:MM", e.g., "7:00 PM"
    prettyTime(hhmm) {
      if (!hhmm) return "";
      const [h, min] = hhmm.split(":").map(Number);
      const d = new Date();
      d.setHours(h || 0, min || 0, 0, 0);
      return d.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" });
    }
  };

  // ---------- Public API ----------
  const STORE = {
    KEYS,
    load, save,
    uid,

    // children
    getChildren, setChildren, upsertChild,

    // vaccinations
    getVaccinations, setVaccinations,

    // corrections
    getCorrections, setCorrections,

    // appointments (optional)
    getAppointments, setAppointments,

    // role/pin flags
    getRole, setRole,
    getPin, setPin
  };

  // Expose globally
  window.STORE = STORE;
  window.fmt = fmt;
})();
