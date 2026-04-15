import geopandas as gpd
import os

def identify_agri_risk():
    # File paths
    agri_path = os.path.join("data", "central_anatolia_agriculture.geojson")
    flood_path = os.path.join("data", "ankara_flood_extent.geojson")
    output_path = os.path.join("data", "agri_at_flood_risk.geojson")

    print("Loading agricultural and flood datasets...")
    agri_df = gpd.read_file(agri_path)
    flood_df = gpd.read_file(flood_path)

    # Ensure consistent CRS
    if agri_df.crs != flood_df.crs:
        flood_df = flood_df.to_crs(agri_df.crs)

    # Project to local CRS for accurate 1km buffer (meters)
    local_crs = "EPSG:32636"
    agri_df_projected = agri_df.to_crs(local_crs)
    flood_df_projected = flood_df.to_crs(local_crs)

    print("Creating 1km buffer and identifying at-risk farmlands...")
    flood_buffer = flood_df_projected.geometry.buffer(1000).union_all()
    
    # Identify agricultural plots that INTERSECT the 1km buffer
    agri_at_risk = agri_df_projected[agri_df_projected.geometry.intersects(flood_buffer)]

    # Convert back to WGS84
    agri_at_risk_wgs84 = agri_at_risk.to_crs("EPSG:4326")

    # Save results
    agri_at_risk_wgs84.to_file(output_path, driver='GeoJSON')
    
    print(f"Success! Identified {len(agri_at_risk_wgs84)} agricultural plots at risk.")
    print(f"Results saved to {output_path}")

if __name__ == "__main__":
    identify_agri_risk()
