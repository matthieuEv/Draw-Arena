const API_BASE = "http://localhost:8000/api";
const TOKEN_KEY = "drawarena_token";
const USER_KEY = "drawarena_user";

const authSection = document.getElementById("auth-section");
const sessionSection = document.getElementById("session-section");
const composerSection = document.getElementById("composer-section");
const loginForm = document.getElementById("login-form");
const registerForm = document.getElementById("register-form");
const postForm = document.getElementById("post-form");
const postsContainer = document.getElementById("posts");
const statusEl = document.getElementById("status");
const sessionUserEl = document.getElementById("session-user");
const logoutBtn = document.getElementById("logout-btn");
const apiIndicator = document.getElementById("api-indicator");
const apiStatusLabel = document.getElementById("api-status-label");

const state = {
  token: localStorage.getItem(TOKEN_KEY) || "",
  username: localStorage.getItem(USER_KEY) || "",
};

function setStatus(message, isError = false) {
  statusEl.textContent = message;
  statusEl.style.color = isError ? "#e05d2f" : "#1e8f7a";
}

async function checkApiHealth() {
  try {
    const response = await fetch(`${API_BASE}/health`, {
      method: "GET",
      headers: { "Content-Type": "application/json" },
    });
    
    if (response.ok) {
      apiIndicator.className = "status-indicator online";
      apiStatusLabel.textContent = "API";
    } else {
      apiIndicator.className = "status-indicator offline";
      apiStatusLabel.textContent = "API";
    }
  } catch (error) {
    apiIndicator.className = "status-indicator offline";
    apiStatusLabel.textContent = "API";
  }
}

// Vérifier le statut de l'API toutes les 5 secondes
setInterval(checkApiHealth, 5000);

function setAuthState(isAuthed) {
  authSection.classList.toggle("hidden", isAuthed);
  sessionSection.classList.toggle("hidden", !isAuthed);
  composerSection.classList.toggle("hidden", !isAuthed);
  sessionUserEl.textContent = isAuthed ? state.username : "-";
}

async function apiFetch(path, options = {}) {
  const headers = {
    "Content-Type": "application/json",
    ...(options.headers || {}),
  };

  if (state.token) {
    headers.Authorization = `Bearer ${state.token}`;
    headers["X-Auth-Token"] = state.token;
  }

  const response = await fetch(`${API_BASE}${path}`, {
    ...options,
    headers,
  });

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    const message = data.error || "Erreur API";
    throw new Error(message);
  }

  return data;
}

function renderPosts(posts) {
  postsContainer.innerHTML = "";

  if (!posts.length) {
    const empty = document.createElement("div");
    empty.className = "post";
    empty.textContent = "Aucun post pour le moment.";
    postsContainer.appendChild(empty);
    return;
  }

  posts.forEach((post) => {
    const card = document.createElement("article");
    card.className = "post";

    const title = document.createElement("h3");
    title.textContent = post.title;

    const meta = document.createElement("div");
    meta.className = "post-meta";
    const date = post.created_at
      ? new Date(post.created_at).toLocaleString("fr-FR")
      : "";
    meta.textContent = `${post.author} · ${date}`.trim();

    const body = document.createElement("p");
    body.textContent = post.body;

    card.appendChild(title);
    card.appendChild(meta);
    card.appendChild(body);

    postsContainer.appendChild(card);
  });
}

async function loadPosts() {
  const data = await apiFetch("/posts");
  renderPosts(data.posts || []);
}

function saveSession(token, username) {
  state.token = token;
  state.username = username;
  localStorage.setItem(TOKEN_KEY, token);
  localStorage.setItem(USER_KEY, username);
}

function clearSession() {
  state.token = "";
  state.username = "";
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(USER_KEY);
}

loginForm.addEventListener("submit", async (event) => {
  event.preventDefault();
  setStatus("");

  const formData = new FormData(loginForm);
  const payload = {
    username: formData.get("username"),
    password: formData.get("password"),
  };

  try {
    const data = await apiFetch("/login", {
      method: "POST",
      body: JSON.stringify(payload),
    });
    saveSession(data.token, data.username);
    setAuthState(true);
    setStatus("Connexion ok", false);
    await loadPosts();
  } catch (error) {
    setStatus(error.message, true);
  }
});

registerForm.addEventListener("submit", async (event) => {
  event.preventDefault();
  setStatus("");

  const formData = new FormData(registerForm);
  const username = (formData.get("username") || "").trim();
  const password = formData.get("password") || "";

  // Validation côté client
  if (username.length < 3 || username.length > 30) {
    setStatus("Le nom d'utilisateur doit contenir entre 3 et 30 caractères", true);
    return;
  }

  if (password.length < 6) {
    setStatus("Le mot de passe doit contenir au moins 6 caractères", true);
    return;
  }

  const payload = { username, password };

  try {
    await apiFetch("/register", {
      method: "POST",
      body: JSON.stringify(payload),
    });
    const data = await apiFetch("/login", {
      method: "POST",
      body: JSON.stringify(payload),
    });
    saveSession(data.token, data.username);
    setAuthState(true);
    setStatus("Compte cree", false);
    await loadPosts();
  } catch (error) {
    setStatus(error.message, true);
  }
});

logoutBtn.addEventListener("click", async () => {
  try {
    await apiFetch("/logout", { method: "POST" });
  } catch (error) {
    // Ignore logout errors and clear local state.
  }
  clearSession();
  setAuthState(false);
  postsContainer.innerHTML = "";
  setStatus("");
});

postForm.addEventListener("submit", async (event) => {
  event.preventDefault();
  setStatus("");

  const formData = new FormData(postForm);
  const payload = {
    title: formData.get("title"),
    body: formData.get("body"),
  };

  try {
    await apiFetch("/posts", {
      method: "POST",
      body: JSON.stringify(payload),
    });
    postForm.reset();
    await loadPosts();
    setStatus("Post ajoute", false);
  } catch (error) {
    setStatus(error.message, true);
  }
});

async function init() {
  // Vérifier le statut de l'API immédiatement
  checkApiHealth();
  
  setAuthState(false);

  if (!state.token) {
    return;
  }

  try {
    const me = await apiFetch("/me");
    saveSession(state.token, me.username);
    setAuthState(true);
    await loadPosts();
  } catch (error) {
    clearSession();
    setAuthState(false);
  }
}

init();
