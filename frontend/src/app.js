const app = document.getElementById("app");

const routes = [
  { path: "/", file: "/pages/home.html", data:"home"},
  { path: "/depot", file: "/pages/depot.html", data:"depot" },
  { path: "/concours", file: "/pages/concours.html", data:"concours" },
  { path: "/concours/:id", file: "/pages/concours-detail.html", data:"concours" },
  { path: "/dessins", file: "/pages/dessins.html", data:"dessins" },
  { path: "/dessin/:id", file: "/pages/dessin-view.html", data:"dessins" },
  // { path: "/result", file: "/pages/result.html", data:"result" },
  { path: "/statistique", file: "/pages/statistique.html", data:"statistique" },
  { path: "/administration", file: "/pages/administration.html", data:"administration" },
  { path: "/clubs", file: "/pages/clubs.html", data:"clubs" },
  { path: "/club/:id", file: "/pages/club.html", data:"clubs" },
  { path: "/login", file: "/pages/login.html" },
  { path: "/profil", file: "/pages/profil.html" },
];

const notFoundRoute = { file: "/pages/error/404.html" };
const ROUTE_STYLE_ATTR = "data-route-style";
const loadedScripts = new Set();

var currentDataRoute = "";

function normalizePath(pathname) {
  if (!pathname) return "/";
  const stripped = pathname.replace(/\/+$/, "");
  return stripped === "" ? "/" : stripped;
}

function resolvePath(basePath, relativePath) {
  if (!relativePath || relativePath.startsWith("/") || /^(http|https):\/\//.test(relativePath)) {
    return relativePath;
  }
  
  const stack = basePath.split("/");
  // Remove filename from base path to get directory
  stack.pop();
  
  const parts = relativePath.split("/");
  for (const part of parts) {
    if (part === ".") continue;
    if (part === "..") {
      if (stack.length > 0) stack.pop();
    } else {
      stack.push(part);
    }
  }
  return stack.join("/") || "/";
}

function matchRoute(pathname) {
  const normalizedPath = normalizePath(pathname);
  for (const route of routes) {
    const routePath = normalizePath(route.path);
    if (!routePath.includes(":")) {
      if (routePath === normalizedPath) {
        return { route, params: {} };
      }
      continue;
    }

    const paramNames = [];
    const regexPath = routePath.replace(/:[^/]+/g, (match) => {
      paramNames.push(match.slice(1));
      return "([^/]+)";
    });
    const regex = new RegExp(`^${regexPath}$`);
    const match = normalizedPath.match(regex);
    if (!match) continue;

    const params = {};
    paramNames.forEach((name, index) => {
      params[name] = decodeURIComponent(match[index + 1]);
    });
    return { route, params };
  }
  return null;
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

function parsePage(html, sourcePath = "/") {
  const doc = new DOMParser().parseFromString(html, "text/html");
  const title = doc.querySelector("title")?.textContent?.trim();
  
  const styles = uniqueList(
    Array.from(doc.querySelectorAll('link[rel="stylesheet"][href]')).map(
      (link) => resolvePath(sourcePath, link.getAttribute("href"))
    )
  );

  const scripts = Array.from(doc.querySelectorAll("script")).map((script) => ({
    src: script.getAttribute("src") ? resolvePath(sourcePath, script.getAttribute("src")) : null,
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

function dispatchRouteChange(pathname, params = {}) {
  const event = new CustomEvent("route-change", {
    detail: {
      route: currentDataRoute,
      path: pathname,
      params,
    },
  });
  document.dispatchEvent(event);
}

async function render() {
  const pathname = normalizePath(window.location.pathname);
  const match = matchRoute(pathname);
  let activeRoute = match ? match.route : notFoundRoute;
  const params = match ? match.params : {};
  currentDataRoute = activeRoute.data || "";
  let html = "";

  try {
    html = await loadHtml(activeRoute.file);
  } catch {
    activeRoute = notFoundRoute;
    html = await loadHtml(notFoundRoute.file);
  }

  const { body, styles, scripts, title } = parsePage(html, activeRoute.file);
  if (title) document.title = title;
  app.innerHTML = body;
  syncStyles(styles);
  await loadScripts(scripts);

  // Get element by atribute data-nav-* and add class active
  document.querySelectorAll("a[data-link]").forEach((a) => {
    a.classList.remove("active");
    const navAttr = `data-nav-${currentDataRoute}`;
    if (a.hasAttribute(navAttr)) {
      a.classList.add("active");
    }
  });

  dispatchRouteChange(pathname, params);
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
