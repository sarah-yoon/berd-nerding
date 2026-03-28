/**
 * Clean up eBird location names for display.
 *
 * eBird locName can be:
 *   "Sepulveda Basin--Lake Balboa"           → keep as-is (nice name)
 *   "La Canada"                               → keep as-is
 *   "6233 Bluebell Avenue, Los Angeles, California, US (34.184, -118.41)" → "Los Angeles, California"
 *   "611 N Oakhurst Dr, Beverly Hills US-CA 34.08267, -118.39112"         → "Beverly Hills"
 */
export function formatLocName(locName) {
  if (!locName) return ''

  // Strip trailing coordinates like "(34.184, -118.41)" or "34.08267, -118.39112"
  let cleaned = locName
    .replace(/\s*\([-\d.,\s]+\)\s*$/, '')       // (lat, lng) at end
    .replace(/\s+[-\d]+\.\d+,\s*[-\d]+\.\d+\s*$/, '') // lat, lng at end without parens
    .trim()

  // If it contains a comma, it's likely an address
  const parts = cleaned.split(',').map(p => p.trim())

  if (parts.length >= 3) {
    // "6233 Bluebell Avenue, Los Angeles, California, US" → "Los Angeles, California"
    // Skip parts that look like street addresses (start with a number)
    const nonStreet = parts.filter(p => !/^\d/.test(p))
    // Remove country codes like "US", "CA", "US-CA"
    const meaningful = nonStreet.filter(p => !/^[A-Z]{2}(-[A-Z]{2})?$/.test(p))
    if (meaningful.length >= 2) return meaningful.slice(0, 2).join(', ')
    if (meaningful.length === 1) return meaningful[0]
  }

  if (parts.length === 2) {
    // "Beverly Hills US-CA" → "Beverly Hills"
    // Remove trailing state/country codes from last part
    const last = parts[1].replace(/\s+[A-Z]{2}(-[A-Z]{2})?$/, '').trim()
    const first = parts[0].replace(/^\d+\s+\S+\s+/, '').trim() // strip street number + name prefix
    if (/^\d/.test(parts[0]) && last) return last // first part is address, use second
    return last ? `${parts[0]}, ${last}` : parts[0]
  }

  // Single part — strip leading street number if present
  // "611 N Oakhurst Dr" → keep as-is (no better option)
  // But strip state codes: "Beverly Hills US-CA" → "Beverly Hills"
  return cleaned.replace(/\s+[A-Z]{2}(-[A-Z]{2})?\s*$/, '').trim()
}
