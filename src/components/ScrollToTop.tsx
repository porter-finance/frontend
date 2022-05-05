import { useEffect } from 'react'
import { useLocation } from 'react-router-dom'

const scrollToPosition = (top = 0) => {
  try {
    /**
     * Latest API
     */
    window.scroll({
      top: top,
      left: 0,
      behavior: 'smooth',
    })
  } catch (_) {
    /**
     * Fallback
     */
    window.scrollTo(0, top)
  }
}

export default function ScrollToTop() {
  const { pathname } = useLocation()

  useEffect(scrollToPosition, [pathname])

  return null
}
