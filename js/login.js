// login.js — Hybrid login: Provider uses local auth, Mother/Doctor use Firebase
(function () {
  const auth = firebase.auth();

  const form  = document.getElementById("loginForm") || document.querySelector("form");
  const errEl = document.getElementById("err");
  const roleSel = () => document.querySelector('input[name="role"]:checked')?.value;

  function setErr(msg) {
    if (errEl) errEl.textContent = msg || "";
    else if (msg) alert(msg);
  }

  // Helper: make a neat name from an email if no profile name is available
  function nameFromEmail(email) {
    if (!email) return "Doctor";
    const base = email.split("@")[0].replace(/[._-]+/g, " ");
    return base
      .split(" ")
      .filter(Boolean)
      .map(s => s.charAt(0).toUpperCase() + s.slice(1))
      .join(" ");
  }

  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    setErr("");

    const email    = document.getElementById("email")?.value.trim();
    const password = document.getElementById("password")?.value;
    const roleInput = (roleSel() || "mother").toLowerCase();

    if (!email) return setErr("Please enter your email.");
    if (!password) return setErr("Please enter your password.");

    try {
      if (roleInput === "provider") {
        // ✅ Local (non-Firebase) provider auth
        if (typeof PROVIDER_AUTH === "undefined") {
          return setErr("Provider auth not loaded. Include ../../js/auth.js BEFORE login.js");
        }
        const u = await PROVIDER_AUTH.login(email, password);
        console.log("[provider login]", u);

        // (Optional) Clear any doctor profile so it doesn't leak into doctor UI
        // localStorage.removeItem("mss_doctor_profile");

        window.location.href = "../provider/provider.html";
        return;
      }

      // ✅ Firebase path (mother/doctor)
      const cred = await auth.signInWithEmailAndPassword(email, password);
      const uid = cred.user.uid;

      // fetch user profile from Firestore
      const userRef = firebase.firestore().collection("users").doc(uid);
      const snap = await userRef.get();
      const data = snap.exists ? snap.data() : {};
      const roleFromDb = (data.role || roleInput || "mother").toLowerCase();

      if (roleFromDb === "doctor") {
        // Save doctor profile to localStorage so the dashboard can display the name/clinic
        const profile = {
          name: data.name || cred.user.displayName || nameFromEmail(email),
          clinic: data.clinicName || "Clinic"
        };
        localStorage.setItem("mss_doctor_profile", JSON.stringify(profile));

        window.location.href = "../doctor-dashboard/doctor-dashboard.html";
        return;
      }

      // Mother (default)
      window.location.href = "../mother-dashboard/mother-dashboard.html";
    } catch (ex) {
      console.error("[login] error:", ex);
      setErr(ex?.message || "Login failed.");
    }
  });
})();
