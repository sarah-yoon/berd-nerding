import { useState, useEffect } from 'react'

export function useBreakpoint() {
  const [breakpoint, setBreakpoint] = useState(() => {
    if (typeof window === 'undefined') return 'desktop'
    if (window.matchMedia('(max-width: 768px)').matches) return 'mobile'
    if (window.matchMedia('(max-width: 1024px)').matches) return 'tablet'
    return 'desktop'
  })

  useEffect(() => {
    const mobileQuery = window.matchMedia('(max-width: 768px)')
    const tabletQuery = window.matchMedia('(max-width: 1024px)')

    function update() {
      if (mobileQuery.matches) setBreakpoint('mobile')
      else if (tabletQuery.matches) setBreakpoint('tablet')
      else setBreakpoint('desktop')
    }

    const onMobile = (e) => update()
    const onTablet = (e) => update()

    mobileQuery.addEventListener('change', onMobile)
    tabletQuery.addEventListener('change', onTablet)
    return () => {
      mobileQuery.removeEventListener('change', onMobile)
      tabletQuery.removeEventListener('change', onTablet)
    }
  }, [])

  return breakpoint
}
