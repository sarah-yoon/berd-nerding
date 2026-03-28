# Berd Nerding 🐦

A real-time birdwatching map powered by live eBird data. Discover what birds have been spotted near any location, explore sightings on an interactive map, and build your personal life list.

## Features

- **Interactive Map** — Leaflet map showing recent bird sightings with clickable markers
- **Species Sidebar** — Grouped by species with expandable location details, filter by name
- **Bird Detail Panel** — iNaturalist photos, sighting info, eBird checklist links
- **Location Search** — Autocomplete powered by Nominatim geocoding
- **Responsive** — Desktop (3-panel), tablet (overlay), mobile (bottom card with swipe-to-dismiss)
- **Life List** — Personal bird collection with milestone tracking (sign up required)
- **Log Sightings** — Record birds you've spotted with species autocomplete
- **Time-of-Day Theming** — UI adapts colors based on dawn/morning/afternoon/dusk/night

## Tech Stack

**Frontend:** React 18, Vite, Leaflet, Lucide React, react-window

**Backend:** Node.js, Express, MySQL, Redis, JWT auth

**APIs:** eBird API (sightings data), iNaturalist (bird photos), Nominatim (geocoding)

## Getting Started

```bash
# Frontend
cd client
npm install
npm run dev        # http://localhost:5173

# Backend
cd server
cp .env.example .env   # fill in your credentials
npm install
npm run db:setup       # create MySQL tables
npm run dev            # http://localhost:3001
```

## Environment Variables

See `server/.env.example` for required backend configuration (MySQL, Redis, eBird API key, JWT secret).

## Demo Account

- Email: `demo@birdmap.test`
- Password: `demo1234`
