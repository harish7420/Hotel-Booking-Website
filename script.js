/* =========================================================
   StayFinder — Hotel Search App
   Handles: API fetch, search, filters, sorting, pagination,
            and the hotel detail modal.
   ========================================================= */

const API_URL = "https://demohotelsapi.pythonanywhere.com/hotels/";
const PAGE_SIZE = 12; // hotels shown per "page" via Load More

// ---- App state ----
let allHotels = [];      // full dataset from API
let filteredHotels = []; // after search/filter/sort applied
let visibleCount = PAGE_SIZE;

// ---- DOM references ----
const hotelGrid = document.getElementById("hotelGrid");
const resultsCount = document.getElementById("resultsCount");
const noResults = document.getElementById("noResults");
const loadMoreWrap = document.getElementById("loadMoreWrap");
const loadMoreBtn = document.getElementById("loadMoreBtn");
const loadingOverlay = document.getElementById("loadingOverlay");

const searchInput = document.getElementById("searchInput");
const searchBtn = document.getElementById("searchBtn");
const locationFilter = document.getElementById("locationFilter");
const minPriceInput = document.getElementById("minPrice");
const maxPriceInput = document.getElementById("maxPrice");
const ratingFilter = document.getElementById("ratingFilter");
const sortBy = document.getElementById("sortBy");
const clearFiltersBtn = document.getElementById("clearFilters");

const modal = document.getElementById("hotelModal");
const modalBody = document.getElementById("modalBody");
const modalClose = document.getElementById("modalClose");
const modalOverlay = document.getElementById("modalOverlay");

// =========================================================
// Init
// =========================================================
init();

async function init() {
  try {
    const res = await fetch(API_URL);
    if (!res.ok) throw new Error("Network response was not OK");
    const data = await res.json();

    allHotels = Array.isArray(data.data) ? data.data : [];
    populateLocationOptions(allHotels);
    applyFilters(); // sets filteredHotels + renders
  } catch (err) {
    console.error("Failed to fetch hotels:", err);
    resultsCount.textContent = "";
    hotelGrid.innerHTML = "";
    noResults.textContent =
      "Couldn't load hotels right now. Please check your connection and refresh the page.";
    noResults.classList.remove("hidden");
  } finally {
    loadingOverlay.classList.add("hidden");
  }
}

// =========================================================
// Populate the location dropdown from live data
// =========================================================
function populateLocationOptions(hotels) {
  const locations = [...new Set(hotels.map((h) => h.location))].sort();
  locations.forEach((loc) => {
    const opt = document.createElement("option");
    opt.value = loc;
    opt.textContent = loc;
    locationFilter.appendChild(opt);
  });
}

// =========================================================
// Filtering + Sorting
// =========================================================
function applyFilters() {
  const query = searchInput.value.trim().toLowerCase();
  const location = locationFilter.value;
  const minPrice = parseFloat(minPriceInput.value) || 0;
  const maxPrice = parseFloat(maxPriceInput.value) || Infinity;
  const minRating = parseFloat(ratingFilter.value) || 0;

  filteredHotels = allHotels.filter((hotel) => {
    const price = parseFloat(hotel.price);
    const matchesQuery =
      !query ||
      hotel.name.toLowerCase().includes(query) ||
      hotel.location.toLowerCase().includes(query);
    const matchesLocation = !location || hotel.location === location;
    const matchesPrice = price >= minPrice && price <= maxPrice;
    const matchesRating = hotel.rating >= minRating;

    return matchesQuery && matchesLocation && matchesPrice && matchesRating;
  });

  sortHotels();
  visibleCount = PAGE_SIZE;
  render();
}

function sortHotels() {
  const mode = sortBy.value;

  switch (mode) {
    case "price-asc":
      filteredHotels.sort((a, b) => parseFloat(a.price) - parseFloat(b.price));
      break;
    case "price-desc":
      filteredHotels.sort((a, b) => parseFloat(b.price) - parseFloat(a.price));
      break;
    case "rating-desc":
      filteredHotels.sort((a, b) => b.rating - a.rating);
      break;
    case "name-asc":
      filteredHotels.sort((a, b) => a.name.localeCompare(b.name));
      break;
    default:
      // keep original API order
      break;
  }
}

