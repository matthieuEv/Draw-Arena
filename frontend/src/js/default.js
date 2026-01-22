// Userbar menu toggle functionality

var isCollapsed = true;


function closeUserbarMenus(exceptUserbar = null) {
  document.querySelectorAll(".userbar.is-open").forEach((userbar) => {
    if (userbar === exceptUserbar) return;
    userbar.classList.remove("is-open");
    const toggle = userbar.querySelector("[data-userbar-toggle]");
    if (toggle) toggle.setAttribute("aria-expanded", "false");
  });
}

document.addEventListener("click", (e) => {
  const toggle = e.target.closest("[data-userbar-toggle]");
  if (toggle) {
    const userbar = toggle.closest(".userbar");
    if (!userbar) return;
    const isOpen = !userbar.classList.contains("is-open");
    closeUserbarMenus(userbar);
    userbar.classList.toggle("is-open", isOpen);
    toggle.setAttribute("aria-expanded", isOpen ? "true" : "false");
    return;
  }

  if (e.target.closest(".userbar")) return;
  closeUserbarMenus();
});

function toggleMenu() {
  isCollapsed = !isCollapsed;
  document.querySelector("#collapseMenu").classList.toggle("collapsed", isCollapsed);
}

function logout() {
    clearSession();
    window.location.href = "/login";
}

