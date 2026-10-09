import { useCallback, useState } from 'react'
import { Alert, Box, Button, Card, CardContent, Chip, Stack, Table, TableBody, TableCell, TableHead, TableRow, Typography } from '@mui/material'
import ApiFeedback from '../../components/common/ApiFeedback'
import { useApiData } from '../../hooks/useApiData'
import { acknowledgeAlert, listAlerts, resolveAlert } from '../../services/api'

function AlertsPage() {
  const [actionError, setActionError] = useState('')
  const loadAlerts = useCallback(() => listAlerts(0, 500), [])
  const { data: alerts, loading, error, reload } = useApiData(loadAlerts)

  const runAction = async (id: number, action: 'acknowledge' | 'resolve') => {
    setActionError('')
    try {
      if (action === 'acknowledge') await acknowledgeAlert(id)
      else await resolveAlert(id)
      reload()
    } catch (reason) {
      setActionError(reason instanceof Error ? reason.message : 'Unable to update alert.')
    }
  }

  return (
    <Stack spacing={3}>
      <Box>
        <Typography variant="h4" sx={{ fontWeight: 700 }}>Alerts</Typography>
        <Typography variant="body2" color="text.secondary">Monitoring and incident management</Typography>
      </Box>
      {actionError && <Alert severity="error" onClose={() => setActionError('')}>{actionError}</Alert>}
      <Card>
        <CardContent>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Time</TableCell>
                <TableCell>Device</TableCell>
                <TableCell>Alert Type</TableCell>
                <TableCell>Message</TableCell>
                <TableCell>Location</TableCell>
                <TableCell>Severity</TableCell>
                <TableCell>Status</TableCell>
                <TableCell>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {alerts?.map((alert) => (
                <TableRow key={alert.id} hover>
                  <TableCell>{new Date(alert.created_at).toLocaleString()}</TableCell>
                  <TableCell>{alert.device_id ?? '—'}</TableCell>
                  <TableCell>{alert.type}</TableCell>
                  <TableCell>{alert.message}</TableCell>
                  <TableCell>
                    {alert.latitude !== null && alert.longitude !== null ? `${alert.latitude}, ${alert.longitude}` : '—'}
                  </TableCell>
                  <TableCell>
                    <Chip label={alert.severity} size="small" color={alert.severity.toLowerCase() === 'critical' ? 'error' : alert.severity.toLowerCase() === 'high' ? 'warning' : 'default'} />
                  </TableCell>
                  <TableCell>{alert.status}</TableCell>
                  <TableCell>
                    <Stack direction="row" spacing={1}>
                      {alert.status.toLowerCase() !== 'acknowledged' && alert.status.toLowerCase() !== 'resolved' && (
                        <Button size="small" onClick={() => void runAction(alert.id, 'acknowledge')}>Acknowledge</Button>
                      )}
                      {alert.status.toLowerCase() !== 'resolved' && (
                        <Button size="small" onClick={() => void runAction(alert.id, 'resolve')}>Resolve</Button>
                      )}
                    </Stack>
                  </TableCell>
                </TableRow>
              ))}
              {alerts && alerts.length === 0 && (
                <TableRow><TableCell colSpan={8}><ApiFeedback loading={false} error="" empty emptyMessage="No alerts returned by the API." /></TableCell></TableRow>
              )}
            </TableBody>
          </Table>
          {!alerts && <ApiFeedback loading={loading} error={error} empty={false} emptyMessage="" />}
        </CardContent>
      </Card>
    </Stack>
  )
}

export default AlertsPage
