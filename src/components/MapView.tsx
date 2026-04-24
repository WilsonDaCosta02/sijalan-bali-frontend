import { MapContainer, TileLayer, Marker, Popup, useMap, useMapEvents } from "react-leaflet"
import type { LatLngExpression, LatLngBoundsExpression } from "leaflet"
import { useEffect } from "react"
import "leaflet/dist/leaflet.css"
import L from "leaflet"
import type { Report } from "../utils/reportStorage"


const FitToMarkers = ({ markers }: { markers?: Report[] }) => {
  const map = useMap()

  useEffect(() => {
    if (markers && markers.length > 0) {
      const bounds: [number, number][] = markers.map((m) => [
  m.lat,
  m.lng,
])
      map.fitBounds(bounds, { padding: [50, 50] })
    }
  }, [markers])

  return null
}

type MapViewProps = {
  lat?: string
  lng?: string
  onChangeLocation?: (lat: number, lng: number) => void
  markers?: Report[] // 🔥 TAMBAH INI
}

// ICON
const redIcon = new L.Icon({
  iconUrl: "https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-red.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
  iconSize: [20, 32],
  iconAnchor: [10, 32],
})

// BATAS BALI
const BALI_BOUNDS: LatLngBoundsExpression = [
  [-8.85, 114.4],
  [-8.05, 115.75]
]

// 🔥 PINDAH KE LUAR (INI KUNCINYA)
const ChangeView = ({
  lat,
  lng,
  hasLocation,
  position
}: {
  lat?: string
  lng?: string
  hasLocation: boolean
  position: LatLngExpression
}) => {

  const map = useMap()

  useEffect(() => {
    if (hasLocation) {
      map.flyTo(position, 16)
    } else {
      map.fitBounds(BALI_BOUNDS)
    }
  }, [lat, lng])

  return null
}

type MapClickHandlerProps = {
  onChangeLocation?: (lat: number, lng: number) => void
}

const MapClickHandler = ({ onChangeLocation }: MapClickHandlerProps) => {
  useMapEvents({
    click(e) {
      onChangeLocation?.(e.latlng.lat, e.latlng.lng)
    },
  })

  return null
}

const MapView = ({ lat, lng, onChangeLocation, markers }: MapViewProps) => {

  const defaultPosition: LatLngExpression = [-8.4095, 115.1889]

  const hasLocation =
    lat && lng && !isNaN(Number(lat)) && !isNaN(Number(lng))

  const position: LatLngExpression = hasLocation
    ? [Number(lat), Number(lng)]
    : defaultPosition

  return (
    <div style={{ height: "100%", width: "100%", position: "relative", zIndex: 1 }}>
     <MapContainer
  style={{ height: "100%", width: "100%", borderRadius: "10px" }}
  
>
  <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
  {/* 🔥 MARKER DARI DASHBOARD */}
{markers?.map((r, i) => (
  <Marker key={i} position={[r.lat, r.lng]} icon={redIcon}>
    <Popup>
      <b>{r.roadName}</b><br />
      {r.damage}
    </Popup>
  </Marker>
))}
<FitToMarkers markers={markers} />
 {(!markers || markers.length === 0) && (
  <ChangeView
    lat={lat}
    lng={lng}
    hasLocation={!!hasLocation}
    position={position}
  />
)}

  {/* 🔥 KLIK MAP */}
  {!markers && (
  <MapClickHandler onChangeLocation={onChangeLocation} />
)}

  {/* 🔥 MARKER DRAG */}
 {/* 🔥 MARKER DRAG */}
{!markers && hasLocation && (
  <Marker
    position={position}
    icon={redIcon}
    draggable={true}
    eventHandlers={{
      dragend: (e) => {
        const marker = e.target
        const newPos = marker.getLatLng()

        onChangeLocation?.(newPos.lat, newPos.lng)
      }
    }}
  >
    <Popup>
      Geser marker atau klik map 📍
    </Popup>
  </Marker>
)}
</MapContainer>
    </div>
  )
}

export default MapView