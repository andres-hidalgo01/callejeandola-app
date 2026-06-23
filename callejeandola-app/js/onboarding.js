const ONBOARDING_KEY = "cj_onboarding_completed";

const steps = [
    {
        title: "Bienvenido a Callejeandola",
        eyebrow: "Inicio",
        text: "Encontrá spots, eventos y skateshops desde el teléfono.",
        targetSelectors: [".appbar", "header"],
        position: "bottom",
        spotlight: false,
    },
    {
        title: "Explorá spots",
        eyebrow: "Spots",
        text: "Aquí ves spots cercanos, fotos, detalles, favoritos y ubicación para ir a patinar.",
        targetSelectors: ["#tourTabSpots", '[data-tab="spots"]'],
        position: "top",
    },
    {
        title: "Buscá ruta",
        eyebrow: "Route",
        text: "El botón central abre el mapa de Callejeandola. Al elegir un spot, queda como ruta activa.",
        targetSelectors: ["#tourTabRoute", "#btnRouteHub", ".route-hub"],
        position: "top",
    },
    {
        title: "Eventos",
        eyebrow: "Competencias",
        text: "Aquí vas a ver jams, competencias y actividades. Luego entra el registro de competidores.",
        targetSelectors: ["#tourTabEvents", '[data-tab="events"]'],
        position: "top",
    },
    {
        title: "Skateshops",
        eyebrow: "Comunidad",
        text: "Aquí aparecen tiendas, marcas, sponsors y puntos importantes de la escena.",
        targetSelectors: ["#tourTabShops", '[data-tab="shops"]'],
        position: "top",
    },
    {
        title: "Tu perfil",
        eyebrow: "Skater",
        text: "Registrate, verificá tu email, guardá favoritos y completá tus datos.",
        targetSelectors: ["#tourTabProfile", '[data-tab="profile"]'],
        position: "top",
    },
    {
        title: "Listo para patinar",
        eyebrow: "Go Skateboarding",
        text: "Buscá un spot, abrí detalle, tocá Route y guardalo como favorito.",
        targetSelectors: ["#tourTabRoute", "#btnRouteHub", ".route-hub"],
        position: "top",
    },
];

let currentStep = 0;
let overlay = null;
let spotlight = null;
let card = null;
let resizeObserver = null;

function $(selector) {
    return document.querySelector(selector);
}

function createEl(tag, className, text = "") {
    const el = document.createElement(tag);

    if (className) el.className = className;
    if (text) el.textContent = text;

    return el;
}

function findTarget(step) {
    for (const selector of step.targetSelectors || []) {
        const el = $(selector);

        if (!el) continue;

        const rect = el.getBoundingClientRect();

        if (rect.width > 0 && rect.height > 0) {
            return el;
        }
    }

    return document.body;
}

function getTargetRect(target) {
    if (!target || target === document.body) {
        return {
            top: 90,
            left: 18,
            width: Math.min(window.innerWidth - 36, 420),
            height: 96,
        };
    }

    const rect = target.getBoundingClientRect();
    const isBottomNavTarget = Boolean(target.closest?.(".bottom-nav"));

    if (isBottomNavTarget) {
        const isRoute =
            target.id === "tourTabRoute" ||
            target.id === "btnRouteHub" ||
            target.classList.contains("route-hub");

        const size = isRoute ? 72 : 64;

        return {
            top: Math.max(10, rect.top + rect.height / 2 - size / 2),
            left: Math.max(10, rect.left + rect.width / 2 - size / 2),
            width: size,
            height: size,
        };
    }

    const padding = 6;

    return {
        top: Math.max(10, rect.top - padding),
        left: Math.max(10, rect.left - padding),
        width: Math.min(window.innerWidth - 20, rect.width + padding * 2),
        height: Math.min(window.innerHeight - 20, rect.height + padding * 2),
    };
}

function setSpotlight(rect) {
    if (!spotlight) return;

    spotlight.style.top = `${rect.top}px`;
    spotlight.style.left = `${rect.left}px`;
    spotlight.style.width = `${rect.width}px`;
    spotlight.style.height = `${rect.height}px`;
}

function getCardPosition(rect, step) {
    const cardWidth = Math.min(window.innerWidth - 32, 360);
    const gap = 14;

    let top;

    if (step.position === "top") {
        top = rect.top - 220 - gap;
    } else {
        top = rect.top + rect.height + gap;
    }

    if (top < 16) {
        top = rect.top + rect.height + gap;
    }

    if (top + 220 > window.innerHeight - 16) {
        top = Math.max(16, window.innerHeight - 236);
    }

    const left = Math.min(
        Math.max(16, rect.left + rect.width / 2 - cardWidth / 2),
        window.innerWidth - cardWidth - 16
    );

    return {
        top,
        left,
        width: cardWidth,
    };
}

