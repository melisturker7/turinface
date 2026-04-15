import geopandas as gpd
import os

def filter_health_sites_at_risk():
    # File paths
    health_sites_path = os.path.join("data", "central_anatolia_health_facilities.geojson")
    flood_extent_path = os.path.join("data", "ankara_flood_extent.geojson")
    output_path = os.path.join("data", "health_sites_at_flood_risk.geojson")

    print("Loading datasets...")
    # Load health facilities
    health_df = gpd.read_file(health_sites_path)
    # Load flood extent
    flood_df = gpd.read_file(flood_extent_path)

    # Ensure both are in the same CRS (WGS84)
    if health_df.crs != flood_df.crs:
        flood_df = flood_df.to_crs(health_df.crs)

    # Project to a local coordinate system (e.g., EPSG:32636 for Central Turkey) 
    # to perform buffering in meters (1km = 1000m)
    local_crs = "EPSG:32636"
    health_df_projected = health_df.to_crs(local_crs)
    flood_df_projected = flood_df.to_crs(local_crs)

    print("Creating 1km buffer around flood extent...")
    # Create 1km buffer
    flood_buffer = flood_df_projected.geometry.buffer(1000)
    
    # Check which health sites are within the buffer
    print("Identifying health sites within 1km of the flood...")
    sites_at_risk = health_df_projected[health_df_projected.geometry.within(flood_buffer.unary_union)]

    # Convert back to WGS84 for GeoJSON output
    sites_at_risk_wgs84 = sites_at_risk.to_crs("EPSG:4326")

    # Save to file
    sites_at_risk_wgs84.to_file(output_path, driver='GeoJSON')
    
    print(f"Success! Identified {len(sites_at_risk_wgs84)} health sites at risk.")
    print(f"Results saved to {output_path}")

if __name__ == "__main__":
    filter_health_sites_at_risk()
