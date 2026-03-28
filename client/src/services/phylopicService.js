const cache = new Map()   // sciName → svgUrl | null
let buildNumber = null

async function getBuild() {
  if (buildNumber !== null) return buildNumber
  const res = await fetch('https://api.phylopic.org/')
  const data = await res.json()
  buildNumber = data.build
  return buildNumber
}

export async function fetchPhylopicIcon(sciName) {
  if (cache.has(sciName)) return cache.get(sciName)
  try {
    const build = await getBuild()
    const res = await fetch(
      `https://api.phylopic.org/images?build=${build}&filter_name=${encodeURIComponent(sciName)}&page=0&embed_items=true`
    )
    const data = await res.json()
    const items = data._embedded?.items ?? []
    const url = items[0]?._links?.vectorFile?.href ?? null
    cache.set(sciName, url)
    return url
  } catch {
    return null
  }
}
