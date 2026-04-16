"use client"

import { useState, useCallback } from "react"
import dynamic from "next/dynamic"
import { Map, Database, Info, Play, Download } from "lucide-react"
import { Button } from "@/components/ui/button"
import { FileDropzone } from "@/components/file-dropzone"
import { DataPanel } from "@/components/data-panel"
import { parseCSV } from "@/lib/csv-parser"
import type { DataPoint } from "@/lib/types"
import { downloadHTML } from "@/lib/export-html"

const SAMPLE_DATA = `ID,GlideNumber,Country,multi_country,anonymous_long,anonymous_lat,Area,Began,Ended,Validation,Dead,Displaced,MainCause,Severity,categorised_cause
2178,0,Mozambique,Multi-country,35.529,-23.865,137205.77,37685,37696,News,8,8300,Heavy rain,1,Heavy Rain
5015,,Mozambique,Multi-country,34.839,-25.966,1148874.13,44218,44221,FloodList,6,0,Tropical Storm Eloise,1.5,Storm
4023,,Mozambique,Multi-country,35.529,-17.878,83155.21,41291,41337,News,135,170000,Heavy Rain,1.5,Heavy Rain
2430,0,Namibia,Multi-country,18.491,-22.560,615606.17,38018,38140,News,10,40000,Heavy rain,2,Heavy Rain
3156,,South Africa,Multi-country,24.991,-29.000,121430.22,39456,39490,News,45,23000,Flooding,1.5,Flood
4521,,Zimbabwe,Multi-country,29.154,-19.015,390757.00,42567,42590,News,23,15000,Cyclone Idai,2,Storm
2987,,Malawi,Multi-country,34.302,-13.254,118484.00,38890,38920,News,56,89000,Heavy rainfall,1.5,Heavy Rain
3478,,Madagascar,Multi-country,46.869,-18.766,587041.00,40123,40145,News,34,45000,Tropical cyclone,2,Storm
4102,,Botswana,Multi-country,24.684,-22.328,581730.00,41456,41478,News,3,5600,Flash floods,1,Flood
3890,,Tanzania,Multi-country,34.888,-6.369,947300.00,40789,40812,News,67,78000,Heavy rain,1.5,Heavy Rain
2654,,Kenya,Multi-country,37.906,-1.286,580367.00,38456,38478,News,29,34000,Monsoon floods,1.5,Flood
3234,,Uganda,Multi-country,32.290,1.373,241038.00,39678,39702,News,18,21000,Landslides,1,Heavy Rain
4789,,Zambia,Multi-country,28.283,-15.387,752618.00,43012,43034,News,12,9800,Flash floods,1,Flood
3567,,Ethiopia,Multi-country,38.757,9.145,1104300.00,40234,40267,News,89,125000,Heavy rainfall,2,Heavy Rain
4234,,Rwanda,Multi-country,29.873,-1.940,26338.00,41789,41802,News,41,28000,Flooding,1.5,Flood`

const DisasterMap = dynamic(
  () => import("@/components/disaster-map").then((mod) => mod.DisasterMap),
  {
    ssr: false,
    loading: () => (
      <div className="flex h-full items-center justify-center bg-card rounded-lg">
        <div className="text-center text-muted-foreground">
          <Map className="mx-auto mb-2 h-10 w-10 animate-pulse" />
          <p className="text-sm">Loading map...</p>
        </div>
      </div>
    ),
  }
)

