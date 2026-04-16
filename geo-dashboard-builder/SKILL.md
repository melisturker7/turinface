---
name: geo-dashboard-builder
description: Build and publish professional, high-fidelity geographic dashboards from CSV data. Features include interactive sidebars, automated coordinate mapping, and GitHub Pages deployment logic.
---

# Geo-Dashboard Builder

This skill enables the rapid creation of professional-grade geographic data dashboards with a standard "GeoViz" aesthetic.

## Recommended Workflow

1.  **Analyze Data**: Inspect the target CSV for coordinate columns (lat/long) and semantic fields (country, deaths, cause).
2.  **Scaffold**: Use `assets/template.html` as the base.
3.  **Map Fields**: Apply logic from [references/coordinate-mapping.md](references/coordinate-mapping.md) to handle field normalization.
4.  **Style**: Ensure consistent use of [references/brand-identity.md](references/brand-identity.md).
5.  **Publish**: Follow the GitHub Pages publishing protocol.

## Core Features
- **Sidebar Navigation**: Syncs list items with map markers.
- **Dynamic Stats**: Real-time aggregation of dataset metrics.
- **Universal CSV Parser**: Handles various delimiters and headers via PapaParse.
- **Visual Feedback**: Marker scaling and color-coding based on severity/impact.

## GitHub Pages Deployment

To publish a new dashboard without overwriting the existing project:
1.  **Isolation**: Save the new dashboard with a unique filename (e.g., `wildfire_2024.html`).
2.  **Integration**: Add a navigation link to the root `index.html`.
3.  **Deployment**: Push changes to `main`.
4.  **Force Build**: If the site doesn't refresh, push an empty commit:
    ```bash
    git commit --allow-empty -m "trigger: refresh pages" && git push origin main
    ```

## Resources
- **Template**: [assets/template.html](assets/template.html)
- **Coordinate Logic**: [references/coordinate-mapping.md](references/coordinate-mapping.md)
- **Style Guide**: [references/brand-identity.md](references/brand-identity.md)
