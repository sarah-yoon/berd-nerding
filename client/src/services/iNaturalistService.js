const cache = new Map()  // sciName → { photoUrl, attribution } | null

export async function fetchBirdPhoto(sciName) {
  if (cache.has(sciName)) return cache.get(sciName)
  try {
    const res = await fetch(
      `https://api.inaturalist.org/v1/taxa?q=${encodeURIComponent(sciName)}&per_page=1&rank=species`
    )
    const data = await res.json()
    const taxon = data.results?.[0]
    const photo = taxon?.default_photo
    const result = photo
      ? { photoUrl: photo.medium_url, attribution: photo.attribution }
      : null
    cache.set(sciName, result)
    return result
  } catch {
    return null
  }
}
