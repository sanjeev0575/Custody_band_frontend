import { useCallback, useMemo, useState, type FormEvent } from 'react'
import { Alert, Box, Button, MenuItem, Stack, Table, TableBody, TableCell, TableHead, TableRow, TextField } from '@mui/material'
import { useApiData } from '../../hooks/useApiData'
import { getAccessToken, listDevices } from '../../services/api'

const dayKey = (value: string | Date) => {
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return ''
  const parts = new Intl.DateTimeFormat('en-CA', { timeZone: 'Asia/Kolkata', year: 'numeric', month: '2-digit', day: '2-digit' }).formatToParts(date)
  return ['year', 'month', 'day'].map(type => parts.find(part => part.type === type)?.value).join('-')
}

export default function DeviceStatisticsPage() {
  const today = dayKey(new Date())
  const [start, setStart] = useState(today), [end, setEnd] = useState(today)
  const [parent, setParent] = useState(''), [company, setCompany] = useState('')
  const [kind, setKind] = useState('Import'), [scope, setScope] = useState('Only self')
  const [filters, setFilters] = useState({ start: today, end: today, parent: '', company: '', kind: 'Import', scope: 'Only self' })
  const [showTable, setShowTable] = useState(false), [exporting, setExporting] = useState(false)
  const [message, setMessage] = useState('')
  const load = useCallback(() => getAccessToken() ? listDevices(0, 500) : Promise.resolve([]), [])
  const { data, loading, error, reload } = useApiData(load)
  const parents = [...new Set((data ?? []).map(device => device.parent_customer).filter((value): value is string => Boolean(value)))]
  const companies = [...new Set((data ?? []).filter(device => !parent || device.parent_customer === parent).map(device => device.company).filter((value): value is string => Boolean(value)))]
  const devices = useMemo(() => (data ?? []).filter(device => {
    const timestamp = filters.kind === 'Online' ? device.last_seen : filters.kind === 'Active' ? device.activation_time : device.created_at
    const day = timestamp ? dayKey(timestamp) : ''
    return day >= filters.start && day <= filters.end
      && (filters.kind !== 'Online' || device.status.toLowerCase() === 'online')
      && (!filters.parent || device.parent_customer === filters.parent)
      && (!filters.company || device.company === filters.company)
      && (filters.scope === 'Include subcompany' || device.is_subcompany !== true)
  }), [data, filters])
  const lookup = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    if (!start || !end || start > end) { setMessage('Choose an end date on or after the start date.'); return }
    setMessage('')
    setFilters({ start, end, parent, company, kind, scope })
    setShowTable(true)
    reload()
  }
  const exportExcel = async () => {
    if (!start || !end || start > end) { setMessage('Choose an end date on or after the start date.'); return }
    setExporting(true)
    setMessage('')
    try { const { downloadDeviceWorkbook } = await import('../devices/deviceExport'); downloadDeviceWorkbook(devices) }
    catch (reason) { setMessage(reason instanceof Error ? reason.message : 'Unable to export the spreadsheet.') }
    finally { setExporting(false) }
  }
  const control = { flex: '1 1 170px', minWidth: 150, '& .MuiOutlinedInput-root': { borderRadius: 0, bgcolor: '#fff', font: '14px Arial, sans-serif' } }
  const menuProps = { slotProps: { paper: { sx: { borderRadius: 0, '& .MuiMenuItem-root': { minHeight: 36, font: '14px Arial, sans-serif' }, '& .Mui-selected, & .Mui-selected:hover': { bgcolor: '#5cb879', color: '#fff' } } } } }
  const cell = { border: '1px solid #e3e3e3', py: 1, px: 2, color: '#666', font: '14px Arial, sans-serif', whiteSpace: 'nowrap' }
  return <Stack spacing={0} sx={{ bgcolor: '#fff', minHeight: 'calc(100vh - 180px)', minWidth: 0 }}>
    <Box component="form" onSubmit={lookup} sx={{ bgcolor: '#f2f2f2', p: 2, borderLeft: '4px solid #00998c' }}>
      <Box sx={{ display: 'flex', gap: .5, flexWrap: 'wrap', alignItems: 'center' }}>
        <TextField type="date" size="small" value={start} onChange={event => setStart(event.target.value)} slotProps={{ htmlInput: { 'aria-label': 'Start date' } }} sx={control} />
        <TextField type="date" size="small" value={end} onChange={event => setEnd(event.target.value)} slotProps={{ htmlInput: { 'aria-label': 'End date', min: start } }} sx={control} />
        <TextField select size="small" value={parent} onChange={event => { setParent(event.target.value); setCompany('') }} slotProps={{ select: { displayEmpty: true, inputProps: { 'aria-label': 'Parent Customer' }, MenuProps: menuProps } }} sx={control}><MenuItem value="">Parent Customer</MenuItem>{parents.map(value => <MenuItem key={value} value={value}>{value}</MenuItem>)}</TextField>
        <TextField select size="small" value={company} onChange={event => setCompany(event.target.value)} slotProps={{ select: { displayEmpty: true, inputProps: { 'aria-label': 'Customer' }, MenuProps: menuProps } }} sx={control}><MenuItem value="">Please select</MenuItem>{companies.map(value => <MenuItem key={value} value={value}>{value}</MenuItem>)}</TextField>
        <TextField select size="small" value={kind} onChange={event => setKind(event.target.value)} slotProps={{ select: { inputProps: { 'aria-label': 'Statistics type' }, MenuProps: menuProps } }} sx={control}>{['Import', 'Online', 'Active'].map(value => <MenuItem key={value} value={value}>{value}</MenuItem>)}</TextField>
        <TextField select size="small" value={scope} onChange={event => setScope(event.target.value)} slotProps={{ select: { inputProps: { 'aria-label': 'Company scope' }, MenuProps: menuProps } }} sx={control}>{['Only self', 'Include subcompany'].map(value => <MenuItem key={value} value={value}>{value}</MenuItem>)}</TextField>
        <Button type="submit" variant="contained" disabled={loading} sx={{ bgcolor: '#00998c', borderRadius: .3, height: 38 }}>Lookup</Button>
      </Box>
      <Box sx={{ display: 'flex', mt: .5, pl: 1 }}>
        <Button type="button" variant="contained" onClick={() => void exportExcel()} disabled={loading || exporting} sx={{ bgcolor: '#2196ff', borderRadius: .3, minWidth: 124 }}>{exporting ? 'Exporting...' : 'Import Excel'}</Button>
      </Box>
    </Box>
    {(message || error) && <Alert severity="error">{message || error}</Alert>}
    {showTable && <Box sx={{ overflow: 'auto', mt: 3 }}><Table sx={{ minWidth: 1500 }}><TableHead><TableRow>{['Company Name', 'Device Name', 'Imei', 'Device SIM', 'Device Model', 'Create Time', 'Activate Time', 'Device expire time', 'Last communication time'].map(label => <TableCell key={label} sx={{ ...cell, bgcolor: '#f2f2f2' }}>{label}</TableCell>)}</TableRow></TableHead><TableBody>
      {devices.map(device => <TableRow key={device.id}>{[device.company, device.device_name ?? device.serial_number, device.imei, device.device_sim, device.device_model, device.created_at, device.activation_time, device.expire_time, device.last_seen].map((value, index) => <TableCell key={index} sx={cell}>{value ?? '-'}</TableCell>)}</TableRow>)}
      {!devices.length && <TableRow><TableCell colSpan={9} sx={{ ...cell, textAlign: 'center', color: '#999' }}>{loading ? 'Loading...' : 'No Data'}</TableCell></TableRow>}
    </TableBody></Table></Box>}
  </Stack>
}
