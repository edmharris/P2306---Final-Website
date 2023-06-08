import arcpy
import csv
import json
import glob

# Path to the shapefile
shapefile_path = "D:/FlemSem3/Collab/P2306/Del2/imagery/COGsForGeoJSON2.shp"

# Path to the CSV file
csv_file_path = "D:/FlemSem3/Collab/TrentUniFreeTIFs/Trent.csv"

# path to the geoTIFFs/COGs
img_file_path = "D:/FlemSem3/Collab/TrentUniFreeTIFs/"
# create empy list to store the file names in
tiffs = []

# Field names in the shapefile and CSV file for joining
shapefile_id_field = "PHOTO_ID"
csv_id_field = "PHOTO_ID"   ########################## Cambium's is "x"

# Path to the output GeoJSON file
output_geojson_path = "D:/FlemSem3/Collab/P2306-Final-Website/imagery/aerialsPy.json"   # output name

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
        # print("photo id",photo_id)
        # print("row: ",row)

        # Get the corresponding row from the CSV data
        csv_row = csv_dict.get(str(photo_id))
        # get the corresponding file name from the image folder
        print("photo_id: ",photo_id)
        imgFiles = glob.glob(img_file_path+str(photo_id)+'_*.tif')  ############################################

        if csv_row is not None:
            # Extract coordinates from the geometry
            coordinates = list()
            if geometry == None:
                continue
            elif geometry.type == "polygon":
                for segment in geometry:
                    for vertex in segment:
                        coordinates.append([geometry.centroid.X, geometry.centroid.Y])
            else:
                # Handle other geometry types as needed
                continue

            # construct the properties of the geoJSON feature
            properties = {
                "PHOTO_ID":photo_id,
                "File_Name":imgFiles
            }
            # print(str(tiffs[photo_id-1]))
            # add all other key-value pairs from the csv
            for key,value in csv_row.items():
                if key != csv_id_field:
                    properties[key] = value

            # Construct the GeoJSON feature
            feature = {
                "type": "Feature",
                "geometry": {
                    "type": "Point",
                    "coordinates": coordinates
                },
                "properties": properties
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
print(tiffs)
print("Process complete.")