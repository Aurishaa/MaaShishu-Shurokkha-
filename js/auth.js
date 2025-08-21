// provider-auth-local.js — demo-only auth for Providers (NO Firebase)
// Stores provider users in localStorage. Role is always "provider".
const PROVIDER_AUTH = {
  KEYS: { USERS: "mss_provider_users", SESSION: "mss_provider_session" },

  async sha256(text) {
    const buf = new TextEncoder().encode(text);
    const hash = await crypto.subtle.digest("SHA-256", buf);
    return [...new Uint8Array(hash)].map(b => b.toString(16).padStart(2, "0")).join("");
  },

  loadUsers() { return JSON.parse(localStorage.getItem(this.KEYS.USERS) || "[]"); },
  saveUsers(u) { localStorage.setItem(this.KEYS.USERS, JSON.stringify(u)); },

  async register({ name, email, password, clinicName }) {
    const users = this.loadUsers();
    if (users.find(u => u.email.toLowerCase() === email.toLowerCase())) {
      throw new Error("An account with this email already exists (provider).");
    }
    const pass = await this.sha256(password);
    const user = {
      id: crypto.randomUUID ? crypto.randomUUID() : (Math.random().toString(36).slice(2) + Date.now().toString(36)),
      name, email, role: "provider",
      clinicName: clinicName || "Clinic",
      pass
    };
    users.push(user);
    this.saveUsers(users);
    localStorage.setItem(this.KEYS.SESSION, user.id);
    return user;
  },

  async login(email, password) {
    const users = this.loadUsers();
    const passHash = await this.sha256(password);
    const u = users.find(x => x.email.toLowerCase() === email.toLowerCase() && x.pass === passHash);
    if (!u) throw new Error("Invalid email or password (provider).");
    localStorage.setItem(this.KEYS.SESSION, u.id);
    return u;
  },

  logout() { localStorage.removeItem(this.KEYS.SESSION); },

  current() {
    const id = localStorage.getItem(this.KEYS.SESSION);
    if (!id) return null;
    return this.loadUsers().find(u => u.id === id) || null;
  },


  async seedDemo() {
    const users = this.loadUsers();
    if (users.length) return;
    const pass = await this.sha256("provider123");
    users.push({
      id: "u_provider_demo",
      name: "Demo Provider",
      email: "provider@example.com",
      role: "provider",
      clinicName: "Demo Clinic",
      pass
    });
    this.saveUsers(users);
  }
};
window.PROVIDER_AUTH = PROVIDER_AUTH;

PROVIDER_AUTH.seedDemo();
