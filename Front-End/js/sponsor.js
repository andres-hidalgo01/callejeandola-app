import { getSponsors } from "./api.js";

async function loadSponsors() {
  const track = document.getElementById("sponsorTrack");
  if (!track) return;

  try {
    const sponsors = await getSponsors();

    if (!Array.isArray(sponsors) || sponsors.length === 0) {
      track.innerHTML = "<p style='color:white;'>No sponsors available.</p>";
      return;
    }

    track.innerHTML = sponsors.map((sponsor) => `
      <a class="img-link" href="${sponsor.website || "#"}" target="_blank" rel="noopener">
        <img src="${sponsor.logo}" alt="${sponsor.name}">
      </a>
    `).join("");

    // Duplicar dinámicamente para marquee infinito
    const originalHTML = track.innerHTML;
    track.innerHTML += originalHTML;

    // Calcular distancia real para animación suave
    const distance = track.scrollWidth / 2;
    track.style.setProperty("--marquee-distance", `${distance}px`);

  } catch (error) {
    console.error("Error loading sponsors:", error);
    track.innerHTML = "<p style='color:white;'>Error loading sponsors.</p>";
  }
}

document.addEventListener("DOMContentLoaded", loadSponsors);