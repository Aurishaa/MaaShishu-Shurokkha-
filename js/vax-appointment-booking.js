// vax-appointment-booking.js — localStorage vaccination appointments (facility-centric, supports mother/child)

(function(){
  const KEYS = { APPTS: "mss_vax_appointments" };

  const load  = () => JSON.parse(localStorage.getItem(KEYS.APPTS) || "[]");
  const save  = (a) => localStorage.setItem(KEYS.APPTS, JSON.stringify(a));
  const DOW   = ["Sun","Mon","Tue","Wed","Thu","Fri","Sat"];

  function genSlots(schedule, daysAhead = 21) {
    const days   = (schedule?.days?.length ? schedule.days : ["Mon","Wed","Fri"]);
    const blocks = (schedule?.blocks?.length ? schedule.blocks : [["09:00","12:00"],["14:00","16:00"]]);
    const step   = Number(schedule?.stepMinutes) || 30;
    const allowed = new Set(days);
    const out = [];
    const now = new Date();

    for (let i=0;i<daysAhead;i++){
      const d = new Date(now); d.setDate(now.getDate()+i);
      if (!allowed.has(DOW[d.getDay()])) continue;
      const y=d.getFullYear(), m=String(d.getMonth()+1).padStart(2,"0"), dd=String(d.getDate()).padStart(2,"0");
      const date = `${y}-${m}-${dd}`;
      for (const [s,e] of blocks){
        const [sh,sm]=s.split(":").map(Number), [eh,em]=e.split(":").map(Number);
        let t = sh*60+(sm||0), end = eh*60+(em||0);
        while (t < end){ // not including the exact end minute
          const hh=String(Math.floor(t/60)).padStart(2,"0"), mm=String(t%60).padStart(2,"0");
          out.push({date, time:`${hh}:${mm}`}); t+=step;
        }
      }
    }
    return out;
  }

  window.VAX_APPT = {
    list() { return load(); },
    getSlots(schedule, daysAhead = 21) { return genSlots(schedule, daysAhead); },

    // payload:
    // { patientType: "mother"|"child", patientName, childId?, guardianName?,
    //   facilityName, facilityType?, address?, vaccineCode, date, time, notes }
    book(p) {
      const patientType = (p?.patientType === "mother" || p?.patientType === "child") ? p.patientType : "child";
      const patientName = String(p?.patientName || "").trim();
      const facilityName = String(p?.facilityName || "").trim();
      if (!patientName || !p?.vaccineCode || !p?.date || !p?.time || !facilityName) {
        throw new Error("Please fill who it's for, name, vaccine, facility, date and time.");
      }

      const appts = load();

      // prevent same person double-booking same slot (active)
      if (appts.some(a => a.patientName?.toLowerCase()===patientName.toLowerCase()
        && a.date===p.date && a.time===p.time && a.status!=="cancelled")) {
        throw new Error("This person already has an appointment at that time.");
      }

      // prevent slot clash at the same facility (active)
      if (appts.some(a => a.facilityName===facilityName
        && a.date===p.date && a.time===p.time && a.status!=="cancelled")) {
        throw new Error("This slot is already taken. Please choose another time.");
      }

      appts.push({
        id: "a_" + Math.random().toString(36).slice(2),
        patientType,
        patientName,
        childId: p?.childId || null,
        guardianName: p?.guardianName || "",
        facilityName,
        facilityType: p?.facilityType || "",
        address: p?.address || "",
        vaccineCode: String(p.vaccineCode).toUpperCase(),
        date: p.date,
        time: p.time,
        status: "booked", // booked | checked_in | completed | cancelled
        notes: p?.notes || "",
        createdAt: new Date().toISOString()
      });
      save(appts);
      return true;
    }
  };
})();
