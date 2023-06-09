import arcpy
import csv
import json
import glob
import os

# set current working directory
current_directory = os.getcwd()
print("Current working directory:",current_directory)
# Path to the shapefile
shapefile_path = os.path.join(current_directory,"imagery","COGsForGeoJSON2.shp") # change to path and shapefile as required
print("Shapefile absolute path: ",shapefile_path)

# Path to the CSV file
csv_file_path = os.path.join(current_directory,"imagery","TrentData.csv") # change path and csv name as required
print("Shapefile absolute path:", csv_file_path)

# path to the geoTIFFs/COGs
img_file_path = os.path.relpath("imagery")  # change to the folder where the images are
print("Shapefile absolute path:",img_file_path)

# Field names in the shapefile and CSV file for joining
shapefile_id_field = "PHOTO_ID"
csv_id_field = "PHOTO_ID"   ########################## Cambium's is "x"

# Path to the output GeoJSON file
output_geojson_path = "imagery/aerialsPy.json"   # output name and location

# Open the CSV file and create a dictionary based on the PHOTO_ID field
csv_dict = {}
with open(csv_file_path, 'r') as csv_file:
    reader = csv.DictReader(csv_file)
    for row in reader:
        csv_dict[row[csv_id_field]] = row

# Create a list to hold the GeoJSON features
features = []

# set the spatial reference for the coordinates
sr = arcpy.SpatialReference(4326) #3857
# Iterate through the shapefile records
with arcpy.da.SearchCursor(shapefile_path, ["SHAPE@", shapefile_id_field],spatial_reference=sr) as cursor:
    for row in cursor:
        geometry = row[0]
        photo_id = row[1]
        # print("photo id",photo_id)
        # print("row: ",row)

        # Get the corresponding row from the CSV data
        csv_row = csv_dict.get(str(photo_id))
        # print(csv_row)
        # get the corresponding file name from the image folder
        imgFile = None
        for eachPic in glob.glob(os.path.join(img_file_path,str(photo_id)+'_*.tif')): 
            imgFile = eachPic     

        if csv_row is not None:
            # print("did this work")
            # Extract coordinates from the geometry
            coordinates = []
           
            print("first if")
            for segment in geometry:
                print("segment",segment)
                seg_coords = []
                for vertex in segment:
                    seg_coords.append([vertex.X,vertex.Y])
                    print(seg_coords)
                coordinates.append(seg_coords)
                print(coordinates)

            # construct the properties of the geoJSON feature
            properties = {
                "PHOTO_ID":photo_id,
                "File_Name":imgFile
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
                    "type": "Polygon",
                    "coordinates": coordinates
                },
                "properties": properties
            }
            features.append(feature)
print(coordinates)

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

# print(coordinates)
print("Process complete.")