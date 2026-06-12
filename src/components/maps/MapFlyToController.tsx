// components/maps/MapFlyToController.tsx

import { useEffect } from 'react'

import { useMap } from 'react-leaflet'
import type { LatLngExpression } from 'leaflet'

interface MapFlyToControllerProps {
  position: LatLngExpression | null
}

const MapFlyToController: React.FC<MapFlyToControllerProps> = ({ position }) => {
  const map = useMap()

  useEffect(() => {
    if (position) {
      // Fly to the new position with a good zoom level for a city zone
      map.flyTo(position, 13)
    }
  }, [position, map])

  return null // This component does not render anything itself
}

export default MapFlyToController
