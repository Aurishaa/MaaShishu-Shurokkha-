// === File: js/register.js (All-in-One Version) ===

try {
    // --- PART 1: FIREBASE CONFIGURATION ---
    // This part runs immediately when the script is loaded.
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
    console.log("Firebase config loaded and initialized successfully inside register.js.");

} catch (e) {
    console.error("FATAL ERROR during Firebase Initialization:", e);
    alert("CRITICAL ERROR: Firebase could not be configured. Check console.");
}


// --- PART 2: EVENT LISTENER LOGIC ---
// This part waits for the HTML page to be ready.
document.addEventListener('DOMContentLoaded', function() {
    const registerForm = document.getElementById('registerForm');

    if (!registerForm) {
        console.error("FATAL ERROR: The form with id='registerForm' was NOT found.");
        return;
    }
    
    registerForm.addEventListener('submit', function(event) {
        event.preventDefault();
        console.log("Submit button clicked. Starting validation...");

        // Check if Firebase services are actually available
        if (typeof auth === 'undefined' || typeof db === 'undefined') {
            console.error("FATAL ERROR: 'auth' or 'db' objects are not defined. Firebase initialization failed.");
            alert("CRITICAL ERROR: Firebase services are not available.");
            return;
        }

        // Get values from the form
        const fullName = document.getElementById('fullName').value;
        const email = document.getElementById('email').value;
        const password = document.getElementById('password').value;
        const role = document.querySelector('input[name="role"]:checked').value;

        console.log("Data to be sent:", { fullName, email, role });

        // --- Firebase Interaction ---
        console.log("Attempting to contact Firebase Auth...");
        auth.createUserWithEmailAndPassword(email, password)
            .then((userCredential) => {
                const user = userCredential.user;
                console.log("%cSUCCESS: Firebase Auth created the user.", "color: green");
                return db.collection('users').doc(user.uid).set({
                    fullName: fullName,
                    email: email,
                    role: role
                });
            })
            .then(() => {
                console.log("%cSUCCESS: Firestore saved the user data.", "color: green");
                alert("Registration successful! Redirecting to login.");
                window.location.href = '../login/login.html';
            })
            .catch((error) => {
                console.error("%cFIREBASE ERROR:", "color: red; font-weight: bold;", error.message);
                alert("Registration Failed: " + error.message);
            });
    });
});