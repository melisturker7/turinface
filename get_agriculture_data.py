import requests
import json
import os
import time

def get_agriculture_data():
    url = "https://overpass-api.de/api/interpreter"
    
    # Using bounding boxes to avoid timeouts for large provinces like Konya
    # Format: (S, W, N, E)
    regions = {
        "Ankara": [39.0, 31.5, 40.5, 34.0],
        "Eskişehir": [39.0, 29.8, 40.2, 31.8],
        "Konya": [36.5, 31.5, 39.5, 34.5],
        "Kırıkkale": [39.6, 33.1, 40.2, 34.2]
    }
    
    geojson = {
        "type": "FeatureCollection",
        "features": []
    }
    
    for name, bbox in regions.items():
        print(f"Querying Overpass API for {name} ({bbox}) agricultural landuse...")
        # Note: We filter for larger farmlands to keep the file size manageable 
        # using a simple way length or just limiting the count.
        query = f"""
        [out:json][timeout:60];
        (
          way["landuse"~"farmland|orchard|vineyard"]({bbox[0]},{bbox[1]},{bbox[2]},{bbox[3]});
        );
        out geom 1000; 
        """
        
        response = requests.post(url, data={'data': query})
        
        if response.status_code == 200:
            data = response.json()
            added_count = 0
            for element in data.get('elements', []):
                if element['type'] == 'way' and 'geometry' in element:
                    coordinates = [[pt['lon'], pt['lat']] for pt in element['geometry']]
                    if len(coordinates) < 3: continue
                    if coordinates[0] != coordinates[-1]:
                        coordinates.append(coordinates[0])
                    
                    feature = {
                        "type": "Feature",
                        "geometry": {
                            "type": "Polygon",
                            "coordinates": [coordinates]
                        },
                        "properties": element.get('tags', {})
                    }
                    feature["properties"]["osm_id"] = element.get('id')
                    feature["properties"]["province_context"] = name
                    geojson["features"].append(feature)
                    added_count += 1
            print(f"Success for {name}! Added {added_count} features.")
            time.sleep(2)
        else:
            print(f"Error for {name}: {response.status_code}")

    output_path = os.path.join("data", "central_anatolia_agriculture.geojson")
    with open(output_path, "w", encoding="utf-8") as f:
        json.dump(geojson, f, indent=2, ensure_ascii=False)
    
    print(f"Success! Saved {len(geojson['features'])} agricultural areas to {output_path}")

if __name__ == "__main__":
    get_agriculture_data()
