// File: js/mother-dashboard.js

// 1. Ensure user is logged in and display name
auth.onAuthStateChanged((user) => {
    if (user) {
        const userId = user.uid;
        loadMotherName(userId);
        loadChildProfiles(userId);
    } else {
        // Redirect to login page if not logged in
        window.location.href = "../../views/login/login.html";
    }
});

// 2. Load mother’s name and update greeting
function loadMotherName(userId) {
    db.collection("users").doc(userId).get().then(doc => {
        if (doc.exists) {
            const name = doc.data().fullName || "Mother";

            document.getElementById("welcomeMessage").textContent = `Welcome, ${name}!`;
        } else {
            document.getElementById("welcomeMessage").textContent = `Welcome!`;
        }
    });
}

// 3. Load child profiles
function loadChildProfiles(userId) {
    const container = document.getElementById("childrenListContainer");
    const emptyState = document.getElementById("emptyState");

    db.collection("users").doc(userId).collection("children").get().then(snapshot => {
        container.innerHTML = ""; // Clear old content
        if (snapshot.empty) {
            emptyState.style.display = "block";
        } else {
            emptyState.style.display = "none";
            snapshot.forEach(doc => {
                const child = doc.data();
                const card = document.createElement("div");
                card.className = "dashboard-card content-card";
                card.innerHTML = `
                    <div class="card-header">
                        <div class="icon"><i class="fa-solid fa-baby"></i></div>
                        <h3>${child.name}</h3>
                    </div>
                    <div class="card-body">
                        <p>Date of Birth: ${child.dob}</p>
                        <a href="../vaccination-tracking/vaccination-tracking.html" class="btn btn-primary">Track Vaccinations</a>
                    </div>
                `;
                container.appendChild(card);
            });
        }
    });
}

// 4. Handle "Add Child" form
document.getElementById("addChildButton").addEventListener("click", () => {
    document.getElementById("addChildModal").style.display = "flex";
});

document.getElementById("closeModalButton").addEventListener("click", () => {
    document.getElementById("addChildModal").style.display = "none";
});

document.getElementById("addChildForm").addEventListener("submit", function (e) {
    e.preventDefault();
    const name = document.getElementById("childName").value;
    const dob = document.getElementById("childDob").value;

    const user = auth.currentUser;
    if (!user) return;

    db.collection("users")
        .doc(user.uid)
        .collection("children")
        .add({ name, dob })
        .then(() => {
            document.getElementById("addChildForm").reset();
            document.getElementById("addChildModal").style.display = "none";
            loadChildProfiles(user.uid); // Reload
        });
});

 if (logoutButton) {
        logoutButton.addEventListener('click', (e) => {
            e.preventDefault(); // This stops the link from doing anything by itself.
            
            // This is the Firebase function to sign the user out.
            auth.signOut().then(() => {
                alert("You have been successfully logged out.");
                // This is the CORRECT redirect to the login page
                window.location.href = '../login/login.html'; 
            }).catch(error => {
                console.error("Logout Error:", error);
            });
        });
    }
