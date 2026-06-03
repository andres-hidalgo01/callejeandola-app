let toastTimer = null;

export function showToast(message, options = {}) {
    const toast = document.getElementById("toast");

    if (!toast) {
        console.log(message);
        return;
    }

    const duration = options.duration || 2500;

    toast.textContent = message;
    toast.hidden = false;
    toast.classList.add("is-active");

    window.clearTimeout(toastTimer);

    toastTimer = window.setTimeout(() => {
        toast.classList.remove("is-active");
        toast.hidden = true;
    }, duration);
}