import {
    register,
    login,
    getMe,
    verifyEmail,
    resendVerificationCode,
} from "../api/auth.api.js";

import { getMyProfile, updateMyProfile } from "../api/profile.api.js";

import {
    setSession,
    clearSession,
    hasSession,
    getStoredUser,
    getAuthToken,
} from "../services/session.service.js";

let currentUser = null;
let currentProfile = null;

export function initProfileView() {
    bindProfileActions();
    bootstrapProfileSession();
}

function bindProfileActions() {
    const btnLogin = document.getElementById("btnProfileLogin");
    const btnRegister = document.getElementById("btnProfileRegister");
    const btnSave = document.getElementById("btnProfileSave");
    const btnLogout = document.getElementById("btnProfileLogout");
    const btnVerifyEmail = document.getElementById("btnVerifyEmail");
    const btnResendEmailCode = document.getElementById("btnResendEmailCode");


    const btnShowLogin = document.getElementById("btnShowLogin");
    const btnShowRegister = document.getElementById("btnShowRegister");

    const btnTogglePassword = document.getElementById("btnToggleProfilePassword");
    const btnToggleRegisterPassword = document.getElementById(
        "btnToggleProfileRegisterPassword"
    );

    if (btnShowLogin) {
        btnShowLogin.onclick = () => showLoginForm();
    }

    if (btnShowRegister) {
        btnShowRegister.onclick = () => showRegisterForm();
    }

    if (btnLogin) {
        btnLogin.onclick = async (event) => {
            event.preventDefault();
            await handleProfileLogin();
        };
    }

    if (btnRegister) {
        btnRegister.onclick = async (event) => {
            event.preventDefault();
            await handleProfileRegister();
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

    if (btnVerifyEmail) {
        btnVerifyEmail.onclick = async (event) => {
            event.preventDefault();
            await handleVerifyEmailCode();
        };
    }

    if (btnResendEmailCode) {
        btnResendEmailCode.onclick = async (event) => {
            event.preventDefault();
            await handleResendEmailCode();
        };
    }

    setupPasswordToggle("profileLoginPassword", btnTogglePassword);
    setupPasswordToggle("profileRegisterPassword", btnToggleRegisterPassword);
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
        const meResult = await getMe();

        currentUser = meResult.user || meResult.data || meResult;

        const profileResult = await getMyProfile();
        currentProfile = profileResult.data || null;

        showUserProfile();
        renderUserMeta();
        renderProfileForm();
        renderEmailVerificationState(currentUser);

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
        const email = getValue("profileLoginEmail");
        const password = getValue("profileLoginPassword");

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
        currentProfile = profileResult.data || null;

        showUserProfile();
        renderUserMeta();
        renderProfileForm();
        renderEmailVerificationState(currentUser);
        notifySessionChanged();
    } catch (error) {
        console.error("Profile login error:", error);
        alert(error.message || "Error iniciando sesión");
    }
}

async function handleProfileRegister() {
    try {
        const name = getValue("profileRegisterName");
        const email = getValue("profileRegisterEmail");
        const password = getValue("profileRegisterPassword");
        const country = getValue("profileRegisterCountry") || "Costa Rica";

        if (!name || !email || !password) {
            alert("Nombre, email y password son obligatorios");
            return;
        }

        if (password.length < 6) {
            alert("El password debe tener mínimo 6 caracteres");
            return;
        }

        const result = await register({
            name,
            email,
            password,
            country,
        });

        setSession(result.token, result.user);

        currentUser = result.user;

        const profileResult = await getMyProfile();
        currentProfile = profileResult.data || null;

        showUserProfile();
        renderUserMeta();
        renderProfileForm();
        renderEmailVerificationState(currentUser);

        alert("Cuenta skater creada correctamente");
    } catch (error) {
        console.error("Profile register error:", error);
        alert(error.message || "Error creando cuenta");
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

        currentProfile = result.data || null;

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
    notifySessionChanged();
    renderEmailVerificationState(null);
}

function showGuestProfile() {
    const guestCard = document.getElementById("profileGuestCard");
    const userCard = document.getElementById("profileUserCard");

    if (guestCard) guestCard.hidden = false;
    if (userCard) userCard.hidden = true;

    showLoginForm();
}

function showUserProfile() {
    const guestCard = document.getElementById("profileGuestCard");
    const userCard = document.getElementById("profileUserCard");

    if (guestCard) guestCard.hidden = true;
    if (userCard) userCard.hidden = false;
}

function showLoginForm() {
    const loginForm = document.getElementById("profileLoginForm");
    const registerForm = document.getElementById("profileRegisterForm");
    const btnShowLogin = document.getElementById("btnShowLogin");
    const btnShowRegister = document.getElementById("btnShowRegister");

    if (loginForm) loginForm.hidden = false;
    if (registerForm) registerForm.hidden = true;

    btnShowLogin?.classList.add("is-active");
    btnShowRegister?.classList.remove("is-active");
}

function showRegisterForm() {
    const loginForm = document.getElementById("profileLoginForm");
    const registerForm = document.getElementById("profileRegisterForm");
    const btnShowLogin = document.getElementById("btnShowLogin");
    const btnShowRegister = document.getElementById("btnShowRegister");

    if (loginForm) loginForm.hidden = true;
    if (registerForm) registerForm.hidden = false;

    btnShowLogin?.classList.remove("is-active");
    btnShowRegister?.classList.add("is-active");
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
        const verifiedLabel = currentUser?.emailVerified
            ? "Email verificado"
            : "Email pendiente";

        meta.textContent = `${currentUser?.role || "SKATER"} · ${currentUser?.country || "Costa Rica"} · ${verifiedLabel}`;
    }

    if (avatar) {
        avatar.textContent = getInitials(displayName);
    }
}

function renderProfileForm() {
    setValue(
        "profileDisplayName",
        currentProfile?.displayName || currentUser?.name || ""
    );

    setValue("profileCity", currentProfile?.city || "");
    setValue("profileStance", currentProfile?.stance || "");
    setValue("profileLevel", currentProfile?.level || "");
    setValue("profileInstagram", currentProfile?.instagram || "");
    setValue("profileBio", currentProfile?.bio || "");
}

function setupPasswordToggle(inputId, button) {
    if (!button) return;

    button.innerHTML = getEyeIcon(false);
    button.setAttribute("aria-label", "Mostrar contraseña");

    button.onclick = (event) => {
        event.preventDefault();
        togglePasswordVisibility(inputId, button);
    };
}

function togglePasswordVisibility(inputId, button) {
    const passwordInput = document.getElementById(inputId);

    if (!passwordInput) return;

    const isHidden = passwordInput.type === "password";
    const shouldShowPassword = isHidden;

    passwordInput.type = shouldShowPassword ? "text" : "password";

    button.innerHTML = getEyeIcon(shouldShowPassword);
    button.setAttribute(
        "aria-label",
        shouldShowPassword ? "Ocultar contraseña" : "Mostrar contraseña"
    );
}

function getEyeIcon(isVisible) {
    if (isVisible) {
        return `
      <svg class="password-eye-icon" viewBox="0 0 24 24" aria-hidden="true">
        <path d="M3 3l18 18" />
        <path d="M10.58 10.58A2 2 0 0 0 12 14a2 2 0 0 0 1.42-.58" />
        <path d="M9.88 4.24A10.94 10.94 0 0 1 12 4c7 0 10 8 10 8a18.5 18.5 0 0 1-3.2 4.5" />
        <path d="M6.61 6.61C3.98 8.39 2 12 2 12s3 8 10 8a10.7 10.7 0 0 0 5.39-1.39" />
      </svg>
    `;
    }

    return `
    <svg class="password-eye-icon" viewBox="0 0 24 24" aria-hidden="true">
      <path d="M2 12s3-8 10-8 10 8 10 8-3 8-10 8S2 12 2 12z" />
      <circle cx="12" cy="12" r="3" />
    </svg>
  `;
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
    return (
        String(value || "CJ")
            .split(" ")
            .filter(Boolean)
            .slice(0, 2)
            .map((part) => part[0]?.toUpperCase())
            .join("") || "CJ"
    );
}

function notifySessionChanged() {
    window.dispatchEvent(
        new CustomEvent("cj:session-changed", {
            detail: {
                user: currentUser,
                profile: currentProfile,
            },
        })
    );
}

function renderEmailVerificationState(user) {
    const box = document.getElementById("emailVerifyBox");

    if (!box) return;

    box.hidden = Boolean(user?.emailVerified);
}

async function handleVerifyEmailCode() {
    try {
        const code = document.getElementById("profileEmailCode")?.value?.trim();
        const email = currentUser?.email;

        if (!email || !code) {
            alert("Ingresá el código de verificación");
            return;
        }

        const result = await verifyEmail({ email, code });

        currentUser = {
            ...currentUser,
            ...result.user,
        };

        const token = getAuthToken();

        if (token) {
            setSession(token, currentUser);
        }

        renderUserMeta();
        renderEmailVerificationState(currentUser);

        alert("Email verificado correctamente");
        notifySessionChanged();
    } catch (error) {
        console.error("Verify email error:", error);
        alert(error.message || "No se pudo verificar el email");
    }
}

async function handleResendEmailCode() {
    try {
        const email = currentUser?.email;

        if (!email) {
            alert("No hay email de usuario activo");
            return;
        }

        await resendVerificationCode({ email });

        alert("Código reenviado. Revisá la consola local.");
    } catch (error) {
        console.error("Resend verification code error:", error);
        alert(error.message || "No se pudo reenviar el código");
    }
}