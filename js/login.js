// === File: js/login.js (All-in-One Version) ===

try {
    // --- PART 1: FIREBASE CONFIGURATION ---
    const firebaseConfig = {
      apiKey: "AIzaSyDBEwAiW648VpDIMAUqi_PWoYO0UJM8Lwc", // <-- Put your new, safe key here
      authDomain: "maashishu-shurokkha.firebaseapp.com",
      projectId: "maashishu-shurokkha",
      storageBucket: "maashishu-shurokkha.appspot.com",
      messagingSenderId: "1020945509053",
      appId: "1:1020945509053:web:6bb48ef986cd2752fd25d4"
    };
   const app = firebase.initializeApp(firebaseConfig);
    var auth = firebase.auth();
    var db = firebase.firestore();
    console.log("Firebase initialized successfully inside login.js.");

} catch (e) {
    console.error("FATAL ERROR during Firebase Initialization:", e);
}

// --- PART 2: EVENT LISTENER LOGIC ---
document.addEventListener('DOMContentLoaded', function() {
    const loginForm = document.getElementById('loginForm');
    if (!loginForm) return;
    
    loginForm.addEventListener('submit', function(event) {
        event.preventDefault();

        // Check if Firebase services are available
        if (typeof auth === 'undefined' || typeof db === 'undefined') {
            alert("CRITICAL ERROR: Firebase services are not available.");
            return;
        }

        const email = document.getElementById('email').value;
        const password = document.getElementById('password').value;
        // This is the new, critical line that reads the selected role
        const selectedRole = document.querySelector('input[name="role"]:checked').value;

        let userRoleFromDB = '';

        // --- Firebase Interaction ---
        auth.signInWithEmailAndPassword(email, password)
            .then((userCredential) => {
                const user = userCredential.user;
                // Go to the database to get the user's real role
                return db.collection('users').doc(user.uid).get();
            })
            .then((doc) => {
                if (doc.exists) {
                    userRoleFromDB = doc.data().role;

                    // IMPORTANT: Check if the selected role matches the user's actual role
                    if (selectedRole !== userRoleFromDB) {
                        // If they don't match, throw an error. This is a security feature.
                        throw new Error(`Login failed. This account is registered as a "${userRoleFromDB}", not a "${selectedRole}".`);
                    }
                    
                    alert("Login successful! Redirecting...");
                    
                    // Redirect based on the confirmed role
                    if (userRoleFromDB === "doctor") {
                        window.location.href = '../doctor-dashboard/doctor-dashboard.html'; 
                    } else {
                        window.location.href = '../mother-dashboard/mother-dashboard.html';
                    }
                } else {
                    throw new Error("User data not found in database.");
                }
            })
            .catch((error) => {
                console.error("Login Error:", error.message);
                alert("Login Failed: " + error.message);
            });
    });
});