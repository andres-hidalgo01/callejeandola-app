export function initDebugService() {
    window.addEventListener("beforeunload", () => {
        console.warn("[DEBUG] La página está recargando o navegando.");
    });

    document.addEventListener(
        "submit",
        (event) => {
            console.warn("[DEBUG] Submit nativo detectado:", event.target);
        },
        true
    );

    document.addEventListener(
        "click",
        (event) => {
            const target = event.target;

            if (target?.matches?.("button")) {
                console.log("[DEBUG] Button click:", {
                    text: target.textContent.trim(),
                    type: target.type,
                    id: target.id,
                    dataset: { ...target.dataset },
                });
            }
        },
        true
    );
}