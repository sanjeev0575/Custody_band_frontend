import { useCallback, useMemo, useState, type FormEvent } from 'react'
import { Alert, Box, Button, MenuItem, Stack, Table, TableBody, TableCell, TableHead, TableRow, TextField, Typography } from '@mui/material'
import { RefreshOutlined } from '@mui/icons-material'
import { useApiData } from '../../hooks/useApiData'
import { getAccessToken, listAlerts, listDevices } from '../../services/api'

const alarmTypes = ['All', 'Offline', 'SOS Alarm', 'Geofence', 'Vibration Alarm', 'A Sedentary Reminder', 'Fall in the alarm', 'Low Battery Alarm']
const dateKey = (value: string | Date) => {
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return ''
  const parts = new Intl.DateTimeFormat('en-CA', { timeZone: 'Asia/Kolkata', year: 'numeric', month: '2-digit', day: '2-digit' }).formatToParts(date)
  return ['year', 'month', 'day'].map(type => parts.find(part => part.type === type)?.value).join('-')
}
const displayTime = (value: string | null | undefined) => value ? new Date(value).toLocaleString('en-GB', { timeZone: 'Asia/Kolkata', hour12: false }) : '-'
const normalize = (value: string) => value.toLowerCase().replace(/[_-]/g, ' ')
const matchesType = (type: string, message: string, selected: string) => {
  if (selected === 'All') return true
  const value = normalize(`${type} ${message}`)
  const keywords: Record<string, string[]> = {
    Offline: ['offline'], 'SOS Alarm': ['sos', 'emergency'], Geofence: ['geofence', 'fence'],
    'Vibration Alarm': ['vibration'], 'A Sedentary Reminder': ['sedentary'],
    'Fall in the alarm': ['fall'], 'Low Battery Alarm': ['low battery', 'battery low'],
  }
  return keywords[selected]?.some(keyword => value.includes(keyword)) ?? false
}

