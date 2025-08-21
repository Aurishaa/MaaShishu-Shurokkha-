// super-light local auth for demos (NOT production security)
const AUTH = {
  KEYS: { USERS: "mss_users", SESSION: "mss_session" },

  async sha256(text) {
    const buf = new TextEncoder().encode(text);
    const hash = await crypto.subtle.digest("SHA-256", buf);
    return [...new Uint8Array(hash)].map(b=>b.toString(16).padStart(2,"0")).join("");
  },

  loadUsers()   { return JSON.parse(localStorage.getItem(this.KEYS.USERS) || "[]"); },
  saveUsers(u)  { localStorage.setItem(this.KEYS.USERS, JSON.stringify(u)); },

  seedDemoUsers: async function () {
    const users = this.loadUsers();
    if (users.length) return;
    // demo mother + provider
    users.push({
      id: "u_mother_1",
      name: "Ayesha Rahman",
      email: "mother@example.com",
      role: "mother",
      pass: await this.sha256("mother123")
    });
    users.push({
      id: "u_provider_1",
      name: "Nurse Farzana",
      email: "provider@example.com",
      role: "provider",
      pass: await this.sha256("provider123")
    });
    this.saveUsers(users);
  },

  current() {
    const id = localStorage.getItem(this.KEYS.SESSION);
    if (!id) return null;
    return this.loadUsers().find(u => u.id === id) || null;
  },

  async login(email, password) {
    const users = this.loadUsers();
    const pass = await this.sha256(password);
    const u = users.find(x => x.email.toLowerCase() === email.toLowerCase() && x.pass === pass);
    if (!u) throw new Error("Invalid credentials");
    localStorage.setItem(this.KEYS.SESSION, u.id);
    return u;
  },

  logout() { localStorage.removeItem(this.KEYS.SESSION); },

  requireRole(roles /* array */) {
    const u = this.current();
    if (!u || (roles && !roles.includes(u.role))) {
      // redirect to login page with target=current
      const target = encodeURIComponent(location.pathname + location.search);
      location.href = `../auth/login.html?next=${target}`;
    }
  }
};

// seed demo users at load
AUTH.seedDemoUsers();
