"use client"

import { useCallback, useState } from "react"
import { Upload, FileText, X, ClipboardPaste, Database } from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"

interface FileDropzoneProps {
  onFileLoad: (content: string, fileName: string) => void
  currentFile: string | null
  onClear: () => void
}

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

export function FileDropzone({ onFileLoad, currentFile, onClear }: FileDropzoneProps) {
  const [isDragging, setIsDragging] = useState(false)
  const [showPasteArea, setShowPasteArea] = useState(false)
  const [pasteContent, setPasteContent] = useState("")

  const handleDrop = useCallback(
    (e: React.DragEvent<HTMLDivElement>) => {
      e.preventDefault()
      setIsDragging(false)

      const file = e.dataTransfer.files[0]
      if (file) {
        readFile(file)
      }
    },
    [onFileLoad]
  )

  const handleFileChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0]
      if (file) {
        readFile(file)
      }
    },
    [onFileLoad]
  )

  const readFile = (file: File) => {
    const reader = new FileReader()
    reader.onload = (event) => {
      const content = event.target?.result as string
      onFileLoad(content, file.name)
    }
    reader.readAsText(file)
  }

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    setIsDragging(true)
  }

  const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    setIsDragging(false)
  }

  const handlePasteSubmit = () => {
    if (pasteContent.trim()) {
      onFileLoad(pasteContent, "Pasted Data")
      setPasteContent("")
      setShowPasteArea(false)
    }
  }

  const handleLoadExample = () => {
    onFileLoad(SAMPLE_DATA, "Example Dataset (African Floods)")
  }

  if (currentFile) {
    return (
      <div className="flex items-center gap-3 rounded-lg border border-border bg-card p-3">
        <FileText className="h-5 w-5 text-primary" />
        <span className="flex-1 truncate text-sm text-foreground">{currentFile}</span>
        <button
          onClick={onClear}
          className="rounded-md p-1 text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
        >
          <X className="h-4 w-4" />
        </button>
      </div>
    )
  }

  if (showPasteArea) {
    return (
      <div className="flex flex-col gap-3">
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium text-foreground">Paste CSV Data</span>
          <button
            onClick={() => {
              setShowPasteArea(false)
              setPasteContent("")
            }}
            className="rounded-md p-1 text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
        <textarea
          value={pasteContent}
          onChange={(e) => setPasteContent(e.target.value)}
          placeholder="Paste your CSV data here (comma or tab-separated)..."
          className="h-32 w-full resize-none rounded-lg border border-border bg-input p-3 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
          autoFocus
        />
        <Button
          onClick={handlePasteSubmit}
          disabled={!pasteContent.trim()}
          className="w-full"
        >
          Load Data
        </Button>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-3">
      {/* File Drop Area */}
      <div
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        className={cn(
          "relative flex cursor-pointer flex-col items-center justify-center gap-3 rounded-lg border-2 border-dashed p-6 transition-all",
          isDragging
            ? "border-primary bg-primary/10"
            : "border-border bg-card hover:border-primary/50 hover:bg-card/80"
        )}
      >
        <input
          type="file"
          accept=".csv,.tsv,.txt"
          onChange={handleFileChange}
          className="absolute inset-0 cursor-pointer opacity-0"
        />
        <Upload
          className={cn(
            "h-8 w-8 transition-colors",
            isDragging ? "text-primary" : "text-muted-foreground"
          )}
        />
        <div className="text-center">
          <p className="text-sm font-medium text-foreground">
            Drop your CSV file here
          </p>
          <p className="text-xs text-muted-foreground">
            or click to browse
          </p>
        </div>
      </div>

      {/* Alternative Actions */}
      <div className="flex gap-2">
        <Button
          variant="outline"
          size="sm"
          onClick={() => setShowPasteArea(true)}
          className="flex-1 gap-2"
        >
          <ClipboardPaste className="h-4 w-4" />
          Paste CSV
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={handleLoadExample}
          className="flex-1 gap-2"
        >
          <Database className="h-4 w-4" />
          Example
        </Button>
      </div>
    </div>
  )
}
