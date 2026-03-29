import { useEffect, useRef } from 'react'
import L from 'leaflet'
import { sightingKey } from '../../utils/sightingKey'

function makeDotIcon(color) {
  return L.divIcon({
    className: '',
    html: `<div style="width:14px;height:14px;border-radius:50%;background:${color};border:2px solid #fff;box-shadow:0 0 6px ${color},0 1px 3px rgba(0,0,0,0.4);cursor:pointer;overflow:visible;"></div>`,
    iconSize: [28, 28], iconAnchor: [14, 14],
  })
}

function makePulseIcon(color) {
  return L.divIcon({
    className: '',
    html: `<div style="width:14px;height:14px;border-radius:50%;background:${color};border:2px solid #fff;--pulse-color:${color};animation:marker-pulse 1s ease-in-out infinite;cursor:pointer;overflow:visible;"></div>`,
    iconSize: [28, 28], iconAnchor: [14, 14],
  })
}

// Bird SVG inline — used as fallback when Phylopic has no silhouette
const BIRD_SVG = `<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="rgba(0,0,0,0.7)" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M16 7h.01"/><path d="M3.4 18H12a8 8 0 0 0 8-8V7a4 4 0 0 0-7.28-2.3L2 20"/><path d="m20 7 2 .5-2 .5"/><path d="M10 18v3"/><path d="M14 17.75V21"/><path d="M7 18a6 6 0 0 0 3.84-10.61"/></svg>`

function makePinIcon(svgUrl) {
  const inner = svgUrl
    ? `<img src="${svgUrl}" alt="" style="width:20px;height:20px;object-fit:contain;filter:invert(1);opacity:0.9;" />`
    : BIRD_SVG
  return L.divIcon({
    className: '',
    html: `<div style="display:flex;flex-direction:column;align-items:center;">
      <div style="width:36px;height:36px;border-radius:50%;background:#f0c060;border:2.5px solid #fff;
        box-shadow:0 0 10px rgba(240,192,96,0.7),0 2px 6px rgba(0,0,0,0.5);
        display:flex;align-items:center;justify-content:center;">${inner}</div>
      <div style="width:0;height:0;border-left:6px solid transparent;border-right:6px solid transparent;
        border-top:9px solid #f0c060;margin-top:-1px;"></div>
    </div>`,
    iconSize: [36, 49], iconAnchor: [18, 49],
  })
}

export default function SightingsMap({
  center,
  sightings,
  onMarkerClick,
  onBgClick,
  accentColor = '#f0c060',
  selectedSighting = null,
  hoveredSighting = null,
  iconMap = new Map(),
}) {
  const mapRef = useRef(null)
  const mapObj = useRef(null)
  const layersRef = useRef({})
  const markerRefs = useRef(new Map())
  const prevSelectedKey = useRef(null)
  const prevHoveredKey = useRef(null)
  const rafRef = useRef(null)
  const onMarkerClickRef = useRef(onMarkerClick)
  onMarkerClickRef.current = onMarkerClick

  // Init map
  useEffect(() => {
    if (mapObj.current) return
    const isMobile = window.innerWidth <= 768
    mapObj.current = L.map(mapRef.current, { zoomControl: !isMobile, minZoom: 10, maxZoom: 18 }).setView(center, 12)
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '© OpenStreetMap contributors',
    }).addTo(mapObj.current)
    setTimeout(() => mapObj.current?.invalidateSize(), 100)
    return () => {
      mapObj.current?.remove()
      mapObj.current = null
      layersRef.current = {}
    }
  }, [])

  // Pan to new center
  useEffect(() => {
    if (!mapObj.current) return
    mapObj.current.setView(center, 12)
  }, [center[0], center[1]])

  // Background click
  useEffect(() => {
    if (!mapObj.current || !onBgClick) return
    mapObj.current.on('click', onBgClick)
    return () => { mapObj.current?.off('click', onBgClick) }
  }, [onBgClick])

  // Build sighting markers — one dot per unique location, no stacking
  useEffect(() => {
    if (!mapObj.current) return
    if (layersRef.current.sightings) mapObj.current.removeLayer(layersRef.current.sightings)
    markerRefs.current.clear()

    const layer = L.layerGroup()
    const placedCoords = new Map() // "lat,lng" → marker

    sightings.forEach(s => {
      const key = sightingKey(s)
      const coordKey = `${s.lat},${s.lng}`

      if (placedCoords.has(coordKey)) {
        // Location already has a dot — just store the ref to the existing marker
        markerRefs.current.set(key, placedCoords.get(coordKey))
        return
      }

      const icon = makeDotIcon(accentColor)
      const marker = L.marker([s.lat, s.lng], { icon, zIndexOffset: 1000 })
      marker.on('click', (e) => {
        L.DomEvent.stopPropagation(e)
        onMarkerClickRef.current?.(s)
      })
      markerRefs.current.set(key, marker)
      placedCoords.set(coordKey, marker)
      layer.addLayer(marker)
    })

    layer.addTo(mapObj.current)
    layersRef.current.sightings = layer
  }, [sightings, accentColor])

  // Selected sighting — swap icon with Phylopic silhouette + fly to location
  useEffect(() => {
    const newKey = selectedSighting ? sightingKey(selectedSighting) : null
    const oldKey = prevSelectedKey.current

    if (oldKey && oldKey !== newKey) {
      const oldMarker = markerRefs.current.get(oldKey)
      if (oldMarker?._icon) oldMarker.setIcon(makeDotIcon(accentColor))
    }

    if (newKey && selectedSighting) {
      const newMarker = markerRefs.current.get(newKey)
      if (newMarker?._icon) newMarker.setIcon(makePinIcon(iconMap.get(selectedSighting.sciName) ?? null))

      if (mapObj.current && selectedSighting.lat && selectedSighting.lng) {
        mapObj.current.flyTo([selectedSighting.lat, selectedSighting.lng], 14, { duration: 0.8 })
      }
    }

    prevSelectedKey.current = newKey
  }, [selectedSighting, iconMap, accentColor])

  // Hovered sighting — swap icons with RAF debounce
  useEffect(() => {
    if (rafRef.current) cancelAnimationFrame(rafRef.current)
    rafRef.current = requestAnimationFrame(() => {
      const newKey = hoveredSighting ? sightingKey(hoveredSighting) : null
      const oldKey = prevHoveredKey.current
      const selectedKey = selectedSighting ? sightingKey(selectedSighting) : null

      if (oldKey && oldKey !== newKey && oldKey !== selectedKey) {
        const oldMarker = markerRefs.current.get(oldKey)
        if (oldMarker?._icon) oldMarker.setIcon(makeDotIcon(accentColor))
      }

      if (newKey && newKey !== selectedKey) {
        const newMarker = markerRefs.current.get(newKey)
        if (newMarker?._icon) newMarker.setIcon(makePulseIcon(accentColor))
      }

      prevHoveredKey.current = newKey
    })
    return () => { if (rafRef.current) cancelAnimationFrame(rafRef.current) }
  }, [hoveredSighting, selectedSighting, accentColor])


  // Invalidate map size when container resizes
  useEffect(() => {
    if (!mapRef.current || !mapObj.current) return
    const observer = new ResizeObserver(() => {
      mapObj.current?.invalidateSize()
    })
    observer.observe(mapRef.current)
    return () => observer.disconnect()
  }, [])

  return <div ref={mapRef} style={{ height: '100%', width: '100%', borderRadius: 8 }} />
}
