# AtithiHub — Hotel Search App

A responsive, interactive hotel search web app built with **plain HTML, CSS, and JavaScript**, powered by the [Hotel Search API](https://demohotelsapi.pythonanywhere.com/).

## Features

- 🔍 **Live search** — search hotels by name or city (debounced as you type)
- 🎚️ **Filters** — filter by location, price range, and minimum rating
- ↕️ **Sorting** — sort by price (low/high), rating, or name
- 📄 **Load More pagination** — loads hotels in batches of 12 for performance
- 🖼️ **Hotel detail modal** — click any hotel card to view a photo gallery, full description, and price
- 📱 **Fully responsive** — works on desktop, tablet, and mobile
- ⚠️ **Error & empty states** — handles API failures and "no results" gracefully

## Folder Structure

```
hotel-search-app/
├── index.html          # Main HTML structure
├── css/
│   └── style.css       # All styling (responsive, no frameworks)
├── js/
│   └── script.js        # API fetching, filtering, sorting, modal logic
└── README.md
```

## API Used

- **Base URL:** `https://demohotelsapi.pythonanywhere.com/hotels/`
- Returns a JSON object with a `data` array of hotels, each containing:
  `id`, `name`, `price`, `rating`, `location`, `thumbnail`, `photos[]`, `description`

All 500 hotels are fetched once on page load; search, filtering, sorting, and pagination are then handled entirely on the client side for a fast, snappy experience.

## How to Run

No build tools or dependencies required.

1. Clone this repository
2. Open `index.html` in your browser

   *(or use a simple local server, e.g. VS Code's "Live Server" extension)*

## Tech Stack

- HTML5
- CSS3 (Grid, Flexbox, responsive media queries)
- Vanilla JavaScript (Fetch API, DOM manipulation, event delegation)
- Google Fonts: Playfair Display + Poppins
