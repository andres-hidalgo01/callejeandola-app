document.addEventListener("DOMContentLoaded", () => {
  const navToggle = document.getElementById("navToggle");
  const mobileMenu = document.getElementById("mobileMenu");
  const mobileOverlay = document.getElementById("mobileOverlay");
  const closeMobileMenu = document.getElementById("closeMobileMenu");

  // abrir menu
  navToggle.addEventListener("click", () => {
    mobileMenu.classList.add("open");
    mobileOverlay.classList.add("show");
    document.body.classList.add("menu-open"); // ✅
  });

  // cerrar menu
  function closeMenu() {
    mobileMenu.classList.remove("open");
    mobileOverlay.classList.remove("show");
    document.body.classList.remove("menu-open"); // ✅
  }

  closeMobileMenu.addEventListener("click", closeMenu);
  mobileOverlay.addEventListener("click", closeMenu);

  // Idioma menú móvil
  const mobileLangTrigger = document.getElementById("mobileLangTrigger");
  const mobileLangDropdown = document.getElementById("mobileLangDropdown");

  mobileLangTrigger.addEventListener("click", () => {
    mobileLangDropdown.classList.toggle("show");
  });
});

// Topbar sólida al scroll
const topbar = document.querySelector(".topbar");

window.addEventListener("scroll", () => {
  if (!topbar) return;
  topbar.classList.toggle("is-solid", window.scrollY > 40);
});


// ===== Sponsor marquee: clonar track para loop infinito sin duplicar HTML =====
document.addEventListener("DOMContentLoaded", () => {
  document.querySelectorAll("[data-sponsor-track]").forEach(track => {
    if (track.dataset.cloned === "1") return;
    const clone = track.cloneNode(true);
    clone.setAttribute("aria-hidden", "true");
    track.parentElement.appendChild(clone);
    track.dataset.cloned = "1";
  });
});


const track = document.getElementById("sponsorTrack");

if (track) {
  const items = track.innerHTML;
  track.innerHTML += items; // duplica automáticamente
}


