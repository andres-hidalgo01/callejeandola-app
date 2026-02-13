# Callejeando — Static UI v2 (Aprobación)

Esta carpeta contiene una **versión estática (front-end only)** de Callejeando para:
- aprobar UI/UX
- validar navegación/flujo
- y después migrar a backend + API sin rehacer diseño.

> Nota: La versión actual del sitio tiene secciones About/Spots/Events/FAQs/Contact. Esta v2 conserva esos anclajes para migración simple. 

---

## 📦 Estructura

- `index.html`  → layout + secciones + componentes
- `global.css`  → design system base (tokens, botones, cards, chips, tabs, modal, toast)
- `app.js`      → interacción: tabs, filtros, búsqueda, favoritos (localStorage), modal, toast

---

## ▶️ Cómo correrlo (rápido)

### Opción A — Abrir directo
1. Abre `index.html` en tu navegador.

### Opción B — Servidor local (recomendado)
Con Node:
```bash
npx serve .