import { useCallback, useState } from 'react'
import DeviceSectionNav from '../../components/layout/DeviceSectionNav'
import { Box, Button, Dialog, DialogActions, DialogContent, DialogTitle, MenuItem, Stack, Table, TableBody, TableCell, TableHead, TableRow, TextField, Typography } from '@mui/material'
import { DeleteOutlined, RefreshOutlined } from '@mui/icons-material'
import ApiFeedback from '../../components/common/ApiFeedback'
import { useApiData } from '../../hooks/useApiData'
import { getAccessToken, listUsers } from '../../services/api'

export default function UsersPage() {
  const [page, setPage] = useState(0)
  const [pageSize, setPageSize] = useState(20)
  const [action, setAction] = useState<{ name: string; user: string } | null>(null)
  const loadUsers = useCallback(() => getAccessToken() ? listUsers(0, 500) : Promise.resolve([]), [])
  const { data: users, loading, error, reload } = useApiData(loadUsers)
  const count = users?.length ?? 0
  const pageCount = Math.max(1, Math.ceil(count / pageSize))
  const currentPage = Math.min(page, pageCount - 1)
  const cell = { border: '1px solid #e3e3e3', px: 2, py: 1, color: '#666', font: '14px Arial, sans-serif', height: 39 }
  const button = { minWidth: 0, borderRadius: .2, px: .7, py: .3, color: '#fff', font: '12px Arial, sans-serif', '& .MuiButton-startIcon': { mr: .4 }, '& svg': { fontSize: 14 } }
  return <Stack spacing={2} sx={{ bgcolor: '#fff', p: 1.5, minHeight: 'calc(100vh - 180px)', minWidth: 0 }}>
    <DeviceSectionNav />
    <Box sx={{ border: '1px solid #e3e3e3' }}>
      <Box sx={{ height: 320, overflow: 'auto' }}>
        <Table sx={{ minWidth: 580, tableLayout: 'fixed' }}>
          <TableHead><TableRow>{['Login Name', 'Type', 'Operation'].map(label => <TableCell key={label} sx={{ ...cell, bgcolor: '#f2f2f2' }}>{label}</TableCell>)}</TableRow></TableHead>
          <TableBody>{users?.slice(currentPage * pageSize, (currentPage + 1) * pageSize).map(user => <TableRow key={user.id}>
            <TableCell sx={cell}>{user.full_name || user.email}</TableCell>
            <TableCell sx={cell}>{user.role.toLowerCase() === 'admin' ? 'Company Administrator' : user.role}</TableCell>
            <TableCell sx={cell}><Box sx={{ display: 'flex', gap: 1 }}>
              <Button type="button" startIcon={<DeleteOutlined />} onClick={() => setAction({ name: 'Delete', user: user.full_name || user.email })} sx={{ ...button, bgcolor: '#ff5722', '&:hover': { bgcolor: '#e64a19' } }}>Delete</Button>
              <Button type="button" startIcon={<RefreshOutlined />} onClick={() => setAction({ name: 'Reset password', user: user.full_name || user.email })} sx={{ ...button, bgcolor: '#00998c', '&:hover': { bgcolor: '#007b70' } }}>Reset password</Button>
            </Box></TableCell>
          </TableRow>)}{!loading && !error && count === 0 && <TableRow><TableCell colSpan={3} sx={{ ...cell, textAlign: 'center' }}>No users loaded</TableCell></TableRow>}</TableBody>
        </Table>
        {(loading || error) && <Box sx={{ p: 1 }}><ApiFeedback loading={loading} error={error} empty={false} emptyMessage="" /></Box>}
      </Box>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, borderTop: '1px solid #e3e3e3', p: 1, flexWrap: 'wrap' }}>
        <Button aria-label="Previous page" disabled={currentPage === 0} onClick={() => setPage(currentPage - 1)} sx={{ minWidth: 24 }}>{'<'}</Button>
        <Box sx={{ bgcolor: '#00998c', color: '#fff', px: 1.5, py: .5 }}>{currentPage + 1}</Box>
        <Button aria-label="Next page" disabled={currentPage >= pageCount - 1} onClick={() => setPage(currentPage + 1)} sx={{ minWidth: 24 }}>{'>'}</Button>
        <Button aria-label="Refresh users" disabled={loading} onClick={reload} sx={{ minWidth: 30, color: '#666' }}><RefreshOutlined sx={{ fontSize: 18 }} /></Button>
        <Typography variant="body2">Sum {count} Rows</Typography>
        <TextField select size="small" value={pageSize} onChange={event => { setPageSize(Number(event.target.value)); setPage(0) }} slotProps={{ htmlInput: { 'aria-label': 'Rows per page' } }} sx={{ '& .MuiOutlinedInput-root': { borderRadius: 0 }, '& .MuiSelect-select': { py: .5, fontSize: 12 } }}>
          {[20, 50, 100].map(value => <MenuItem key={value} value={value}>{value} Rows/Page</MenuItem>)}
        </TextField>
      </Box>
    </Box>
    <Dialog open={Boolean(action)} onClose={() => setAction(null)} fullWidth maxWidth="xs">
      <DialogTitle>{action?.name}</DialogTitle><DialogContent><Typography>{action?.name} for {action?.user} is not available yet. This action needs support from the account service.</Typography></DialogContent><DialogActions><Button onClick={() => setAction(null)}>Close</Button></DialogActions>
    </Dialog>
  </Stack>
}

