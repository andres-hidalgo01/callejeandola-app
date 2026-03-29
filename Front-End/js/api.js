const API_BASE_URL = "http://localhost:4000/api";

async function apiFetch(endpoint, options = {}) {
  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    headers: {
      "Content-Type": "application/json",
      ...(options.headers || {})
    },
    ...options
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`API error ${response.status}: ${errorText}`);
  }

  return response.json();
}

// ===== Spots =====
export function getSpots() {
  return apiFetch("/spots");
}

export function getSpotById(id) {
  return apiFetch(`/spots/${id}`);
}

export function createSpot(data) {
  return apiFetch("/spots", {
    method: "POST",
    body: JSON.stringify(data)
  });
}

export function deleteSpot(id) {
  return apiFetch(`/spots/${id}`, {
    method: "DELETE"
  });
}

// ===== Events =====
export function getEvents() {
  return apiFetch("/events");
}

export function createEvent(data) {
  return apiFetch("/events", {
    method: "POST",
    body: JSON.stringify(data)
  });
}

// ===== Sponsors =====
export function getSponsors() {
  return apiFetch("/sponsors");
}

export function createSponsor(data) {
  return apiFetch("/sponsors", {
    method: "POST",
    body: JSON.stringify(data)
  });
}

// ===== Auth =====
export function registerUser(data) {
  return apiFetch("/auth/register", {
    method: "POST",
    body: JSON.stringify(data)
  });
}

export function loginUser(data) {
  return apiFetch("/auth/login", {
    method: "POST",
    body: JSON.stringify(data)
  });
}