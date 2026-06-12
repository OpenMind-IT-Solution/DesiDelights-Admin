
'use client'

import React, { useEffect, useState } from 'react'

import dynamic from 'next/dynamic'

import {
  Box,
  Button,
  Card,
  CardContent,
  CardHeader,
  Chip,
  CircularProgress,
  Divider,
  Grid,
  IconButton,
  InputAdornment,
  List,
  ListItem,
  ListItemButton,
  ListItemText,
  Switch,
  TextField,
  Tooltip,
  Typography
} from '@mui/material'
import type { LatLng, LatLngExpression } from 'leaflet'
import {
  CheckCircleOutline,
  CloseCircleOutline,
  ContentSaveEditOutline,
  DeleteOutline,
  MapMarkerPlusOutline,
  TrashCanOutline
} from 'mdi-material-ui'

import { toast } from 'react-toastify'

import DeleteConfirmationDialog from '@/components/dialogs/DeleteConfirmationDialog'

interface Zone {
  id: number | null
  name: string
  charge: number
  boundary: LatLngExpression[]
  status: 'active' | 'inactive'
}

const LocationMap = dynamic(() => import('../../../../../../components/maps/LocationMap'), {
  ssr: false,
  loading: () => (
    <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%' }}>
      <CircularProgress /> <Typography sx={{ ml: 2 }}>Loading Map...</Typography>
    </Box>
  )
})

const initialZones: Zone[] = [
  {
    id: 1,
    name: 'Brussels Capital Region',
    charge: 5.0,
    boundary: [
      [50.87, 4.35],
      [50.85, 4.4],
      [50.83, 4.38],
      [50.83, 4.32],
      [50.87, 4.35]
    ],
    status: 'active'
  },
  {
    id: 2,
    name: 'Antwerp City Center',
    charge: 7.5,
    boundary: [
      [51.22, 4.4],
      [51.23, 4.42],
      [51.21, 4.42],
      [51.22, 4.4]
    ],
    status: 'active'
  },
  {
    id: 3,
    name: 'Ghent (Inactive)',
    charge: 10.0,
    boundary: [
      [51.05, 3.7],
      [51.06, 3.72],
      [51.04, 3.74],
      [51.03, 3.72],
      [51.05, 3.7]
    ],
    status: 'inactive'
  }
]

const getPolygonCenter = (boundary: LatLngExpression[]): LatLngExpression => {
  if (!boundary || boundary.length === 0) return [50.8503, 4.3517]
  const lats = boundary.map(p => (p as number[])[0])
  const lngs = boundary.map(p => (p as number[])[1])

  
return [lats.reduce((a, b) => a + b, 0) / lats.length, lngs.reduce((a, b) => a + b, 0) / lngs.length]
}

