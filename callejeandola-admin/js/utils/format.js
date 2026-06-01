export function formatDate(value) {
    if (!value) return "—";

    const date = new Date(value);

    if (Number.isNaN(date.getTime())) {
        return "—";
    }

    return date.toLocaleDateString("es-CR", {
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
    });
}

export function formatDateTimeLocal(value) {
    if (!value) return "";

    const date = new Date(value);

    if (Number.isNaN(date.getTime())) {
        return "";
    }

    const offset = date.getTimezoneOffset();
    const localDate = new Date(date.getTime() - offset * 60000);

    return localDate.toISOString().slice(0, 16);
}