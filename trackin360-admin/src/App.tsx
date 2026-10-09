import { useEffect, useMemo, useState } from 'react'
import { Alert, Box, CssBaseline, ThemeProvider } from '@mui/material'
import { useDispatch, useSelector } from 'react-redux'
import AppRoutes from './app/routes'
import { createAppTheme } from './theme'
import type { AppDispatch, RootState } from './store/store'
import { ApiError, clearAccessToken, getAccessToken, getCurrentUser } from './services/api'
import { logout, setUser } from './store/authSlice'

function App() {
  const mode = useSelector((state: RootState) => state.theme.mode)
  const isAuthenticated = useSelector((state: RootState) => state.auth.isAuthenticated)
  const dispatch = useDispatch<AppDispatch>()
  const [sessionError, setSessionError] = useState('')

  useEffect(() => {
    window.localStorage.setItem('trackin360-theme', mode)
  }, [mode])

  useEffect(() => {
    if (!isAuthenticated || !getAccessToken()) return
    getCurrentUser()
      .then((user) => {
        setSessionError('')
        dispatch(setUser({ id: user.id, email: user.email, name: user.full_name, role: user.role }))
      })
      .catch((error: unknown) => {
        if (error instanceof ApiError && error.status === 401) {
          clearAccessToken()
          dispatch(logout())
        } else {
          setSessionError(error instanceof Error ? error.message : 'Unable to restore the API session.')
        }
      })
  }, [dispatch, isAuthenticated])

  const theme = useMemo(() => createAppTheme(mode), [mode])

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      {sessionError && (
        <Box sx={{ position: 'fixed', top: 2, left: 2, right: 2, zIndex: (appTheme) => appTheme.zIndex.tooltip }}>
          <Alert severity="error" onClose={() => setSessionError('')}>{sessionError}</Alert>
        </Box>
      )}
      <AppRoutes />
    </ThemeProvider>
  )
}

export default App
