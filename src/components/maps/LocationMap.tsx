// components/maps/LocationMap.tsx

import React from 'react'
import {
  MapContainer,
  TileLayer,
  Polygon,
  Marker,
  Tooltip,
  useMap,
  useMapEvents,
  Polyline,
  CircleMarker
} from 'react-leaflet'
import { LatLngExpression, LatLng, PathOptions } from 'leaflet'

// --- MapController to handle flying to locations ---
const MapController: React.FC<{ center: LatLngExpression }> = ({ center }) => {
  const map = useMap()
  React.useEffect(() => {
    map.flyTo(center, 13)
  }, [center, map])
  return null
}

// --- MapClickHandler to handle drawing points ---
const MapClickHandler: React.FC<{ isDrawing: boolean; onMapClick: (latlng: LatLng) => void }> = ({
  isDrawing,
  onMapClick
}) => {
  useMapEvents({
    click(e) {
      if (isDrawing) {
        onMapClick(e.latlng)
      }
    }
  })
  return null
}

interface Zone {
  id: number | null
  name: string
  charge: number
  boundary: LatLngExpression[]
  status: 'active' | 'inactive'
}

interface LocationMapProps {
  zone: Zone | null
  mapCenter: LatLngExpression
  isDrawing: boolean
  onMapClick: (latlng: LatLng) => void
  drawingPoints: LatLngExpression[]
}

const LocationMap: React.FC<LocationMapProps> = ({ zone, mapCenter, isDrawing, onMapClick, drawingPoints }) => {
  const boundaryToShow = isDrawing ? drawingPoints : zone?.boundary ?? []

  const activeZoneStyle: PathOptions = { color: 'blue', fillColor: 'blue', fillOpacity: 0.2 }
  
  const inactiveZoneStyle: PathOptions = { color: 'grey', fillColor: 'black', fillOpacity: 0.1, dashArray: '5, 5' }

  const polygonStyle = zone?.status === 'inactive' ? inactiveZoneStyle : activeZoneStyle

  const getPolygonCenter = (boundary: LatLngExpression[]): LatLngExpression | null => {
    if (!boundary || boundary.length === 0) return null
    const lats = boundary.map(p => (p as number[])[0])
    const lngs = boundary.map(p => (p as number[])[1])
    const avgLat = lats.reduce((a, b) => a + b, 0) / lats.length
    const avgLng = lngs.reduce((a, b) => a + b, 0) / lngs.length
    return [avgLat, avgLng]
  }

  const polygonCenter = getPolygonCenter(boundaryToShow)

  return (
    <MapContainer center={mapCenter} zoom={8} style={{ height: '100%', width: '100%', borderRadius: '8px' }}>
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        url='https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png'
      />

      {boundaryToShow.length > 2 && !isDrawing && (
        <Polygon pathOptions={polygonStyle} positions={boundaryToShow} />
      )}

      {boundaryToShow.length > 2 && isDrawing && (
        <Polygon pathOptions={activeZoneStyle} positions={boundaryToShow} />
      )}

      {isDrawing && boundaryToShow.length > 1 && (
        <Polyline pathOptions={{ color: 'red', dashArray: '5, 10' }} positions={boundaryToShow} />
      )}

      {isDrawing &&
        boundaryToShow.map((point, index) => (
          <CircleMarker key={index} center={point} radius={5} pathOptions={{ color: 'red' }} />
        ))}

      {!isDrawing && polygonCenter && zone && (
        <Marker position={polygonCenter}>
          <Tooltip direction='top' permanent>
            <div style={{ textAlign: 'center', fontWeight: 'bold' }}>
              <span>{zone.name}</span>
              <br />
              <span>€{zone.charge.toFixed(2)}</span>
            </div>
          </Tooltip>
        </Marker>
      )}

      <MapController center={mapCenter} />
      <MapClickHandler isDrawing={isDrawing} onMapClick={onMapClick} />
    </MapContainer>
  )
}

export default LocationMap