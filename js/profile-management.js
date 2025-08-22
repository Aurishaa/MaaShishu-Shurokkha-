// profile-management.js — wires your existing Profile page without changing UI.
// Works with: Firebase (mother/doctor) and local provider auth (PROVIDER_AUTH).

(function () {
  // ------- selector helpers (don't change your HTML) -------
  const $  = (sel, root=document) => root.querySelector(sel);
  const byId = (id) => document.getElementById(id);
  const firstOf = (candidates) => candidates.map(c => $(c)).find(Boolean) || null;
  const initials = (t) => (t||"U").split(/\s+/).filter(Boolean).map(s=>s[0]).slice(0,2).join("").toUpperCase();

  // Try common ids/names your page might already have
  const form        = firstOf(["#profileForm", "form#f", ".profile-form", "form"]);
  const pwdForm     = firstOf(["#passwordForm", ".password-form"]);
  const logoutBtn   = firstOf(["#logoutBtn", ".logout-link a", "a.logout"]);
  const saveMsg     = firstOf(["#saveMsg"]);
  const pwdMsg      = firstOf(["#pwdMsg"]);

  const nameEl      = firstOf(["#fullName", "#name", '[name="name"]']);
  const emailEl     = firstOf(["#email", '[name="email"]']);
  const phoneEl     = firstOf(["#phone", '[name="phone"]']);
  const addressEl   = firstOf(["#address", '[name="address"]']);
  const dobEl       = firstOf(["#dob", '[name="dob"]']);
  const clinicEl    = firstOf(["#clinic", '[name="clinic"]', "#clinicName"]);
  const roleEl      = firstOf(["#role", '[name="role"]']);

  const avatarInput = firstOf(["#avatarFile", '[name="avatar"]']);
  const avatarView  = firstOf(["#avatarPreview", ".avatar-xl", ".avatar"]);

  const accNameEl   = firstOf(["#accountName"]);
  const accRoleEl   = firstOf(["#accountRole"]);
  const sidebarIni  = firstOf(["#sidebarInitials", ".avatar-mother"]);

  // Optional sections that should toggle by mode
  const firebaseOnly     = firstOf(["#firebaseOnly"]);
  const providerOnlyNote = firstOf(["#providerOnlyNote"]);

  // ------- state -------
  let mode = "guest"; // "firebase" | "provider" | "guest"
  let uid  = null;
  let role = "mother";
  let profile = {
    name: "", email: "", phone: "", address: "", dob: "", clinic: "", role: "mother", avatarDataUrl: ""
  };

  // ------- local provider storage ----------
  const LKEY = "mss_provider_profile";
  function loadLocalProfile(id) {
    const map = JSON.parse(localStorage.getItem(LKEY) || "{}");
    return map[id] || null;
  }
  function saveLocalProfile(id, data) {
    const map = JSON.parse(localStorage.getItem(LKEY) || "{}");
    map[id] = data; localStorage.setItem(LKEY, JSON.stringify(map));
  }

  // ------- detect auth mode (no UI changes) -------
  function detectAuth() {
    try {
      const prov = window.PROVIDER_AUTH?.current?.();
      if (prov && prov.role === "provider") {
        mode = "provider";
        uid  = prov.id;
        role = "provider";
        profile = loadLocalProfile(uid) || {
          name: prov.name || "Provider",
          email: prov.email || "",
          phone: "", address: "", dob: "",
          clinic: prov.clinicName || prov.clinic || "",
          role: "provider",
          avatarDataUrl: ""
        };
        return;
      }
    } catch {}

    // If Firebase is present, we’ll wait for onAuthStateChanged
    try {
      if (window.firebase?.auth) {
        const u = firebase.auth().currentUser;
        if (u) { mode = "firebase"; uid = u.uid; }
        else   { mode = "guest"; }
      } else {
        mode = "guest";
      }
    } catch { mode = "guest"; }
  }

  // ------- Firebase profile load/save (mother/doctor) -------
  async function loadFirebaseProfile() {
    const user = firebase.auth().currentUser;
    if (!user) return;
    const doc = await firebase.firestore().collection("users").doc(user.uid).get();
    const data = doc.exists ? doc.data() : {};
    role = data.role || "mother";
    profile = {
      name: data.name || user.displayName || "User",
      email: user.email || data.email || "",
      phone: data.phone || "",
      address: data.address || "",
      dob: data.dob || "",
      clinic: data.clinicName || "",
      role: role,
      avatarDataUrl: data.avatarDataUrl || ""
    };
  }

  async function saveFirebaseProfile() {
    if (!uid) return;
    const db = firebase.firestore();
    await db.collection("users").doc(uid).set({
      name: profile.name,
      phone: profile.phone,
      address: profile.address,
      dob: profile.dob,
      clinicName: profile.clinic,
      role: role,
      avatarDataUrl: profile.avatarDataUrl || ""
    }, { merge: true });
  }

  // ------- render (keeps your UI) -------
  function render() {
    if (nameEl)    nameEl.value = profile.name || "";
    if (emailEl)   { emailEl.value = profile.email || ""; emailEl.disabled = true; }
    if (phoneEl)   phoneEl.value = profile.phone || "";
    if (addressEl) addressEl.value = profile.address || "";
    if (dobEl)     dobEl.value = profile.dob || "";
    if (clinicEl)  clinicEl.value = profile.clinic || "";
    if (roleEl)    { roleEl.value = profile.role || role || ""; roleEl.disabled = true; }

    const ini = initials(profile.name);
    if (avatarView) {
      if (profile.avatarDataUrl) {
        avatarView.style.backgroundImage = `url(${profile.avatarDataUrl})`;
        avatarView.style.backgroundSize = "cover";
        avatarView.style.backgroundPosition = "center";
        avatarView.textContent = "";
      } else {
        avatarView.style.backgroundImage = "none";
        avatarView.textContent = ini;
      }
    }
    if (sidebarIni) sidebarIni.textContent = ini;
    if (accNameEl)  accNameEl.textContent = profile.name || "User";
    if (accRoleEl)  accRoleEl.textContent = profile.role || role || "member";

    if (firebaseOnly)     firebaseOnly.style.display     = (mode === "firebase") ? "block" : "none";
    if (providerOnlyNote) providerOnlyNote.style.display = (mode === "provider") ? "block" : "none";
  }

  function showSaved() {
    if (!saveMsg) return;
    saveMsg.style.display = "inline";
    setTimeout(()=> saveMsg.style.display = "none", 1400);
  }

  // ------- events (no UI changes) -------
  // Avatar preview (local only)
  avatarInput?.addEventListener("change", (e)=>{
    const f = e.target.files?.[0]; if (!f) return;
    if (!/^image\//.test(f.type)) { alert("Please select an image file."); return; }
    const reader = new FileReader();
    reader.onload = () => { profile.avatarDataUrl = reader.result; render(); };
    reader.readAsDataURL(f);
  });

  form?.addEventListener("submit", async (e)=>{
    e.preventDefault();
    // collect
    profile.name    = nameEl?.value?.trim() || profile.name;
    profile.phone   = phoneEl?.value?.trim() || "";
    profile.address = addressEl?.value?.trim() || "";
    profile.dob     = dobEl?.value || "";
    profile.clinic  = clinicEl?.value || profile.clinic;

    try {
      if (mode === "provider") {
        saveLocalProfile(uid, profile);
      } else if (mode === "firebase") {
        await saveFirebaseProfile();
      }
      showSaved();
    } catch (err) {
      console.error(err); alert(err?.message || "Failed to save profile.");
    }
  });

  pwdForm?.addEventListener("submit", async (e)=>{
    e.preventDefault();
    if (mode !== "firebase") return;
    const newPw = byId("newPassword")?.value?.trim();
    if (!newPw || newPw.length < 6) { alert("Password must be at least 6 characters."); return; }
    try {
      await firebase.auth().currentUser.updatePassword(newPw);
      byId("newPassword").value = "";
      if (pwdMsg) { pwdMsg.style.display = "inline"; setTimeout(()=> pwdMsg.style.display = "none", 1400); }
    } catch (err) {
      console.error(err);
      alert(err?.message || "Failed to update password. Please reauthenticate and try again.");
    }
  });

  logoutBtn?.addEventListener("click", async (e)=>{
    e.preventDefault();
    try {
      if (mode === "firebase") await firebase.auth().signOut();
      if (mode === "provider") window.PROVIDER_AUTH?.logout?.();
    } catch {}
    location.href = "../login/login.html";
  });

  // ------- boot -------
  detectAuth();

  if (mode === "provider") {
    render();
  } else if (window.firebase?.auth) {
    firebase.auth().onAuthStateChanged(async (user)=>{
      if (user) {
        mode = "firebase"; uid = user.uid;
        await loadFirebaseProfile();
      } else {
        mode = "guest";
        profile = { name: "Guest", email: "", phone:"", address:"", dob:"", clinic:"", role:"mother", avatarDataUrl:"" };
      }
      render();
    });
  } else {
    // no auth at all (pure static)
    mode = "guest";
    profile = { name: "Guest", email: "", phone:"", address:"", dob:"", clinic:"", role:"mother", avatarDataUrl:"" };
    render();
  }
})();
