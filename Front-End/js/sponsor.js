import { getSponsors } from "./api.js";

async function loadSponsors() {
  const sponsors = await getSponsors();

  const track = document.querySelector(".sponsor-track");

  track.innerHTML = sponsors
    .map(
      (sponsor) => `
      <a href="#" class="img-link">
        <img src="${sponsor.logo}" alt="${sponsor.name}">
      </a>
    `
    )
    .join("");
}

loadSponsors();