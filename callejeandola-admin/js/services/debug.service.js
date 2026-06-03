let lastClickInfo = null;

export function initDebugService() {
    console.info("[DEBUG] Admin debug service activo");

    window.addEventListener("beforeunload", () => {
        console.warn("[DEBUG] La página está recargando o navegando.", {
            lastClickInfo,
            currentUrl: window.location.href,
            timestamp: new Date().toISOString(),
        });
    });

    document.addEventListener(
        "submit",
        (event) => {
            console.warn("[DEBUG] Submit nativo detectado:", {
                target: event.target,
                id: event.target?.id,
                className: event.target?.className,
            });
        },
        true
    );

    document.addEventListener(
        "click",
        (event) => {
            const button = event.target.closest?.("button");

            if (!button) return;

            lastClickInfo = {
                text: button.textContent.trim(),
                type: button.type,
                id: button.id,
                dataset: { ...button.dataset },
                timestamp: new Date().toISOString(),
            };

            console.log("[DEBUG] Button click:", lastClickInfo);
        },
        true
    );
}