export default function AlarmStatisticsPage() {
  const today = dateKey(new Date())
  const [start, setStart] = useState(today)
  const [end, setEnd] = useState(today)
  const [scope, setScope] = useState('Only self')
  const [type, setType] = useState('All')
  const [imei, setImei] = useState('')
  const [filters, setFilters] = useState({ start: today, end: today, scope: 'Only self', type: 'All', imei: '' })
  const [validationError, setValidationError] = useState('')
  const [page, setPage] = useState(0)
  const [pageSize, setPageSize] = useState(12)
  const load = useCallback(async () => {
    if (!getAccessToken()) return { alerts: [], devices: [] }
    const [alerts, devices] = await Promise.all([listAlerts(0, 500), listDevices(0, 500)])
    return { alerts, devices }
  }, [])
  const { data, loading, error, reload } = useApiData(load)
  const rows = useMemo(() => {
    const devices = new Map(data?.devices.map(device => [device.id, device]))
    return (data?.alerts ?? []).map(alert => ({ alert, device: alert.device_id == null ? undefined : devices.get(alert.device_id) })).filter(({ alert, device }) => {
      const day = dateKey(alert.created_at)
      return day >= filters.start && day <= filters.end && matchesType(alert.type, alert.message, filters.type)
        && (!filters.imei || (device?.imei ?? alert.imei ?? '').includes(filters.imei))
        && (filters.scope === 'Include subcompany' || alert.is_subcompany !== true)
    }).sort((a, b) => new Date(b.alert.created_at).getTime() - new Date(a.alert.created_at).getTime())
  }, [data, filters])
  const pages = Math.max(1, Math.ceil(rows.length / pageSize)), currentPage = Math.min(page, pages - 1)
  const lookup = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    if (!start || !end || start > end) { setValidationError('Choose an end date on or after the start date.'); return }
    setValidationError('')
    setFilters({ start, end, scope, type, imei: imei.trim() })
    setPage(0)
    reload()
  }
  const field = { width: 182, '& .MuiOutlinedInput-root': { borderRadius: 0, bgcolor: '#fff', font: '14px Arial, sans-serif' } }
  const menuProps = { slotProps: { paper: { sx: { borderRadius: 0, '& .MuiMenuItem-root': { font: '14px Arial, sans-serif', minHeight: 36 }, '& .Mui-selected, & .Mui-selected:hover': { bgcolor: '#5cb879', color: '#fff' } } } } }
  const cell = { border: '1px solid #e3e3e3', height: 39, px: 2, py: 1, color: '#666', font: '14px Arial, sans-serif', whiteSpace: 'nowrap' }
  return <Stack spacing={0} sx={{ bgcolor: '#fff', minHeight: 'calc(100vh - 180px)', minWidth: 0 }}>
    <Box component="form" onSubmit={lookup} sx={{ display: 'flex', gap: .5, flexWrap: 'wrap', alignItems: 'center', bgcolor: '#f2f2f2', p: 2, borderLeft: '4px solid #00998c' }}>
      <TextField type="date" size="small" value={start} onChange={event => setStart(event.target.value)} slotProps={{ htmlInput: { 'aria-label': 'Start date' } }} sx={field} />
      <TextField type="date" size="small" value={end} onChange={event => setEnd(event.target.value)} slotProps={{ htmlInput: { 'aria-label': 'End date', min: start } }} sx={field} />
      <TextField select size="small" value={scope} onChange={event => setScope(event.target.value)} slotProps={{ select: { inputProps: { 'aria-label': 'Company scope' }, MenuProps: menuProps } }} sx={{ ...field, width: 212 }}>{['Only self', 'Include subcompany'].map(value => <MenuItem key={value} value={value}>{value}</MenuItem>)}</TextField>
      <TextField select size="small" value={type} onChange={event => setType(event.target.value)} slotProps={{ select: { inputProps: { 'aria-label': 'Exception type' }, MenuProps: menuProps } }} sx={{ ...field, width: 212 }}>{alarmTypes.map(value => <MenuItem key={value} value={value}>{value}</MenuItem>)}</TextField>
      <TextField size="small" placeholder="Imei" value={imei} onChange={event => setImei(event.target.value)} slotProps={{ htmlInput: { 'aria-label': 'IMEI' } }} sx={field} />
      <Button type="submit" variant="contained" disabled={loading} sx={{ bgcolor: '#00998c', borderRadius: .3, height: 38 }}>Lookup</Button>
    </Box>
    {(validationError || error) && <Alert severity="error">{validationError || error}</Alert>}
    <Box sx={{ overflow: 'auto', height: 'max(360px, calc(100dvh - 360px))', mt: 3 }}>
      <Table sx={{ minWidth: 1200 }}><TableHead><TableRow>{['Device Name', 'Model', 'Imei', 'Exception Type', 'Exception Time', 'Location Time', 'State'].map(label => <TableCell key={label} sx={{ ...cell, bgcolor: '#f2f2f2', position: 'sticky', top: 0 }}>{label}</TableCell>)}</TableRow></TableHead>
        <TableBody>{rows.slice(currentPage * pageSize, (currentPage + 1) * pageSize).map(({ alert, device }) => <TableRow key={alert.id} hover>
          <TableCell sx={cell}>{device?.device_name ?? device?.serial_number ?? alert.device_name ?? '-'}</TableCell>
          <TableCell sx={cell}>{device?.device_model ?? alert.device_model ?? '-'}</TableCell>
          <TableCell sx={cell}>{device?.imei ?? alert.imei ?? '-'}</TableCell>
          <TableCell sx={cell}>{alert.message || alert.type}</TableCell>
          <TableCell sx={cell}>{displayTime(alert.created_at)}</TableCell>
          <TableCell sx={cell}>{displayTime(alert.location_time)}</TableCell>
          <TableCell sx={cell}>{alert.status}</TableCell>
        </TableRow>)}{!rows.length && <TableRow><TableCell colSpan={7} sx={{ ...cell, textAlign: 'center', color: '#999' }}>{loading ? 'Loading...' : 'No Data'}</TableCell></TableRow>}</TableBody>
      </Table>
    </Box>
    <Box sx={{ border: '1px solid #e3e3e3', display: 'flex', alignItems: 'center', gap: 1.5, p: 1, flexWrap: 'wrap' }}>
      <Button aria-label="Previous page" disabled={currentPage === 0} onClick={() => setPage(currentPage - 1)} sx={{ minWidth: 24 }}>{'<'}</Button><Box sx={{ bgcolor: '#00998c', color: '#fff', px: 1.5, py: .5 }}>{currentPage + 1}</Box><Button aria-label="Next page" disabled={currentPage + 1 >= pages} onClick={() => setPage(currentPage + 1)} sx={{ minWidth: 24 }}>{'>'}</Button>
      <Button aria-label="Refresh alarms" onClick={reload} disabled={loading} sx={{ minWidth: 24, color: '#666' }}><RefreshOutlined sx={{ fontSize: 18 }} /></Button><Typography sx={{ fontSize: 12 }}>Sum {rows.length} Rows</Typography>
      <TextField select size="small" value={pageSize} onChange={event => { setPageSize(Number(event.target.value)); setPage(0) }} slotProps={{ select: { inputProps: { 'aria-label': 'Rows per page' } } }} sx={{ '& .MuiOutlinedInput-root': { borderRadius: 0 }, '& .MuiSelect-select': { py: .5, fontSize: 12 } }}>{[12, 20, 50, 100].map(value => <MenuItem key={value} value={value}>{value} Rows/Page</MenuItem>)}</TextField>
    </Box>
  </Stack>
}
