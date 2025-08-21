// vax-tracking-page.js — Shared vaccination tracking logic for Mother & Child pages (localStorage only)

window.VaxTrackingPage = (function () {
  const KEY_APPTS = "mss_vax_appointments"; // created by Find Provider page
  const KEY_HIST  = "mss_vaccinations";     // vaccination records

  const VAX_MAX_DOSES = { BCG:1, PENTA:3, PCV:3, OPV:4, MMR:2, TT:2 };
  const VAX_LIST = Object.keys(VAX_MAX_DOSES);

  // Helpers
  const $ = (id) => document.getElementById(id);
  const esc = (s) => (s||"").replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const ymd = (d) => {
    const y=d.getFullYear(), m=String(d.getMonth()+1).padStart(2,"0"), day=String(d.getDate()).padStart(2,"0");
    return `${y}-${m}-${day}`;
  };
  const prettyDate = (ymdStr) => {
    if (!ymdStr) return "";
    const [y,m,d]=ymdStr.split("-").map(Number);
    const dt = new Date(y,(m||1)-1,d||1);
    return dt.toLocaleDateString("en-US",{month:"long",day:"numeric",year:"numeric"});
  };
  function loadJSON(key, fallback=[]) { try { return JSON.parse(localStorage.getItem(key) || JSON.stringify(fallback)); } catch { return fallback; } }
  function saveJSON(key, val) { try { localStorage.setItem(key, JSON.stringify(val)); } catch {} }

  function sortUpcoming(arr){
    return arr
      .filter(a => a.status !== "cancelled")
      .sort((a,b) => (a.date + (a.time||"")).localeCompare(b.date + (b.time||"")));
  }

  function autoPickPerson(pageType){
    // Choose most recent appointment of this type to pre-fill the name
    const appts = loadJSON(KEY_APPTS);
    const filtered = appts.filter(a => a.status!=="cancelled" && a.patientType===pageType);
    if (filtered.length){
      const latest = [...filtered].sort((a,b) => (b.date + (b.time||"")).localeCompare(a.date+(a.time||"")))[0];
      return latest?.patientName || "";
    }
    // else blank
    return "";
  }

  function setDoseOptions(sel, vaccine, suggested){
    const max = VAX_MAX_DOSES[vaccine] || 1;
    sel.innerHTML = Array.from({length:max}, (_,i)=>`<option value="${i+1}">${i+1}</option>`).join("");
    sel.value = String(suggested || 1);
  }

  function suggestNextDose(pageType, name, vaccine){
    const hist = loadJSON(KEY_HIST).filter(v =>
      v.patientType === pageType &&
      (v.patientName||"").toLowerCase() === (name||"").toLowerCase() &&
      (v.code||"") === vaccine
    );
    const taken = Math.max(0, ...hist.map(v => Number(v.dose || 0)));
    const max   = VAX_MAX_DOSES[vaccine] || 1;
    return Math.min(max, taken + 1) || 1;
  }

  // Main init
  function init({ pageType }) {
    // DOM
    const whoName   = $("whoName");
    const applyBtn  = $("applyPerson");
    const personMeta= $("personMeta");
    const apptBody  = $("apptBody");
    const histBody  = $("histBody");
    const openRecord= $("openRecord");

    const recordModal = $("recordModal");
    const closeModal  = $("closeModal");
    const cancelModal = $("cancelModal");
    const recordForm  = $("recordForm");

    const rfType = $("rfType"); // hidden, already set to "mother" or "child"
    const rfName = $("rfName");
    const rfVax  = $("rfVax");
    const rfDose = $("rfDose");
    const rfDate = $("rfDate");
    const rfRoute= $("rfRoute");
    const rfSite = $("rfSite");
    const rfLot  = $("rfLot");

    // State
    let currentName = "";

    // Renderers
    function renderMeta() {
      personMeta.textContent = currentName ? `${pageType === "mother" ? "Mother" : "Child"} • ${currentName}` : "";
      whoName.value = currentName;
    }

    function renderAppointments() {
      const all = loadJSON(KEY_APPTS);
      const items = sortUpcoming(
        all.filter(a => a.patientType === pageType && (!currentName || (a.patientName||"").toLowerCase() === currentName.toLowerCase()))
      );

      if (!items.length) {
        apptBody.innerHTML = `<div class="tr"><div class="muted">No upcoming vaccination appointments.</div><div></div><div></div><div></div><div></div></div>`;
        return;
      }

      apptBody.innerHTML = items.map(a => `
        <div class="tr">
          <div><strong>${esc(a.facilityName)}</strong> <span class="badge badge-booked">Booked</span></div>
          <div>${esc(a.vaccineCode)} — Dose ${esc(String(a.dose || 1))}</div>
          <div>${prettyDate(a.date)} ${a.time ? "at " + esc(a.time) : ""}</div>
          <div class="muted">${esc(a.address || "")}</div>
          <div style="display:flex;gap:8px;justify-content:flex-end">
            <button class="btn btn-ghost" data-reschedule="${a.id}">Reschedule</button>
            <button class="btn btn-danger" data-cancel="${a.id}">Cancel</button>
          </div>
        </div>
      `).join("");

      // actions
      apptBody.querySelectorAll("[data-cancel]").forEach(b=>{
        b.addEventListener("click", () => {
          const id = b.getAttribute("data-cancel");
          const list = loadJSON(KEY_APPTS);
          const i = list.findIndex(x=>x.id===id);
          if (i>-1) {
            list[i].status = "cancelled";
            saveJSON(KEY_APPTS, list);
            renderAppointments();
          }
        });
      });
      apptBody.querySelectorAll("[data-reschedule]").forEach(b=>{
        b.addEventListener("click", () => {
          const id = b.getAttribute("data-reschedule");
          const list = loadJSON(KEY_APPTS);
          const i = list.findIndex(x=>x.id===id);
          if (i===-1) return;
          const nd = prompt("New date (YYYY-MM-DD):", list[i].date);
          const nt = prompt("New time (HH:MM):", list[i].time || "");
          if (nd && nt) {
            list[i].date = nd; list[i].time = nt;
            saveJSON(KEY_APPTS, list);
            renderAppointments();
          }
        });
      });
    }

    function renderHistory() {
      const all = loadJSON(KEY_HIST);
      const items = all
        .filter(v => v.patientType === pageType && (!currentName || (v.patientName||"").toLowerCase() === currentName.toLowerCase()))
        .sort((a,b) => (b.administeredAt || "").localeCompare(a.administeredAt || ""));

      if (!items.length) {
        histBody.innerHTML = `<div class="tr"><div class="muted">No vaccinations recorded.</div><div></div><div></div><div></div><div></div></div>`;
        return;
      }

      histBody.innerHTML = items.map(v => `
        <div class="tr">
          <div>${esc(v.code)}</div>
          <div>${esc(String(v.dose || ""))}</div>
          <div>${prettyDate(v.administeredAt)}</div>
          <div class="muted">
            ${v.lot ? `Lot ${esc(v.lot)}` : "Lot N/A"}
            ${v.manufacturer ? ` • ${esc(v.manufacturer)}` : ""}
            ${v.route ? ` • ${esc(v.route)}` : ""}
            ${v.site ? ` • ${esc(v.site)}` : ""}
          </div>
          <div><span class="badge badge-record">recorded</span></div>
        </div>
      `).join("");
    }

    // Modal / form
    function openRecordModal() {
      recordForm.reset();
      rfType.value = pageType;
      rfName.value = currentName || "";
      rfDate.value = ymd(new Date());
      rfVax.innerHTML = VAX_LIST.map(v=>`<option value="${v}">${v}</option>`).join("");
      // suggest next dose for initial vaccine
      const sugg = suggestNextDose(pageType, rfName.value, rfVax.value);
      setDoseOptions(rfDose, rfVax.value, sugg);
      recordModal.classList.add("show");
    }
    function closeRecordModal() {
      recordModal.classList.remove("show");
      recordForm.reset();
    }

    openRecord?.addEventListener("click", openRecordModal);
    closeModal?.addEventListener("click", closeRecordModal);
    cancelModal?.addEventListener("click", closeRecordModal);
    recordModal?.addEventListener("click", (e)=>{ if (e.target === recordModal) closeRecordModal(); });

    rfVax.addEventListener("change", ()=>{
      const sugg = suggestNextDose(pageType, rfName.value, rfVax.value);
      setDoseOptions(rfDose, rfVax.value, sugg);
    });
    rfName.addEventListener("blur", ()=>{
      const sugg = suggestNextDose(pageType, rfName.value, rfVax.value);
      setDoseOptions(rfDose, rfVax.value, sugg);
    });

    recordForm?.addEventListener("submit", (e)=>{
      e.preventDefault();
      const patientName = (rfName.value || "").trim();
      const code = rfVax.value;
      const dose = Number(rfDose.value || 1);
      const administeredAt = rfDate.value;
      const route = rfRoute.value;
      const site  = (rfSite.value || "").trim();
      const lot   = (rfLot.value || "").trim();

      if (!patientName || !code || !administeredAt) {
        alert("Please fill name, vaccine and date.");
        return;
      }

      const list = loadJSON(KEY_HIST);
      list.push({
        id: "v_" + Math.random().toString(36).slice(2),
        patientType: pageType,
        patientName,
        code, dose, administeredAt,
        route, site, lot,
        manufacturer: "",
        createdAt: new Date().toISOString()
      });
      saveJSON(KEY_HIST, list);

      alert("✅ Vaccination recorded.");
      closeRecordModal();
      renderHistory();
    });

    // Apply context
    function applyPerson() {
      currentName = (whoName.value || "").trim();
      renderMeta();
      renderAppointments();
      renderHistory();
    }
    applyBtn?.addEventListener("click", applyPerson);

    // Init defaults
    document.addEventListener("DOMContentLoaded", ()=>{
      currentName = autoPickPerson(pageType); // best guess from recent appt
      renderMeta();
      renderAppointments();
      renderHistory();

      // Live refresh
      window.addEventListener("storage", (e)=>{
        if (e.key === KEY_APPTS || e.key === KEY_HIST) {
          renderAppointments(); renderHistory();
        }
      });
      document.addEventListener("visibilitychange", ()=>{
        if (!document.hidden) { renderAppointments(); renderHistory(); }
      });
    });
  }

  return { init };
})();