export default function Home() {
  const [data, setData] = useState<DataPoint[]>([])
  const [fileName, setFileName] = useState<string | null>(null)
  const [selectedPoint, setSelectedPoint] = useState<DataPoint | null>(null)

  const handleFileLoad = useCallback((content: string, name: string) => {
    const parsed = parseCSV(content)
    setData(parsed.rows)
    setFileName(name)
    setSelectedPoint(null)
  }, [])

  const handleClear = useCallback(() => {
    setData([])
    setFileName(null)
    setSelectedPoint(null)
  }, [])

  const handleLoadExample = useCallback(() => {
    const parsed = parseCSV(SAMPLE_DATA)
    setData(parsed.rows)
    setFileName("Example Dataset (African Floods)")
    setSelectedPoint(null)
  }, [])

  const handleExportHTML = useCallback(() => {
    if (data.length > 0) {
      downloadHTML(data, fileName || "Dataset")
    }
  }, [data, fileName])

  return (
    <main className="flex h-screen flex-col bg-background">
      {/* Header */}
      <header className="flex items-center justify-between border-b border-border px-6 py-4">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary">
            <Map className="h-5 w-5 text-primary-foreground" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-foreground">GeoViz</h1>
            <p className="text-xs text-muted-foreground">Dataset Map Visualizer</p>
          </div>
        </div>

        <div className="flex items-center gap-4">
          {data.length > 0 && (
            <>
              <div className="flex items-center gap-2 rounded-full bg-card px-4 py-2">
                <Database className="h-4 w-4 text-primary" />
                <span className="text-sm text-foreground">
                  {data.length.toLocaleString()} records
                </span>
              </div>
              <Button
                onClick={handleExportHTML}
                variant="outline"
                size="sm"
                className="gap-2"
              >
                <Download className="h-4 w-4" />
                Export HTML
              </Button>
            </>
          )}
        </div>
      </header>

      {/* Main Content */}
      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar */}
        <aside className="flex w-80 flex-col gap-4 overflow-hidden border-r border-border bg-sidebar p-4">
          <FileDropzone
            onFileLoad={handleFileLoad}
            currentFile={fileName}
            onClear={handleClear}
          />
          <DataPanel
            data={data}
            selectedPoint={selectedPoint}
            onSelectPoint={setSelectedPoint}
          />
        </aside>

        {/* Map Area */}
        <div className="flex flex-1 flex-col">
          {data.length === 0 ? (
            <div className="flex flex-1 items-center justify-center bg-card m-4 rounded-lg">
              <div className="max-w-md text-center p-8">
                <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-secondary">
                  <Map className="h-10 w-10 text-muted-foreground" />
                </div>
                <h2 className="mb-2 text-xl font-semibold text-foreground">
                  No Dataset Loaded
                </h2>
                <p className="mb-4 text-muted-foreground">
                  Drop a CSV file in the sidebar to visualize your geographic data on the map.
                </p>
                <Button onClick={handleLoadExample} className="mb-6 gap-2">
                  <Play className="h-4 w-4" />
                  Try Example Dataset
                </Button>
                <div className="rounded-lg bg-secondary/50 p-4 text-left">
                  <div className="mb-2 flex items-center gap-2 text-sm font-medium text-foreground">
                    <Info className="h-4 w-4 text-primary" />
                    Expected Columns
                  </div>
                  <ul className="space-y-1 text-xs text-muted-foreground">
                    <li>
                      <code className="rounded bg-muted px-1">anonymous_lat</code> or{" "}
                      <code className="rounded bg-muted px-1">lat</code> - Latitude
                    </li>
                    <li>
                      <code className="rounded bg-muted px-1">anonymous_long</code> or{" "}
                      <code className="rounded bg-muted px-1">long</code> - Longitude
                    </li>
                    <li>
                      <code className="rounded bg-muted px-1">Country</code> - Country name
                    </li>
                    <li>
                      <code className="rounded bg-muted px-1">Dead</code>,{" "}
                      <code className="rounded bg-muted px-1">Displaced</code> - Metrics
                    </li>
                    <li>
                      <code className="rounded bg-muted px-1">Severity</code>,{" "}
                      <code className="rounded bg-muted px-1">MainCause</code> - Details
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          ) : (
            <div className="flex-1 p-4">
              <DisasterMap
                data={data}
                selectedPoint={selectedPoint}
                onSelectPoint={setSelectedPoint}
              />
            </div>
          )}

          {/* Legend */}
          {data.length > 0 && (
            <div className="border-t border-border bg-card px-6 py-3">
              <div className="flex flex-wrap items-center gap-6 text-xs">
                <span className="font-medium text-muted-foreground uppercase tracking-wide">
                  Severity:
                </span>
                <div className="flex items-center gap-2">
                  <span className="h-3 w-3 rounded-full bg-yellow-500" />
                  <span className="text-foreground">Low (≤1)</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="h-3 w-3 rounded-full bg-orange-500" />
                  <span className="text-foreground">Medium (1-1.5)</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="h-3 w-3 rounded-full bg-red-500" />
                  <span className="text-foreground">High ({">"}1.5)</span>
                </div>
                <span className="ml-auto text-muted-foreground">
                  Marker size indicates displaced population
                </span>
              </div>
            </div>
          )}
        </div>
      </div>
    </main>
  )
}
