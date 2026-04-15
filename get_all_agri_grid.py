import requests
import json
import os
import time

def get_all_agriculture_data():
    url = "https://overpass-api.de/api/interpreter"
    
    # Define a 0.5x0.5 degree grid for the 4 provinces area
    # Min Lat: 36.5, Max Lat: 40.5
    # Min Lon: 29.8, Max Lon: 34.5
    
    lat_steps = [36.5, 37.5, 38.5, 39.5, 40.5]
    lon_steps = [29.8, 31.0, 32.2, 33.4, 34.6]
    
    all_features = []
    seen_ids = set()

    output_path = os.path.join("data", "central_anatolia_agriculture.geojson")

    for i in range(len(lat_steps)-1):
        for j in range(len(lon_steps)-1):
            bbox = [lat_steps[i], lon_steps[j], lat_steps[i+1], lon_steps[j+1]]
            print(f"Fetching grid cell {bbox}...")
            
            # Query for landuse=farmland/orchard/vineyard
            # We use 'out center' for very large areas to keep data size down, 
            # but here we'll try 'out geom' with a limit per cell.
            query = f"""
            [out:json][timeout:60];
            (
              way["landuse"~"farmland|orchard|vineyard"]({bbox[0]},{bbox[1]},{bbox[2]},{bbox[3]});
            );
            out geom 300; 
            """
            
            try:
                response = requests.post(url, data={'data': query}, timeout=70)
                if response.status_code == 200:
                    data = response.json()
                    added_in_cell = 0
                    for element in data.get('elements', []):
                        if element['id'] in seen_ids: continue
                        if element['type'] == 'way' and 'geometry' in element:
                            coordinates = [[pt['lon'], pt['lat']] for pt in element['geometry']]
                            if len(coordinates) < 3: continue
                            if coordinates[0] != coordinates[-1]:
                                coordinates.append(coordinates[0])
                            
                            feature = {
                                "type": "Feature",
                                "geometry": { "type": "Polygon", "coordinates": [coordinates] },
                                "properties": {
                                    "osm_id": element['id'],
                                    "landuse": element.get('tags', {}).get('landuse', 'farmland')
                                }
                            }
                            all_features.append(feature)
                            seen_ids.add(element['id'])
                            added_in_cell += 1
                    print(f"  Added {added_in_cell} new features.")
                    # Sleep to prevent rate limiting
                    time.sleep(2)
                elif response.status_code == 429:
                    print("  Rate limited. Sleeping for 10 seconds...")
                    time.sleep(10)
                else:
                    print(f"  Error {response.status_code}. Skipping cell.")
            except Exception as e:
                print(f"  Request failed: {e}")

    # Save to file
    with open(output_path, "w", encoding="utf-8") as f:
        json.dump({"type": "FeatureCollection", "features": all_features}, f)
    
    print(f"Total features collected: {len(all_features)}")

if __name__ == "__main__":
    get_all_agriculture_data()
