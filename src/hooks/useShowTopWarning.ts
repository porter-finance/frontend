import { useEffect, useState } from 'react'
import { useLocation } from 'react-router-dom'

const useShowTopWarning = () => {
  const [showTopWarning, setShowTopWarning] = useState(false)
  const { pathname } = useLocation()

  useEffect(() => {
    if (!window.location.href.includes('/auction')) {
      setShowTopWarning(false)
    }
  }, [pathname])

  return { showTopWarning, setShowTopWarning }
}

export default useShowTopWarning
