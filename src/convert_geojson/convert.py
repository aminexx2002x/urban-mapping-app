import json
import shapely.wkt
from shapely.geometry import mapping
import os

# Load the WKT data
file_path = os.path.join("src", "convert_geojson", "wilayas.wkt.json")
with open(file_path, 'r', encoding='utf-8') as f:
    wilayas_data = json.load(f)

def get_wilaya_borders(wilaya_name):
    """Get the borders of a specific wilaya by name"""
    for wilaya in wilayas_data:
        if wilaya['name'].lower() == wilaya_name.lower():
            # Convert WKT to GeoJSON-like format
            geometry = shapely.wkt.loads(wilaya['wkt'])
            return mapping(geometry)
    return None

# Example usage:
# borders = get_wilaya_borders("Algiers")
# print(borders)  # This will print the GeoJSON-like coordinates for Algiers