const LocationSettings: React.FC = () => {
  const [zones, setZones] = useState<Zone[]>(initialZones)
  const [selectedZone, setSelectedZone] = useState<Zone | null>(zones.length > 0 ? zones[0] : null)

  const [mapCenter, setMapCenter] = useState<LatLngExpression>(
    zones.length > 0 ? getPolygonCenter(zones[0].boundary) : [50.8503, 4.3517]
  )

  const [isDrawing, setIsDrawing] = useState<boolean>(false)
  const [isEditingBoundary, setIsEditingBoundary] = useState<boolean>(false)
  const [drawingPoints, setDrawingPoints] = useState<LatLngExpression[]>([])
  const [formValues, setFormValues] = useState({ name: '', charge: 0 })
  const [dialogOpen, setDialogOpen] = useState<boolean>(false)
  const [zoneToDelete, setZoneToDelete] = useState<number | null>(null)

  useEffect(() => {
    if (selectedZone) {
      if (selectedZone.boundary && selectedZone.boundary.length > 0) {
        setMapCenter(getPolygonCenter(selectedZone.boundary))
      }

      setFormValues({ name: selectedZone.name, charge: selectedZone.charge })
    } else {
      setMapCenter([50.8503, 4.3517])
    }
  }, [selectedZone])

  const handleToggleZoneStatus = (zoneId: number) => {
    setZones(prevZones =>
      prevZones.map(zone =>
        zone.id === zoneId ? { ...zone, status: zone.status === 'active' ? 'inactive' : 'active' } : zone
      )
    )
  }

  const handleDeleteClick = (zoneId: number) => {
    setZoneToDelete(zoneId)
    setDialogOpen(true)
  }

  const handleCloseDialog = () => {
    setDialogOpen(false)
    setZoneToDelete(null)
  }

  const handleConfirmDelete = () => {
    if (zoneToDelete !== null) {
      setZones(prevZones => prevZones.filter(zone => zone.id !== zoneToDelete))

      if (selectedZone?.id === zoneToDelete) {
        setSelectedZone(null)
      }
    }

    handleCloseDialog()
  }


  const handleSelectZone = (zone: Zone) => {
    setIsDrawing(false)
    setIsEditingBoundary(false)
    setDrawingPoints([])
    setSelectedZone(zone)
  }

  const handleFormChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = event.target

    setFormValues(prev => ({ ...prev, [name]: value }))
  }

  const handleSaveChanges = () => {
    if (!selectedZone) return

    const updatedZones = zones.map(z =>
      z.id === selectedZone.id ? { ...z, name: formValues.name, charge: Number(formValues.charge) } : z
    )

    setZones(updatedZones)
    setSelectedZone(updatedZones.find(z => z.id === selectedZone.id) || null)
    toast.success('Changes saved!')
  }

  const handleAddNewZoneClick = () => {
    setSelectedZone(null)
    setDrawingPoints([])
    setIsDrawing(true)
    setIsEditingBoundary(false)
  }

  const handleEditBoundaryClick = () => {
    if (!selectedZone) return
    setIsEditingBoundary(true)
    const boundaryToEdit = [...selectedZone.boundary]

    if (
      boundaryToEdit.length > 1 &&
      JSON.stringify(boundaryToEdit[0]) === JSON.stringify(boundaryToEdit[boundaryToEdit.length - 1])
    ) {
      boundaryToEdit.pop()
    }

    setDrawingPoints(boundaryToEdit)
  }

  const handleMapClick = (latlng: LatLng) => {
    setDrawingPoints(prev => [...prev, [latlng.lat, latlng.lng]])
  }

  const handleFinishDrawing = () => {
    const newZone: Zone = {
      id: Date.now(),
      name: 'New Custom Zone',
      charge: 15.0,
      boundary: [...drawingPoints, drawingPoints[0]],
      status: 'active'
    }

    setZones(prevZones => [...prevZones, newZone])
    setSelectedZone(newZone)
    setIsDrawing(false)
    setDrawingPoints([])
  }

  const handleSaveBoundary = () => {
    if (!selectedZone) return
    const updatedBoundary = drawingPoints.length > 0 ? [...drawingPoints, drawingPoints[0]] : []
    const updatedZones = zones.map(z => (z.id === selectedZone.id ? { ...z, boundary: updatedBoundary } : z))

    setZones(updatedZones)
    setSelectedZone(updatedZones.find(z => z.id === selectedZone.id) || null)
    setIsEditingBoundary(false)
    setDrawingPoints([])
  }

  const handleCancelEdit = () => {
    setIsDrawing(false)
    setIsEditingBoundary(false)
    setDrawingPoints([])
  }

  return (
    <>
      <Grid container spacing={6}>
        <Grid item xs={12} lg={8}>
          <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
            <CardHeader
              title='Delivery Zone Manager'
              subheader={
                isDrawing
                  ? 'Click to add points for a new zone'
                  : isEditingBoundary
                    ? 'Now editing boundary. Click map to add points.'
                    : 'Select a zone or search a location.'
              }
            />
            <CardContent sx={{ flexGrow: 1, position: 'relative', minHeight: '600px' }}>
              <LocationMap
                zone={selectedZone}
                mapCenter={mapCenter}
                isDrawing={isDrawing || isEditingBoundary}
                onMapClick={handleMapClick}
                drawingPoints={drawingPoints}
              />
              <Box sx={{ position: 'absolute', top: 24, right: 24, zIndex: 1001 }}>
                <Button
                  variant='contained'
                  startIcon={<MapMarkerPlusOutline />}
                  onClick={handleAddNewZoneClick}
                  disabled={isDrawing || isEditingBoundary}
                >
                  Draw New Zone
                </Button>
              </Box>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} lg={4}>
          <Grid container spacing={6}>
            <Grid item xs={12}>
              <Card>
                <CardHeader
                  title={
                    isDrawing
                      ? 'Drawing New Zone'
                      : isEditingBoundary
                        ? 'Editing Boundary'
                        : selectedZone
                          ? 'Edit Zone Details'
                          : 'Zone Details'
                  }
                />
                <Divider />
                <CardContent component='form'>
                  {isDrawing ? (
                    <>
                      <Typography variant='body2' sx={{ mb: 2 }}>
                        Click points on the map to create a boundary. Finish when done.
                      </Typography>
                      <Box sx={{ display: 'flex', gap: 2, mb: 2 }}>
                        <Button
                          variant='contained'
                          color='success'
                          startIcon={<CheckCircleOutline />}
                          onClick={handleFinishDrawing}
                          disabled={drawingPoints.length < 3}
                        >
                          Finish Drawing
                        </Button>
                        <Button
                          variant='outlined'
                          color='error'
                          startIcon={<CloseCircleOutline />}
                          onClick={handleCancelEdit}
                        >
                          Cancel
                        </Button>
                      </Box>
                    </>
                  ) : isEditingBoundary ? (
                    <>
                      <Typography variant='body2' sx={{ mb: 2 }}>
                        Click points on map to add. Use the list below to remove points.
                      </Typography>
                      <Box sx={{ display: 'flex', gap: 2, mb: 2 }}>
                        <Button
                          variant='contained'
                          color='success'
                          startIcon={<CheckCircleOutline />}
                          onClick={handleSaveBoundary}
                          disabled={drawingPoints.length < 3}
                        >
                          Save Boundary
                        </Button>
                        <Button
                          variant='outlined'
                          color='error'
                          startIcon={<CloseCircleOutline />}
                          onClick={handleCancelEdit}
                        >
                          Cancel
                        </Button>
                      </Box>
                    </>
                  ) : selectedZone ? (
                    <>
                      <TextField
                        fullWidth
                        label='Zone Name'
                        name='name'
                        variant='outlined'
                        sx={{ mb: 4 }}
                        value={formValues.name}
                        onChange={handleFormChange}
                      />
                      <TextField
                        fullWidth
                        label='Delivery Charge'
                        name='charge'
                        variant='outlined'
                        sx={{ mb: 4 }}
                        InputProps={{ startAdornment: <InputAdornment position='start'>€</InputAdornment> }}
                        type='number'
                        value={formValues.charge}
                        onChange={handleFormChange}
                      />
                      <Box sx={{ display: 'flex', gap: 2 }}>
                        <Button variant='contained' onClick={handleSaveChanges} startIcon={<ContentSaveEditOutline />}>
                          Save Changes
                        </Button>
                        <Button variant='outlined' onClick={handleEditBoundaryClick}>
                          Edit Boundary
                        </Button>
                      </Box>
                    </>
                  ) : (
                    <Typography>Select a zone from the list to see its details or draw a new one.</Typography>
                  )}
                  <Divider sx={{ my: 4 }} />
                  <Typography variant='h6' sx={{ mb: 2 }}>
                    Boundary Points
                  </Typography>
                  <List dense sx={{ maxHeight: 200, overflow: 'auto' }}>
                    {(isDrawing || isEditingBoundary ? drawingPoints : (selectedZone?.boundary ?? [])).map(
                      (point, index) => (
                        <ListItem
                          key={index}
                          secondaryAction={
                            (isDrawing || isEditingBoundary) && (
                              <IconButton
                                edge='end'
                                onClick={() => setDrawingPoints(p => p.filter((_, i) => i !== index))}
                              >
                                <TrashCanOutline />
                              </IconButton>
                            )
                          }
                        >
                          <ListItemText
                            primary={`Point ${index + 1}`}
                            secondary={`Lat: ${(point as number[])[0].toFixed(4)}, Lng: ${(point as number[])[1].toFixed(4)}`}
                          />
                        </ListItem>
                      )
                    )}
                  </List>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={12}>
              <Card>
                <CardHeader title='Delivery Zones' />
                <List disablePadding>
                  {zones.map(zone => (
                    <ListItem
                      key={zone.id}
                      disablePadding
                      secondaryAction={
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <Tooltip title={zone.status === 'active' ? 'Deactivate' : 'Activate'}>
                            <Switch
                              edge='end'
                              checked={zone.status === 'active'}
                              onChange={() => handleToggleZoneStatus(zone.id!)}
                              onClick={e => e.stopPropagation()}
                            />
                          </Tooltip>
                          <Tooltip title='Delete Zone'>
                            <IconButton edge='end' color='error' onClick={() => handleDeleteClick(zone.id!)}>
                              <DeleteOutline />
                            </IconButton>
                          </Tooltip>
                        </Box>
                      }
                    >
                      <ListItemButton selected={selectedZone?.id === zone.id} onClick={() => handleSelectZone(zone)}>
                        <ListItemText
                          primary={zone.name}
                          secondary={
                            <Box component='span' sx={{ display: 'flex', alignItems: 'center' }}>
                              <Chip
                                label={zone.status === 'active' ? 'Active' : 'Inactive'}
                                color={zone.status === 'active' ? 'success' : 'default'}
                                size='small'
                                sx={{ mr: 2, height: '20px' }}
                              />
                              <Typography component='span' variant='body2' color='text.secondary'>
                                Charge: €{zone.charge.toFixed(2)}
                              </Typography>
                            </Box>
                          }
                        />
                      </ListItemButton>
                    </ListItem>
                  ))}
                </List>
              </Card>
            </Grid>
          </Grid>
        </Grid>
      </Grid>

      <DeleteConfirmationDialog
        open={dialogOpen}
        onClose={handleCloseDialog}
        onConfirm={handleConfirmDelete}
        itemType='zone'
        itemName={zones.find(z => z.id === zoneToDelete)?.name}
      />
    </>
  )
}

export default LocationSettings
