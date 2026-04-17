"use client"

import { useEffect, useRef } from "react"
import L from "leaflet"
import "leaflet/dist/leaflet.css"
import type { DataPoint } from "@/lib/types"

interface DisasterMapProps {
  data: DataPoint[]
  selectedPoint: DataPoint | null
  onSelectPoint: (point: DataPoint | null) => void
}

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
  if (severity <= 1) return CR_COLORS.green // Low severity - green
  if (severity <= 1.5) return CR_COLORS.yellow // Medium severity - yellow
  return CR_COLORS.red // High severity - red
}

function getMarkerSize(displaced: number): number {
  if (displaced <= 0) return 8;
  // Logarithmic scaling: 4 + log10(displaced) * 6
  // 1k -> 22px, 10k -> 28px, 100k -> 34px, 1M -> 40px, 10M -> 46px, 100M -> 52px
  const size = 8 + (Math.log10(displaced) * 6);
  return Math.min(size, 60); // Cap at 60px diameter
}

export function DisasterMap({ data, selectedPoint, onSelectPoint }: DisasterMapProps) {
  const mapRef = useRef<L.Map | null>(null)
  const mapContainerRef = useRef<HTMLDivElement>(null)
  const markersRef = useRef<L.CircleMarker[]>([])

  useEffect(() => {
    if (!mapContainerRef.current || mapRef.current) return

    mapRef.current = L.map(mapContainerRef.current, {
      center: [0, 20],
      zoom: 2,
      zoomControl: true,
      attributionControl: true,
    })

    // Custom styled map - Sea: Dark Blue (#0B3E73), Land: Dark Green tint
    // Using Stadia Alidade Smooth Dark with custom background
    L.tileLayer("https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png", {
      attribution: '&copy; <a href="https://carto.com/attributions">CartoDB</a>',
      maxZoom: 19,
    }).addTo(mapRef.current)
    
    // Set map background to Climate Reality dark blue for ocean areas
    mapContainerRef.current.style.backgroundColor = CR_COLORS.darkBlue

    return () => {
      if (mapRef.current) {
        mapRef.current.remove()
        mapRef.current = null
      }
    }
  }, [])

  useEffect(() => {
    if (!mapRef.current) return

    // Clear existing markers
    markersRef.current.forEach((marker) => marker.remove())
    markersRef.current = []

    // Add new markers
    data.forEach((point) => {
      const lat = point.anonymous_lat
      const lng = point.anonymous_long

      if (isNaN(lat) || isNaN(lng)) return

      const size = getMarkerSize(point.Displaced)
      const color = getSeverityColor(point.Severity)

      const marker = L.circleMarker([lat, lng], {
        radius: size / 2,
        fillColor: color,
        color: CR_COLORS.darkBlue,
        weight: 1.5,
        opacity: 0.8,
        fillOpacity: 0.6,
      }).addTo(mapRef.current!)

      const severityLabel = point.Severity <= 1 ? "Low" : point.Severity <= 1.5 ? "Medium" : "High"
      const severityBadgeColor = getSeverityColor(point.Severity)
      
      marker.bindPopup(`
        <div style="min-width: 220px; padding: 4px;">
          <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 10px;">
            <h3 style="font-weight: 600; font-size: 15px; margin: 0; color: ${CR_COLORS.lightBlue};">${point.Country}</h3>
            <span style="background: ${severityBadgeColor}; color: #fff; padding: 2px 8px; border-radius: 12px; font-size: 11px; font-weight: 500;">${severityLabel}</span>
          </div>
          <div style="background: rgba(30, 73, 118, 0.3); border-radius: 6px; padding: 8px; margin-bottom: 8px;">
            <p style="margin: 0; font-size: 13px; color: ${CR_COLORS.green}; font-weight: 500;">${point.MainCause}</p>
          </div>
          <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 8px;">
            <div style="background: rgba(178, 32, 37, 0.15); border-radius: 4px; padding: 6px 8px;">
              <p style="margin: 0; font-size: 10px; color: #8ba4c0; text-transform: uppercase;">Deaths</p>
              <p style="margin: 2px 0 0 0; font-size: 14px; font-weight: 600; color: ${CR_COLORS.red};">${point.Dead?.toLocaleString() ?? "N/A"}</p>
            </div>
            <div style="background: rgba(0, 167, 237, 0.15); border-radius: 4px; padding: 6px 8px;">
              <p style="margin: 0; font-size: 10px; color: #8ba4c0; text-transform: uppercase;">Displaced</p>
              <p style="margin: 2px 0 0 0; font-size: 14px; font-weight: 600; color: ${CR_COLORS.lightBlue};">${point.Displaced?.toLocaleString() ?? "N/A"}</p>
            </div>
          </div>
          <p style="margin: 8px 0 0 0; font-size: 11px; color: #8ba4c0;"><strong style="color: #f0f4f8;">Area:</strong> ${point.Area?.toLocaleString() ?? "N/A"} km²</p>
        </div>
      `)

      marker.on("click", () => {
        onSelectPoint(point)
      })

      markersRef.current.push(marker)
    })

    // Fit bounds if we have data
    if (data.length > 0) {
      const validPoints = data.filter(
        (p) => !isNaN(p.anonymous_lat) && !isNaN(p.anonymous_long)
      )
      if (validPoints.length > 0) {
        const bounds = L.latLngBounds(
          validPoints.map((p) => [p.anonymous_lat, p.anonymous_long] as [number, number])
        )
        mapRef.current.fitBounds(bounds, { padding: [50, 50] })
      }
    }
  }, [data, onSelectPoint])

  useEffect(() => {
    if (!mapRef.current || !selectedPoint) return

    const lat = selectedPoint.anonymous_lat
    const lng = selectedPoint.anonymous_long

    if (!isNaN(lat) && !isNaN(lng)) {
      mapRef.current.setView([lat, lng], 6)
    }
  }, [selectedPoint])

  return (
    <div className="relative h-full w-full">
      <div
        ref={mapContainerRef}
        className="h-full w-full rounded-lg overflow-hidden"
        style={{ minHeight: "400px" }}
      />
      {/* Legend Overlay */}
      <div className="absolute bottom-4 left-4 z-[1000] rounded-lg p-3" style={{ background: "rgba(15, 34, 64, 0.95)", border: "1px solid #1e4976" }}>
        <p className="text-xs font-medium mb-2" style={{ color: "#8ba4c0", textTransform: "uppercase", letterSpacing: "0.05em" }}>Severity</p>
        <div className="flex flex-col gap-1.5">
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 rounded-full" style={{ background: CR_COLORS.green, border: `2px solid ${CR_COLORS.darkBlue}` }} />
            <span className="text-xs" style={{ color: "#f0f4f8" }}>Low (1)</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 rounded-full" style={{ background: CR_COLORS.yellow, border: `2px solid ${CR_COLORS.darkBlue}` }} />
            <span className="text-xs" style={{ color: "#f0f4f8" }}>Medium (1.5)</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 rounded-full" style={{ background: CR_COLORS.red, border: `2px solid ${CR_COLORS.darkBlue}` }} />
            <span className="text-xs" style={{ color: "#f0f4f8" }}>High (2+)</span>
          </div>
        </div>
        <p className="text-xs mt-2" style={{ color: "#8ba4c0" }}>Size = displaced population</p>
      </div>
    </div>
  )
}
