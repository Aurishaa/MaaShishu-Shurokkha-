// === File: js/register.js ===
// Hybrid register: Mother/Doctor via Firebase; Provider via local storage.
// After successful registration, ALWAYS redirect to login (no auto-login).

(function () {
  // Firebase (for mother/doctor)
  const auth = firebase.auth();
  const db   = firebase.firestore();

  // DOM
  const form       = document.getElementById("registerForm") || document.querySelector("form");
  const errEl      = document.getElementById("err");
  const roleMother = document.getElementById("roleMother");
  const roleDoctor = document.getElementById("roleDoctor");
  const roleProv   = document.getElementById("roleProvider");
  const clinicRow  = document.getElementById("clinicRow"); // provider-only row

  // Helpers
  const setErr = (m) => { if (errEl) errEl.textContent = m || ""; };
  const roleVal = () => (document.querySelector('input[name="role"]:checked')?.value || "mother").toLowerCase();
  const gotoLogin = (role) => {
    // Pass role & a "registered" message to login page to show nice note
    const params = new URLSearchParams({ role, msg: "registered" });
    window.location.href = `../login/login.html?${params.toString()}`;
  };

  // Show/hide provider clinic select based on role
  function toggleClinic() {
    const r = roleVal();
    if (clinicRow) clinicRow.style.display = (r === "provider" ? "block" : "none");
  }
  [roleMother, roleDoctor, roleProv].forEach(r => r && r.addEventListener("change", toggleClinic));
  toggleClinic();

  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    setErr("");

    const fullName = document.getElementById("fullName")?.value?.trim();
    const email    = document.getElementById("email")?.value?.trim();
    const password = document.getElementById("password")?.value || "";
    const role     = roleVal();
    const clinic   = document.getElementById("clinic")?.value?.trim() || "";

    if (!fullName) return setErr("Please enter your full name.");
    if (!email)    return setErr("Please enter a valid email.");
    if (password.length < 6) return setErr("Password must be at least 6 characters.");

    // Provider: local storage (NO Firebase)
    if (role === "provider") {
      if (!window.PROVIDER_AUTH) {
        return setErr("Provider auth not loaded. Ensure ../../js/auth.js is included before register.js");
      }
      if (!clinic) return setErr("Please select your clinic / hospital.");

      try {
        // Register locally
        const user = await PROVIDER_AUTH.register({
          name: fullName, email, password, clinicName: clinic
        });

        // We do NOT want to be logged in yet → clear any auto-session then go to login
        try { PROVIDER_AUTH.logout(); } catch {}
        gotoLogin("provider");
      } catch (ex) {
        console.error("[provider register] error:", ex);
        return setErr(ex?.message || "Registration failed for provider.");
      }
      return; // done
    }

    // Mother / Doctor via Firebase
    try {
      // 1) Create the auth user
      const cred = await auth.createUserWithEmailAndPassword(email, password);
      const uid  = cred.user.uid;

      // 2) Save a profile document (role + name [+ clinic if doctor wants])
      await db.collection("users").doc(uid).set({
        name: fullName,
        email,
        role, // "mother" | "doctor"
        clinicName: (role === "doctor" ? (clinic || "") : ""),
        createdAt: firebase.firestore.FieldValue.serverTimestamp()
      });

      // 3) Sign-out to force explicit login next time
      await auth.signOut();

      // 4) Go to login page with a success toast
      gotoLogin(role);
    } catch (ex) {
      console.error("[register] error:", ex);
      setErr(ex?.message || "Registration failed.");
    }
  });
})();
