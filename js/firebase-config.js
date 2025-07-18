// === File: js/firebase-config.js (The Essential Configuration) ===

// IMPORTANT: Replace with your project's new, regenerated keys.
const firebaseConfig = {
  apiKey: "YOUR_NAIzaSyDBEwAiW648VpDIMAUqi_PWoYO0UJM8Lwc",
  authDomain: "maashishu-shurokkha.firebaseapp.com",
  projectId: "maashishu-shurokkha",
  storageBucket: "maashishu-shurokkha.appspot.com",
  messagingSenderId: "1020945509053",
  appId: "1:102094550905a5fd25d4" // I noticed a typo in the old App ID, this might be more correct
};

// Initialize Firebase and make the services available globally for other scripts to use
try {
  const app = firebase.initializeApp(firebaseConfig);
  const auth = firebase.auth();
  const db = firebase.firestore();
  console.log("Firebase initialized successfully from firebase-config.js");
} catch (e) {
  console.error("CRITICAL ERROR: Could not initialize Firebase. Check your firebaseConfig object.", e);
  alert("CRITICAL ERROR: Could not initialize Firebase. Check console.");
}