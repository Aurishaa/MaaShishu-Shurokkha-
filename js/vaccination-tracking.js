document.addEventListener("DOMContentLoaded", () => {
  const vaccinations = [
    { name: "BCG", date: "2025-07-20", status: "complete" },
    { name: "Polio (1st dose)", date: "2025-08-01", status: "due" },
    { name: "Hepatitis B", date: "2025-07-10", status: "missed" },
    { name: "MMR", date: "2025-09-05", status: "due" },
  ];

  const tableBody = document.getElementById("vaccineTableBody");

  vaccinations.forEach(vaccine => {
    const row = document.createElement("tr");

    const nameCell = document.createElement("td");
    nameCell.textContent = vaccine.name;

    const dateCell = document.createElement("td");
    dateCell.textContent = vaccine.date;

    const statusCell = document.createElement("td");
    statusCell.textContent = vaccine.status.charAt(0).toUpperCase() + vaccine.status.slice(1);
    statusCell.classList.add(`status-${vaccine.status}`);

    row.appendChild(nameCell);
    row.appendChild(dateCell);
    row.appendChild(statusCell);

    tableBody.appendChild(row);
  });
});
