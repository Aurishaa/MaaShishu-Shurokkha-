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

  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    setErr("");

    const email    = document.getElementById("email")?.value.trim();
    const password = document.getElementById("password")?.value;
    const role     = (roleSel() || "mother").toLowerCase();

    if (!email) return setErr("Please enter your email.");
    if (!password) return setErr("Please enter your password.");

    try {
      if (role === "provider") {
        // ✅ Local auth
        if (typeof PROVIDER_AUTH === "undefined") {
          return setErr("Provider auth not loaded. Include ../../js/auth.js BEFORE login.js");
        }
        const u = await PROVIDER_AUTH.login(email, password);
        console.log("[provider login]", u);
        window.location.href = "../provider/provider.html";
        return;
      }

      // ✅ Firebase path (mother/doctor)
      const cred = await auth.signInWithEmailAndPassword(email, password);
      const uid = cred.user.uid;

      // fetch user profile from Firestore
      const snap = await firebase.firestore().collection("users").doc(uid).get();
      const data = snap.exists ? snap.data() : {};
      const roleFromDb = data.role || role;

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
