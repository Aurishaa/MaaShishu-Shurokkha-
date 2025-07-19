// === File: js/child-dashboard.js ===

document.addEventListener("DOMContentLoaded", () => {
  firebase.auth().onAuthStateChanged(user => {
    if (user) {
      loadChildDashboard(user);
    } else {
      alert("You must be logged in to view the child dashboard.");
      window.location.href = '../login/login.html';
    }
  });
});

function loadChildDashboard(user) {
  const userRef = firebase.firestore().collection('users').doc(user.uid);
  const childDashboardHeader = document.querySelector(".main-content-header h1");
  const vaccinationCardBody = document.querySelector(".dashboard-card .card-body p");

  // Retrieve child's name (assume one child for now)
  userRef.collection("children").limit(1).get().then(snapshot => {
    if (!snapshot.empty) {
      const childData = snapshot.docs[0].data();
      childDashboardHeader.textContent = `Dashboard for ${childData.name}`;
      vaccinationCardBody.innerHTML = `The MMR vaccine is due on <strong>${childData.mmrDueDate || 'N/A'}</strong>.`;
    } else {
      childDashboardHeader.textContent = "Dashboard for [No Child Found]";
      vaccinationCardBody.innerHTML = `No child data found. Please add a child profile.`;
    }
  }).catch(error => {
    console.error("Error loading child dashboard:", error);
  });
}

// Sample event listeners (for buttons)
function setupButtons() {
  const bookBtn = document.querySelector(".btn.btn-primary");
  if (bookBtn) {
    bookBtn.addEventListener("click", () => {
      window.location.href = "../appointment-scheduling/appointment-scheduling.html";
    });
  }
}
