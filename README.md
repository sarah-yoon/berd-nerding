# Berd Nerding

A birdwatching app that pulls live sighting data from eBird and shows it on an interactive map. You search a location and it shows you every bird that's been spotted nearby, with photos, locations, and times.

**Try it live:** [berd-nerding.vercel.app](https://berd-nerding.vercel.app)

---

## Why I Built This

I wanted to build something with real data and real APIs, not another todo app. Birdwatching has surprisingly rich public data through eBird, so I thought it would be cool to make something that feels actually useful. Search a city, see what birds are around, and keep track of what you've spotted.

## What It Does

Type in a city or hit "use my location" and you get a map full of recent bird sightings. The sidebar groups them by species. Tap one to expand and see where each was spotted. Click a location and the map flies over to show you exactly where, with a detail card showing the bird's photo pulled from iNaturalist.

If you sign up, you can log your own sightings and build a personal "life list." It tracks milestones like your 10th, 25th, and 50th species.

## Features I'm Proud Of

**The map interaction took a lot of work.** I went through several iterations. Started with clustered markers (the numbered bubbles) but they were confusing. Ended up with individual dots, a grouped species list, and smooth fly-to animations when you click a sighting. The selected marker swaps to a bird icon pin so you can always see which one you picked.

**The theming is automatic.** The whole color scheme shifts based on time of day. Warm oranges at dawn, blues in the morning, greens in the afternoon, deep purples at night. Even the logo badge changes color.

## Tech Stack

| | |
|---|---|
| **Frontend** | React 18, Vite, Leaflet, Lucide React |
| **Backend** | Node.js, Express, MySQL, Redis |
| **APIs** | eBird (sightings), iNaturalist (photos), Nominatim (geocoding) |
| **Deployed** | Vercel (frontend) + Railway (backend, MySQL, Redis) |
| **Tests** | 76 tests with Vitest + React Testing Library |

## How It's Built

The frontend is a React SPA with Vite. The map uses Leaflet with custom divIcon markers, which are just styled HTML divs for the dots and pins. State management is just React hooks. No Redux or context for app state, just useState and useEffect which handled everything fine.

The backend is a Node/Express API that proxies eBird and caches responses in Redis. Auth is JWT-based with bcrypt password hashing. User sightings are stored in MySQL.

For deployment, the frontend is on Vercel and the backend plus databases are on Railway. The trickiest part was getting CORS right and making sure the frontend's API URL was baked into the Vite build.

```
client/                     server/
  src/                        src/
    components/                 controllers/
      Map/SightingsMap.jsx        birdsController.js
      SightingsList.jsx           authController.js
      BirdPanel.jsx             services/
      MobileBirdCard.jsx          ebirdService.js
      MobileSpeciesSheet.jsx      cacheService.js
    pages/                      middleware/
      HomePage.jsx                auth.js
      MapPage.jsx                 rateLimiter.js
    hooks/                      db/
      useBreakpoint.js            mysql.js
      useAddress.js               redis.js
    utils/
      reverseGeocode.js
      sightingKey.js
    services/
      iNaturalistService.js
```

## Running It Locally

```bash
# Frontend
cd client
npm install
npm run dev        # http://localhost:5173

# Backend
cd server
cp .env.example .env   # fill in credentials
npm install
npm run db:setup
npm run dev            # http://localhost:3001
```

You'll need an eBird API key (free from [ebird.org/api](https://ebird.org/api/keygen)) and MySQL + Redis running locally.

## Tests

```bash
cd client
npm test    # 76 tests across 14 files
```

---

Built by [Sarah Yoon](https://github.com/sarah-yoon)
