const TOKEN_KEY = "cj_admin_token";
const USER_KEY = "cj_admin_user";

export function getAuthToken() {
    return localStorage.getItem(TOKEN_KEY);
}

export function setSession(token, user) {
    localStorage.setItem(TOKEN_KEY, token);
    localStorage.setItem(USER_KEY, JSON.stringify(user));
}

export function getStoredUser() {
    const rawUser = localStorage.getItem(USER_KEY);

    if (!rawUser) return null;

    try {
        return JSON.parse(rawUser);
    } catch {
        return null;
    }
}

export function clearSession() {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
}

export function hasSession() {
    return Boolean(getAuthToken());
}