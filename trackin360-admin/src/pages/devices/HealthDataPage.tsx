import { useCallback } from 'react'
import { useSearchParams } from 'react-router-dom'
import { Box, Card, CardContent, Chip, Stack, Table, TableBody, TableCell, TableHead, TableRow, Typography } from '@mui/material'
import ApiFeedback from '../../components/common/ApiFeedback'
import { useApiData } from '../../hooks/useApiData'
import { listDevices } from '../../services/api'

function HealthDataPage() {
  const [params] = useSearchParams()
  const loadDevices = useCallback(() => listDevices(0, 500), [])
  const { data: devices, loading, error } = useApiData(loadDevices)

  return (
    <Stack spacing={3}>
      <Box>
        <Typography variant="h4" sx={{ fontWeight: 700 }}>Health Data</Typography>
        <Typography variant="body2" color="text.secondary">Battery and connection status reported by tracking devices</Typography>
      </Box>
      <Card>
        <CardContent sx={{ overflowX: 'auto' }}>
          <Table sx={{ minWidth: 700 }}>
            <TableHead>
              <TableRow>
                <TableCell>Device</TableCell>
                <TableCell>Battery</TableCell>
                <TableCell>Connection Status</TableCell>
                <TableCell>Last Seen</TableCell>
                <TableCell>Person ID</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {devices?.filter(device => !params.get('device') || String(device.id) === params.get('device')).map((device) => (
                <TableRow key={device.id} hover>
                  <TableCell>{device.serial_number}</TableCell>
                  <TableCell>{device.battery_pct == null ? 'Not reported' : `${device.battery_pct}%`}</TableCell>
                  <TableCell><Chip label={device.status} size="small" variant="outlined" /></TableCell>
                  <TableCell>{device.last_seen ? new Date(device.last_seen).toLocaleString() : 'Not reported'}</TableCell>
                  <TableCell>{device.custody_person_id ?? 'Unassigned'}</TableCell>
                </TableRow>
              ))}
              {devices && devices.length === 0 && (
                <TableRow><TableCell colSpan={5}><ApiFeedback loading={false} error="" empty emptyMessage="No device health data returned by the API." /></TableCell></TableRow>
              )}
            </TableBody>
          </Table>
          {!devices && <ApiFeedback loading={loading} error={error} empty={false} emptyMessage="" />}
        </CardContent>
      </Card>
    </Stack>
  )
}

export default HealthDataPage
