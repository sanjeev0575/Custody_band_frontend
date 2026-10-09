import { useCallback, useMemo, useState, type FormEvent } from 'react'
import { Alert, Box, Button, MenuItem, Stack, Table, TableBody, TableCell, TableHead, TableRow, TextField, Typography } from '@mui/material'
import { getAccessToken, listUsers } from '../../services/api'
import { useApiData } from '../../hooks/useApiData'

const dayKey = (value: string | Date) => {
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return ''
  const parts = new Intl.DateTimeFormat('en-CA', { timeZone: 'Asia/Kolkata', year: 'numeric', month: '2-digit', day: '2-digit' }).formatToParts(date)
  return ['year', 'month', 'day'].map(type => parts.find(part => part.type === type)?.value).join('-')
}

export default function UserStatisticsPage() {
  const today = dayKey(new Date())
  const [start, setStart] = useState(today), [end, setEnd] = useState(today)
  const [scope, setScope] = useState('Only self')
  const [filters, setFilters] = useState({ start: today, end: today, scope: 'Only self' })
  const [lookedUp, setLookedUp] = useState(false), [exporting, setExporting] = useState(false)
  const [message, setMessage] = useState('')
  const load = useCallback(() => getAccessToken() ? listUsers(0, 500) : Promise.resolve([]), [])
  const { data, loading, error, reload } = useApiData(load)
  const users = useMemo(() => (data ?? []).filter(user => {
    const day = dayKey(user.created_at)
    return day >= filters.start && day <= filters.end && (filters.scope === 'Include subcompany' || user.is_subcompany !== true)
  }), [data, filters])
  const valid = () => {
    if (!start || !end || start > end) { setMessage('Choose an end date on or after the start date.'); return false }
    setMessage('')
    return true
  }
  const lookup = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    if (!valid()) return
    setFilters({ start, end, scope })
    setLookedUp(true)
    reload()
  }
  const exportExcel = async () => {
    if (!valid()) return
    setExporting(true)
    try { const { downloadUserWorkbook } = await import('./userExport'); downloadUserWorkbook(users) }
    catch (reason) { setMessage(reason instanceof Error ? reason.message : 'Unable to export user statistics.') }
    finally { setExporting(false) }
  }
  const control = { width: 182, '& .MuiOutlinedInput-root': { borderRadius: 0, bgcolor: '#fff', font: '14px Arial, sans-serif' } }
  const cell = { border: '1px solid #e3e3e3', p: 1.5, font: '14px Arial, sans-serif', color: '#666' }
  return <Stack spacing={0} sx={{ bgcolor: '#fff', minHeight: 'calc(100vh - 180px)', minWidth: 0 }}>
    <Box component="form" onSubmit={lookup} sx={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: .5, p: 2, bgcolor: '#f2f2f2', borderLeft: '4px solid #00998c' }}>
      <TextField type="date" size="small" value={start} onChange={event => setStart(event.target.value)} slotProps={{ htmlInput: { 'aria-label': 'Start date' } }} sx={control} />
      <TextField type="date" size="small" value={end} onChange={event => setEnd(event.target.value)} slotProps={{ htmlInput: { 'aria-label': 'End date', min: start } }} sx={control} />
      <TextField select size="small" value={scope} onChange={event => setScope(event.target.value)} slotProps={{ select: { inputProps: { 'aria-label': 'Company scope' }, MenuProps: { slotProps: { paper: { sx: { borderRadius: 0, '& .MuiMenuItem-root': { font: '14px Arial, sans-serif', minHeight: 36 }, '& .Mui-selected, & .Mui-selected:hover': { bgcolor: '#5cb879', color: '#fff' } } } } } } }} sx={{ ...control, width: 212 }}>{['Only self', 'Include subcompany'].map(value => <MenuItem key={value} value={value}>{value}</MenuItem>)}</TextField>
      <Button type="submit" variant="contained" disabled={loading} sx={{ bgcolor: '#00998c', borderRadius: .3, height: 38 }}>Lookup</Button>
      <Button type="button" variant="contained" disabled={loading || exporting} onClick={() => void exportExcel()} sx={{ ml: 1.5, bgcolor: '#2196ff', borderRadius: .3, height: 38, minWidth: 124 }}>{exporting ? 'Exporting...' : 'Import Excel'}</Button>
    </Box>
    {(message || error) && <Alert severity="error">{message || error}</Alert>}
    <Box sx={{ mt: 3, bgcolor: '#f2f2f2', p: 2, borderLeft: '4px solid #00998c' }}><Typography sx={{ font: '14px Arial, sans-serif' }}>User statistics</Typography></Box>
    <Box sx={{ mt: 1.25, border: '1px solid #e3e3e3', minHeight: 'max(330px, calc(100dvh - 390px))', overflow: 'auto' }}>
      {lookedUp && <Table sx={{ minWidth: 800 }}><TableHead><TableRow>{['Customer Name', 'Login Name', 'Contact', 'Phone', 'Create Time'].map(label => <TableCell key={label} sx={{ ...cell, bgcolor: '#f2f2f2' }}>{label}</TableCell>)}</TableRow></TableHead><TableBody>
        {users.map(user => <TableRow key={user.id}>{[user.company, user.login_name ?? user.email, user.contact ?? user.full_name, user.phone, user.created_at].map((value, index) => <TableCell key={index} sx={cell}>{value ?? '-'}</TableCell>)}</TableRow>)}
        {!users.length && <TableRow><TableCell colSpan={5} sx={{ ...cell, textAlign: 'center', color: '#999' }}>{loading ? 'Loading...' : 'No Data'}</TableCell></TableRow>}
      </TableBody></Table>}
    </Box>
  </Stack>
}
