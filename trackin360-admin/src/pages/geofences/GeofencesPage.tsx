import { useCallback, useState, type FormEvent } from 'react'
import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControl,
  InputLabel,
  MenuItem,
  Select,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  TextField,
  Typography,
} from '@mui/material'
import ApiFeedback from '../../components/common/ApiFeedback'
import { useApiData } from '../../hooks/useApiData'
import { createGeofence, deleteGeofence, listGeofences, updateGeofence, type FenceType } from '../../services/api'

function GeofencesPage() {
  const [dialogOpen, setDialogOpen] = useState(false)
  const [actionError, setActionError] = useState('')
  const [name, setName] = useState('')
  const [latitude, setLatitude] = useState('')
  const [longitude, setLongitude] = useState('')
  const [radius, setRadius] = useState('')
  const [fenceType, setFenceType] = useState<FenceType>('exclusion')
  const loadGeofences = useCallback(() => listGeofences(0, 500), [])
  const { data: geofences, loading, error, reload } = useApiData(loadGeofences)

  const handleCreate = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setActionError('')
    try {
      await createGeofence({
        name: name.trim(),
        fence_type: fenceType,
        latitude: Number(latitude),
        longitude: Number(longitude),
        radius_m: Number(radius),
      })
      setDialogOpen(false)
      setName('')
      setLatitude('')
      setLongitude('')
      setRadius('')
      setFenceType('exclusion')
      reload()
    } catch (reason) {
      setActionError(reason instanceof Error ? reason.message : 'Unable to create geofence.')
    }
  }

  const handleToggle = async (id: number, isActive: boolean) => {
    setActionError('')
    try {
      await updateGeofence(id, { is_active: !isActive })
      reload()
    } catch (reason) {
      setActionError(reason instanceof Error ? reason.message : 'Unable to update geofence.')
    }
  }

  const handleDelete = async (id: number) => {
    setActionError('')
    try {
      await deleteGeofence(id)
      reload()
    } catch (reason) {
      setActionError(reason instanceof Error ? reason.message : 'Unable to delete geofence.')
    }
  }

  return (
    <Stack spacing={3}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 2 }}>
        <Box>
          <Typography variant="h4" sx={{ fontWeight: 700 }}>Geofences</Typography>
          <Typography variant="body2" color="text.secondary">Configured areas from the custody tracking API</Typography>
        </Box>
        <Button variant="contained" onClick={() => setDialogOpen(true)}>Create Geofence</Button>
      </Box>
      {actionError && <Alert severity="error" onClose={() => setActionError('')}>{actionError}</Alert>}
      <Card>
        <CardContent sx={{ overflowX: 'auto' }}>
          <Table sx={{ minWidth: 850 }}>
            <TableHead>
              <TableRow>
                <TableCell>Name</TableCell>
                <TableCell>Type</TableCell>
                <TableCell>Latitude</TableCell>
                <TableCell>Longitude</TableCell>
                <TableCell>Radius</TableCell>
                <TableCell>Trip ID</TableCell>
                <TableCell>Status</TableCell>
                <TableCell>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {geofences?.map((geofence) => (
                <TableRow key={geofence.id} hover>
                  <TableCell>{geofence.name}</TableCell>
                  <TableCell>{geofence.fence_type}</TableCell>
                  <TableCell>{geofence.latitude}</TableCell>
                  <TableCell>{geofence.longitude}</TableCell>
                  <TableCell>{geofence.radius_m} m</TableCell>
                  <TableCell>{geofence.trip_id ?? '—'}</TableCell>
                  <TableCell><Chip label={geofence.is_active ? 'Active' : 'Disabled'} size="small" color={geofence.is_active ? 'success' : 'default'} /></TableCell>
                  <TableCell>
                    <Stack direction="row" spacing={1}>
                      <Button size="small" onClick={() => void handleToggle(geofence.id, geofence.is_active)}>
                        {geofence.is_active ? 'Disable' : 'Enable'}
                      </Button>
                      <Button size="small" color="error" onClick={() => void handleDelete(geofence.id)}>Delete</Button>
                    </Stack>
                  </TableCell>
                </TableRow>
              ))}
              {geofences && geofences.length === 0 && (
                <TableRow><TableCell colSpan={8}><ApiFeedback loading={false} error="" empty emptyMessage="No geofences returned by the API." /></TableCell></TableRow>
              )}
            </TableBody>
          </Table>
          {!geofences && <ApiFeedback loading={loading} error={error} empty={false} emptyMessage="" />}
        </CardContent>
      </Card>
      <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)} fullWidth maxWidth="sm">
        <Box component="form" onSubmit={handleCreate}>
          <DialogTitle>Create Geofence</DialogTitle>
          <DialogContent>
            <Stack spacing={2} sx={{ pt: 1 }}>
              <TextField label="Name" value={name} onChange={(event) => setName(event.target.value)} required />
              <FormControl>
                <InputLabel id="fence-type-label">Type</InputLabel>
                <Select
                  labelId="fence-type-label"
                  label="Type"
                  value={fenceType}
                  onChange={(event) => {
                    const value = event.target.value
                    if (value === 'inclusion' || value === 'exclusion') setFenceType(value)
                  }}
                >
                  <MenuItem value="inclusion">Inclusion</MenuItem>
                  <MenuItem value="exclusion">Exclusion</MenuItem>
                </Select>
              </FormControl>
              <TextField label="Latitude" type="number" value={latitude} onChange={(event) => setLatitude(event.target.value)} required slotProps={{ htmlInput: { step: 'any', min: -90, max: 90 } }} />
              <TextField label="Longitude" type="number" value={longitude} onChange={(event) => setLongitude(event.target.value)} required slotProps={{ htmlInput: { step: 'any', min: -180, max: 180 } }} />
              <TextField label="Radius (meters)" type="number" value={radius} onChange={(event) => setRadius(event.target.value)} required slotProps={{ htmlInput: { step: 'any', min: 0.1 } }} />
            </Stack>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setDialogOpen(false)}>Cancel</Button>
            <Button type="submit" variant="contained">Create</Button>
          </DialogActions>
        </Box>
      </Dialog>
    </Stack>
  )
}

export default GeofencesPage
