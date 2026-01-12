const app = document.getElementById("app");

const routes = [
  { path: "/", file: "/pages/home.html" },
  { path: "/depot", file: "/pages/depot.html" },
  { path: "/concours", file: "/pages/concours.html" },
  { path: "/result", file: "/pages/result.html" },
  { path: "/statistique", file: "/pages/statistique.html" },

  { path: "/login", file: "/pages/login.html" },
  
];

function matchRoute(pathname) {
  return routes.find(r => r.path === pathname);
}

async function loadHtml(file) {
  const res = await fetch(file, { cache: "no-cache" });
  if (!res.ok) throw new Error("Page not found");
  return await res.text();
}

async function render() {
  const pathname = window.location.pathname;
  const route = matchRoute(pathname);

  try {
    const html = await loadHtml(route ? route.file : "/pages/error/404.html");
    app.innerHTML = html;
  } catch {
    app.innerHTML = await loadHtml("/pages/error/404.html");
  }
}

// navigation “comme React Router” : empêche le reload
document.addEventListener("click", (e) => {
  const a = e.target.closest("a[data-link]");
  if (!a) return;

  // liens externes / new tab : on laisse faire
  if (a.target === "_blank" || a.hasAttribute("download")) return;

  e.preventDefault();
  history.pushState(null, "", a.getAttribute("href"));
  render();
});

window.addEventListener("popstate", render);
render();
