document.addEventListener("DOMContentLoaded", () => {
  // ----- Elements -----
  const modal            = document.getElementById("bookingModal");
  const modalTitle       = document.getElementById("modalTitle");
  const form             = document.getElementById("bookingForm");
  const closeBtn         = document.getElementById("closeModal");
  const confirmBtn       = document.getElementById("confirmBtn");

  const editingIdInput   = document.getElementById("editingId");
  const doctorNameInput  = document.getElementById("doctorName");
  const hospitalInput    = document.getElementById("hospital");
  const reasonInput      = document.getElementById("reason");
  const slotDate         = document.getElementById("slotDate");
  const slotTime         = document.getElementById("slotTime");

  const listEl           = document.getElementById("appointmentsList");

  // ----- Local storage helpers -----
  const STORAGE_KEY = "mss_appointments"; // MaaShishu Shurokkha

  function uid() {
    return Math.random().toString(36).slice(2) + Date.now().toString(36);
  }
  function loadAll() {
    try { return JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]"); }
    catch { return []; }
  }
  function saveAll(arr) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(arr));
  }
  function addAppointment(appt) {
    const arr = loadAll(); arr.push(appt); saveAll(arr);
  }
  function updateAppointment(id, patch) {
    const arr = loadAll();
    const i = arr.findIndex(a => a.id === id);
    if (i >= 0) { arr[i] = { ...arr[i], ...patch }; saveAll(arr); }
  }
  function deleteAppointment(id) {
    saveAll(loadAll().filter(a => a.id !== id));
  }

  // ----- Date/Time utilities -----
  const dayMap   = { Sun:0, Mon:1, Tue:2, Wed:3, Thu:4, Fri:5, Sat:6 };
  const dayNames = ["Sun","Mon","Tue","Wed","Thu","Fri","Sat"];

  function to24h(h12, meridiem) {
    let h = parseInt(h12, 10);
    const mer = meridiem.toUpperCase();
    if (mer === "AM") { if (h === 12) h = 0; } else { if (h !== 12) h += 12; }
    return String(h).padStart(2, "0");
  }
  function formatYMD(d) {
    const yyyy = d.getFullYear();
    const mm = String(d.getMonth() + 1).padStart(2, "0");
    const dd = String(d.getDate()).padStart(2, "0");
    return `${yyyy}-${mm}-${dd}`;
  }
  function formatPrettyDate(ymd) {
    const [y,m,d] = ymd.split("-").map(Number);
    const dt = new Date(y, m-1, d);
    return dt.toLocaleDateString("en-US", { weekday:"long", year:"numeric", month:"long", day:"numeric" });
  }
  function formatPrettyTime(hhmm) {
    const [h, m] = hhmm.split(":").map(Number);
    const d = new Date(); d.setHours(h, m, 0, 0);
    return d.toLocaleTimeString("en-US", { hour:"numeric", minute:"2-digit" });
  }

  // Parse availability like "Mon, Wed (7 PM - 9 PM)" or "Tue, Thu (17:30 - 20:00)"
  function parseAvailability(availText) {
    const allowedDays = Object.keys(dayMap)
      .filter(d => new RegExp(`\\b${d}\\b`, "i").test(availText))
      .map(d => dayMap[d]);

    let start = "09:00", end = "17:00";
    // AM/PM form
    let m = availText.match(/(\d{1,2})(?::(\d{2}))?\s*(AM|PM)\s*-\s*(\d{1,2})(?::(\d{2}))?\s*(AM|PM)/i);
    if (m) {
      const h1  = to24h(m[1], m[3]); const mn1 = m[2] ? m[2].padStart(2, "0") : "00";
      const h2  = to24h(m[4], m[6]); const mn2 = m[5] ? m[5].padStart(2, "0") : "00";
      start = `${h1}:${mn1}`; end = `${h2}:${mn2}`;
    } else {
      // 24h form "19:00 - 21:00"
      m = availText.match(/(\d{1,2}):?(\d{2})?\s*-\s*(\d{1,2}):?(\d{2})?/);
      if (m) {
        const h1  = String(m[1]).padStart(2, "0"); const mn1 = m[2] ? m[2].padStart(2, "0") : "00";
        const h2  = String(m[3]).padStart(2, "0"); const mn2 = m[4] ? m[4].padStart(2, "0") : "00";
        start = `${h1}:${mn1}`; end = `${h2}:${mn2}`;
      }
    }
    return { allowedDays, start, end };
  }

  // Next N dates that match allowed weekdays
  function generateDates(allowedDays, occurrences = 12) {
    const out = [];
    const today = new Date(); today.setHours(0,0,0,0);
    for (let d = new Date(today); out.length < occurrences; d.setDate(d.getDate() + 1)) {
      if (allowedDays.includes(d.getDay())) out.push(new Date(d));
    }
    return out;
  }

  // 30-minute times between [start, end), filter past times if date is today
  function generateTimes(startStr, endStr, stepMin = 30, forDateYMD = null) {
    const [sh, sm] = startStr.split(":").map(x => parseInt(x,10));
    const [eh, em] = endStr.split(":").map(x => parseInt(x,10));
    const base = new Date(); base.setHours(sh, sm, 0, 0);
    const end  = new Date(); end.setHours(eh, em, 0, 0);

    const now = new Date(); const nowHHMM = `${String(now.getHours()).padStart(2,"0")}:${String(now.getMinutes()).padStart(2,"0")}`;
    const times = [];
    for (let t = new Date(base); t < end; t.setMinutes(t.getMinutes() + stepMin)) {
      const hh = String(t.getHours()).padStart(2,"0"); const mm = String(t.getMinutes()).padStart(2,"0");
      const label = `${hh}:${mm}`;
      if (forDateYMD === formatYMD(now) && label <= nowHHMM) continue; // hide past times today
      times.push(label);
    }
    return times;
  }

  // ----- State -----
  let currentAvailability = { allowedDays: [], start: "00:00", end: "23:59" };
  let currentDoctorKey    = ""; // for avoiding duplicate booking per doctor/slot

  // ----- Render appointments -----
  function renderList() {
    const arr = loadAll().sort((a,b) => (b.date + b.time).localeCompare(a.date + a.time));
    listEl.innerHTML = "";
    if (arr.length === 0) {
      listEl.innerHTML = `<p class="muted">No appointments yet.</p>`;
      return;
    }
    arr.forEach(a => {
      const card = document.createElement("div");
      card.className = "appointment-card content-card";
      card.innerHTML = `
        <h4>${a.doctorName}</h4>
        <p><i class="fa-solid fa-hospital"></i> ${a.hospital}</p>
        <p>
          <i class="fa-regular fa-calendar"></i> ${formatPrettyDate(a.date)}
          <i class="fa-regular fa-clock" style="margin-left:8px;"></i> ${formatPrettyTime(a.time)}
        </p>
        <p><span class="status-badge ${a.status}">${a.status}</span></p>
        <div style="display:flex; gap:8px; margin-top:8px;">
          <button class="btn" data-act="reschedule" data-id="${a.id}">Reschedule</button>
          <button class="btn btn-danger" data-act="cancel" data-id="${a.id}">Cancel</button>
        </div>
      `;
      listEl.appendChild(card);
    });
  }

  // Event delegation for reschedule/cancel
  listEl.addEventListener("click", (e) => {
    const btn = e.target.closest("button[data-act]");
    if (!btn) return;
    const id = btn.getAttribute("data-id");
    const all = loadAll();
    const appt = all.find(a => a.id === id);
    if (!appt) return;

    if (btn.dataset.act === "cancel") {
      if (!confirm("Cancel this appointment?")) return;
      deleteAppointment(id);
      renderList();
    } else if (btn.dataset.act === "reschedule") {
      openModalForEdit(appt);
    }
  });

  // Booking buttons (open modal in "create" mode)
  document.querySelectorAll(".book-appointment").forEach(btn => {
    btn.addEventListener("click", () => {
      const card = btn.closest(".doctor-profile-card");

      const doctor = (card.querySelector("h3")?.textContent || "").trim();
      const hospital = (card.querySelector(".hospital-info p")?.textContent || "").trim();
      const availText = (card.querySelector(".availability")?.textContent || "").trim();

      currentAvailability = parseAvailability(availText);
      currentDoctorKey = doctor + "@" + hospital;

      openModal({
        mode: "create",
        doctorName: doctor,
        hospital,
        reason: "",
      });
    });
  });

  // Open modal for edit
  function openModalForEdit(appt) {
    // Try find the matching provider card to re-parse availability
    const cards = document.querySelectorAll(".doctor-profile-card");
    let availText = "";
    for (const c of cards) {
      const name = (c.querySelector("h3")?.textContent || "").trim();
      const hosp = (c.querySelector(".hospital-info p")?.textContent || "").trim();
      if (name === appt.doctorName && hosp === appt.hospital) {
        availText = (c.querySelector(".availability")?.textContent || "").trim();
        break;
      }
    }
    currentAvailability = parseAvailability(availText || "Mon (9 AM - 5 PM)");
    currentDoctorKey = appt.doctorName + "@" + appt.hospital;

    openModal({
      mode: "edit",
      id: appt.id,
      doctorName: appt.doctorName,
      hospital: appt.hospital,
      reason: appt.reason,
      prefillDate: appt.date,
      prefillTime: appt.time
    });
  }

  // Open modal (shared for create/edit)
  function openModal({ mode, id="", doctorName, hospital, reason, prefillDate="", prefillTime="" }) {
    editingIdInput.value = mode === "edit" ? id : "";
    modalTitle.textContent = (mode === "edit") ? "Reschedule Appointment" : "Book Appointment";

    doctorNameInput.value = doctorName;
    hospitalInput.value = hospital;
    reasonInput.value = reason || "";

    // Build dates
    const dates = generateDates(currentAvailability.allowedDays, 12);
    slotDate.innerHTML = `<option value="" disabled selected>Select a date</option>`;
    dates.forEach(d => {
      const value = formatYMD(d);
      const label = `${dayNames[d.getDay()]} • ${value}`;
      const opt = document.createElement("option");
      opt.value = value; opt.textContent = label;
      slotDate.appendChild(opt);
    });

    // If editing, pre-select date and build times
    if (prefillDate) {
      slotDate.value = prefillDate;
      buildTimesForDate(prefillDate, prefillTime);
    } else {
      slotTime.innerHTML = `<option value="" disabled selected>Select a time</option>`;
      slotTime.disabled = true;
    }

    confirmBtn.disabled = !(slotDate.value && slotTime.value && reasonInput.value.trim());
    modal.classList.remove("hidden");
  }

  function buildTimesForDate(dateYMD, preselectTime="") {
    const times = generateTimes(currentAvailability.start, currentAvailability.end, 30, dateYMD);
    slotTime.innerHTML = `<option value="" disabled selected>Select a time</option>`;
    times.forEach(t => {
      const opt = document.createElement("option");
      opt.value = t; opt.textContent = t;
      slotTime.appendChild(opt);
    });
    slotTime.disabled = false;
    if (preselectTime && times.includes(preselectTime)) slotTime.value = preselectTime;
  }

  // React to date/time/reason changes for enabling confirm
  slotDate.addEventListener("change", () => {
    if (!slotDate.value) {
      slotTime.innerHTML = `<option value="" disabled selected>Select a time</option>`;
      slotTime.disabled = true;
      confirmBtn.disabled = true;
      return;
    }
    buildTimesForDate(slotDate.value);
    confirmBtn.disabled = !(slotDate.value && slotTime.value && reasonInput.value.trim());
  });
  slotTime.addEventListener("change", () => {
    confirmBtn.disabled = !(slotDate.value && slotTime.value && reasonInput.value.trim());
  });
  reasonInput.addEventListener("input", () => {
    confirmBtn.disabled = !(slotDate.value && slotTime.value && reasonInput.value.trim());
  });

  // Close modal
  closeBtn.addEventListener("click", () => modal.classList.add("hidden"));
  modal.addEventListener("click", (e) => { if (e.target === modal) modal.classList.add("hidden"); });

  // Submit (create or edit)
  form.addEventListener("submit", (e) => {
    e.preventDefault();

    const date = slotDate.value;
    const time = slotTime.value;
    const reason = reasonInput.value.trim();
    if (!date || !time || !reason) return;

    const all = loadAll();
    const slotKey = (doctorNameInput.value + "@" + hospitalInput.value + "#" + date + "T" + time);
    const isEditing = !!editingIdInput.value;

    if (!isEditing) {
      const clash = all.find(a => (a.doctorName + "@" + a.hospital + "#" + a.date + "T" + a.time) === slotKey);
      if (clash) { alert("This slot is already booked for this doctor."); return; }

      const appt = {
        id: uid(),
        doctorName: doctorNameInput.value,
        hospital: hospitalInput.value,
        date, time, reason,
        status: "scheduled",
        createdAt: new Date().toISOString()
      };
      addAppointment(appt);
    } else {
      const clash = all.find(a => a.id !== editingIdInput.value && (a.doctorName + "@" + a.hospital + "#" + a.date + "T" + a.time) === slotKey);
      if (clash) { alert("This slot is already booked for this doctor."); return; }
      updateAppointment(editingIdInput.value, { date, time, reason, status: "rescheduled" });
    }

    alert("✅ Saved!");
    modal.classList.add("hidden");
    form.reset();
    renderList();
  });

  // Initial render
  renderList();
});
