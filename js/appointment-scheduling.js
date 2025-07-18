document.addEventListener("DOMContentLoaded", () => {
  const form = document.getElementById("appointmentForm");
  const list = document.getElementById("appointmentList");

  const appointments = [];

  form.addEventListener("submit", (e) => {
    e.preventDefault();

    const doctor = document.getElementById("doctor").value;
    const date = document.getElementById("date").value;
    const time = document.getElementById("time").value;

    if (!doctor || !date || !time) {
      alert("Please fill in all fields.");
      return;
    }

    const doctorName = {
      "dr-rahman": "Dr. Rahman (Pediatrician)",
      "dr-kabir": "Dr. Kabir (Gynecologist)"
    };

    const appointment = `${doctorName[doctor]} - ${date} at ${time}`;
    appointments.push(appointment);

    const li = document.createElement("li");
    li.textContent = appointment;
    list.appendChild(li);

    form.reset();
  });
});
