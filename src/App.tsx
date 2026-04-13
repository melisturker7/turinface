import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet'
import 'leaflet/dist/leaflet.css'
import L from 'leaflet'

// Fix for default marker icon issues with Vite
import icon from 'leaflet/dist/images/marker-icon.png'
import iconShadow from 'leaflet/dist/images/marker-shadow.png'

const DefaultIcon = L.icon({
    iconUrl: icon,
    shadowUrl: iconShadow,
    iconSize: [25, 41],
    iconAnchor: [12, 41]
});

L.Marker.prototype.options.icon = DefaultIcon;

const landmarks = [
  { name: "Hagia Sophia", pos: [41.0085, 28.9802] as [number, number] },
  { name: "Blue Mosque", pos: [41.0054, 28.9768] as [number, number] },
  { name: "Topkapi Palace", pos: [41.0115, 28.9833] as [number, number] },
  { name: "Galata Tower", pos: [41.0256, 28.9741] as [number, number] },
  { name: "Grand Bazaar", pos: [41.0106, 28.9682] as [number, number] },
]

function App() {
  const center: [number, number] = [41.0082, 28.9784]

  return (
    <div style={{ height: '100vh', width: '100vw' }}>
      <MapContainer 
        center={center} 
        zoom={13} 
        scrollWheelZoom={true} 
        style={{ height: '100%', width: '100%' }}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        {landmarks.map((landmark, idx) => (
          <Marker key={idx} position={landmark.pos}>
            <Popup>
              {landmark.name}
            </Popup>
          </Marker>
        ))}
      </MapContainer>
    </div>
  )
}

export default App
