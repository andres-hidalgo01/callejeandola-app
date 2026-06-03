import { escapeAttr } from "./sanitize.js";

export function setText(id, value) {
    const element = document.getElementById(id);

    if (element) {
        element.textContent = String(value);
    }
}

export function renderImage(src, alt) {
    if (!src || String(src).trim() === "") {
        return `<span class="muted">Sin imagen</span>`;
    }

    return `
    <img
      class="table-img"
      src="${escapeAttr(src)}"
      alt="${escapeAttr(alt || "Imagen")}"
      loading="lazy"
      onerror="this.outerHTML='<span class=&quot;muted&quot;>Imagen inválida</span>'"
    >
  `;
}