# Berd Nerding

A birdwatching app I built that pulls live sighting data from eBird and plots it on an interactive map. You search a location, and it shows you every bird that's been spotted nearby — with photos, locations, and times.

**Try it live:** [berd-nerding.vercel.app](https://berd-nerding.vercel.app)

---

## Why I Built This

I wanted to build something with real data, real APIs, and real problems to solve — not another todo app. Birdwatching has surprisingly rich public data through eBird, so I thought it'd be cool to make something that actually feels useful: search a city, see what birds are around, and keep track of what you've spotted.

## What It Does

Type in a city (or hit "use my location") and you get a map full of recent bird sightings. The sidebar groups them by species — tap one to expand and see where each was spotted. Click a location and the map flies over to show you exactly where, with a detail card showing the bird's photo pulled from iNaturalist.

If you sign up, you can log your own sightings and build a personal "life list" — it tracks milestones like your 10th, 25th, 50th species.

## Features I'm Proud Of

**The map interaction took a lot of work.** I went through several iterations — started with clustered markers (the numbered bubbles), but they were confusing. Ended up with individual dots, a grouped species list, and smooth fly-to animations when you click a sighting. The selected marker swaps to a bird icon pin so you can always see which one you picked.

**It actually works on phones.** Not just "it fits on a small screen" but genuinely different UX — the species list slides down from the top as a sheet you can swipe away, bird details pop up as a bottom card with swipe-to-dismiss, and the map takes the full screen. I spent a lot of time on the touch gestures (direction locking, velocity-based dismissal, scroll protection).

**Addresses are reverse-geocoded on demand.** eBird gives you raw coordinates or weird location names like "My Yard" or "Private Balcony." I built a system that geocodes each coordinate through Nominatim when you actually look at it — not all at once — with caching so it's instant the second time. Shows a skeleton shimmer while loading.

**The theming is automatic.** The whole color scheme shifts based on time of day — warm oranges at dawn, blues in the morning, greens in the afternoon, deep purples at night. Even the logo badge changes color.

**I hit a lot of real bugs.** Mobile Safari caches placeholder text and won't clear it even when you set it to empty string. CSS `transform` on a parent breaks `position: fixed` on children (cost me hours). Leaflet's internal z-index goes up to 600 and silently covers your dropdowns. I learned more debugging these than from any tutorial.

## Tech Stack

| | |
|---|---|
| **Frontend** | React 18, Vite, Leaflet, Lucide React |
| **Backend** | Node.js, Express, MySQL, Redis |
| **APIs** | eBird (sightings), iNaturalist (photos), Nominatim (geocoding) |
| **Deployed** | Vercel (frontend) + Railway (backend, MySQL, Redis) |
| **Tests** | 76 tests with Vitest + React Testing Library |

## How It's Built

The frontend is a React SPA with Vite. The map uses Leaflet with custom `divIcon` markers — no images, just styled HTML divs for the dots and pins. State management is just React hooks (no Redux or context for app state — `useState` and `useEffect` handled everything).

The backend is a Node/Express API that proxies eBird and caches responses in Redis. Auth is JWT-based with bcrypt password hashing. User sightings are stored in MySQL.

For deployment, the frontend is on Vercel and the backend + databases are on Railway. The trickiest part was getting CORS right and making sure the frontend's `VITE_API_URL` was baked into the build.

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

## Some Things I Learned

- `backgroundAttachment: fixed` doesn't work on mobile Safari. At all.
- Leaflet creates stacking contexts with z-indexes up to 600. If your dropdown has `z-index: 200`, it's behind the map controls.
- React's `onBlur` fires before `onClick` on dropdown items. You need `onMouseDown` instead, or the dropdown closes before the click registers.
- Mobile browsers cache rendered placeholder text. Setting the attribute to empty string doesn't always clear it visually. I ended up replacing the HTML placeholder with a React-controlled overlay div.
- `position: fixed` becomes `position: relative` if any ancestor has `transform` set — even `translateX(0)`. This broke my dropdowns inside a sliding panel.

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
