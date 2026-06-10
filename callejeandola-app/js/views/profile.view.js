import { login, getMe } from "../api/auth.api.js";
import { getMyProfile, updateMyProfile } from "../api/profile.api.js";

import {
    setSession,
    clearSession,
    hasSession,
    getStoredUser,
} from "../services/session.service.js";

let currentUser = null;
let currentProfile = null;

export function initProfileView() {
    bindProfileActions();
    bootstrapProfileSession();
}

function bindProfileActions() {
    const btnLogin = document.getElementById("btnProfileLogin");
    const btnSave = document.getElementById("btnProfileSave");
    const btnLogout = document.getElementById("btnProfileLogout");
    const btnTogglePassword = document.getElementById("btnToggleProfilePassword");

    if (btnLogin) {
        btnLogin.onclick = async (event) => {
            event.preventDefault();
            await handleProfileLogin();
        };
    }

    if (btnSave) {
        btnSave.onclick = async (event) => {
            event.preventDefault();
            await handleProfileSave();
        };
    }

    if (btnLogout) {
        btnLogout.onclick = (event) => {
            event.preventDefault();
            handleProfileLogout();
        };
    }

    if (btnTogglePassword) {
        btnTogglePassword.onclick = (event) => {
            event.preventDefault();

            const passwordInput = document.getElementById("profileLoginPassword");

            if (!passwordInput) return;

            const isPassword = passwordInput.type === "password";

            passwordInput.type = isPassword ? "text" : "password";
            btnTogglePassword.textContent = isPassword ? "🙈" : "👁";
            btnTogglePassword.setAttribute(
                "aria-label",
                isPassword ? "Ocultar contraseña" : "Mostrar contraseña"
            );
        };
    }
}

async function bootstrapProfileSession() {
    if (!hasSession()) {
        showGuestProfile();
        return;
    }

    const storedUser = getStoredUser();

    if (storedUser) {
        currentUser = storedUser;
        renderUserMeta();
    }

    try {
        const me = await getMe();

        currentUser = me.user;

        const profileResult = await getMyProfile();

        currentProfile = profileResult.data;

        showUserProfile();
        renderUserMeta();
        renderProfileForm();
    } catch (error) {
        console.error("Profile bootstrap error:", error);
        clearSession();
        currentUser = null;
        currentProfile = null;
        showGuestProfile();
    }
}

async function handleProfileLogin() {
    try {
        const email = document.getElementById("profileLoginEmail")?.value?.trim();
        const password = document.getElementById("profileLoginPassword")?.value?.trim();

        if (!email || !password) {
            alert("Email y password son obligatorios");
            return;
        }

        const result = await login({
            email,
            password,
        });

        setSession(result.token, result.user);

        currentUser = result.user;

        const profileResult = await getMyProfile();
        currentProfile = profileResult.data;

        showUserProfile();
        renderUserMeta();
        renderProfileForm();
    } catch (error) {
        console.error("Profile login error:", error);
        alert(error.message || "Error iniciando sesión");
    }
}

async function handleProfileSave() {
    try {
        const payload = {
            displayName: getValue("profileDisplayName"),
            city: getValue("profileCity"),
            stance: getValue("profileStance"),
            level: getValue("profileLevel"),
            instagram: getValue("profileInstagram"),
            bio: getValue("profileBio"),
            avatar: "",
        };

        const result = await updateMyProfile(payload);

        currentProfile = result.data;

        renderUserMeta();
        renderProfileForm();

        alert("Perfil guardado correctamente");
    } catch (error) {
        console.error("Profile save error:", error);
        alert(error.message || "Error guardando perfil");
    }
}

function handleProfileLogout() {
    clearSession();

    currentUser = null;
    currentProfile = null;

    showGuestProfile();
}

function showGuestProfile() {
    const guestCard = document.getElementById("profileGuestCard");
    const userCard = document.getElementById("profileUserCard");

    if (guestCard) guestCard.hidden = false;
    if (userCard) userCard.hidden = true;
}

function showUserProfile() {
    const guestCard = document.getElementById("profileGuestCard");
    const userCard = document.getElementById("profileUserCard");

    if (guestCard) guestCard.hidden = true;
    if (userCard) userCard.hidden = false;
}

function renderUserMeta() {
    const name = document.getElementById("profileUserName");
    const meta = document.getElementById("profileUserMeta");
    const avatar = document.getElementById("profileAvatar");

    const displayName =
        currentProfile?.displayName ||
        currentUser?.name ||
        "Skater";

    if (name) {
        name.textContent = displayName;
    }

    if (meta) {
        meta.textContent = `${currentUser?.role || "GUEST"} · ${currentUser?.country || "Costa Rica"}`;
    }

    if (avatar) {
        avatar.textContent = getInitials(displayName);
    }
}

function renderProfileForm() {
    setValue("profileDisplayName", currentProfile?.displayName || currentUser?.name || "");
    setValue("profileCity", currentProfile?.city || "");
    setValue("profileStance", currentProfile?.stance || "");
    setValue("profileLevel", currentProfile?.level || "");
    setValue("profileInstagram", currentProfile?.instagram || "");
    setValue("profileBio", currentProfile?.bio || "");
}

function getValue(id) {
    return document.getElementById(id)?.value?.trim() || "";
}

function setValue(id, value) {
    const element = document.getElementById(id);

    if (element) {
        element.value = value || "";
    }
}

function getInitials(value) {
    return String(value || "CJ")
        .split(" ")
        .filter(Boolean)
        .slice(0, 2)
        .map((part) => part[0]?.toUpperCase())
        .join("") || "CJ";
}