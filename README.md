# Berd Nerding

A full-stack birdwatching web app that shows real-time bird sightings near any location. Built with React, Node.js, and live eBird data.

**Live:** [berd-nerding.vercel.app](https://berd-nerding.vercel.app)

---

## What It Does

Search any city and instantly see what birds have been spotted nearby — powered by the eBird API's real-time observation data. Click a sighting to see photos from iNaturalist, explore species grouped by type, and build your own personal life list.

## Key Features

**Interactive Map**
- Leaflet map with individual sighting markers and fly-to animations
- Click a marker to see bird details with species photo, location, time, and eBird checklist link
- Hover pulse effects on markers when browsing the species list
- Custom bird silhouette icon on selected markers

**Species Sidebar (Desktop)**
- Sightings grouped by species with expandable location details
- Filter by name to find specific birds
- Collapsible panel with smooth slide animation
- Cross-highlighting between list and map markers

**Mobile-First Design**
- Three responsive breakpoints: desktop, tablet, mobile
- Top-sliding species sheet with swipe-up-to-close gesture
- Bottom card for bird details with swipe-to-dismiss (direction locking + velocity detection)
- Touch-optimized markers with enlarged hit targets

**Smart Address Resolution**
- On-demand reverse geocoding via Nominatim — only geocodes locations currently visible on screen
- Skeleton loading states while addresses resolve
- Module-level caching so repeated coordinates are instant
- Formats to "Street, City, State" (no house numbers, no coordinates)

**Time-of-Day Theming**
- 5 color themes that auto-switch based on the time: dawn, morning, afternoon, dusk, night
- Logo badge color adapts to the current theme
- Smooth CSS transitions between themes

**User Accounts**
- JWT authentication with registration and login
- Personal life list tracking every species you've spotted
- Milestone celebrations at 10, 25, 50, 100, 200 species
- Log sightings with species autocomplete from nearby eBird data

## Tech Stack

| Layer | Tech |
|---|---|
| Frontend | React 18, Vite, Leaflet, Lucide React |
| Backend | Node.js, Express, MySQL, Redis |
| APIs | eBird (sightings), iNaturalist (photos), Nominatim (geocoding) |
| Deployment | Vercel (frontend), Railway (backend + MySQL + Redis) |
| Testing | Vitest, React Testing Library (76 tests) |

## Architecture

```
client/                     server/
  src/                        src/
    components/                 controllers/
      Map/SightingsMap.jsx        birdsController.js
      SightingsList.jsx           authController.js
      BirdPanel.jsx               sightingsController.js
      MobileBirdCard.jsx        services/
      MobileSpeciesSheet.jsx      ebirdService.js
      BirdSightingInfo.jsx        cacheService.js
      AddressText.jsx           middleware/
    pages/                        auth.js
      HomePage.jsx                rateLimiter.js
      MapPage.jsx               routes/
      LifeListPage.jsx            birds.js
      LogSightingPage.jsx         sightings.js
    hooks/                      db/
      useBreakpoint.js            mysql.js
      useAddress.js               redis.js
    utils/
      reverseGeocode.js
      formatLocName.js
      sightingKey.js
    services/
      iNaturalistService.js
```

## Notable Implementation Details

- **Marker lifecycle optimization** — map markers update icons in-place via refs instead of rebuilding the entire layer, preserving map state and preventing flicker
- **Composite sighting keys** — `subId_speciesCode` handles multiple species per eBird checklist
- **Portal-based dropdowns** — autocomplete dropdowns render via `createPortal` to escape CSS `transform` stacking contexts
- **Custom placeholder handling** — HTML placeholder replaced with a React-controlled overlay div to fix persistent mobile Safari rendering bugs
- **Rate-limited geocoding** — Nominatim requests throttled to 1/sec with deduplication via pending promise map

## Running Locally

```bash
# Frontend
cd client
npm install
npm run dev        # http://localhost:5173

# Backend
cd server
cp .env.example .env   # fill in credentials
npm install
npm run db:setup       # create MySQL tables
npm run dev            # http://localhost:3001
```

## Environment Variables

See `server/.env.example` for required backend configuration:
- `EBIRD_API_KEY` — free from [ebird.org/api](https://ebird.org/api/keygen)
- `JWT_SECRET` — any random string
- MySQL and Redis connection details

## Testing

```bash
cd client
npm test          # 76 tests across 14 test files
```

---

Built by [Sarah Yoon](https://github.com/sarah-yoon)
