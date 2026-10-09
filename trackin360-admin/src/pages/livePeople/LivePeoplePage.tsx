import { useCallback, useEffect, useMemo, useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { Alert, Box, Button, Menu, MenuItem, Stack, Switch, TextField, Typography } from '@mui/material'
import { ExpandMore, PersonOutlined } from '@mui/icons-material'
import { useApiData } from '../../hooks/useApiData'
import { getAccessToken, listDevices } from '../../services/api'
import MonitoringMap from './MonitoringMap'

export default function LivePeoplePage() {
  const [params] = useSearchParams()
  const [selectedId, setSelectedId] = useState<number | null>(() => params.get('device') ? Number(params.get('device')) : null)
  const [provider, setProvider] = useState(import.meta.env.VITE_GOOGLE_MAPS_API_KEY ? 'google' : 'osm')
  const [company, setCompany] = useState('')
  const [search, setSearch] = useState('')
  const [lookup, setLookup] = useState('')
  const [status, setStatus] = useState('All')
  const [showNames, setShowNames] = useState(false)
  const [aggregate, setAggregate] = useState(true)
  const [refresh, setRefresh] = useState(false)
  const [page, setPage] = useState(0)
  const [operation, setOperation] = useState<{ id: number; anchor: HTMLElement } | null>(null)
  const load = useCallback(() => getAccessToken() ? listDevices(0, 500) : Promise.resolve([]), [])
  const { data, loading, error, reload } = useApiData(load)
  useEffect(() => { if (!refresh) return; const timer = window.setInterval(reload, 30000); return () => window.clearInterval(timer) }, [refresh, reload])
  const companies = [...new Set((data ?? []).map(device => device.company).filter((value): value is string => Boolean(value)))]
  const devices = useMemo(() => (data ?? []).filter(device => {
    const normalized = device.status.toLowerCase().replace(/[_-]/g, ' ')
    const matchesStatus = status === 'All' || normalized === status.toLowerCase() || (status === 'Not Active' && ['inactive', 'not activated'].includes(normalized))
    return matchesStatus && (!company || device.company === company) && (!lookup || `${device.imei ?? ''} ${device.device_name ?? device.serial_number}`.toLowerCase().includes(lookup.toLowerCase()))
  }), [data, status, company, lookup])
  const pages = Math.max(1, Math.ceil(devices.length / 20)), currentPage = Math.min(page, pages - 1)
  const selected = devices.find(device => device.id === selectedId) ?? devices[0]
  const control = { '& .MuiOutlinedInput-root': { borderRadius: 0, font: '14px Arial, sans-serif', bgcolor: 'white' }, '& .MuiSelect-select': { py: 1 } }
  const menuProps = { slotProps: { paper: { sx: { borderRadius: 0, '& .MuiMenuItem-root': { fontSize: 14 }, '& .Mui-selected, & .Mui-selected:hover': { bgcolor: '#5cb879', color: '#fff' } } } } }
  return <Stack spacing={0} sx={{ bgcolor: '#fff', minHeight: 'calc(100vh - 180px)', font: '14px Arial, sans-serif' }}>
    <Box component="form" onSubmit={event => { event.preventDefault(); setLookup(search.trim()); setPage(0) }} sx={{ display: 'flex', alignItems: 'center', gap: .5, p: .5, pb: 1.5, flexWrap: 'wrap', borderBottom: '1px solid #ddd' }}>
      <TextField select size="small" value={provider} onChange={event => setProvider(event.target.value)} slotProps={{ select: { inputProps: { 'aria-label': 'Map provider' }, MenuProps: menuProps } }} sx={{ ...control, width: 145 }}><MenuItem value="google" disabled={!import.meta.env.VITE_GOOGLE_MAPS_API_KEY}>google</MenuItem><MenuItem value="osm">OpenStreetMap</MenuItem></TextField>
      <TextField select size="small" value={company} onChange={event => { setCompany(event.target.value); setPage(0) }} slotProps={{ select: { displayEmpty: true, inputProps: { 'aria-label': 'Company Name' }, MenuProps: menuProps } }} sx={{ ...control, width: 145 }}><MenuItem value="">Company Name</MenuItem>{companies.map(value => <MenuItem key={value} value={value}>{value}</MenuItem>)}</TextField>
      <TextField size="small" placeholder="Imei" value={search} onChange={event => setSearch(event.target.value)} slotProps={{ htmlInput: { 'aria-label': 'IMEI or device name' } }} sx={{ ...control, width: 140 }} />
      <TextField select size="small" value={status} onChange={event => { setStatus(event.target.value); setPage(0) }} slotProps={{ select: { inputProps: { 'aria-label': 'Device connection status' }, MenuProps: menuProps } }} sx={{ ...control, width: 110 }}>{['All', 'Online', 'Offline', 'Not Active'].map(value => <MenuItem key={value} value={value}>{value}</MenuItem>)}</TextField>
      <Button type="button" aria-pressed={showNames} onClick={() => setShowNames(!showNames)} sx={{ border: '1px solid #ddd', borderRadius: 0, bgcolor: showNames ? '#00998c' : '#ddd', color: showNames ? '#fff' : '#555', fontSize: 12 }}>show device name</Button>
      <Button type="submit" variant="contained" disabled={loading} sx={{ bgcolor: '#2196ff', borderRadius: .2, ml: 1 }}>Lookup</Button>
      <Box component="label" sx={{ display: 'flex', alignItems: 'center', pl: 1, bgcolor: '#5cb879', borderRadius: 4, color: '#fff', fontSize: 12 }}>Aggregate<Switch size="small" checked={aggregate} onChange={event => setAggregate(event.target.checked)} slotProps={{ input: { 'aria-label': 'Aggregate device locations' } }} /></Box>
      <Box component="label" sx={{ display: 'flex', alignItems: 'center', bgcolor: refresh ? '#5cb879' : '#f4f4f4', borderRadius: 4, color: refresh ? '#fff' : '#888', fontSize: 12 }}><Switch size="small" checked={refresh} onChange={event => setRefresh(event.target.checked)} slotProps={{ input: { 'aria-label': 'Automatically refresh devices' } }} />Refresh {refresh ? 'On' : 'Off'}</Box>
    </Box>
    {error && <Alert severity="error">{error}</Alert>}
    <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '200px minmax(0, 1fr)' }, minHeight: 'max(520px, calc(100dvh - 260px))' }}>
      <Box sx={{ borderRight: '1px solid #ddd', minWidth: 0 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, borderBottom: '1px solid #ddd', p: 1 }}><Button aria-label="Previous device page" disabled={currentPage === 0} onClick={() => setPage(currentPage - 1)} sx={{ minWidth: 20 }}>{'<'}</Button><Box sx={{ bgcolor: '#00998c', color: 'white', px: 1.5, py: .5 }}>{currentPage + 1}/{pages}</Box><Button aria-label="Next device page" disabled={currentPage + 1 >= pages} onClick={() => setPage(currentPage + 1)} sx={{ minWidth: 20 }}>{'>'}</Button></Box>
        {devices.slice(currentPage * 20, (currentPage + 1) * 20).map(device => <Box key={device.id} sx={{ display: 'flex', alignItems: 'center', borderBottom: '1px solid #ddd', py: .7, bgcolor: selected?.id === device.id ? '#eefaf8' : '#fff' }}>
          <Button onClick={() => setSelectedId(device.id)} sx={{ flex: 1, minWidth: 0, justifyContent: 'flex-start', color: '#00998c', fontSize: 14 }} startIcon={<PersonOutlined sx={{ fontSize: 15 }} />}><Box component="span" sx={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{device.device_name ?? device.serial_number}</Box></Button>
          <Button aria-haspopup="menu" aria-expanded={operation?.id === device.id} onClick={event => setOperation({ id: device.id, anchor: event.currentTarget })} endIcon={<ExpandMore />} sx={{ bgcolor: '#2196ff', color: '#fff', fontSize: 12, p: .5, borderRadius: .2 }}>Operation</Button>
        </Box>)}
        {!devices.length && <Typography sx={{ textAlign: 'center', color: '#999', mt: 12, fontSize: 14 }}>{loading ? 'Loading...' : 'No Data'}</Typography>}
      </Box>
      <Box sx={{ height: 'max(520px, calc(100dvh - 260px))', minWidth: 0 }}><MonitoringMap devices={devices} selectedId={selected?.id ?? null} showNames={showNames} aggregate={aggregate} provider={provider} /></Box>
    </Box>
    <Menu anchorEl={operation?.anchor} open={Boolean(operation)} onClose={() => setOperation(null)}><MenuItem onClick={() => { setSelectedId(operation?.id ?? null); setAggregate(false); setOperation(null) }}>Tracking</MenuItem><MenuItem component={Link} to={`/admin/location-history?device=${operation?.id ?? ''}`} onClick={() => setOperation(null)}>Playback</MenuItem><MenuItem component={Link} to={`/admin/health-data?device=${operation?.id ?? ''}`} onClick={() => setOperation(null)}>Health Data</MenuItem></Menu>
  </Stack>
}

