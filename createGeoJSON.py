import arcpy
import csv
import json

# Path to the shapefile
shapefile_path = "D:/FlemSem3/Collab/Workflows/Airphoto Database/2023_AirphotoDatabase.shp"

# Path to the CSV file
csv_file_path = "D:/FlemSem3/Collab/Workflows/Airphoto Database/2020AirPhotoDatabaseMasterUPDATED.csv"

# Field names in the shapefile and CSV file for joining
shapefile_id_field = "PHOTO_ID"
csv_id_field = "x"

# Path to the output GeoJSON file
output_geojson_path = "D:/FlemSem3/Collab/P2306-Final-Website/imagery/aerialsPy.json"

# Open the CSV file and create a dictionary based on the PHOTO_ID field
csv_dict = {}
with open(csv_file_path, 'r') as csv_file:
    reader = csv.DictReader(csv_file)
    for row in reader:
        csv_dict[row[csv_id_field]] = row

# Create a list to hold the GeoJSON features
features = []

# Iterate through the shapefile records
with arcpy.da.SearchCursor(shapefile_path, ["SHAPE@", shapefile_id_field]) as cursor:
    for row in cursor:
        geometry = row[0]
        photo_id = row[1]

        # Get the corresponding row from the CSV data
        csv_row = csv_dict.get(photo_id)

        if csv_row is not None:
            # Extract coordinates from the geometry
            if geometry.type == "polygon":
                coordinates = [geometry.centroid.X, geometry.centroid.Y]
            else:
                # Handle other geometry types as needed
                continue

            # Construct the GeoJSON feature
            feature = {
                "type": "Feature",
                "geometry": {
                    "type": "Point",
                    "coordinates": coordinates
                },
                "properties": {
                    "PHOTO_ID": photo_id,
                    "image": csv_row["ImageFileName"]
                }
            }

            features.append(feature)

# Create the GeoJSON structure
geojson = {
    "type": "FeatureCollection",
    "features": features
}

# Convert to JSON string
geojson_str = json.dumps(geojson)

# Save to a file
with open(output_geojson_path, "w") as output_file:
    output_file.write(geojson_str)
