const API_BASE = window.API_BASE || "http://localhost:8000/api";
const TOKEN_KEY = "drawarena_token";
const USER_KEY = "drawarena_user";

const state = {
    token: localStorage.getItem(TOKEN_KEY) || "",
    username: localStorage.getItem(USER_KEY) || "",
};

async function apiFetch(path, options = {}) {
    const isFormData = options.body instanceof FormData;
    console.log("State :", state);
    const headers = {
        ...(options.headers || {}),
    };

    if (!isFormData) {
        headers["Content-Type"] = "application/json";
    }

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
        const message = data.error || "API Error";
        throw new Error(message);
    }

    return data;
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


async function init() {
    // Check API health immediately
    checkApiHealth();

    if (!state.token) {
        return;
    }

    try {
        const me = await apiFetch("/me");
        saveSession(state.token, me.username);
        console.log(`Welcome back, ${me.username}!`);
        await loadPosts();
    } catch (error) {
        clearSession();
        console.error("Session invalid, please log in again.");
    }
}

init();



// TODO : Temporary API Health check function

async function checkApiHealth() {
    try {
        const response = await apiFetch(`/health`);

        if (response.ok) {
            console.log("API: Online");
        } else {
            console.warn("API: ERROR");
        }
    } catch (error) {
        console.warn("API: OFFLINE");
    }
}
// Check API health every 5 seconds
setInterval(checkApiHealth, 5000);