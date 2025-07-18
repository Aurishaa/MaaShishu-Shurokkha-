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

    // Initialize Firebase and make auth and db available
    const app = firebase.initializeApp(firebaseConfig);
    var auth = firebase.auth();
    var db = firebase.firestore();
    console.log("Firebase config loaded and initialized successfully inside login.js.");

} catch (e) {
    console.error("FATAL ERROR during Firebase Initialization:", e);
    alert("CRITICAL ERROR: Firebase could not be configured. Check console.");
}


// --- PART 2: EVENT LISTENER LOGIC ---
document.addEventListener('DOMContentLoaded', function() {
    const loginForm = document.getElementById('loginForm');

    if (!loginForm) {
        console.error("FATAL ERROR: The form with id='loginForm' was NOT found.");
        return;
    }
    
    loginForm.addEventListener('submit', function(event) {
        event.preventDefault();
        console.log("Login button clicked. Starting validation...");

        // Check if Firebase services are actually available
        if (typeof auth === 'undefined' || typeof db === 'undefined') {
            console.error("FATAL ERROR: 'auth' or 'db' objects are not defined. Firebase initialization failed.");
            alert("CRITICAL ERROR: Firebase services are not available.");
            return;
        }

        const email = document.getElementById('email').value;
        const password = document.getElementById('password').value;
        let userRole = ''; // Variable to hold the user's role

        // --- Firebase Interaction ---
        console.log("Attempting to sign in with Firebase Auth...");
        auth.signInWithEmailAndPassword(email, password)
            .then((userCredential) => {
                const user = userCredential.user;
                console.log("%cSUCCESS: Firebase Auth signed the user in.", "color: green");
                return db.collection('users').doc(user.uid).get();
            })
            .then((doc) => {
                if (doc.exists) {
                    userRole = doc.data().role;
                    console.log(`%cSUCCESS: Firestore found user role: ${userRole}.`, "color: green");
                    
                    alert("Login successful! Redirecting...");
                    
                   // --- This is the NEW, CORRECTED code ---
if (userRole === "doctor") {
    // Correct path for the doctor's dashboard
    window.location.href = '../doctor-dashboard/doctor-dashboard.html'; 
} else {
    // Correct path for the mother's dashboard
    window.location.href = '../mother-dashboard/mother-dashboard.html';
}
                } else {
                    throw new Error("User data not found in database. Registration may be incomplete.");
                }
            })
            .catch((error) => {
                console.error("%cFIREBASE ERROR:", "color: red; font-weight: bold;", error.message);
                alert("Login Failed: " + error.message);
            });
    });
});