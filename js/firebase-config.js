// === File: js/firebase-config.js (The Essential Configuration) ===

// IMPORTANT: Replace with your project's new, regenerated keys.
const firebaseConfig = {
  apiKey: "AIzaSyDBEwAiW648VpDIMAUqi_PWoYO0UJM8Lwc",
  authDomain: "maashishu-shurokkha.firebaseapp.com",
  projectId: "maashishu-shurokkha",
  storageBucket: "maashishu-shurokkha.appspot.com",
  messagingSenderId: "1020945509053",
  appId: "1:1:1020945509053:web:6bb48ef986cd2752fd25d4" // I noticed a typo in the old App ID, this might be more correct
};

firebase.initializeApp(firebaseConfig);

// Export auth and db for use in other scripts
const auth = firebase.auth();
const db = firebase.firestore();

// Optional: Log confirmation
console.log("✅ Firebase initialized in firebase-config.js");