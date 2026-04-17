import type { DataPoint } from "./types"

// Climate Reality Brand Colors
const CR_COLORS = {
  green: "#8DC63F",
  darkBlue: "#0B3E73",
  darkGreen: "#10502F",
  red: "#B22025",
  lightBlue: "#00A7ED",
  yellow: "#FFC500",
  orange: "#E55825",
}

function getSeverityColor(severity: number): string {
  if (severity <= 1) return CR_COLORS.green
  if (severity <= 1.5) return CR_COLORS.yellow
  return CR_COLORS.red
}

function getMarkerRadius(displaced: number): number {
  if (displaced <= 0) return 4
  // Logarithmic scaling for better handling of outliers
  const radius = 4 + (Math.log10(displaced) * 3)
  return Math.min(radius, 30) // Cap radius at 30px
}

export function generateStandaloneHTML(data: DataPoint[], title: string): string {
  // Calculate center point
  const avgLat = data.reduce((sum, d) => sum + d.lat, 0) / data.length
  const avgLng = data.reduce((sum, d) => sum + d.lng, 0) / data.length

  const markersJS = data.map((point, index) => {
    const color = getSeverityColor(point.severity || 1)
    const radius = getMarkerRadius(point.displaced || 0)
    const popupContent = `
      <div style="font-family: system-ui, sans-serif; min-width: 200px;">
        <h3 style="margin: 0 0 8px 0; font-size: 14px; font-weight: 600;">${point.country || "Unknown"}</h3>
        <div style="font-size: 12px; color: #666; line-height: 1.6;">
          ${point.mainCause ? `<div><strong>Cause:</strong> ${point.mainCause}</div>` : ""}
          ${point.dead !== undefined ? `<div><strong>Deaths:</strong> ${point.dead.toLocaleString()}</div>` : ""}
          ${point.displaced ? `<div><strong>Displaced:</strong> ${point.displaced.toLocaleString()}</div>` : ""}
          ${point.severity ? `<div><strong>Severity:</strong> ${point.severity}</div>` : ""}
          ${point.began ? `<div><strong>Began:</strong> ${point.began}</div>` : ""}
          ${point.ended ? `<div><strong>Ended:</strong> ${point.ended}</div>` : ""}
        </div>
      </div>
    `.replace(/\n/g, "").replace(/\s+/g, " ")

    return `
      L.circleMarker([${point.lat}, ${point.lng}], {
        radius: ${radius},
        fillColor: "${color}",
        color: "${CR_COLORS.darkBlue}",
        weight: 2,
        opacity: 1,
        fillOpacity: 0.85
      }).addTo(map).bindPopup(\`${popupContent}\`);
    `
  }).join("\n")

  // Calculate stats
  const totalDead = data.reduce((sum, d) => sum + (d.dead || 0), 0)
  const totalDisplaced = data.reduce((sum, d) => sum + (d.displaced || 0), 0)
  const countries = new Set(data.map((d) => d.country).filter(Boolean)).size

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${title} - GeoViz Export</title>
  <link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css" />
  <script src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js"></script>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { font-family: system-ui, -apple-system, sans-serif; background: #0a1628; color: #f0f4f8; }
    .header { background: #0f2240; padding: 16px 24px; border-bottom: 1px solid #1e4976; display: flex; align-items: center; justify-content: space-between; }
    .header h1 { font-size: 18px; font-weight: 600; }
    .header .subtitle { font-size: 12px; color: #8ba4c0; margin-top: 2px; }
    .stats { display: flex; gap: 24px; font-size: 12px; }
    .stat { text-align: center; }
    .stat-value { font-size: 16px; font-weight: 600; color: #8DC63F; }
    .stat-label { color: #8ba4c0; margin-top: 2px; }
    #map { height: calc(100vh - 120px); background: #0B3E73; }
    .legend { background: #0f2240; padding: 12px 24px; border-top: 1px solid #1e4976; display: flex; align-items: center; gap: 24px; font-size: 12px; }
    .legend-title { color: #8ba4c0; text-transform: uppercase; letter-spacing: 0.05em; font-weight: 500; }
    .legend-item { display: flex; align-items: center; gap: 8px; }
    .legend-dot { width: 12px; height: 12px; border-radius: 50%; border: 2px solid #0B3E73; }
    .leaflet-popup-content-wrapper { border-radius: 8px; background: #0f2240; color: #f0f4f8; }
    .leaflet-popup-tip { background: #0f2240; }
  </style>
</head>
<body>
  <div class="header">
    <div>
      <h1>${title}</h1>
      <div class="subtitle">Exported from GeoViz</div>
    </div>
    <div class="stats">
      <div class="stat">
        <div class="stat-value">${data.length.toLocaleString()}</div>
        <div class="stat-label">Events</div>
      </div>
      <div class="stat">
        <div class="stat-value">${countries}</div>
        <div class="stat-label">Countries</div>
      </div>
      <div class="stat">
        <div class="stat-value">${totalDead.toLocaleString()}</div>
        <div class="stat-label">Deaths</div>
      </div>
      <div class="stat">
        <div class="stat-value">${totalDisplaced.toLocaleString()}</div>
        <div class="stat-label">Displaced</div>
      </div>
    </div>
  </div>
  <div id="map"></div>
  <div class="legend">
    <span class="legend-title">Severity:</span>
    <div class="legend-item"><span class="legend-dot" style="background: #8DC63F;"></span> Low</div>
    <div class="legend-item"><span class="legend-dot" style="background: #FFC500;"></span> Medium</div>
    <div class="legend-item"><span class="legend-dot" style="background: #B22025;"></span> High</div>
    <span style="margin-left: auto; color: #8ba4c0;">Marker size indicates displaced population</span>
  </div>
  <script>
    const map = L.map('map', { attributionControl: false }).setView([${avgLat}, ${avgLng}], 4);
    // Stadia Alidade Smooth Dark - provides better sea/land contrast
    L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
      maxZoom: 19
    }).addTo(map);
    L.control.attribution({ prefix: false, position: 'bottomright' })
      .addAttribution('<a href="https://carto.com/attributions" style="color: #00A7ED;">CartoDB</a>')
      .addTo(map);
    ${markersJS}
  </script>
</body>
</html>`
}

export function downloadHTML(data: DataPoint[], fileName: string): void {
  const title = fileName || "Dataset"
  const html = generateStandaloneHTML(data, title)
  const blob = new Blob([html], { type: "text/html" })
  const url = URL.createObjectURL(blob)
  const a = document.createElement("a")
  a.href = url
  a.download = `${title.replace(/[^a-z0-9]/gi, "_")}_map.html`
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
  URL.revokeObjectURL(url)
}
