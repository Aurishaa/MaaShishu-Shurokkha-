// === File: js/login.js ===
// Hybrid login: Providers via local auth; Mothers/Doctors via Firebase.
// Also reads ?role=...&msg=registered to preselect role and show a success note.

(function () {
  const auth = firebase.auth();
  const form  = document.getElementById("loginForm") || document.querySelector("form");
  const errEl = document.getElementById("err");

  const setErr = (m) => { if (errEl) errEl.textContent = m || ""; };

  // Read query params
  const params = new URLSearchParams(location.search);
  const roleFromUrl = (params.get("role") || "").toLowerCase();
  const msg = params.get("msg");

  // Preselect role based on URL
  if (roleFromUrl) {
    const input = document.querySelector(`input[name="role"][value="${roleFromUrl}"]`);
    if (input) input.checked = true;
  }

  // Show soft success message if coming from register
  if (msg === "registered" && errEl) {
    errEl.style.color = "#166534"; // green-700
    errEl.textContent = "Account created successfully. Please log in.";
    setTimeout(() => { errEl.textContent = ""; }, 5000);
  }

  const roleVal = () => (document.querySelector('input[name="role"]:checked')?.value || "mother").toLowerCase();

  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    setErr("");

    const email    = document.getElementById("email")?.value?.trim();
    const password = document.getElementById("password")?.value;
    const role     = roleVal();

    if (!email)    return setErr("Please enter your email.");
    if (!password) return setErr("Please enter your password.");

    try {
      if (role === "provider") {
        if (typeof PROVIDER_AUTH === "undefined") {
          return setErr("Provider auth not loaded. Include ../../js/auth.js BEFORE login.js");
        }
        await PROVIDER_AUTH.login(email, password);
        window.location.href = "../provider/provider.html";
        return;
      }

      // Firebase path (mother/doctor)
      const cred = await auth.signInWithEmailAndPassword(email, password);
      const uid  = cred.user.uid;
      const snap = await firebase.firestore().collection("users").doc(uid).get();
      const data = snap.exists ? snap.data() : {};
      const roleFromDb = (data.role || role).toLowerCase();

      if (roleFromDb === "doctor") {
        window.location.href = "../doctor-dashboard/doctor-dashboard.html";
      } else {
        window.location.href = "../mother-dashboard/mother-dashboard.html";
      }
    } catch (ex) {
      console.error("[login] error:", ex);
      setErr(ex?.message || "Login failed.");
    }
  });
})();
