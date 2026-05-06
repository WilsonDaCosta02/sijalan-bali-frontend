import {
  MapContainer,
  TileLayer,
  Marker,
  Popup,
  useMap,
  useMapEvents,
} from "react-leaflet";
import type { LatLngExpression, LatLngBoundsExpression } from "leaflet";
import { useEffect, useRef } from "react";
import "leaflet/dist/leaflet.css";
import L from "leaflet";

type Report = {
  id: number;
  road_name: string;
  landmark: string;
  damage_level: string;
  status: string;
  latitude: string;
  longitude: string;
  image_url: string[];
  created_at: string;

  lat?: number;
  lng?: number;
};

/* ============================= */
/* 🔥 FIT BOUNDS KE MARKERS */
/* ============================= */
const FitToMarkers = ({ markers }: { markers?: Report[] }) => {
  const map = useMap();
  const hasFit = useRef(false);

  useEffect(() => {
    if (!hasFit.current && markers && markers.length > 0) {
      const bounds: [number, number][] = markers.map((m) => [
        Number(m.lat),
        Number(m.lng),
      ]);

      map.fitBounds(bounds, {
        padding: [50, 50],
      });

      hasFit.current = true;
    }
  }, [markers]);

  return null;
};

/* ============================= */
/* 🔥 TYPES */
/* ============================= */
type MapViewProps = {
  lat?: string;
  lng?: string;
  onChangeLocation?: (lat: number, lng: number) => void;
  markers?: Report[];
};

/* ============================= */
/* 🔥 ICON */
/* ============================= */
const redIcon = new L.Icon({
  iconUrl:
    "https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-red.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
  iconSize: [20, 32],
  iconAnchor: [10, 32],
});

/* ============================= */
/* 🔥 BOUNDS BALI */
/* ============================= */
const BALI_BOUNDS: LatLngBoundsExpression = [
  [-8.85, 114.4],
  [-8.05, 115.75],
];

/* ============================= */
/* 🔥 CHANGE VIEW */
/* ============================= */
const ChangeView = ({
  lat,
  lng,
  hasLocation,
  position,
}: {
  lat?: string;
  lng?: string;
  hasLocation: boolean;
  position: LatLngExpression;
}) => {
  const map = useMap();

  useEffect(() => {
    if (hasLocation) {
      map.flyTo(position, 16);
    } else {
      map.fitBounds(BALI_BOUNDS);
    }
  }, [lat, lng]);

  return null;
};

/* ============================= */
/* 🔥 MAP CLICK HANDLER */
/* ============================= */
const MapClickHandler = ({
  onChangeLocation,
}: {
  onChangeLocation?: (lat: number, lng: number) => void;
}) => {
  useMapEvents({
    click(e) {
      onChangeLocation?.(e.latlng.lat, e.latlng.lng);
    },
  });

  return null;
};

/* ============================= */
/* 🔥 GOOGLE MAPS FUNCTION */
/* ============================= */
const openGoogleMaps = (lat: number, lng: number) => {
  const url = `https://www.google.com/maps?q=${lat},${lng}`;
  window.open(url, "_blank");
};

/* ============================= */
/* 🔥 COMPONENT */
/* ============================= */
const MapView = ({ lat, lng, onChangeLocation, markers }: MapViewProps) => {
  const defaultPosition: LatLngExpression = [-8.4095, 115.1889];

  const hasLocation = lat && lng && !isNaN(Number(lat)) && !isNaN(Number(lng));

  const position: LatLngExpression = hasLocation
    ? [Number(lat), Number(lng)]
    : defaultPosition;

  return (
    <div
      style={{
        height: "100%",
        width: "100%",
        position: "relative",
        zIndex: 1,
      }}
    >
      <MapContainer
        style={{
          height: "100%",
          width: "100%",
          borderRadius: "10px",
        }}
      >
        <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />

        {/* ============================= */}
        {/* 🔥 MARKERS */}
        {/* ============================= */}
        {markers?.map((r, i) => {
          const latNum = Number(r.lat);
          const lngNum = Number(r.lng);

          return (
            <Marker key={i} position={[latNum, lngNum]} icon={redIcon}>
              <Popup
                maxWidth={300}
                minWidth={150}
                closeButton={true}
                autoPan={true}
              >
                <div
                  style={{
                    width: "100%",
                    maxWidth: "200px", // 🔥 biar ga kepanjangan di desktop
                    display: "flex",
                    flexDirection: "column",
                    gap: "6px",
                    cursor: "pointer",
                  }}
                  onClick={() => openGoogleMaps(latNum, lngNum)}
                >
                  {/* TITLE */}
                  <div
                    style={{
                      fontSize: "14px",
                      fontWeight: 600,
                      wordBreak: "break-word",
                    }}
                  >
                    {r.road_name}
                  </div>

                  {/* DAMAGE */}
                  <div
                    style={{
                      fontSize: "12px",
                      color: "#64748b",
                      wordBreak: "break-word",
                    }}
                  >
                    {r.damage_level}
                  </div>

                  {/* BUTTON */}
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      openGoogleMaps(latNum, lngNum);
                    }}
                    style={{
                      marginTop: "6px",
                      width: "100%",
                      padding: "8px",
                      borderRadius: "8px",
                      border: "none",
                      background: "#22c55e",
                      color: "white",
                      fontSize: "12px",
                      cursor: "pointer",
                    }}
                  >
                    📍 Buka di Google Maps
                  </button>

                  {/* HINT */}
                  <div
                    style={{
                      fontSize: "10px",
                      color: "#94a3b8",
                      textAlign: "center",
                    }}
                  >
                    klik popup untuk buka
                  </div>
                </div>
              </Popup>
            </Marker>
          );
        })}

        <FitToMarkers markers={markers} />

        {/* ============================= */}
        {/* 🔥 DEFAULT VIEW */}
        {/* ============================= */}
        {(!markers || markers.length === 0) && (
          <ChangeView
            lat={lat}
            lng={lng}
            hasLocation={!!hasLocation}
            position={position}
          />
        )}

        {/* ============================= */}
        {/* 🔥 CLICK MAP */}
        {/* ============================= */}
        {!markers && <MapClickHandler onChangeLocation={onChangeLocation} />}

        {/* ============================= */}
        {/* 🔥 DRAG MARKER */}
        {/* ============================= */}
        {!markers && hasLocation && (
          <Marker
            position={position}
            icon={redIcon}
            draggable={true}
            eventHandlers={{
              dragend: (e) => {
                const marker = e.target;
                const newPos = marker.getLatLng();

                onChangeLocation?.(newPos.lat, newPos.lng);
              },
            }}
          >
            <Popup>Geser marker atau klik map 📍</Popup>
          </Marker>
        )}
      </MapContainer>
    </div>
  );
};

export default MapView;