function setCardPosition(rect, step) {
    if (!card) return;

    const position = getCardPosition(rect, step);

    card.style.top = `${position.top}px`;
    card.style.left = `${position.left}px`;
    card.style.width = `${position.width}px`;
}

function renderStep() {
    if (!overlay || !spotlight || !card) return;

    const step = steps[currentStep];
    const target = findTarget(step);

    target.scrollIntoView({
        behavior: "smooth",
        block: "center",
        inline: "center",
    });

    setTimeout(() => {
        const rect = getTargetRect(target);

        if (step.spotlight === false) {
            spotlight.hidden = true;

            setCardPosition(
                {
                    top: 140,
                    left: 16,
                    width: Math.min(window.innerWidth - 32, 360),
                    height: 120,
                },
                step
            );
        } else {
            spotlight.hidden = false;
            setSpotlight(rect);
            setCardPosition(rect, step);
        }

        const progress = Math.round(((currentStep + 1) / steps.length) * 100);

        card.innerHTML = `
            <div class="tour-card__top">
                <span class="tour-card__eyebrow">${step.eyebrow}</span>
                <span class="tour-card__count">${currentStep + 1}/${steps.length}</span>
            </div>

            <h2>${step.title}</h2>
            <p>${step.text}</p>

            <div class="tour-progress" aria-hidden="true">
                <span style="width: ${progress}%"></span>
            </div>

            <div class="tour-actions">
                <button class="tour-btn tour-btn--ghost" type="button" data-tour-skip>
                    Saltar
                </button>

                <div class="tour-actions__right">
                    <button class="tour-btn tour-btn--soft" type="button" data-tour-prev ${currentStep === 0 ? "disabled" : ""}>
                        Atrás
                    </button>

                    <button class="tour-btn tour-btn--primary" type="button" data-tour-next>
                        ${currentStep === steps.length - 1 ? "Finalizar" : "Siguiente"}
                    </button>
                </div>
            </div>
        `;

        card.querySelector("[data-tour-skip]")?.addEventListener("click", completeTour);
        card.querySelector("[data-tour-prev]")?.addEventListener("click", previousStep);
        card.querySelector("[data-tour-next]")?.addEventListener("click", nextStep);
    }, 180);
}

function nextStep() {
    if (currentStep >= steps.length - 1) {
        completeTour();
        return;
    }

    currentStep += 1;
    renderStep();
}

function previousStep() {
    if (currentStep <= 0) return;

    currentStep -= 1;
    renderStep();
}

function completeTour() {
    localStorage.setItem(ONBOARDING_KEY, "true");
    closeTour();
}

function closeTour() {
    document.body.classList.remove("tour-active");

    if (resizeObserver) {
        resizeObserver.disconnect();
        resizeObserver = null;
    }

    overlay?.remove();
    overlay = null;
    spotlight = null;
    card = null;

    window.removeEventListener("keydown", handleKeys);
    window.removeEventListener("resize", renderStep);
    window.removeEventListener("scroll", renderStep, true);
}

function handleKeys(event) {
    if (!overlay) return;

    if (event.key === "Escape") {
        closeTour();
    }

    if (event.key === "ArrowRight") {
        nextStep();
    }

    if (event.key === "ArrowLeft") {
        previousStep();
    }
}

export function startOnboarding(force = false) {
    if (!force && localStorage.getItem(ONBOARDING_KEY) === "true") return;

    closeTour();

    currentStep = 0;

    overlay = createEl("div", "tour-overlay");
    spotlight = createEl("div", "tour-spotlight");
    card = createEl("section", "tour-card");

    overlay.setAttribute("aria-hidden", "true");
    card.setAttribute("role", "dialog");
    card.setAttribute("aria-label", "Tutorial Callejeandola");

    overlay.appendChild(spotlight);
    overlay.appendChild(card);

    document.body.appendChild(overlay);
    document.body.classList.add("tour-active");

    window.addEventListener("keydown", handleKeys);
    window.addEventListener("resize", renderStep);
    window.addEventListener("scroll", renderStep, true);

    renderStep();
}

function createHelpButton() {
    if ($("#btnOnboardingHelp")) return;

    const button = createEl("button", "tour-help-btn");
    button.id = "btnOnboardingHelp";
    button.type = "button";
    button.setAttribute("aria-label", "Abrir tutorial");
    button.title = "Tutorial";
    button.innerHTML = `
        <span>?</span>
    `;

    button.addEventListener("click", () => {
        startOnboarding(true);
    });

    document.body.appendChild(button);
}

function bootOnboarding() {
    createHelpButton();

    const shouldAutoStart = localStorage.getItem(ONBOARDING_KEY) !== "true";

    if (shouldAutoStart) {
        setTimeout(() => {
            startOnboarding(false);
        }, 1000);
    }

    window.startCallejeandolaTour = () => startOnboarding(true);
}

if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", bootOnboarding);
} else {
    bootOnboarding();
}