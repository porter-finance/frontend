import { useEffect } from 'react'
import { useParams } from 'react-router-dom'

import { useDispatch } from 'react-redux'

import { AppDispatch } from '../state'
import { updateUserDarkMode } from '../state/user/actions'

export default function DarkModeQueryParamReader() {
  const dispatch = useDispatch<AppDispatch>()
  const parsed = useParams()

  useEffect(() => {
    if (!parsed) return

    const theme = parsed.theme

    if (typeof theme !== 'string') return

    if (theme.toLowerCase() === 'light') {
      dispatch(updateUserDarkMode({ userDarkMode: false }))
    } else if (theme.toLowerCase() === 'dark') {
      dispatch(updateUserDarkMode({ userDarkMode: true }))
    }
  }, [dispatch, parsed])

  return null
}
