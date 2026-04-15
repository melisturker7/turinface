import requests
import json
import os

def get_central_anatolia_health_data():
    # Overpass API URL
    url = "https://overpass-api.de/api/interpreter"
    
    # Query: Find all hospitals and clinics in the 'İç Anadolu Bölgesi' (Central Anatolia) area
    # Note: We use the Turkish name as it is the standard OSM tag for the region.
    query = """
    [out:json][timeout:60];
    area["name"="İç Anadolu Bölgesi"]["admin_level"="3"]->.searchArea;
    (
      node["amenity"="hospital"](area.searchArea);
      way["amenity"="hospital"](area.searchArea);
      node["healthcare"="clinic"](area.searchArea);
      way["healthcare"="clinic"](area.searchArea);
    );
    out center;
    """
    
    print("Querying Overpass API... This may take a moment.")
    response = requests.post(url, data={'data': query})
    
    if response.status_code == 200:
        data = response.json()
        
        # Simple conversion from Overpass JSON to GeoJSON
        geojson = {
            "type": "FeatureCollection",
            "features": []
        }
        
        for element in data.get('elements', []):
            # For ways, 'out center' provides a 'center' lat/lon
            lat = element.get('lat') or element.get('center', {}).get('lat')
            lon = element.get('lon') or element.get('center', {}).get('lon')
            
            if lat and lon:
                feature = {
                    "type": "Feature",
                    "geometry": {
                        "type": "Point",
                        "coordinates": [lon, lat]
                    },
                    "properties": element.get('tags', {})
                }
                # Add ID for reference
                feature["properties"]["osm_id"] = element.get('id')
                geojson["features"].append(feature)
        
        # Save to file
        output_path = os.path.join("data", "central_anatolia_health_facilities.geojson")
        with open(output_path, "w", encoding="utf-8") as f:
            json.dump(geojson, f, indent=2, ensure_ascii=False)
        
        print(f"Success! Saved {len(geojson['features'])} health facilities to {output_path}")
    else:
        print(f"Error querying API: {response.status_code}")
        print(response.text)

if __name__ == "__main__":
    get_central_anatolia_health_data()
