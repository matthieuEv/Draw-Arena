const AUTH_SELECTOR = "[data-auth]";

function initAuthPanels(root = document) {
  const authBlocks = root.querySelectorAll(AUTH_SELECTOR);
  authBlocks.forEach((auth) => {
    if (auth.dataset.authReady === "true") return;
    auth.dataset.authReady = "true";

    const toggles = Array.from(auth.querySelectorAll("[data-auth-toggle]"));
    const panels = Array.from(auth.querySelectorAll("[data-auth-panel]"));
    const primaryToggles = toggles.filter((btn) =>
      btn.classList.contains("single__toggle-btn")
    );

    if (toggles.length === 0 || panels.length === 0) return;

    const setState = (state) => {
      auth.dataset.authState = state;

      primaryToggles.forEach((btn) => {
        const isActive = btn.dataset.authToggle === state;
        btn.classList.toggle("is-active", isActive);
        btn.setAttribute("aria-pressed", isActive ? "true" : "false");
      });

      panels.forEach((panel) => {
        const isActive = panel.dataset.authPanel === state;
        panel.classList.toggle("is-active", isActive);
        panel.setAttribute("aria-hidden", isActive ? "false" : "true");
      });
    };

    let current = auth.dataset.authState || "login";
    setState(current);

    toggles.forEach((btn) => {
      btn.addEventListener("click", (event) => {
        const next = btn.dataset.authToggle;
        if (!next || next === current) return;
        event.preventDefault();
        current = next;
        setState(current);
      });
    });
  });
}

function observeAuthPanels() {
  const appRoot = document.getElementById("app");
  if (!appRoot) {
    initAuthPanels(document);
    return;
  }

  const observer = new MutationObserver(() => {
    initAuthPanels(appRoot);
  });

  observer.observe(appRoot, { childList: true, subtree: true });
  initAuthPanels(appRoot);
}

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", observeAuthPanels);
} else {
  observeAuthPanels();
}

async function login(event) {
  event.preventDefault();

  const errorMessage = document.querySelector("[data-signin-error]");
  errorMessage.textContent = "";

  const form = event.target;
  const email = form.email.value;
  const password = form.password.value;
  const remember = form["login-remember"].checked;

  if (!email || !password) {
    errorMessage.textContent = "Veuillez remplir tous les champs.";
    return;
  }

  if (!isAValidEmail(email)) {
    errorMessage.textContent = "Veuillez entrer une adresse e-mail valide.";
    return;
  }
  
  const res = await apiFetch("/auth/login", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      "login": email,
      "password": password
    }),
  });

  console.log(res);

  if (res.token) {
    // Decode token to get user info
    const payload = JSON.parse(atob(res.token.split('.')[1]));
    const userData = JSON.stringify(payload.user);

    var userJSON = JSON.stringify({
      id: payload.numUtilisateur,
      nom: payload.nom,
      prenom: payload.prenom,
      login: payload.login,
      role: res.role,
      club: res.club,
      photoProfilUrl: payload.photo_profil_url || null,
    });

    saveSession(res.token, userJSON);
    window.location.href = "/"; 
  } else {
    errorMessage.textContent = res.message || "Échec de la connexion.";
  }
}

async function signup(event){
  event.preventDefault();

  const errorMessage = document.querySelector("[data-signup-error]");
  errorMessage.textContent = "";

  const form = event.target;
  const nom = form.lastname.value;
  const prenom = form.firstname.value;
  const email = form.email.value;
  const address = form.address.value;
  const password = form.password.value;
  const confirmPassword = form.passwordConfirm.value;

  if (!nom || !prenom || !email || !address || !password || !confirmPassword) {
    errorMessage.textContent = "Veuillez remplir tous les champs.";
    return;
  }

  if (!isAValidEmail(email)) {
    errorMessage.textContent = "Veuillez entrer une adresse e-mail valide.";
    return;
  }

  if (password !== confirmPassword) {
    errorMessage.textContent = "Les mots de passe ne correspondent pas.";
    return;
  }
  
  const res = await apiFetch("/auth/register", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      "nom": nom,
      "prenom": prenom,
      "login": email,
      "password": password,
      "address": address
    }),
  });

  if (res.success) {
    saveSession(res.token, res.nom);
    window.location.href = "/login";
  } else {
    errorMessage.textContent = res.message || "Échec de la création du compte.";
  }
}

function isAValidEmail(email) {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}