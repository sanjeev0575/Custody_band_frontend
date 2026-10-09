import { Box, Button } from '@mui/material'
import { Link, useLocation } from 'react-router-dom'

export default function DeviceSectionNav() {
  const { pathname } = useLocation()
  return <Box component="nav" aria-label="Device sections" sx={{ display: 'flex', gap: 2, borderBottom: '1px solid #ddd', flexWrap: 'wrap' }}>
    {[
      ['Device', '/admin/device-management'],
      ['Add Device', '/admin/add-device'],
      ['Managing user list', '/admin/users'],
      ['Bulk Sell', '/admin/bulk-sell'],
    ].map(([label, to]) => <Button key={to} component={Link} to={to} aria-current={pathname === to ? 'page' : undefined} sx={{ color: pathname === to ? '#00998c' : '#222', borderBottom: pathname === to ? '2px solid #5cb879' : '2px solid transparent', borderRadius: 0, fontWeight: 400, fontSize: 14 }}>{label}</Button>)}
  </Box>
}
