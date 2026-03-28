export function useTheme() {
  const h = new Date().getHours()
  if (h >= 5  && h < 7)  return 'dawn'
  if (h >= 7  && h < 12) return 'morning'
  if (h >= 12 && h < 17) return 'afternoon'
  if (h >= 17 && h < 20) return 'dusk'
  return 'night'
}
