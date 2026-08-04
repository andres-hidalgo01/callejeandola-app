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

/* =========================================
   PROFILE — USER MESSAGES   
========================================= */

function profileMessage(message, type = "info") {
    if (typeof globalThis.showAppMessage === "function") {
        globalThis.showAppMessage(message, type);
        return;
    }

    if (typeof globalThis.toast === "function") {
        globalThis.toast(message, type);
        return;
    }

    console[type === "error" ? "error" : "log"](message);
}

export function initProfileView() {
    bindProfileActions();
    bindCostaRicaPhoneMask();
    bootstrapProfileSession();
}

function formatCostaRicaPhone(value) {
    const digits = String(value || "")
        .replace(/\D/g, "")
        .replace(/^506/, "")
        .slice(0, 8);

    if (!digits) return "";

    if (digits.length <= 4) {
        return `+(506) ${digits}`;
    }

    if (digits.length <= 6) {
        return `+(506) ${digits.slice(0, 4)}-${digits.slice(4)}`;
    }

    return `+(506) ${digits.slice(0, 4)}-${digits.slice(4, 6)}-${digits.slice(6, 8)}`;
}

function bindCostaRicaPhoneMask() {
    [
        "profileRegisterPhone",
        "profilePhone",
    ].forEach((id) => {
        const input = document.getElementById(id);

        if (!input) return;

        input.addEventListener("input", () => {
            input.value = formatCostaRicaPhone(input.value);
        });
    });
}

