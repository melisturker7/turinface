import type { DataPoint, ParsedData } from "./types"

export function parseCSV(csvText: string): ParsedData {
  const lines = csvText.trim().split(/\r?\n/)
  if (lines.length < 2) {
    return { headers: [], rows: [] }
  }

  // Parse headers - handle both tab and comma delimiters
  const delimiter = lines[0].includes("\t") ? "\t" : ","
  const headers = parseCSVLine(lines[0], delimiter)

  // Find column indices
  const columnMap: Record<string, number> = {}
  headers.forEach((header, index) => {
    columnMap[header.trim()] = index
  })

  const rows: DataPoint[] = []

  for (let i = 1; i < lines.length; i++) {
    const line = lines[i].trim()
    if (!line) continue

    const values = parseCSVLine(line, delimiter)

    const getValue = (key: string): string => {
      const index = columnMap[key]
      return index !== undefined ? values[index]?.trim() ?? "" : ""
    }

    const getNumericValue = (key: string): number => {
      const val = getValue(key)
      const num = parseFloat(val)
      return isNaN(num) ? 0 : num
    }

    // Support different column name variations
    const lat = getNumericValue("anonymous_lat") || getNumericValue("lat") || getNumericValue("latitude")
    const lng = getNumericValue("anonymous_long") || getNumericValue("long") || getNumericValue("longitude")

    const dataPoint: DataPoint = {
      ID: getNumericValue("ID") || i,
      GlideNumber: getValue("GlideNumber") || getValue("glide_number") || "",
      Country: getValue("Country") || getValue("country") || "Unknown",
      multi_country: getValue("multi_country") || getValue("Multi_country") || "",
      anonymous_long: lng,
      anonymous_lat: lat,
      Area: getNumericValue("Area") || getNumericValue("area"),
      Began: getNumericValue("Began") || getNumericValue("began"),
      Ended: getNumericValue("Ended") || getNumericValue("ended"),
      Validation: getValue("Validation") || getValue("validation") || "",
      Dead: getNumericValue("Dead") || getNumericValue("dead") || getNumericValue("deaths"),
      Displaced: getNumericValue("Displaced") || getNumericValue("displaced"),
      MainCause: getValue("MainCause") || getValue("main_cause") || getValue("cause") || "Unknown",
      Severity: getNumericValue("Severity") || getNumericValue("severity") || 1,
      categorised_cause: getValue("categorised_cause") || getValue("cause_category") || "",
    }

    rows.push(dataPoint)
  }

  return { headers, rows }
}

function parseCSVLine(line: string, delimiter: string): string[] {
  const result: string[] = []
  let current = ""
  let inQuotes = false

  for (let i = 0; i < line.length; i++) {
    const char = line[i]

    if (char === '"') {
      inQuotes = !inQuotes
    } else if (char === delimiter && !inQuotes) {
      result.push(current)
      current = ""
    } else {
      current += char
    }
  }

  result.push(current)
  return result
}
