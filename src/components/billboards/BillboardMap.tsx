"use client";

import { MapContainer, Marker, Popup, TileLayer } from "react-leaflet";
import L from "leaflet";

// Icône de marqueur maison (pin emerald cohérent avec le reste du site) : évite de dépendre des
// images par défaut de Leaflet, dont les chemins ne se résolvent pas correctement une fois passés
// par le bundler de Next.js.
const markerIcon = L.divIcon({
  className: "",
  html: `
    <svg width="32" height="40" viewBox="0 0 32 40" xmlns="http://www.w3.org/2000/svg">
      <path
        d="M16 0C7.163 0 0 7.163 0 16c0 11 16 24 16 24s16-13 16-24C32 7.163 24.837 0 16 0Z"
        fill="#059669"
      />
      <circle cx="16" cy="16" r="6.5" fill="white" />
    </svg>
  `,
  iconSize: [32, 40],
  iconAnchor: [16, 40],
  popupAnchor: [0, -38],
});

interface BillboardMapProps {
  latitude: number;
  longitude: number;
  title: string;
  address?: string | null;
}

export function BillboardMap({ latitude, longitude, title, address }: BillboardMapProps) {
  return (
    <MapContainer
      center={[latitude, longitude]}
      zoom={15}
      scrollWheelZoom={false}
      className="h-full w-full"
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      <Marker position={[latitude, longitude]} icon={markerIcon}>
        <Popup>
          <strong>{title}</strong>
          {address && (
            <>
              <br />
              {address}
            </>
          )}
        </Popup>
      </Marker>
    </MapContainer>
  );
}
