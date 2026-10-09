import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Box, Button, Checkbox, Dialog, DialogActions, DialogContent, DialogTitle, Menu, MenuItem, Table, TableBody, TableCell, TableHead, TableRow, Typography } from '@mui/material'
import { ExpandMore, LocationOnOutlined } from '@mui/icons-material'
import type { Device } from '../../services/api'

const columns: { label: string; value: (device: Device) => string | number }[] = [
  { label: 'Device Name', value: d => d.device_name ?? d.serial_number },
  { label: 'Company', value: d => d.company ?? '-' },
  { label: 'Device SIM', value: d => d.device_sim ?? '-' },
  { label: 'Device Model', value: d => d.device_model ?? '-' },
  { label: 'Activation Time', value: d => d.activation_time ?? '-' },
  { label: 'Last communication time', value: d => d.last_seen ? new Date(d.last_seen).toLocaleString() : '-' },
  { label: 'Battery', value: d => d.battery_pct == null ? '-' : `${d.battery_pct}%` },
  { label: 'Heart rate', value: d => d.heart_rate ?? '-' },
  { label: 'Blood pressure', value: d => d.blood_pressure ?? '-' },
  { label: 'Temperature', value: d => d.temperature == null ? '-' : `${d.temperature}Â°C` },
  { label: 'Step counter', value: d => d.step_counter ?? '-' },
  { label: 'Sleep', value: d => d.sleep ?? '-' },
  { label: 'Blood Oxygen', value: d => d.blood_oxygen == null ? '-' : `${d.blood_oxygen}%` },
  { label: 'Create Time', value: d => d.created_at ? new Date(d.created_at).toLocaleDateString() : '-' },
  { label: 'Status', value: d => d.status },
  { label: 'Person ID', value: d => d.custody_person_id ?? 'Unassigned' },
]

