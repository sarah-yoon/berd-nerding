/**
 * Clean up eBird location names for display.
 * Goal: show at most "Street, City, State" — no coordinates, no country codes, no zip codes.
 *
 * Input formats:
 *   "10322 McBroom Street, Los Angeles, California, US (34.263, -118.355)"
 *   "4921 Aldama St, Los Angeles US-CA 34.11103, -118.20927"
 *   "Marina Del Rey Marina, Marina del Rey US-CA 33.96885, -118.45011"
 *   "Sepulveda Basin--Lake Balboa"
 *   "Ambrose Hotel - 1255 20th St, Santa Monica US"
 *   "700 block N La Fayette Park Place"
 *   "My Yard"
 */
/**
 * Get display address: use reverse-geocoded address if available, fall back to cleaned locName.
 */
export function getDisplayAddress(sighting, addressMap) {
  if (addressMap && sighting?.lat && sighting?.lng) {
    const key = `${sighting.lat},${sighting.lng}`
    const addr = addressMap.get(key)
    if (addr) return addr
  }
  return formatLocName(sighting?.locName)
}

export function formatLocName(locName) {
  if (!locName) return ''

  let cleaned = locName
    // Strip trailing coordinates: "(34.184, -118.41)" or "34.08267, -118.39112"
    .replace(/\s*\([-\d.,\s]+\)\s*$/, '')
    .replace(/\s+[-\d]+\.\d{3,},\s*[-\d]+\.\d{3,}\s*$/, '')
    .trim()

  // Strip trailing country codes: "US", "US-CA" at end of string
  cleaned = cleaned.replace(/\s+[A-Z]{2}(-[A-Z]{2,3})?\s*$/, '').trim()

  // Split by comma
  const parts = cleaned.split(',').map(p => p.trim()).filter(Boolean)

  if (parts.length >= 3) {
    // e.g. "10322 McBroom Street", "Los Angeles", "California", maybe "US"
    // Filter out country-only parts
    const filtered = parts.filter(p => !/^[A-Z]{2,3}$/.test(p.trim()))
    // Take up to 3 meaningful parts: street, city, state
    return filtered.slice(0, 3).join(', ')
  }

  if (parts.length === 2) {
    // e.g. "4921 Aldama St", "Los Angeles" (after stripping US-CA)
    // or "Marina Del Rey Marina", "Marina del Rey"
    return parts.join(', ')
  }

  // Single part — named place like "Sepulveda Basin--Lake Balboa"
  // Clean up eBird double-dash format
  return cleaned.replace(/--/g, ' — ')
}
