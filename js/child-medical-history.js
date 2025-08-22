// Child Medical History (Timeline) — localStorage based
(function () {
  const timelineEl = document.querySelector(".history-timeline");
  const addBtn = document.querySelector(".header-button-container .btn");

  // Load existing records
  function loadRecords() {
    let data = JSON.parse(localStorage.getItem("child_medical_history") || "[]");
    if (!data.length) {
      data = [
        {
          type: "checkup",
          title: "Routine Checkup",
          date: "2025-09-05",
          doctor: "Dr. Ahmed Karim",
          details: "Healthy, meeting all growth milestones."
        },
        {
          type: "prescription",
          title: "Prescription Issued",
          date: "2025-07-22",
          doctor: "Dr. Salma Akhtar",
          details: "Prescribed Amoxicillin for ear infection."
        },
        {
          type: "report",
          title: "Lab Report Added",
          date: "2025-06-10",
          doctor: "",
          details: "Blood Test — All results within normal range."
        }
      ];
      localStorage.setItem("child_medical_history", JSON.stringify(data));
    }
    return data;
  }

  // Save records
  function saveRecords(data) {
    localStorage.setItem("child_medical_history", JSON.stringify(data));
  }

  // Render timeline
  function renderTimeline() {
    const records = loadRecords();
    if (!records.length) {
      timelineEl.innerHTML = "<p class='muted'>No medical history yet.</p>";
      return;
    }

    timelineEl.innerHTML = records.map(r => `
      <div class="timeline-item">
        <div class="timeline-icon icon-${r.type}">
          <i class="fa-solid ${iconForType(r.type)}"></i>
        </div>
        <div class="timeline-content">
          <div class="timeline-header">
            <h3>${r.title}</h3>
            <span class="date">${formatDate(r.date)}</span>
          </div>
          <div class="timeline-body">
            ${r.doctor ? `<p>with <span class="doctor-name">${r.doctor}</span></p>` : ""}
            <p><strong>Details:</strong> ${r.details}</p>
          </div>
        </div>
      </div>
    `).join("");
  }

  // Handle new record
  function addRecord() {
    const title = prompt("Enter record title (e.g., Checkup, Prescription, Report):");
    if (!title) return;
    const date = prompt("Enter date (YYYY-MM-DD):", new Date().toISOString().split("T")[0]);
    const doctor = prompt("Doctor's name (optional):") || "";
    const details = prompt("Enter details:") || "";

    const newRec = {
      type: typeForTitle(title),
      title,
      date,
      doctor,
      details
    };

    const records = loadRecords();
    records.unshift(newRec); // add to top
    saveRecords(records);
    renderTimeline();
  }

  // Helpers
  function iconForType(type) {
    if (type === "checkup") return "fa-stethoscope";
    if (type === "prescription") return "fa-pills";
    if (type === "report") return "fa-file-lines";
    return "fa-notes-medical";
  }

  function typeForTitle(title) {
    title = title.toLowerCase();
    if (title.includes("checkup")) return "checkup";
    if (title.includes("prescription")) return "prescription";
    if (title.includes("report") || title.includes("lab")) return "report";
    return "other";
  }

  function formatDate(d) {
    const dt = new Date(d);
    return dt.toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric"
    });
  }

  // Events
  addBtn?.addEventListener("click", addRecord);

  // Init
  renderTimeline();
})();