export default function DeviceTable({ devices, onAssign, onUnassign }: { devices: Device[]; onAssign: (id: number) => void; onUnassign: (id: number) => void }) {
  const [selected, setSelected] = useState<number[]>([])
  const [menu, setMenu] = useState<{ anchor: HTMLElement; device: Device } | null>(null)
  const [detail, setDetail] = useState<{ title: string; device: Device } | null>(null)
  const allSelected = devices.length > 0 && devices.every(d => selected.includes(d.id))
  const cell = { py: 1, px: 2, border: '1px solid #e3e3e3', whiteSpace: 'nowrap', font: '14px Arial, sans-serif', color: '#666' }
  const fixed = { position: 'sticky', bgcolor: '#fff', zIndex: 2 } as const
  const action = { minWidth: 0, px: .7, py: .3, borderRadius: .3, font: '12px Arial, sans-serif', color: '#fff' }
  return <>
    <Box sx={{ overflowX: 'auto', height: 360, maxWidth: '100%', bgcolor: '#fff' }}>
      <Table sx={{ width: 2573, tableLayout: 'fixed', '& thead th': { bgcolor: '#f2f2f2', height: 39 }, '& td, & th': { overflow: 'hidden', textOverflow: 'ellipsis' } }}>
        <colgroup><col style={{ width: 48 }} /><col style={{ width: 170 }} />{columns.map(column => <col key={column.label} style={{ width: column.label === 'Last communication time' ? 200 : 125 }} />)}<col style={{ width: 280 }} /></colgroup>
        <TableHead><TableRow>
          <TableCell sx={{ ...cell, ...fixed, left: 0, width: 48, px: 0 }}><Checkbox size="small" checked={allSelected} indeterminate={!allSelected && devices.some(d => selected.includes(d.id))} slotProps={{ input: { 'aria-label': 'Select all visible devices' } }} onChange={event => setSelected(event.target.checked ? devices.map(d => d.id) : [])} /></TableCell>
          <TableCell sx={{ ...cell, ...fixed, left: 48, minWidth: 170 }}>IMEI</TableCell>
          {columns.map(column => <TableCell key={column.label} sx={cell}>{column.label}</TableCell>)}
          <TableCell sx={{ ...cell, ...fixed, right: 0, minWidth: 250 }}>Operation</TableCell>
        </TableRow></TableHead>
        <TableBody>{devices.map(device => <TableRow key={device.id}>
          <TableCell sx={{ ...cell, ...fixed, left: 0, width: 48, px: 0 }}><Checkbox size="small" checked={selected.includes(device.id)} slotProps={{ input: { 'aria-label': `Select ${device.serial_number}` } }} onChange={event => setSelected(current => event.target.checked ? [...current, device.id] : current.filter(id => id !== device.id))} /></TableCell>
          <TableCell sx={{ ...cell, ...fixed, left: 48 }}>{device.imei ?? '-'}</TableCell>
          {columns.map(column => <TableCell key={column.label} sx={cell}>{column.value(device)}</TableCell>)}
          <TableCell sx={{ ...cell, ...fixed, right: 0 }}><Box sx={{ display: 'flex', gap: .5 }}>
            <Button component={Link} to={`/admin/monitoring-center?device=${device.id}`} startIcon={<LocationOnOutlined />} sx={{ ...action, bgcolor: '#ffb900', '&:hover': { bgcolor: '#dda000' } }}>Tracking</Button>
            <Button component={Link} to={`/admin/location-history?device=${device.id}`} startIcon={<LocationOnOutlined />} sx={{ ...action, bgcolor: '#00998c', '&:hover': { bgcolor: '#007b70' } }}>Playback</Button>
            <Button aria-haspopup="menu" aria-expanded={menu?.device.id === device.id} onClick={event => setMenu({ anchor: event.currentTarget, device })} endIcon={<ExpandMore />} sx={{ ...action, bgcolor: '#2196ff', '&:hover': { bgcolor: '#1876cc' } }}>More</Button>
          </Box></TableCell>
        </TableRow>)}{devices.length === 0 && <TableRow><TableCell colSpan={19} sx={cell}>No matching devices</TableCell></TableRow>}</TableBody>
      </Table>
    </Box>
    <Menu anchorEl={menu?.anchor} open={Boolean(menu)} onClose={() => setMenu(null)} slotProps={{ paper: { sx: { borderRadius: .3 } } }}>
      {['Edit', 'Person Profile', 'Relation', 'Device instruction'].map(title => <MenuItem key={title} onClick={() => { if (!menu) return; if (title === 'Relation') onAssign(menu.device.id); else setDetail({ title, device: menu.device }); setMenu(null) }}>{title}</MenuItem>)}
      <MenuItem component={Link} to={`/admin/health-data?device=${menu?.device.id ?? ''}`} onClick={() => setMenu(null)}>Health Data</MenuItem>
      {menu?.device.custody_person_id != null && <MenuItem onClick={() => { onUnassign(menu.device.id); setMenu(null) }}>Unassign</MenuItem>}
    </Menu>
    <Dialog open={Boolean(detail)} onClose={() => setDetail(null)} fullWidth maxWidth="sm">
      <DialogTitle>{detail?.title}</DialogTitle><DialogContent>
        {detail && <><Typography>Device: {detail.device.device_name ?? detail.device.serial_number}</Typography><Typography>IMEI: {detail.device.imei ?? '-'}</Typography>
          {detail.title === 'Person Profile' ? <><Typography>Person ID: {detail.device.custody_person_id ?? 'Unassigned'}</Typography><Button component={Link} to="/admin/people">View people</Button></> : <Typography sx={{ mt: 2 }}>{detail.title === 'Edit' ? 'Device editing is unavailable with the current API.' : 'Device instructions are unavailable with the current API.'}</Typography>}
        </>}
      </DialogContent><DialogActions><Button onClick={() => setDetail(null)}>Close</Button></DialogActions>
    </Dialog>
  </>
}


