const app = document.getElementById("app");

const routes = [
  { path: "/", file: "/pages/home.html" },
  { path: "/depot", file: "/pages/depot.html" },
  { path: "/concours", file: "/pages/concours.html" },
  { path: "/result", file: "/pages/result.html" },
  { path: "/statistique", file: "/pages/statistique.html" },

  { path: "/login", file: "/pages/login.html" },
];

const notFoundRoute = { file: "/pages/error/404.html" };
const ROUTE_STYLE_ATTR = "data-route-style";
const loadedScripts = new Set();

function matchRoute(pathname) {
  return routes.find(r => r.path === pathname);
}

async function loadHtml(file) {
  const res = await fetch(file, { cache: "no-cache" });
  if (!res.ok) throw new Error("Page not found");
  return await res.text();
}

function uniqueList(items = []) {
  const result = [];
  const seen = new Set();
  items.forEach((item) => {
    if (!item || seen.has(item)) return;
    seen.add(item);
    result.push(item);
  });
  return result;
}

function parsePage(html) {
  const doc = new DOMParser().parseFromString(html, "text/html");
  const title = doc.querySelector("title")?.textContent?.trim();
  const styles = uniqueList(
    Array.from(doc.querySelectorAll('link[rel="stylesheet"][href]')).map(
      (link) => link.getAttribute("href")
    )
  );
  const scripts = Array.from(doc.querySelectorAll("script")).map((script) => ({
    src: script.getAttribute("src"),
    type: script.getAttribute("type"),
    text: script.textContent || "",
  }));

  doc.querySelectorAll("script").forEach((script) => script.remove());
  doc
    .querySelectorAll('link[rel="stylesheet"]')
    .forEach((link) => link.remove());

  return {
    body: doc.body ? doc.body.innerHTML : html,
    styles,
    scripts,
    title,
  };
}

function syncStyles(styles = []) {
  const normalized = uniqueList(styles);
  const keep = new Set(normalized);

  document
    .querySelectorAll(`link[rel="stylesheet"][${ROUTE_STYLE_ATTR}]`)
    .forEach((link) => {
      const href = link.getAttribute("href");
      if (!keep.has(href)) {
        link.remove();
        return;
      }
      keep.delete(href);
    });

  normalized.forEach((href) => {
    if (!keep.has(href)) return;
    const link = document.createElement("link");
    link.rel = "stylesheet";
    link.href = href;
    link.setAttribute(ROUTE_STYLE_ATTR, "true");
    document.head.appendChild(link);
  });
}

function loadScripts(scripts = []) {
  return scripts.reduce((promise, script) => {
    return promise.then(() => {
      if (script.src) {
        if (loadedScripts.has(script.src)) return Promise.resolve();
        return new Promise((resolve, reject) => {
          const el = document.createElement("script");
          if (script.type) el.type = script.type;
          el.src = script.src;
          el.dataset.routeScript = "true";
          el.onload = () => {
            loadedScripts.add(script.src);
            resolve();
          };
          el.onerror = () =>
            reject(new Error(`Failed to load script: ${script.src}`));
          document.body.appendChild(el);
        });
      }

      const inline = script.text.trim();
      if (!inline) return Promise.resolve();
      const el = document.createElement("script");
      if (script.type) el.type = script.type;
      el.textContent = inline;
      el.dataset.routeScript = "inline";
      document.body.appendChild(el);
      el.remove();
      return Promise.resolve();
    });
  }, Promise.resolve());
}

async function render() {
  const pathname = window.location.pathname;
  let activeRoute = matchRoute(pathname) || notFoundRoute;
  let html = "";

  try {
    html = await loadHtml(activeRoute.file);
  } catch {
    activeRoute = notFoundRoute;
    html = await loadHtml(notFoundRoute.file);
  }

  const { body, styles, scripts, title } = parsePage(html);
  if (title) document.title = title;
  app.innerHTML = body;
  syncStyles(styles);
  await loadScripts(scripts);
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
