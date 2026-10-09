import { useMemo } from 'react'
import {
  AppBar,
  Box,
  IconButton,
  Toolbar,
  Typography,
} from '@mui/material'
import {
  ExitToAppOutlined,
  NotificationsOutlined,
  HomeOutlined,
} from '@mui/icons-material'
import { Link, Outlet, useLocation } from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux'
import type { RootState } from '../../store/store'
import { logout } from '../../store/authSlice'
import { clearAccessToken } from '../../services/api'
import ManageDropdown from './ManageDropdown'
import StatisticsDropdown from './StatisticsDropdown'
import SelfServiceDropdown from './SelfServiceDropdown'

function AppShell() {
  const location = useLocation()
  const dispatch = useDispatch()
  const auth = useSelector((state: RootState) => state.auth)

  const userLabel = useMemo(() => auth.user?.name ?? 'Trackin360 Admin', [auth.user])

  const handleLogout = () => {
    clearAccessToken()
    dispatch(logout())
  }

  if (location.pathname === '/admin/dashboard') return <Outlet />

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: '#eef4f5' }}>
      <AppBar
        position="static"
        elevation={0}
        sx={{
          bgcolor: '#f7f0ef',
          borderBottom: '1px solid rgba(15, 23, 42, 0.08)',
          color: '#1a2736',
          boxShadow: 'none',
        }}
      >
        <Toolbar sx={{ minHeight: 62, px: 2.5, gap: 1.5 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.25, minWidth: 180 }}>
            <Box sx={{ width: 24, height: 24, borderRadius: '50%', bgcolor: '#4cc5c0', display: 'grid', placeItems: 'center', color: '#fff', fontSize: 12, fontWeight: 700 }}>P</Box>
            <Typography sx={{ fontWeight: 700, fontSize: '1.1rem' }}>Purview</Typography>
          </Box>

          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, ml: 2, color: '#25374a' }}>
            <ManageDropdown />
            <StatisticsDropdown />
            <SelfServiceDropdown />
          </Box>

          <Box sx={{ flexGrow: 1 }} />

          <IconButton sx={{ border: '1px solid rgba(15, 23, 42, 0.08)', bgcolor: 'rgba(255,255,255,0.5)', color: '#1a2736' }}>
            <NotificationsOutlined fontSize="small" />
          </IconButton>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, ml: 0.5, px: 1 }}>
            <Box sx={{ width: 28, height: 28, borderRadius: '50%', bgcolor: '#111827', color: '#fff', display: 'grid', placeItems: 'center', fontWeight: 700, fontSize: '0.8rem' }}>
              {userLabel.slice(0, 1).toUpperCase()}
            </Box>
            <Typography sx={{ fontWeight: 700, fontSize: '0.9rem' }}>{userLabel}</Typography>
          </Box>
          <IconButton onClick={handleLogout} sx={{ border: '1px solid rgba(15, 23, 42, 0.08)', bgcolor: 'rgba(255,255,255,0.5)', color: '#1a2736' }}>
            <ExitToAppOutlined fontSize="small" />
          </IconButton>
        </Toolbar>
      </AppBar>

      <Box component="nav" aria-label="Page navigation" sx={{ background: '#1a2d31', color: '#e9f9fa', px: 2, py: 1.25 }}>
        <Box component={Link} to="/admin/dashboard" sx={{ display: 'inline-flex', alignItems: 'center', gap: 1, fontWeight: 600, fontSize: '0.9rem', borderRadius: 0.5, '&:hover': { color: '#8de9e8' }, '&:focus-visible': { outline: '2px solid #8de9e8', outlineOffset: 4 } }}>
          <HomeOutlined sx={{ fontSize: 20 }} />
          Home
        </Box>
      </Box>
      <Box component="main" sx={{ p: 2.5, pb: 3 }}>
        <Outlet />
      </Box>
    </Box>
  )
}

export default AppShell

