import geopandas as gpd
import os

def convert_to_csv():
    # Paths
    files = {
        "health_risk": "data/health_sites_at_flood_risk.geojson",
        "agri_risk": "data/agri_at_flood_risk.geojson"
    }
    
    for key, path in files.items():
        if os.path.exists(path):
            print(f"Converting {path} to CSV...")
            df = gpd.read_file(path)
            
            # For points (Health), extract Lat/Lon
            # For polygons (Agri), extract Centroid Lat/Lon for easy reference
            if all(df.geometry.type == 'Point'):
                df['longitude'] = df.geometry.x
                df['latitude'] = df.geometry.y
            else:
                # Use centroid for polygons
                centroids = df.geometry.centroid
                df['longitude'] = centroids.x
                df['latitude'] = centroids.y
            
            # Drop geometry column for CSV
            df_no_geom = df.drop(columns='geometry')
            
            output_csv = path.replace(".geojson", ".csv")
            df_no_geom.to_csv(output_csv, index=False, encoding='utf-8-sig')
            print(f"  Saved to {output_csv}")

if __name__ == "__main__":
    convert_to_csv()
