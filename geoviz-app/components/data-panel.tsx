"use client"

import { MapPin, Users, Skull, AlertTriangle, Globe } from "lucide-react"
import type { DataPoint } from "@/lib/types"
import { cn } from "@/lib/utils"

interface DataPanelProps {
  data: DataPoint[]
  selectedPoint: DataPoint | null
  onSelectPoint: (point: DataPoint | null) => void
}

// Climate Reality Brand Colors for severity badges
function getSeverityColor(severity: number): string {
  if (severity <= 1) return "bg-[#8DC63F]" // Green - Low
  if (severity <= 1.5) return "bg-[#FFC500]" // Yellow - Medium
  return "bg-[#B22025]" // Red - High
}

function getSeverityLabel(severity: number): string {
  if (severity <= 1) return "Low"
  if (severity <= 1.5) return "Medium"
  return "High"
}

export function DataPanel({ data, selectedPoint, onSelectPoint }: DataPanelProps) {
  const totalDead = data.reduce((sum, point) => sum + (point.Dead || 0), 0)
  const totalDisplaced = data.reduce((sum, point) => sum + (point.Displaced || 0), 0)
  const countries = new Set(data.map((p) => p.Country)).size

  const causeCounts = data.reduce((acc, point) => {
    const cause = point.categorised_cause || point.MainCause || "Unknown"
    acc[cause] = (acc[cause] || 0) + 1
    return acc
  }, {} as Record<string, number>)

  const topCauses = Object.entries(causeCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)

  return (
    <div className="flex h-full flex-col gap-4 overflow-hidden">
      {/* Summary Stats */}
      <div className="grid grid-cols-2 gap-3">
        <div className="rounded-lg bg-card p-4">
          <div className="flex items-center gap-2 text-muted-foreground">
            <MapPin className="h-4 w-4" />
            <span className="text-xs uppercase tracking-wide">Events</span>
          </div>
          <p className="mt-1 text-2xl font-bold text-primary">{data.length.toLocaleString()}</p>
        </div>
        <div className="rounded-lg bg-card p-4">
          <div className="flex items-center gap-2 text-muted-foreground">
            <Globe className="h-4 w-4" />
            <span className="text-xs uppercase tracking-wide">Countries</span>
          </div>
          <p className="mt-1 text-2xl font-bold text-foreground">{countries}</p>
        </div>
        <div className="rounded-lg bg-card p-4">
          <div className="flex items-center gap-2 text-muted-foreground">
            <Skull className="h-4 w-4" />
            <span className="text-xs uppercase tracking-wide">Deaths</span>
          </div>
          <p className="mt-1 text-2xl font-bold text-destructive">{totalDead.toLocaleString()}</p>
        </div>
        <div className="rounded-lg bg-card p-4">
          <div className="flex items-center gap-2 text-muted-foreground">
            <Users className="h-4 w-4" />
            <span className="text-xs uppercase tracking-wide">Displaced</span>
          </div>
          <p className="mt-1 text-2xl font-bold text-foreground">{totalDisplaced.toLocaleString()}</p>
        </div>
      </div>

      {/* Causes Breakdown */}
      {topCauses.length > 0 && (
        <div className="rounded-lg bg-card p-4">
          <h3 className="mb-3 text-sm font-medium text-muted-foreground uppercase tracking-wide">
            Top Causes
          </h3>
          <div className="space-y-2">
            {topCauses.map(([cause, count]) => (
              <div key={cause} className="flex items-center justify-between">
                <span className="text-sm text-foreground">{cause}</span>
                <span className="rounded-full bg-secondary px-2 py-0.5 text-xs text-secondary-foreground">
                  {count}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Events List */}
      <div className="flex-1 overflow-hidden rounded-lg bg-card">
        <h3 className="border-b border-border p-3 text-sm font-medium text-muted-foreground uppercase tracking-wide">
          Events ({data.length})
        </h3>
        <div className="h-[calc(100%-44px)] overflow-y-auto">
          {data.length === 0 ? (
            <div className="flex h-full items-center justify-center p-4 text-center">
              <div className="text-muted-foreground">
                <AlertTriangle className="mx-auto mb-2 h-8 w-8" />
                <p className="text-sm">No data loaded</p>
                <p className="text-xs">Drop a CSV file to get started</p>
              </div>
            </div>
          ) : (
            <div className="divide-y divide-border">
              {data.map((point, index) => (
                <button
                  key={`${point.ID}-${index}`}
                  onClick={() => onSelectPoint(point)}
                  className={cn(
                    "w-full p-3 text-left transition-colors hover:bg-secondary/50",
                    selectedPoint === point && "bg-secondary"
                  )}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1 min-w-0">
                      <p className="truncate font-medium text-foreground">{point.Country}</p>
                      <p className="truncate text-xs text-muted-foreground">{point.MainCause}</p>
                    </div>
                    <div
                      className={cn(
                        "flex-shrink-0 rounded-full px-2 py-0.5 text-xs font-medium text-white",
                        getSeverityColor(point.Severity)
                      )}
                    >
                      {getSeverityLabel(point.Severity)}
                    </div>
                  </div>
                  <div className="mt-2 flex gap-4 text-xs text-muted-foreground">
                    <span>{point.Dead?.toLocaleString() || 0} dead</span>
                    <span>{point.Displaced?.toLocaleString() || 0} displaced</span>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
