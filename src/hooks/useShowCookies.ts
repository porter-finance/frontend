import { useState } from 'react'

const useShowCookies = () => {
  const [showCookiesBanner, setShowCookiesBanner] = useState(false)

  return { showCookiesBanner, setShowCookiesBanner }
}

export default useShowCookies
