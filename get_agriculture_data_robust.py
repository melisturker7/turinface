import requests
import json
import os
import time

def get_agriculture_data_robust():
    url = "https://overpass-api.de/api/interpreter"
    
    # Focused bounding boxes around city centers/agricultural hubs
    regions = {
        "Ankara_Center": [39.8, 32.7, 40.0, 33.0],
        "Eskişehir_Center": [39.7, 30.4, 39.8, 30.6],
        "Konya_Center": [37.8, 32.4, 38.0, 32.6],
        "Kırıkkale_Center": [39.8, 33.4, 39.9, 33.6]
    }
    
    all_features = []
    
    for name, bbox in regions.items():
        print(f"Querying Overpass API for {name} ({bbox})...")
        query = f"""
        [out:json][timeout:30];
        (
          way["landuse"~"farmland|orchard|vineyard"]({bbox[0]},{bbox[1]},{bbox[2]},{bbox[3]});
        );
        out geom 200; 
        """
        
        try:
            response = requests.post(url, data={'data': query})
            if response.status_code == 200:
                data = response.json()
                for element in data.get('elements', []):
                    if element['type'] == 'way' and 'geometry' in element:
                        coordinates = [[pt['lon'], pt['lat']] for pt in element['geometry']]
                        if len(coordinates) < 3: continue
                        if coordinates[0] != coordinates[-1]:
                            coordinates.append(coordinates[0])
                        
                        feature = {
                            "type": "Feature",
                            "geometry": { "type": "Polygon", "coordinates": [coordinates] },
                            "properties": element.get('tags', {})
                        }
                        feature["properties"]["osm_id"] = element.get('id')
                        feature["properties"]["region"] = name
                        all_features.append(feature)
                print(f"Success! Added {len(data.get('elements', []))} features.")
                time.sleep(3)
            else:
                print(f"Skipping {name} due to status {response.status_code}")
        except Exception as e:
            print(f"Error for {name}: {e}")

    output_path = os.path.join("data", "central_anatolia_agriculture.geojson")
    with open(output_path, "w", encoding="utf-8") as f:
        json.dump({"type": "FeatureCollection", "features": all_features}, f, indent=2)
    
    print(f"Final dataset: {len(all_features)} features saved to {output_path}")

if __name__ == "__main__":
    get_agriculture_data_robust()
