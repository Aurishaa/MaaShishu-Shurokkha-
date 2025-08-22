// community-post.js — Makes your "Post to Community" button work,
// shows posts, and adds visible replies (localStorage only).

(function () {
  const STORAGE_KEY = "mss_cs_posts";

  // ---------- helpers ----------
  const $ = (sel, root=document) => root.querySelector(sel);
  const esc = s => (s||"").replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const nowISO = () => new Date().toISOString();
  const initials = (t) => (t||"U").split(/\s+/).filter(Boolean).map(x=>x[0]).slice(0,2).join("").toUpperCase();

  function load(){ try { return JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]"); } catch { return []; } }
  function save(arr){ try { localStorage.setItem(STORAGE_KEY, JSON.stringify(arr)); } catch {} }

  function timeAgo(iso) {
    const s = Math.floor((Date.now() - new Date(iso).getTime())/1000);
    if (s < 60) return "just now";
    const m = Math.floor(s/60); if (m < 60) return `${m} min ago`;
    const h = Math.floor(m/60); if (h < 24) return `${h} hour${h>1?"s":""} ago`;
    const d = Math.floor(h/24); if (d < 7) return `${d} day${d>1?"s":""} ago`;
    return new Date(iso).toLocaleDateString();
  }

  // ---------- DOM ----------
  const form = document.querySelector(".ask-question-card form");
  const textarea = $("#new-post");
  const threads = $("#csThreads");

  // ---------- render ----------
  function render() {
    if (!threads) return;
    const posts = load().sort((a,b)=> (b.createdAt||"").localeCompare(a.createdAt||""));

    if (!posts.length) {
      threads.innerHTML = `
        <div class="content-card"><p class="muted">No discussions yet. Be the first to post!</p></div>
      `;
      return;
    }

    threads.innerHTML = posts.map(p => `
      <article class="post-card content-card" data-id="${p.id}">
        <div class="post-header">
          <div class="avatar avatar-mother">${initials(p.author || "You")}</div>
          <div class="post-author-info">
            <h4>${esc(p.author || "You")}</h4>
            <p>Asked ${timeAgo(p.createdAt)}</p>
          </div>
        </div>

        <div class="post-body">
          <p>${esc(p.body)}</p>
        </div>

        <div class="post-actions">
          <a href="javascript:void(0)" class="reply-toggle"><i class="fa-solid fa-comment"></i> ${p.replies?.length ? p.replies.length : 0} Replies</a>
          <a href="javascript:void(0)" class="save-toggle"><i class="fa-solid fa-bookmark"></i> ${p.saved ? "Saved" : "Save"}</a>
        </div>

        <!-- Replies -->
        <div class="post-replies" style="margin-top:10px; display:none;">
          ${(p.replies||[]).map(r => `
            <div class="reply-row" style="display:grid;grid-template-columns:auto 1fr;gap:10px;margin:10px 0">
              <div class="avatar avatar-child" style="width:32px;height:32px;border-radius:8px;display:flex;align-items:center;justify-content:center;">${initials(r.author)}</div>
              <div class="reply-content" style="background:#f8fafc;border:1px solid #e2e8f0;border-radius:10px;padding:8px 10px;">
                <div class="muted" style="font-size:12px;margin-bottom:4px;">${esc(r.author)} • ${timeAgo(r.createdAt)}</div>
                <div>${esc(r.body)}</div>
              </div>
            </div>
          `).join("")}

          <!-- Inline reply box -->
          <div class="reply-row" style="display:grid;grid-template-columns:auto 1fr;gap:10px;margin:10px 0">
            <div class="avatar avatar-child" style="width:32px;height:32px;border-radius:8px;display:flex;align-items:center;justify-content:center;">You</div>
            <div>
              <input type="text" class="reply-name" placeholder="Your name (optional)" style="width:100%;padding:8px;border:1px solid #e2e8f0;border-radius:8px;margin-bottom:6px">
              <textarea rows="2" class="reply-text" placeholder="Write a comment…" style="width:100%;padding:8px;border:1px solid #e2e8f0;border-radius:8px"></textarea>
              <div style="display:flex;gap:8px;justify-content:flex-end;margin-top:6px">
                <button class="btn btn-primary reply-submit">Reply</button>
              </div>
            </div>
          </div>
        </div>
      </article>
    `).join("");

    // Wire per-post actions
    threads.querySelectorAll(".post-card").forEach(card => {
      const id = card.getAttribute("data-id");
      const replyToggle = card.querySelector(".reply-toggle");
      const saveToggle  = card.querySelector(".save-toggle");
      const repliesWrap = card.querySelector(".post-replies");
      const replyBtn    = card.querySelector(".reply-submit");

      replyToggle?.addEventListener("click", ()=> {
        if (!repliesWrap) return;
        const isOpen = repliesWrap.style.display !== "none";
        repliesWrap.style.display = isOpen ? "none" : "block";
      });

      saveToggle?.addEventListener("click", ()=> {
        const arr = load();
        const i = arr.findIndex(x=>x.id===id);
        if (i>-1) {
          arr[i].saved = !arr[i].saved;
          save(arr);
          render();
        }
      });

      replyBtn?.addEventListener("click", ()=> {
        const nameEl = card.querySelector(".reply-name");
        const textEl = card.querySelector(".reply-text");
        const author = (nameEl?.value || "You").trim();
        const body   = (textEl?.value || "").trim();
        if (!body) return;

        const arr = load();
        const i = arr.findIndex(x=>x.id===id);
        if (i>-1) {
          arr[i].replies = arr[i].replies || [];
          arr[i].replies.push({ id: "r_"+Math.random().toString(36).slice(2), author, body, createdAt: nowISO() });
          save(arr);
          render();
        }
      });
    });
  }

  // ---------- submit (new post) ----------
  form?.addEventListener("submit", (e)=> {
    e.preventDefault();
    const body = (textarea?.value || "").trim();
    if (!body) return;

    const posts = load();
    posts.unshift({
      id: "p_"+Math.random().toString(36).slice(2),
      author: "You",
      body,
      createdAt: nowISO(),
      saved: false,
      replies: []
    });
    save(posts);

    textarea.value = "";
    render();
  });

  // ---------- boot ----------
  document.addEventListener("DOMContentLoaded", render);
  window.addEventListener("storage", (e)=>{ if (e.key === STORAGE_KEY) render(); });
})();