function validateProfilePassword(password) {
    if (password.length < 8) {
        return "El password debe tener mínimo 8 caracteres.";
    }

    if (!/[A-Z]/.test(password)) {
        return "El password debe incluir al menos una mayúscula.";
    }

    if (!/[a-z]/.test(password)) {
        return "El password debe incluir al menos una minúscula.";
    }

    if (!/\d/.test(password)) {
        return "El password debe incluir al menos un número.";
    }

    return "";
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

function getPendingSkaterProfile(email) {
    try {
        const raw = localStorage.getItem(
            `cj_skater_profile_pending_${email}`
        );

        return raw ? JSON.parse(raw) : null;
    } catch {
        return null;
    }
}

function mergePendingProfile(email) {
    const pendingProfile = getPendingSkaterProfile(email);

    if (!pendingProfile) return;

    currentProfile = {
        ...(currentProfile || {}),
        fullName:
            currentProfile?.fullName ||
            pendingProfile.fullName ||
            currentUser?.name ||
            "",
        displayName:
            currentProfile?.displayName ||
            pendingProfile.fullName ||
            currentUser?.name ||
            "",
        email:
            currentProfile?.email ||
            pendingProfile.email ||
            currentUser?.email ||
            email,
        country:
            currentProfile?.country ||
            pendingProfile.country ||
            "Costa Rica",
        phone:
            currentProfile?.phone ||
            pendingProfile.phone ||
            "",
        stance:
            currentProfile?.stance ||
            pendingProfile.stance ||
            "",
    };
}

async function handleProfileLogin() {
    try {
        const email = getValue("profileLoginEmail");
        const password = getValue("profileLoginPassword");

        if (!email || !password) {
            profileMessage("Correo o contraseña incorrectos.Revisá  e intentá de nuevo.");
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

        try {
            const raw = localStorage.getItem(
                `cj_skater_profile_pending_${currentUser?.email || email}`
            );

            if (raw) {
                const pending = JSON.parse(raw);

                currentProfile = {
                    ...(currentProfile || {}),
                    fullName: pending.fullName || currentProfile?.displayName || currentUser?.name || "",
                    displayName: pending.fullName || currentProfile?.displayName || currentUser?.name || "",
                    email: pending.email || currentUser?.email || email,
                    country: "Costa Rica",
                    phone: pending.phone || "",
                    stance: pending.stance || "",
                };
            }
        } catch (error) {
            console.warn("Pending profile load error:", error);
        }


        mergePendingProfile(currentUser?.email || email);
        showUserProfile();
        renderUserMeta();
        renderProfileForm();
        renderEmailVerificationState(currentUser);
        notifySessionChanged();
    } catch (error) {
        console.error("Profile login error:", error);
        profileMessage(error.message || "Error iniciando sesión");
    }
}

async function handleProfileRegister() {
    try {
        const name = getValue("profileRegisterName");
        const email = getValue("profileRegisterEmail");
        const password = getValue("profileRegisterPassword");
        const country = getValue("profileRegisterCountry") || "Costa Rica";
        const phone = getValue("profileRegisterPhone");
        const stance = getValue("profileRegisterStance");

        if (!name || !email || !password) {
            profileMessage(
                "Nombre completo, correo y password son obligatorios.",
                "error"
            );
            return;
        }

        if (!phone) {
            profileMessage(
                "Agregá tu celular para completar el registro.",
                "error"
            );
            return;
        }

        if (!stance) {
            profileMessage(
                "Seleccioná tu stance: Regular o Goofy.",
                "error"
            );
            return;
        }

        const passwordError = validateProfilePassword(password);

        if (passwordError) {
            profileMessage(passwordError, "error");
            return;
        }


        await register({
            name,
            email,
            password,
            country,
        });

        localStorage.setItem(
            `cj_skater_profile_pending_${email}`,
            JSON.stringify({
                fullName: name,
                email,
                country,
                phone,
                stance,
                termsAccepted: true,
                createdAt: new Date().toISOString(),
            })
        );

        currentUser = null;
        currentProfile = null;

        if (typeof clearSession === "function") {
            clearSession();
        }

        const loginForm = document.getElementById("profileLoginForm");
        const registerForm = document.getElementById("profileRegisterForm");
        const loginEmail = document.getElementById("profileLoginEmail");
        const loginPassword = document.getElementById("profileLoginPassword");
        const btnShowLogin = document.getElementById("btnShowLogin");
        const btnShowRegister = document.getElementById("btnShowRegister");

        if (registerForm) {
            registerForm.hidden = true;
        }

        if (loginForm) {
            loginForm.hidden = false;
        }

        if (loginEmail) {
            loginEmail.value = email;
        }

        if (loginPassword) {
            loginPassword.value = "";
        }

        [
            "profileRegisterName",
            "profileRegisterPhone",
            "profileRegisterEmail",
            "profileRegisterPassword",
            "profileRegisterStance",
        ].forEach((id) => {
            const field = document.getElementById(id);

            if (field) {
                field.value = "";
            }
        });

        const registerCountry =
            document.getElementById("profileRegisterCountry");

        if (registerCountry) {
            registerCountry.value = "Costa Rica";
        }

        btnShowLogin?.classList.add("is-active");
        btnShowRegister?.classList.remove("is-active");

        profileMessage(
            "Cuenta creada. Revisá tu correo para verificarla antes de iniciar sesión.",
            "success"
        );
    } catch (error) {
        console.error("Profile register error:", error);

        profileMessage(
            error.message || "No se pudo crear la cuenta.",
            "error"
        );
    }
}

async function handleProfileSave() {
    try {
        const fullName = getValue("profileFullName");
        const phone = getValue("profilePhone");
        const stance = getValue("profileStance");
        const email =
            getValue("profileEmailReadonly") ||
            currentUser?.email ||
            "";

        const payload = {
            displayName: fullName,
            stance,
            avatar: "",
        };

        const result = await updateMyProfile(payload);

        currentProfile = {
            ...(result.data || {}),
            fullName,
            displayName: fullName,
            email,
            country: "Costa Rica",
            phone,
            stance,
        };

        localStorage.setItem(
            `cj_skater_profile_pending_${email}`,
            JSON.stringify({
                fullName,
                email,
                country: "Costa Rica",
                phone,
                stance,
                updatedAt: new Date().toISOString(),
            })
        );

        renderUserMeta();
        renderProfileForm();

        profileMessage("Perfil guardado correctamente.", "success");
    } catch (error) {
        console.error("Profile save error:", error);
        profileMessage(
            error.message || "Error guardando perfil.",
            "error"
        );
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
    const email =
        currentProfile?.email ||
        currentUser?.email ||
        "";

    const fullName =
        currentProfile?.fullName ||
        currentProfile?.displayName ||
        currentUser?.name ||
        "";

    setValue("profileFullName", fullName);
    setValue("profileCountry", "Costa Rica");
    setValue("profilePhone", currentProfile?.phone || "");
    setValue("profileEmailReadonly", email);
    setValue("profileStance", currentProfile?.stance || "");
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
            profileMessage("Ingresá el código de verificación");
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

        profileMessage("Email verificado correctamente");
        notifySessionChanged();
    } catch (error) {
        console.error("Verify email error:", error);
        profileMessage(error.message || "No se pudo verificar el email");
    }
}

async function handleResendEmailCode() {
    try {
        const email = currentUser?.email;

        if (!email) {
            profileMessage("No hay email de usuario activo");
            return;
        }

        await resendVerificationCode({ email });

        profileMessage("Código reenviado. Revisá la consola local.");
    } catch (error) {
        console.error("Resend verification code error:", error);
        profileMessage(error.message || "No se pudo reenviar el código");
    }
}