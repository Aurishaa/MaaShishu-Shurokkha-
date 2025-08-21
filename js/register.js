// register.js — Hybrid: Provider uses local auth; Mother/Doctor use Firebase
// Load order on register.html:
// 1) firebase-app.js, firebase-auth.js, firebase-firestore.js
// 2) ../../js/firebase-config.js              (for mother/doctor)
// 3) ../../js/auth.js                         (your local provider auth exposing window.PROVIDER_AUTH)
// 4) ../../js/register.js                     (this file)

(function () {
  // Firebase objects (only used for mother/doctor)
  const auth = firebase.auth();
  const db   = firebase.firestore();

  // === Match your actual HTML IDs ===
  const form      = document.getElementById("registerForm") || document.querySelector("form");
  const errEl     = document.getElementById("err");
  const roleSel   = () => document.querySelector('input[name="role"]:checked')?.value;
  // You don’t have #clinicRow / #clinic in this form; keep variables defensively:
  const clinicRow = document.getElementById("clinicRow");
  const clinicInp = document.getElementById("clinic");

  // If you later add a clinic field for providers, this will auto-toggle it.
  document.addEventListener("change", (e) => {
    if (e.target?.name === "role" && clinicRow) {
      clinicRow.style.display = (roleSel() === "provider") ? "block" : "none";
    }
  });

  function setErr(msg) {
    if (errEl) errEl.textContent = msg || "";
    else if (msg) alert(msg);
  }

  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    setErr("");

    // === Match your actual field IDs ===
    const name     = document.getElementById("fullName")?.value.trim();
    const email    = document.getElementById("email")?.value.trim();
    const password = document.getElementById("password")?.value;
    const role     = (roleSel() || "mother").toLowerCase();
    const clinic   = clinicInp?.value.trim() || ""; // safe even if not present

    if (!name)  return setErr("Please enter your full name.");
    if (!email) return setErr("Please enter a valid email.");
    if (!password || password.length < 6) return setErr("Password must be at least 6 characters.");
      if (role === "provider" && !clinic) {
    return setErr("Please select your clinic/hospital.");
  }

    try {
      console.log("[register] role selected:", role);

      if (role === "provider") {
        // ---------- LOCAL (no Firebase) ----------
        if (!window.PROVIDER_AUTH) {
          return setErr("Provider auth not loaded. Include ../../js/auth.js BEFORE register.js");
        }
        await PROVIDER_AUTH.register({
          name,
          email,
          password,
          clinicName: clinic || "Clinic"
        });
        // Go to provider portal
window.location.href = "../login/login.html?role=provider&signup_success=1";
        return;
      }

      // ---------- FIREBASE (mother/doctor) ----------
      const cred = await auth.createUserWithEmailAndPassword(email, password);
      const uid  = cred.user.uid;

      // Optional nicety
      if (cred.user.updateProfile) {
        try { await cred.user.updateProfile({ displayName: name }); } catch {}
      }

      await db.collection("users").doc(uid).set({
        name,
        email,
        role,                    // "mother" or "doctor"
        clinicName: "",          // providers are kept local in this hybrid setup
        createdAt: firebase.firestore.FieldValue.serverTimestamp()
      });

      if (role === "doctor") {
        window.location.href = "../doctor-dashboard/doctor-dashboard.html";
      } else {
        window.location.href = "../mother-dashboard/mother-dashboard.html";
      }
    } catch (ex) {
      console.error("[register] error:", ex);
      setErr(ex?.message || "Registration failed.");
    }
  });
})();