// =========================================================
// Rendering
// =========================================================
function render() {
  const toShow = filteredHotels.slice(0, visibleCount);

  hotelGrid.innerHTML = "";

  if (filteredHotels.length === 0) {
    noResults.classList.remove("hidden");
    resultsCount.textContent = "";
    loadMoreWrap.classList.add("hidden");
    return;
  }

  noResults.classList.add("hidden");
  resultsCount.innerHTML = `Showing <strong>${toShow.length}</strong> of <strong>${filteredHotels.length}</strong> hotels`;

  toShow.forEach((hotel) => hotelGrid.appendChild(createHotelCard(hotel)));

  // Toggle "Load More" visibility
  if (visibleCount >= filteredHotels.length) {
    loadMoreWrap.classList.add("hidden");
  } else {
    loadMoreWrap.classList.remove("hidden");
  }
}

function createHotelCard(hotel) {
  const card = document.createElement("div");
  card.className = "hotel-card";
  card.setAttribute("role", "button");
  card.setAttribute("tabindex", "0");

  card.innerHTML = `
    <div class="hotel-card-img-wrap">
      <img src="${hotel.thumbnail}" alt="${escapeHtml(hotel.name)}" loading="lazy" />
      <span class="hotel-rating-badge">★ ${hotel.rating.toFixed(1)}</span>
    </div>
    <div class="hotel-card-body">
      <h3 class="hotel-name">${escapeHtml(hotel.name)}</h3>
      <p class="hotel-location">📍 ${escapeHtml(hotel.location)}</p>
      <div class="hotel-footer">
        <p class="hotel-price">₹${formatPrice(hotel.price)}<span> / night</span></p>
        <button class="view-btn">View Details</button>
      </div>
    </div>
  `;

  card.addEventListener("click", () => openModal(hotel));
  card.addEventListener("keypress", (e) => {
    if (e.key === "Enter") openModal(hotel);
  });

  return card;
}

// =========================================================
// Modal
// =========================================================
function openModal(hotel) {
  const gallery = (hotel.photos || [])
    .slice(0, 4)
    .map((url) => `<img src="${url}" alt="${escapeHtml(hotel.name)} photo" loading="lazy" />`)
    .join("");

  modalBody.innerHTML = `
    <img class="modal-hero-img" src="${hotel.thumbnail}" alt="${escapeHtml(hotel.name)}" />
    <div class="modal-body-inner">
      <h2>${escapeHtml(hotel.name)}</h2>
      <div class="modal-meta">
        <span>📍 ${escapeHtml(hotel.location)}</span>
        <span class="gold-text">★ ${hotel.rating.toFixed(1)} Rating</span>
      </div>
      <p class="modal-desc">${escapeHtml(hotel.description)}</p>
      ${gallery ? `<div class="modal-gallery">${gallery}</div>` : ""}
      <p class="modal-price-tag">₹${formatPrice(hotel.price)} / night</p>
    </div>
  `;

  modal.classList.remove("hidden");
  document.body.style.overflow = "hidden";
}

function closeModal() {
  modal.classList.add("hidden");
  document.body.style.overflow = "";
}

modalClose.addEventListener("click", closeModal);
modalOverlay.addEventListener("click", closeModal);
document.addEventListener("keydown", (e) => {
  if (e.key === "Escape") closeModal();
});

// =========================================================
// Helpers
// =========================================================
function formatPrice(price) {
  return Math.round(parseFloat(price)).toLocaleString("en-IN");
}

function escapeHtml(str) {
  const div = document.createElement("div");
  div.textContent = str;
  return div.innerHTML;
}

// =========================================================
// Event Listeners
// =========================================================
searchBtn.addEventListener("click", applyFilters);
searchInput.addEventListener("keypress", (e) => {
  if (e.key === "Enter") applyFilters();
});

// Debounce live search-as-you-type
let debounceTimer;
searchInput.addEventListener("input", () => {
  clearTimeout(debounceTimer);
  debounceTimer = setTimeout(applyFilters, 350);
});

locationFilter.addEventListener("change", applyFilters);
ratingFilter.addEventListener("change", applyFilters);
sortBy.addEventListener("change", applyFilters);
minPriceInput.addEventListener("change", applyFilters);
maxPriceInput.addEventListener("change", applyFilters);

clearFiltersBtn.addEventListener("click", () => {
  searchInput.value = "";
  locationFilter.value = "";
  minPriceInput.value = "";
  maxPriceInput.value = "";
  ratingFilter.value = "0";
  sortBy.value = "default";
  applyFilters();
});

loadMoreBtn.addEventListener("click", () => {
  visibleCount += PAGE_SIZE;
  render();
});
