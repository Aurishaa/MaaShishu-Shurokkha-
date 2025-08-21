// Provider portal — NO Firebase. All data persists in localStorage.
// Requires: ../../js/auth.js (local provider auth exposing window.PROVIDER_AUTH).

(function () {
  const FEATURE_APPTS = true;
  const $ = (sel) => document.querySelector(sel);

  // ----- Identity -----
  const me = (window.PROVIDER_AUTH && typeof PROVIDER_AUTH.current === "function")
    ? (PROVIDER_AUTH.current() || null)
    : null;

  const providerNameEl = $("#providerName");
  const logoutBtn      = $("#logoutBtn");
  const clinicEl       = $("#providerClinic");
  const initialsEl     = $("#providerInitials");

  if (providerNameEl) providerNameEl.textContent = me?.name || "Guest";
  if (clinicEl) clinicEl.textContent = `Clinic: ${me?.clinicName || me?.clinic || "—"}`;
  if (initialsEl) initialsEl.textContent = (me?.name || "PR").split(/\s+/).map(s=>s[0]).slice(0,2).join("").toUpperCase();
  logoutBtn?.addEventListener("click", () => { try{PROVIDER_AUTH?.logout?.()}catch{}; location.href="../login/login.html"; });

  // ----- UI refs: Children -----
  const childSearch = $("#childSearch");
  const childSelect = $("#childSelect");
  const childMeta   = $("#childMeta");
  const vaccBody    = $("#vaccBody");
  const openRecordChild = $("#openRecordChild");

  // ----- UI refs: Mothers -----
  const motherSearch   = $("#motherSearch");
  const motherSelect   = $("#motherSelect");
  const motherMeta     = $("#motherMeta");
  const motherVaccBody = $("#motherVaccBody");
  const openRecordMother = $("#openRecordMother");

  // ----- Requests & Appointments -----
  const refreshBtn   = $("#refreshBtn");
  const requestsBody = $("#requestsBody");

  const apptsBody  = $("#apptsBody");
  const apptFilter = $("#apptFilter");
  const apptSearch = $("#apptSearch");

  // ----- Modal (shared for both) -----
  const recordModal       = $("#recordModal");
  const closeModal        = $("#closeModal");
  const cancelModal       = $("#cancelModal");
  const recordForm        = $("#recordForm");
  const patientTypeField  = $("#patientType"); // 'child' | 'mother'
  const childIdField      = $("#childId");
  const motherIdField     = $("#motherId");

  const patientNameField  = $("#patientNameField");
  const secondLabel       = $("#secondLabel");     // "DOB" or "Age"
  const secondValueField  = $("#secondValueField");// value for label above

  const codeField   = $("#codeField");
  const doseField   = $("#doseField");
  const dateField   = $("#dateField");
  const routeField  = $("#routeField");
  const siteField   = $("#siteField");
  const lotField    = $("#lotField");
  const mfrField    = $("#mfrField");
  const clinicField = $("#clinicField");

  // ----- Store (localStorage) -----
  const Store = {
    KEYS: {
      CHILDREN: "mss_children",
      MOTHERS: "mss_mothers",
      VACC_CHILD: "mss_vaccinations_child",
      VACC_MOTHER: "mss_vaccinations_mother",
      REQUESTS: "mss_requests",
      APPTS: "mss_vax_appointments"
    },
    load(k){ try { return JSON.parse(localStorage.getItem(k) || "[]"); } catch { return []; } },
    save(k,v){ try { localStorage.setItem(k, JSON.stringify(v)); } catch {} },

    seed() {
      if (!this.load(this.KEYS.CHILDREN).length) {
        this.save(this.KEYS.CHILDREN, [
          { id:"c_ali",  name:"Ali Rahman",  dob:"2023-11-20", guardianUserId:"u_demo" },
          { id:"c_mina", name:"Mina Akter",  dob:"2024-03-05", guardianUserId:"u_demo" },
          { id:"c_siam", name:"Siam Hossain",dob:"2022-07-15", guardianUserId:"u_demo" }
        ]);
      }
      if (!this.load(this.KEYS.MOTHERS).length) {
        this.save(this.KEYS.MOTHERS, [
          { id:"m_nadia", name:"Nadia Rahman", age:28, nid:"N/A" },
          { id:"m_farzana", name:"Farzana Akter", age:31, nid:"N/A" }
        ]);
      }
      if (!this.load(this.KEYS.VACC_CHILD).length) {
        const t = ymd(new Date());
        this.save(this.KEYS.VACC_CHILD, [
          { id:"vc1", childId:"c_ali", code:"PENTA", dose:1, administeredAt:t, lot:"LT-001", manufacturer:"Serum Inst.", route:"IM", site:"Left Deltoid", providerName:"Demo Provider", clinicName:"Demo Clinic" }
        ]);
      }
      if (!this.load(this.KEYS.VACC_MOTHER).length) {
        this.save(this.KEYS.VACC_MOTHER, [
          { id:"vm1", motherId:"m_nadia", code:"TT", dose:1, administeredAt:"2025-07-15", lot:"TT-1002", manufacturer:"GSK", route:"IM", site:"Right Deltoid", providerName:"Demo Provider", clinicName:"Demo Clinic" }
        ]);
      }
      if (!this.load(this.KEYS.REQUESTS).length) {
        this.save(this.KEYS.REQUESTS, [
          { id:"r1", childId:"c_ali", code:"PENTA", dose:1, reason:"Wrong lot number", createdAt:"2025-08-01 10:10", status:"open" }
        ]);
      }
      if (!this.load(this.KEYS.APPTS).length) {
        const t = ymd(new Date());
        this.save(this.KEYS.APPTS, [
          { id:"a1", patientType:"child",  childId:"c_ali",   patientName:"Ali Rahman",   vaccineCode:"PENTA", date:t, time:"09:30", facilityName:"Evercare Hospital Dhaka", address:"Bashundhara R/A", status:"booked", notes:"Bring card" },
          { id:"a2", patientType:"mother", motherId:"m_nadia",patientName:"Nadia Rahman", vaccineCode:"TT",    date:t, time:"10:30", facilityName:"Labaid Specialized Hospital", address:"Dhanmondi", status:"booked", notes:"" }
        ]);
      }
    },

    // children
    children(){ return this.load(this.KEYS.CHILDREN); },
    childVacc(childId){
      return this.load(this.KEYS.VACC_CHILD).filter(v=>v.childId===childId)
        .sort((a,b)=> (b.administeredAt||"").localeCompare(a.administeredAt||""));
    },
    addChildVacc(rec){
      const arr = this.load(this.KEYS.VACC_CHILD);
      if (arr.some(v => v.childId===rec.childId && v.code===rec.code && Number(v.dose)===Number(rec.dose))) {
        throw new Error("This dose is already recorded for the child.");
      }
      rec.id = rec.id || ("vc_" + Math.random().toString(36).slice(2));
      arr.push(rec); this.save(this.KEYS.VACC_CHILD, arr);
    },

    // mothers
    mothers(){ return this.load(this.KEYS.MOTHERS); },
    motherVacc(motherId){
      return this.load(this.KEYS.VACC_MOTHER).filter(v=>v.motherId===motherId)
        .sort((a,b)=> (b.administeredAt||"").localeCompare(a.administeredAt||""));
    },
    addMotherVacc(rec){
      const arr = this.load(this.KEYS.VACC_MOTHER);
      if (arr.some(v => v.motherId===rec.motherId && v.code===rec.code && Number(v.dose)===Number(rec.dose))) {
        throw new Error("This dose is already recorded for the mother.");
      }
      rec.id = rec.id || ("vm_" + Math.random().toString(36).slice(2));
      arr.push(rec); this.save(this.KEYS.VACC_MOTHER, arr);
    },

    // requests
    openRequests(){
      return this.load(this.KEYS.REQUESTS).filter(r=>["open","pending"].includes(r.status))
        .sort((a,b)=> (b.createdAt||"").localeCompare(a.createdAt||""));
    },
    resolveRequest(id){
      const arr = this.load(this.KEYS.REQUESTS); const i = arr.findIndex(r=>r.id===id);
      if (i>=0){ arr[i].status="resolved"; this.save(this.KEYS.REQUESTS, arr); }
    },

    // appts
    appts(){ return this.load(this.KEYS.APPTS); },
    saveAppts(list){ this.save(this.KEYS.APPTS, list); },
    updateAppt(id, patch){
      const list = this.appts(); const i = list.findIndex(a=>a.id===id);
      if (i>=0){ list[i] = {...list[i], ...patch}; this.saveAppts(list); }
    },
    deleteAppt(id){ this.saveAppts(this.appts().filter(a=>a.id!==id)); }
  };
  Store.seed();

  // ----- State -----
  let children = Store.children();
  let mothers  = Store.mothers();

  let currentChildId  = children[0]?.id || null;
  let currentMotherId = mothers[0]?.id || null;

  let childVaccs  = currentChildId  ? Store.childVacc(currentChildId)   : [];
  let motherVaccs = currentMotherId ? Store.motherVacc(currentMotherId) : [];

  let requests = Store.openRequests();
  let appts    = Store.appts();

  // ----- Renderers: children -----
  function renderChildSelector(){
    const q = (childSearch?.value || "").toLowerCase();
    const filtered = children.filter(c => (c.name||"").toLowerCase().includes(q));

    if (childSelect){
      childSelect.innerHTML = "";
      filtered.forEach(c=>{
        const o=document.createElement("option");
        o.value=c.id; o.textContent=c.name || ("Child "+c.id.slice(0,6));
        childSelect.appendChild(o);
      });
    }
    if (!filtered.find(c=>c.id===currentChildId)){ currentChildId = filtered[0]?.id || null; }
    if (currentChildId && childSelect) childSelect.value=currentChildId;

    const child = children.find(c=>c.id===currentChildId);
    childMeta.textContent = child ? `${child.name} • DOB ${prettyDate(child.dob)}` : "No child selected";
  }
  function renderChildVaccs(){
    if (!vaccBody) return;
    if (!currentChildId){ vaccBody.innerHTML=emptyRow("No child selected."); return; }
    if (!childVaccs.length){ vaccBody.innerHTML=emptyRow("No vaccinations recorded yet."); return; }
    vaccBody.innerHTML = childVaccs.map(v => `
      <div class="tr">
        <div>${esc(v.code)}</div>
        <div>${v.dose ?? ""}</div>
        <div>${prettyDate(v.administeredAt)}</div>
        <div class="muted">${v.lot?`Lot ${esc(v.lot)}`:"Lot N/A"}${v.manufacturer?` • ${esc(v.manufacturer)}`:""}${v.route?` • ${esc(v.route)}`:""}${v.site?` • ${esc(v.site)}`:""}</div>
        <div><span class="badge given">verified</span></div>
      </div>
    `).join("");
  }

  // ----- Renderers: mothers -----
  function renderMotherSelector(){
    const q = (motherSearch?.value || "").toLowerCase();
    const filtered = mothers.filter(m => (m.name||"").toLowerCase().includes(q));

    if (motherSelect){
      motherSelect.innerHTML = "";
      filtered.forEach(m=>{
        const o=document.createElement("option");
        o.value=m.id; o.textContent=m.name || ("Mother "+m.id.slice(0,6));
        motherSelect.appendChild(o);
      });
    }
    if (!filtered.find(m=>m.id===currentMotherId)){ currentMotherId = filtered[0]?.id || null; }
    if (currentMotherId && motherSelect) motherSelect.value=currentMotherId;

    const mom = mothers.find(m=>m.id===currentMotherId);
    motherMeta.textContent = mom ? `${mom.name} • Age ${mom.age ?? "—"}` : "No mother selected";
  }
  function renderMotherVaccs(){
    if (!motherVaccBody) return;
    if (!currentMotherId){ motherVaccBody.innerHTML=emptyRow("No mother selected."); return; }
    if (!motherVaccs.length){ motherVaccBody.innerHTML=emptyRow("No vaccinations recorded yet."); return; }
    motherVaccBody.innerHTML = motherVaccs.map(v => `
      <div class="tr">
        <div>${esc(v.code)}</div>
        <div>${v.dose ?? ""}</div>
        <div>${prettyDate(v.administeredAt)}</div>
        <div class="muted">${v.lot?`Lot ${esc(v.lot)}`:"Lot N/A"}${v.manufacturer?` • ${esc(v.manufacturer)}`:""}${v.route?` • ${esc(v.route)}`:""}${v.site?` • ${esc(v.site)}`:""}</div>
        <div><span class="badge given">verified</span></div>
      </div>
    `).join("");
  }

  // ----- Renderers: requests -----
  function renderRequests(){
    if (!requestsBody) return;
    if (!requests.length){ requestsBody.innerHTML=emptyRow("No open requests."); return; }
    requestsBody.innerHTML = requests.map(r=>{
      const childName = children.find(c=>c.id===r.childId)?.name || (r.childId||"").slice(0,6);
      return `
        <div class="tr">
          <div>${esc(childName)}</div>
          <div>${esc(r.code)} dose ${esc(String(r.dose ?? ""))}</div>
          <div>${esc(r.reason || "")}</div>
          <div>${esc(r.createdAt || "")}</div>
          <div><button class="btn btn-primary" data-resolve="${r.id}">Resolve</button></div>
        </div>
      `;
    }).join("");
    requestsBody.querySelectorAll("[data-resolve]").forEach(b=>{
      b.addEventListener("click", ()=>{
        Store.resolveRequest(b.getAttribute("data-resolve"));
        requests = Store.openRequests(); renderRequests();
      });
    });
  }

  // ----- Renderers: appointments (search + filter + actions) -----
  function renderAppointments(){
    if (!FEATURE_APPTS || !apptsBody) return;
    const filter = apptFilter?.value || "upcoming";
    const q = (apptSearch?.value || "").toLowerCase().trim();
    const today = ymd(new Date());

    appts = Store.appts();
    let view = appts;

    if (filter==="today"){
      view = view.filter(a => a.date===today && a.status!=="cancelled");
    } else if (filter==="upcoming"){
      view = view.filter(a => a.status!=="cancelled")
                 .sort((a,b)=> (a.date+b.time).localeCompare(b.date+b.time));
    }

    if (q){
      view = view.filter(a =>
        (a.patientName||"").toLowerCase().includes(q) ||
        (a.vaccineCode||"").toLowerCase().includes(q) ||
        (a.facilityName||"").toLowerCase().includes(q)
      );
    }

    if (!view.length){ apptsBody.innerHTML=emptyRow("No appointments."); return; }

    apptsBody.innerHTML = view.map(a=>{
      const whoLabel = a.patientType==="mother" ? "Mother" : "Child";
      const statusBadge =
        //a.status==="checked_in" ? `<span class="badge scheduled">checked-in</span>` :
        a.status==="completed"  ? `<span class="badge given">completed</span>` :
        a.status==="cancelled"  ? `<span class="badge resolved">cancelled</span>` : "";

      const actions = (a.status==="booked" || a.status==="checked_in")
        ? `
          ${a.status==="booked" ? `<button class="btn" data-checkin="${a.id}">Check-in</button>` : ""}
          <button class="btn btn-primary" data-give="${a.id}">Give</button>
          <button class="btn btn-danger" data-cancel="${a.id}">Cancel</button>
        ` : statusBadge;

      return `
        <div class="tr">
          <div>${whoLabel}: ${esc(a.patientName||"")}</div>
          <div>${esc(a.vaccineCode||"")}</div>
          <div>${esc(a.date)} • ${esc(a.time)}</div>
          <div class="muted">${esc(a.facilityName||"")}${a.address?` • ${esc(a.address)}`:""}${a.notes?` • ${esc(a.notes)}`:""}</div>
          <div>${actions}</div>
        </div>
      `;
    }).join("");

    // wire actions
    apptsBody.querySelectorAll("[data-checkin]").forEach(b=>{
      b.addEventListener("click", ()=>{
        Store.updateAppt(b.getAttribute("data-checkin"), { status:"checked_in" });
        renderAppointments();
      });
    });
    apptsBody.querySelectorAll("[data-cancel]").forEach(b=>{
      b.addEventListener("click", ()=>{
        if (!confirm("Cancel this appointment?")) return;
        Store.updateAppt(b.getAttribute("data-cancel"), { status:"cancelled" });
        renderAppointments();
      });
    });
    apptsBody.querySelectorAll("[data-give]").forEach(b=>{
      b.addEventListener("click", ()=>{
        const id = b.getAttribute("data-give");
        const a = appts.find(x=>x.id===id); if(!a) return;

        if (a.patientType==="child"){
          ensureRecordModalForChild(a.childId, a.patientName);
        } else {
          ensureRecordModalForMother(a.motherId, a.patientName);
        }
        codeField.value = (a.vaccineCode||"").toUpperCase();
        dateField.value = a.date;
        clinicField.value = me?.clinicName || me?.clinic || a.facilityName || "Clinic";
        recordForm.setAttribute("data-complete-appt-id", id);
        recordModal.classList.add("show");
      });
    });
  }

  // ----- Open modal prefilled for child / mother -----
  function ensureRecordModalForChild(childId, fallbackName){
    const c = children.find(x=>x.id===childId) || children.find(x => (x.name||"").toLowerCase()===(fallbackName||"").toLowerCase());
    patientTypeField.value = "child";
    childIdField.value = c?.id || childId || "";
    motherIdField.value = "";
    patientNameField.value = c?.name || fallbackName || "";
    secondLabel.textContent = "DOB";
    secondValueField.value = c?.dob ? prettyDate(c.dob) : "—";
    // defaults
    doseField.value=""; routeField.value="IM"; siteField.value="Left Deltoid"; lotField.value=""; mfrField.value="";
  }
  function ensureRecordModalForMother(motherId, fallbackName){
    const m = mothers.find(x=>x.id===motherId) || mothers.find(x => (x.name||"").toLowerCase()===(fallbackName||"").toLowerCase());
    patientTypeField.value = "mother";
    motherIdField.value = m?.id || motherId || "";
    childIdField.value = "";
    patientNameField.value = m?.name || fallbackName || "";
    secondLabel.textContent = "Age";
    secondValueField.value = (m?.age != null) ? String(m.age) : "—";
    // defaults
    doseField.value=""; routeField.value="IM"; siteField.value="Left Deltoid"; lotField.value=""; mfrField.value="";
  }

  // ----- Record buttons (manual) -----
  openRecordChild?.addEventListener("click", ()=>{
    if (!currentChildId){ alert("Select a child first."); return; }
    const c = children.find(x=>x.id===currentChildId);
    ensureRecordModalForChild(c?.id, c?.name);
    codeField.value=""; dateField.value=ymd(new Date()); clinicField.value=me?.clinicName || me?.clinic || "Clinic";
    recordForm.removeAttribute("data-complete-appt-id");
    recordModal.classList.add("show");
  });

  openRecordMother?.addEventListener("click", ()=>{
    if (!currentMotherId){ alert("Select a mother first."); return; }
    const m = mothers.find(x=>x.id===currentMotherId);
    ensureRecordModalForMother(m?.id, m?.name);
    codeField.value=""; dateField.value=ymd(new Date()); clinicField.value=me?.clinicName || me?.clinic || "Clinic";
    recordForm.removeAttribute("data-complete-appt-id");
    recordModal.classList.add("show");
  });

  // ----- Modal lifecycle -----
  function closeModalFn(){ recordModal.classList.remove("show"); recordForm.reset(); recordForm.removeAttribute("data-complete-appt-id"); }
  closeModal?.addEventListener("click", closeModalFn);
  cancelModal?.addEventListener("click", closeModalFn);
  recordModal?.addEventListener("click", (e)=>{ if(e.target===recordModal) closeModalFn(); });

  // ----- Save vaccination (child or mother) -----
  recordForm?.addEventListener("submit", (e)=>{
    e.preventDefault();
    const patientType = patientTypeField.value;
    const code = (codeField.value||"").trim().toUpperCase();
    const dose = Number(doseField.value);
    const administeredAt = dateField.value;
    const route = routeField.value;
    const site = (siteField.value||"").trim();
    const lot = (lotField.value||"").trim();
    const manufacturer = (mfrField.value||"").trim();
    const clinicName = (clinicField.value||"").trim() || (me?.clinicName || me?.clinic || "Clinic");

    if (!code || isNaN(dose) || !administeredAt){ alert("Fill vaccine code, dose and date."); return; }

    try {
      if (patientType==="child"){
        const childId = childIdField.value;
        if (!childId){ alert("Missing child."); return; }
        Store.addChildVacc({ childId, code, dose, administeredAt, lot, manufacturer, route, site, providerName:me?.name||"Provider", clinicName });
        childVaccs = Store.childVacc(childId);
      } else {
        const motherId = motherIdField.value;
        if (!motherId){ alert("Missing mother."); return; }
        Store.addMotherVacc({ motherId, code, dose, administeredAt, lot, manufacturer, route, site, providerName:me?.name||"Provider", clinicName });
        motherVaccs = Store.motherVacc(motherId);
      }

      // Close appointment if coming from “Give”
      const completeId = recordForm.getAttribute("data-complete-appt-id");
      if (FEATURE_APPTS && completeId){ Store.updateAppt(completeId, { status:"completed" }); }

      alert("✅ Vaccination recorded.");
      closeModalFn();
      renderChildVaccs(); renderMotherVaccs(); renderAppointments();
    } catch (err) {
      console.error(err); alert(err?.message || "Failed to save vaccination.");
    }
  });

  // ----- Events -----
  childSearch?.addEventListener("input", ()=>{ renderChildSelector(); });
  childSelect?.addEventListener("change", ()=>{
    currentChildId = childSelect.value || null;
    const c = children.find(x=>x.id===currentChildId);
    childMeta.textContent = c ? `${c.name} • DOB ${prettyDate(c.dob)}` : "No child selected";
    childVaccs = currentChildId ? Store.childVacc(currentChildId) : [];
    renderChildVaccs();
  });

  motherSearch?.addEventListener("input", ()=>{ renderMotherSelector(); });
  motherSelect?.addEventListener("change", ()=>{
    currentMotherId = motherSelect.value || null;
    const m = mothers.find(x=>x.id===currentMotherId);
    motherMeta.textContent = m ? `${m.name} • Age ${m.age ?? "—"}` : "No mother selected";
    motherVaccs = currentMotherId ? Store.motherVacc(currentMotherId) : [];
    renderMotherVaccs();
  });

  refreshBtn?.addEventListener("click", ()=>{ requests = Store.openRequests(); renderRequests(); renderAppointments(); });
  apptFilter?.addEventListener("change", renderAppointments);
  apptSearch?.addEventListener("input", renderAppointments);

  // ----- Init -----
  renderChildSelector();  childVaccs  = currentChildId  ? Store.childVacc(currentChildId)   : []; renderChildVaccs();
  renderMotherSelector(); motherVaccs = currentMotherId ? Store.motherVacc(currentMotherId) : []; renderMotherVaccs();
  renderAppointments();   renderRequests();

  // ----- Helpers -----
  function ymd(d){ const y=d.getFullYear(), m=String(d.getMonth()+1).padStart(2,"0"), day=String(d.getDate()).padStart(2,"0"); return `${y}-${m}-${day}`; }
  function prettyDate(ymdStr){ if(!ymdStr) return ""; const [y,m,d]=(ymdStr+"").split("-").map(Number); const dt=new Date(y,(m||1)-1,d||1); return dt.toLocaleDateString("en-US",{weekday:"short",month:"short",day:"numeric",year:"numeric"}); }
  function esc(s){ return (s||"").replace(/[&<>"']/g, c=>({ "&":"&amp;","<":"&lt;",">":"&gt;","\"":"&quot;","'":"&#39;" }[c])); }
  function emptyRow(text){ return `<div class="tr"><div class="muted">${esc(text)}</div><div></div><div></div><div></div><div></div></div>`; }
})();
