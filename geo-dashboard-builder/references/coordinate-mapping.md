# Coordinate Mapping & Normalization

To ensure the Geo-Dashboard works with any CSV file, use the following mapping logic.

## Common Aliases

### Latitude
- `lat`
- `latitude`
- `Lat`
- `Latitude`
- `anonymous_lat`
- `y`
- `coords_0`

### Longitude
- `long`
- `lng`
- `longitude`
- `Long`
- `anonymous_long`
- `x`
- `coords_1`

## Implementation Pattern

Always use the Nullish Coalescing operator (`??`) to check for existence in order:

```javascript
function getCoords(row) {
    const lat = row.lat ?? row.latitude ?? row.Lat ?? row.anonymous_lat;
    const lng = row.long ?? row.lng ?? row.longitude ?? row.anonymous_long;
    
    if (lat !== undefined && lng !== undefined && !isNaN(lat) && !isNaN(lng)) {
        return [lat, lng];
    }
    return null;
}
```
