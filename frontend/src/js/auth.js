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
