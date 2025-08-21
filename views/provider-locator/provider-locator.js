// provider-locator.js — facility-centric vaccination booking (localStorage)

(function(){
  const vaxModal = document.getElementById("vaxModal");
  const vaxForm  = document.getElementById("vaxForm");

  const facilityNameEl = document.getElementById("facilityName");
  const facilityTypeEl = document.getElementById("facilityType");
  const facilityAddrEl = document.getElementById("facilityAddress");

  const patientType  = document.getElementById("patientType");
  const nameLabel    = document.getElementById("nameLabel");
  const patientName  = document.getElementById("patientName");

  const guardianName = document.getElementById("guardianName");
  const vaccineCode  = document.getElementById("vaccineCode");
  const slotDate     = document.getElementById("slotDate");
  const slotTime     = document.getElementById("slotTime");
  const notes        = document.getElementById("notes");

  const btnCancel    = document.getElementById("vaxCancel");

  let currSlots = [];
  let facility = {};

  patientType.addEventListener("change", ()=>{
    const mother = (patientType.value === "mother");
    nameLabel.textContent = mother ? "Mother Name" : "Child Name";
    patientName.placeholder = mother ? "e.g., Nadia Rahman" : "e.g., Ali Rahman";
  });

  // Open modal with facility context & schedule
  document.querySelectorAll(".facility-card .book-vax").forEach(btn=>{
    btn.addEventListener("click", ()=>{
      const card = btn.closest(".facility-card");
      facility = JSON.parse(card.getAttribute("data-facility") || "{}");

      facilityNameEl.value = facility.facilityName || "";
      facilityTypeEl.value = facility.facilityType || "";
      facilityAddrEl.value = facility.address || "";

      currSlots = (window.VAX_APPT?.getSlots?.(facility.schedule || {}, 21)) || [];

      // dates
      const dates = [...new Set(currSlots.map(s=>s.date))];
      slotDate.innerHTML = dates.map(d=>`<option value="${d}">${d}</option>`).join("");

      function refreshTimes(){
        const d = slotDate.value;
        const appts = window.VAX_APPT?.list?.() || [];
        const taken = new Set(
          appts
            .filter(a =>
              a.date === d &&
              a.facilityName === facility.facilityName &&
              a.status !== "cancelled"
            )
            .map(a => a.time)
        );
        const opts = currSlots
          .filter(s => s.date===d && !taken.has(s.time))
          .map(s => `<option value="${s.time}">${s.time}</option>`)
          .join("");
        slotTime.innerHTML = opts || `<option disabled selected>No times available</option>`;
      }

      slotDate.onchange = refreshTimes;
      refreshTimes();

      // reset
      patientType.value = "child";
      nameLabel.textContent = "Child Name";
      patientName.value = ""; guardianName.value = ""; vaccineCode.value = ""; notes.value = "";

      vaxModal.classList.add("show");
      vaxModal.setAttribute("aria-hidden","false");
    });
  });

  btnCancel.addEventListener("click", closeModal);
  vaxModal.addEventListener("click", (e)=>{ if (e.target === vaxModal) closeModal(); });

  function closeModal(){
    vaxModal.classList.remove("show");
    vaxModal.setAttribute("aria-hidden","true");
    vaxForm.reset();
  }

  vaxForm.addEventListener("submit", (e)=>{
    e.preventDefault();
    try{
      if (!slotTime.value || slotTime.options[0]?.disabled) {
        alert("No available times for the selected date.");
        return;
      }
      window.VAX_APPT.book({
        patientType: patientType.value,
        patientName: patientName.value.trim(),
        guardianName: guardianName.value.trim(),
        facilityName: facilityNameEl.value,
        facilityType: facilityTypeEl.value,
        address: facilityAddrEl.value,
        vaccineCode: vaccineCode.value.trim(),
        date: slotDate.value,
        time: slotTime.value,
        notes: notes.value.trim()
      });
      alert("✅ Vaccination appointment booked.");
      closeModal();
    }catch(err){
      alert(err.message || "Failed to book.");
    }
  });
})();
