// === File: js/doctor-dashboard.js ===
// Pure front-end (localStorage). Professional rendering + realistic seed.

(function () {
  // ---------- Storage keys ----------
  const K = {
    APPTS: "mss_appointments",
    PATIENTS: "mss_patients",
    PRESC: "mss_prescriptions",
    VAX: "mss_vaccinations",
    MSG: "mss_messages",
    SLOTS: "mss_slots",
    DOC: "mss_doctor_profile"
  };

  // ---------- Helpers ----------
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => Array.from(r.querySelectorAll(s));
  const load = (k) => JSON.parse(localStorage.getItem(k) || "[]");
  const save = (k, v) => localStorage.setItem(k, JSON.stringify(v));
  const pad = (n) => String(n).padStart(2, "0");
  const todayYMD = () => new Date().toISOString().slice(0, 10);

  function ymd(d) { return `${d.getFullYear()}-${pad(d.getMonth()+1)}-${pad(d.getDate())}`; }
  function addDays(n) { const d=new Date(); d.setDate(d.getDate()+n); return ymd(d); }
  function prettyDate(ymdStr) {
    if (!ymdStr) return "";
    const [y,m,d] = ymdStr.split("-").map(Number);
    const dt = new Date(y,(m||1)-1,d||1);
    return dt.toLocaleDateString("en-GB",{weekday:"short", day:"2-digit", month:"short", year:"numeric"});
  }
  function prettyTime(hhmm) {
    if (!hhmm) return "";
    const [h,m] = hhmm.split(":").map(Number);
    const dt = new Date(); dt.setHours(h||0, m||0, 0, 0);
    return dt.toLocaleTimeString([], { hour: "numeric", minute: "2-digit" });
  }
  function statusBadge(s) {
    const cls = { pending:"pending", confirmed:"confirmed", rescheduled:"rescheduled", completed:"completed", cancelled:"cancelled", declined:"declined" }[s] || "pending";
    const label = s.charAt(0).toUpperCase()+s.slice(1);
    return `<span class="badge ${cls}">${label}</span>`;
  }
  const chip = (t, extra="") => `<span class="chip ${extra}">${t}</span>`;
  const dtBlock = (date, time) => `
    <div class="dt">
      <span class="d">${prettyDate(date)}</span>
      <span class="t">${prettyTime(time)}</span>
    </div>
  `;
  const personBlock = (name, type, sub="") => `
    <div>
      <strong>${escapeHtml(name)}</strong> ${chip(type)}
      ${sub ? `<span class="sub">${escapeHtml(sub)}</span>` : ""}
    </div>
  `;
  const detailsMuted = (text) => `<div class="muted">${escapeHtml(text || "")}</div>`;
  const actions = (buttons) => `<div style="display:flex;gap:6px;flex-wrap:wrap">${buttons.join("")}</div>`;
  const btn = (label, attrs="", primary=false) =>
    `<button class="btn ${primary ? "btn-primary" : ""}" ${attrs}>${label}</button>`;
  function escapeHtml(s){return (s||"").replace(/[&<>"']/g,c=>({ '&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;' }[c]));}

  // ---------- Seed (realistic, BD context) ----------
  function seed() {
    if (!localStorage.getItem(K.DOC)) {
      localStorage.setItem(K.DOC, JSON.stringify({
        name: "Prof. Dr. Sameena Chowdhury",
        clinic: "Evercare Hospital Dhaka"
      }));
    }
    if (!load(K.SLOTS).length) {
      save(K.SLOTS, [
        { id:"s1", day:"Mon", from:"19:00", to:"21:00" },
        { id:"s2", day:"Wed", from:"19:00", to:"21:00" },
        { id:"s3", day:"Fri", from:"10:00", to:"12:00" },
      ]);
    }
    if (!load(K.APPTS).length) {
      save(K.APPTS, [
        { id:"a1", patient:"Anika Rahman", patientType:"Mother", reason:"Antenatal follow-up", doctor:"Prof. Dr. Sameena Chowdhury", date:todayYMD(), time:"19:15", status:"pending", bookedVia:"App • MaaShishu" },
        { id:"a2", patient:"Siam Hossain", patientType:"Child",  reason:"Fever — evaluation",  doctor:"Prof. Dr. Sameena Chowdhury", date:todayYMD(), time:"19:45", status:"confirmed", bookedVia:"Mother: Roksana" },
        { id:"a3", patient:"Mina Akter",   patientType:"Child",  reason:"Routine growth check", doctor:"Prof. Dr. Sameena Chowdhury", date:addDays(2), time:"10:30", status:"pending", bookedVia:"Call Center" },
        { id:"a4", patient:"Salma Khatun", patientType:"Mother", reason:"Postnatal review",     doctor:"Prof. Dr. Sameena Chowdhury", date:addDays(3), time:"19:30", status:"confirmed", bookedVia:"App • MaaShishu" },
      ]);
    }
    if (!load(K.PATIENTS).length) {
      save(K.PATIENTS, [
        { id:"p1", name:"Anika Rahman", type:"Mother", lastVisit:addDays(-35) },
        { id:"p2", name:"Siam Hossain", type:"Child",  lastVisit:addDays(-20) },
        { id:"p3", name:"Mina Akter",   type:"Child",  lastVisit:addDays(-12) },
        { id:"p4", name:"Salma Khatun", type:"Mother", lastVisit:addDays(-60) },
      ]);
    }
    if (!load(K.PRESC).length) {
      save(K.PRESC, [
        { id:"rx1", patient:"Anika Rahman", drug:"Iron + Folic Acid", dose:"1 tab at night", notes:"Continue 12 weeks" },
        { id:"rx2", patient:"Siam Hossain", drug:"Paracetamol Syrup", dose:"10 mg/kg q6h PRN", notes:"Max 4 doses/day" },
      ]);
    }
    if (!load(K.VAX).length) {
      save(K.VAX, [
        { id:"v1", child:"Siam Hossain", code:"PENTA", dose:1, date:addDays(-2) },
        { id:"v2", child:"Mina Akter",  code:"BCG",   dose:1, date:addDays(-40) },
      ]);
    }
    if (!load(K.MSG).length) {
      save(K.MSG, [
        { id:"m1", from:"Mother • Anika", body:"Is it okay to walk 30 minutes daily during second trimester?", date:addDays(-1), thread:[{from:"Doctor", body:"Yes, if no complications. Listen to your body.", date:addDays(-1)}] },
        { id:"m2", from:"Mother • Salma", body:"Can I reschedule my postnatal review to Friday morning?", date:addDays(-3), thread:[] },
      ]);
    }
  }
  seed();

  // ---------- Personalize header ----------
  const profile = JSON.parse(localStorage.getItem(K.DOC) || "{}");
  const doctorNameEl = $("#doctorName");
  const kpiClinic = $("#kpiClinic");
  if (doctorNameEl) doctorNameEl.textContent = profile.name || "Doctor";
  if (kpiClinic) kpiClinic.textContent = profile.clinic || "—";

  // ---------- Navigation (tabs + sidebar) ----------
  function activateSection(section){
    $$("#tabs .tab").forEach(b => b.classList.toggle("active", b.dataset.section === section));
    $$(".section").forEach(s => s.classList.toggle("active", s.id === ("section-" + section)));
  }
  $$("#tabs .tab").forEach(btn => btn.addEventListener("click", () => activateSection(btn.dataset.section)));
  $$("nav.sidebar-nav a[data-nav]").forEach(a => a.addEventListener("click", (e)=>{ e.preventDefault(); activateSection(a.dataset.nav); }));
  $("#qaOpenAppts")?.addEventListener("click", () => activateSection("appointments"));

  // ---------- Appointments (polished rows) ----------
  function renderAppointments(){
    const appts = load(K.APPTS);
    const reqTbody = $("#requestsTbody");
    const todayTbody = $("#todayTbody");
    const today = todayYMD();

    if (reqTbody) {
      const pending = appts.filter(a => a.status==="pending").sort((a,b)=> (a.date+a.time).localeCompare(b.date+b.time));
      reqTbody.innerHTML = pending.map(a => `
        <div class="tr">
          <div>${dtBlock(a.date, a.time)}</div>
          <div>
            ${personBlock(a.patient, a.patientType, a.bookedVia || "")}
            ${detailsMuted(a.reason)}
          </div>
          <div>${statusBadge(a.status)}</div>
          <div>${chip("New Request")}</div>
          ${actions([
            btn("Accept", `data-accept="${a.id}"`, true),
            btn("Reschedule", `data-reschedule="${a.id}"`),
            btn("Decline", `data-decline="${a.id}"`)
          ])}
        </div>
      `).join("") || `<div class="tr"><div class="muted">No pending requests.</div><div></div><div></div><div></div><div></div></div>`;

      // Wire actions
      reqTbody.querySelectorAll("[data-accept]").forEach(b => b.addEventListener("click", () => setApptStatus(b.dataset.accept, "confirmed")));
      reqTbody.querySelectorAll("[data-decline]").forEach(b => b.addEventListener("click", () => setApptStatus(b.dataset.decline, "declined")));
      reqTbody.querySelectorAll("[data-reschedule]").forEach(b => b.addEventListener("click", () => rescheduleAppt(b.dataset.reschedule)));
    }

    if (todayTbody) {
      const list = appts.filter(a => a.date===today && ["confirmed","rescheduled"].includes(a.status)).sort((a,b)=> a.time.localeCompare(b.time));
      todayTbody.innerHTML = list.map(a => `
        <div class="tr">
          <div>${dtBlock(a.date, a.time)}</div>
          <div>${personBlock(a.patient, a.patientType, profile.clinic || "Clinic")}</div>
          <div>${statusBadge(a.status)}</div>
          <div>${chip("Consultation")}</div>
          ${actions([
            btn("Complete", `data-complete="${a.id}"`),
            btn("Cancel", `data-cancel="${a.id}"`)
          ])}
        </div>
      `).join("") || `<div class="tr"><div class="muted">No appointments today.</div><div></div><div></div><div></div><div></div></div>`;

      todayTbody.querySelectorAll("[data-complete]").forEach(b => b.addEventListener("click", () => setApptStatus(b.dataset.complete, "completed")));
      todayTbody.querySelectorAll("[data-cancel]").forEach(b => b.addEventListener("click", () => setApptStatus(b.dataset.cancel, "cancelled")));
    }

    // KPIs
    $("#kpiPending") && ($("#kpiPending").textContent = appts.filter(a => a.status==="pending").length);
    $("#kpiToday") && ($("#kpiToday").textContent = appts.filter(a => a.date===today && ["confirmed","rescheduled"].includes(a.status)).length);
  }

  function setApptStatus(id, status){
    const appts = load(K.APPTS);
    const i = appts.findIndex(a => a.id === id);
    if (i >= 0) {
      appts[i].status = status;
      save(K.APPTS, appts);
      renderAppointments();
    }
  }

  function rescheduleAppt(id){
    const appts = load(K.APPTS);
    const i = appts.findIndex(a => a.id === id);
    if (i < 0) return;
    const date = prompt("New date (YYYY-MM-DD):", appts[i].date);
    const time = prompt("New time (HH:MM):", appts[i].time);
    if (!date || !time) return;

    const slots = load(K.SLOTS);
    const dow = new Date(date).toLocaleDateString("en-GB", { weekday: "short" }).slice(0,3);
    const ok = slots.some(s => s.day===dow && time>=s.from && time<=s.to);
    if (!ok) { alert("Selected time is outside your availability."); return; }

    appts[i].date = date;
    appts[i].time = time;
    appts[i].status = "rescheduled";
    save(K.APPTS, appts);
    renderAppointments();
  }

  // ---------- Patients (clean list) ----------
  function renderPatients(){
    const list = $("#patientsList"); if (!list) return;
    const q = ($("#patientSearch")?.value || "").toLowerCase();
    const pts = load(K.PATIENTS).filter(p => p.name.toLowerCase().includes(q)).sort((a,b)=> a.name.localeCompare(b.name));
    list.innerHTML = pts.map(p => `
      <div class="tr" style="grid-template-columns: 1fr;">
        ${personBlock(p.name, p.type, `Last visit • ${prettyDate(p.lastVisit)}`)}
      </div>
    `).join("") || `<div class="tr"><div class="muted">No patients found.</div></div>`;
  }
  $("#patientSearch")?.addEventListener("input", renderPatients);
  $("#btnAddPatient")?.addEventListener("click", () => {
    const name = prompt("Patient full name:");
    if (!name) return;
    const pts = load(K.PATIENTS);
    pts.push({ id:"p_"+Math.random().toString(36).slice(2), name, type:"Mother", lastVisit:todayYMD() });
    save(K.PATIENTS, pts);
    renderPatients();
  });

  // ---------- Messages (threaded, tidy) ----------
  function renderMessages(){
    const list = $("#messagesList"); if (!list) return;
    const msgs = load(K.MSG).sort((a,b)=> String(b.date).localeCompare(String(a.date)));
    list.innerHTML = msgs.map(m => `
      <div class="content-card" style="margin-bottom:10px;padding:14px">
        <div><strong>${escapeHtml(m.from)}</strong> <span class="muted">• ${prettyDate(m.date)}</span></div>
        <p style="margin:.4rem 0">${escapeHtml(m.body)}</p>
        <div style="margin:.4rem 0 0.25rem">
          ${(m.thread || []).map(t => `
            <div class="muted">↳ <strong>${escapeHtml(t.from)}:</strong> ${escapeHtml(t.body)} • ${prettyDate(t.date)}</div>
          `).join("")}
        </div>
        <div class="form-actions" style="margin-top:8px">
          <input type="text" placeholder="Reply..." data-reply="${m.id}" style="flex:1;border:1px solid #e5e7eb;border-radius:8px;padding:8px">
          <button class="btn" data-send-reply="${m.id}">Reply</button>
        </div>
      </div>
    `).join("");

    list.querySelectorAll("[data-send-reply]").forEach(btn => {
      btn.addEventListener("click", () => {
        const id = btn.dataset.sendReply;
        const input = list.querySelector(`[data-reply="${id}"]`);
        const val = (input?.value || "").trim();
        if (!val) return;
        const ms = load(K.MSG);
        const i = ms.findIndex(x => x.id === id);
        if (i >= 0) {
          ms[i].thread = ms[i].thread || [];
          ms[i].thread.push({ from:"Doctor", body:val, date: todayYMD() });
          save(K.MSG, ms);
          renderMessages();
        }
      });
    });
  }
  $("#sendMsg")?.addEventListener("click", () => {
    const to = $("#msgTo")?.value?.trim();
    const body = $("#msgBody")?.value?.trim();
    if (!to || !body) return alert("Fill recipient and message.");
    const ms = load(K.MSG);
    ms.push({ id:"m_"+Math.random().toString(36).slice(2), from:`To ${to}`, body, date:todayYMD(), thread:[] });
    save(K.MSG, ms);
    $("#msgBody").value = "";
    renderMessages();
  });

  // ---------- Prescriptions (compact) ----------
  function renderRx(){
    const list = $("#rxList"); if (!list) return;
    const rxs = load(K.PRESC).sort((a,b)=> a.patient.localeCompare(b.patient));
    list.innerHTML = rxs.map(r => `
      <div class="tr" style="grid-template-columns:1fr;">
        <div><strong>${escapeHtml(r.patient)}</strong> — ${escapeHtml(r.drug)} <span class="muted">(${escapeHtml(r.dose)}${r.notes?` • ${escapeHtml(r.notes)}`:""})</span></div>
      </div>
    `).join("") || `<div class="tr"><div class="muted">No prescriptions yet.</div></div>`;
  }
  $("#saveRx")?.addEventListener("click", () => {
    const patient = $("#rxPatient")?.value?.trim();
    const drug = $("#rxDrug")?.value?.trim();
    const dose = $("#rxDose")?.value?.trim();
    const notes = $("#rxNotes")?.value?.trim();
    if (!patient || !drug || !dose) return alert("Fill patient, medicine, and dose.");
    const rxs = load(K.PRESC);
    rxs.push({ id:"rx_"+Math.random().toString(36).slice(2), patient, drug, dose, notes });
    save(K.PRESC, rxs);
    renderRx();
  });

  // Quick-action Rx modal
  $("#qaWriteRx")?.addEventListener("click", () => $("#modalRx")?.classList.remove("hidden"));
  $("[data-close-rx]")?.addEventListener("click", () => $("#modalRx")?.classList.add("hidden"));
  $("#mxSave")?.addEventListener("click", () => {
    const patient = $("#mxPatient")?.value?.trim();
    const drug = $("#mxDrug")?.value?.trim();
    const dose = $("#mxDose")?.value?.trim();
    const notes = $("#mxNotes")?.value?.trim();
    if (!patient || !drug || !dose) return alert("Fill patient, medicine, and dose.");
    const rxs = load(K.PRESC);
    rxs.push({ id:"rx_"+Math.random().toString(36).slice(2), patient, drug, dose, notes });
    save(K.PRESC, rxs);
    $("#modalRx")?.classList.add("hidden");
    renderRx();
  });

  // ---------- Vaccinations (dose chips) ----------
  function renderVax(){
    const list = $("#vaxList"); if (!list) return;
    const v = load(K.VAX).sort((a,b)=> (b.date+a.child).localeCompare(a.date+b.child));
    list.innerHTML = v.map(x => `
      <div class="tr" style="grid-template-columns: 1fr 200px;">
        <div><strong>${escapeHtml(x.child)}</strong> — ${escapeHtml(x.code)} ${chip(`Dose ${x.dose}`,"dose")} <span class="sub">Recorded at ${escapeHtml(profile.clinic || "Clinic")}</span></div>
        <div class="dt"><span class="d">${prettyDate(x.date)}</span></div>
      </div>
    `).join("") || `<div class="tr"><div class="muted">No vaccinations recorded.</div></div>`;
  }
  $("#saveVax")?.addEventListener("click", () => {
    const child = $("#vaxPatient")?.value?.trim();
    const code  = $("#vaxCode")?.value?.trim()?.toUpperCase();
    const dose  = Number($("#vaxDose")?.value);
    const date  = $("#vaxDate")?.value;
    if (!child || !code || !dose || !date) return alert("Fill all vaccination fields.");
    const v = load(K.VAX);
    v.push({ id:"v_"+Math.random().toString(36).slice(2), child, code, dose, date });
    save(K.VAX, v);
    renderVax();
  });
  $("#qaRecordVax")?.addEventListener("click", () => $("#modalVax")?.classList.remove("hidden"));
  $("[data-close-vx]")?.addEventListener("click", () => $("#modalVax")?.classList.add("hidden"));
  $("#mvSave")?.addEventListener("click", () => {
    const child = $("#mvChild")?.value?.trim();
    const code  = $("#mvCode")?.value?.trim()?.toUpperCase();
    const dose  = Number($("#mvDose")?.value);
    const date  = $("#mvDate")?.value;
    if (!child || !code || !dose || !date) return alert("Fill all vaccination fields.");
    const v = load(K.VAX);
    v.push({ id:"v_"+Math.random().toString(36).slice(2), child, code, dose, date });
    save(K.VAX, v);
    $("#modalVax")?.classList.add("hidden");
    renderVax();
  });

  // ---------- Availability (overlap guard, pretty times) ----------
  function renderSlots(){
    const list = $("#slotsList"); if (!list) return;
    const s = load(K.SLOTS).sort((a,b)=> a.day.localeCompare(b.day) || a.from.localeCompare(b.from));
    list.innerHTML = s.map(x => `
      <div class="tr" style="grid-template-columns: 140px 1fr;">
        <div><strong>${x.day}</strong></div>
        <div>${prettyTime(x.from)} – ${prettyTime(x.to)}</div>
      </div>
    `).join("") || `<div class="tr"><div class="muted">No availability set.</div></div>`;
  }
  $("#addSlot")?.addEventListener("click", () => {
    const day = $("#daySelect")?.value;
    const from = $("#fromTime")?.value;
    const to = $("#toTime")?.value;
    if (!day || !from || !to) return alert("Fill day and time range.");
    const s = load(K.SLOTS);
    const clash = s.some(v => v.day === day && !(to <= v.from || from >= v.to));
    if (clash) return alert("Slot overlaps with an existing one.");
    s.push({ id:"s_"+Math.random().toString(36).slice(2), day, from, to });
    save(K.SLOTS, s);
    renderSlots();
  });
  $("#qaSetAvail")?.addEventListener("click", () => $("#modalAvail")?.classList.remove("hidden"));
  $("[data-close-av]")?.addEventListener("click", () => $("#modalAvail")?.classList.add("hidden"));
  $("#maSave")?.addEventListener("click", () => {
    const day = $("#maDay")?.value;
    const from = $("#maFrom")?.value;
    const to = $("#maTo")?.value;
    if (!day || !from || !to) return alert("Fill all fields.");
    const s = load(K.SLOTS);
    const clash = s.some(v => v.day === day && !(to <= v.from || from >= v.to));
    if (clash) return alert("Slot overlaps with an existing one.");
    s.push({ id:"s_"+Math.random().toString(36).slice(2), day, from, to });
    save(K.SLOTS, s);
    $("#modalAvail")?.classList.add("hidden");
    renderSlots();
  });

  // ---------- Settings ----------
  $("#saveSettings")?.addEventListener("click", () => {
    const name = $("#setName")?.value?.trim();
    const clinic = $("#setClinic")?.value?.trim();
    const p = JSON.parse(localStorage.getItem(K.DOC) || "{}");
    if (name) p.name = name;
    if (clinic) p.clinic = clinic;
    localStorage.setItem(K.DOC, JSON.stringify(p));
    if (doctorNameEl) doctorNameEl.textContent = p.name || "Doctor";
    if (kpiClinic) kpiClinic.textContent = p.clinic || "—";
    alert("Saved!");
  });

  // ---------- Initial render ----------
  renderAppointments();
  renderPatients();
  renderMessages();
  renderRx();
  renderVax();
  renderSlots();
})();
