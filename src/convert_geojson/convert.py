import geopandas as gpd
import os
import json

# Load the GeoJSON file using os.path.join for proper path handling
file_path = os.path.join("src", "convert_geojson", "all-wilayas.geojson")
gdf = gpd.read_file(file_path)

# Print available columns to see what we're working with
print("Available columns:", gdf.columns.tolist())

# Convert all geometries to WKT
wkt_data = []
for idx, row in gdf.iterrows():
    wkt_data.append({
        'id': idx,
        'name': row['name'] if 'name' in row else str(idx),  # Adjust 'name' to the correct column
        'wkt': row.geometry.wkt
    })

# Save to a JSON file
output_path = os.path.join("src", "convert_geojson", "wilayas.wkt.json")
with open(output_path, 'w', encoding='utf-8') as f:
    json.dump(wkt_data, f, ensure_ascii=False, indent=2)

print(f"\nWKT data saved to {output_path}")
print(f"First entry as example:")
print(json.dumps(wkt_data[0], indent=2))

# # Once you identify the correct column name, uncomment and update these lines:
# selected_wilayas = gdf[gdf['CORRECT_COLUMN_NAME'].isin(['Algiers', 'Oran', 'Constantine', 'Blida', 'Setif', 'Tizi Ouzou', 'Annaba', 'Batna', 'Bejaia', 'Tlemcen'])]
# 
# # Convert geometry to WKT
# selected_wilayas['wkt'] = selected_wilayas.geometry.apply(lambda x: x.wkt)
# 
# # Print the WKT representation
# print(selected_wilayas[['CORRECT_COLUMN_NAME', 'wkt']])
