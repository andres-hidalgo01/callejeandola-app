export function getValue(id) {
    return document.getElementById(id)?.value?.trim() || "";
}

export function getNumberValue(id) {
    const value = document.getElementById(id)?.value;

    if (value === "" || value === null || value === undefined) {
        return 0;
    }

    return Number(value);
}

export function getChecked(id) {
    return document.getElementById(id)?.checked || false;
}