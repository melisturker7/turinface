---
name: csv-visualizer-builder
description: Build and publish standalone web applications for uploading and visualizing CSV data on a map. Use this skill when the user wants to create a new page in a project that handles CSV parsing, geographic mapping (Leaflet), and GitHub Pages deployment.
---

# CSV Visualizer Builder

This skill provides a standard workflow for creating and publishing web-based CSV visualizers with a consistent dark-themed, card-based aesthetic.

## App Architecture

All apps generated with this skill should follow the **Standalone Single-Page Application (SPA)** pattern:
- **Leaflet.js**: For mapping and geographic visualization.
- **PapaParse**: For robust client-side CSV parsing.
- **Dark Theme**: Consistent use of `#0a1628` background and `#8DC63F` primary colors.
- **Responsive Design**: Flexible header and full-screen map.

## Core Implementation Logic

When creating the `renderData` function, ensure it supports common coordinate column names:
- **Latitude**: `lat`, `latitude`, `anonymous_lat`, `Lat`.
- **Longitude**: `long`, `lng`, `longitude`, `anonymous_long`, `Long`.

```javascript
function getCoords(row) {
    const lat = row.anonymous_lat ?? row.lat ?? row.latitude ?? row.Lat;
    const lng = row.anonymous_long ?? row.long ?? row.lng ?? row.longitude ?? row.Long;
    return (lat !== undefined && lng !== undefined) ? [lat, lng] : null;
}
```

## GitHub Pages Publishing Workflow

To ensure the new app is available at a unique URL without conflicting with existing pages:

1. **Unique Filename**: Create a descriptive filename (e.g., `health_data_viz.html`). Do NOT use `index.html`.
2. **Landing Page Link**: Add a link or card for the new page in the project's root `index.html`.
3. **Commit & Push**:
   - `git add <new_file>.html index.html`
   - `git commit -m "feat: add <app_name> visualizer"`
   - `git push origin main`
4. **Trigger Rebuild**: If the site doesn't update, push an empty commit:
   - `git commit --allow-empty -m "trigger: rebuild pages"`
   - `git push origin main`

## Template
Use `assets/template.html` as the starting point for all new visualizer apps.
