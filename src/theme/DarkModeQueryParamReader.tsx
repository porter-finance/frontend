import { useEffect } from 'react'

import { useDispatch } from 'react-redux'
import { themeChange } from 'theme-change'

import { AppDispatch } from '../state'
import { updateUserDarkMode } from '../state/user/actions'

export default function DarkModeQueryParamReader() {
  const dispatch = useDispatch<AppDispatch>()
  const parsed = window.location.search

  useEffect(() => {
    themeChange(false)
  }, [])

  useEffect(() => {
    if (!parsed.includes('theme')) return

    if (typeof parsed !== 'string') return

    if (parsed.toLowerCase().includes('light')) {
      dispatch(updateUserDarkMode({ userDarkMode: false }))
    } else if (parsed.toLowerCase().includes('dark')) {
      dispatch(updateUserDarkMode({ userDarkMode: true }))
    }
  }, [dispatch, parsed])

  return null
}
