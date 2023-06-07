// Initialize the map
var map = L.map('map').setView([44.6, -78.5], 8);

// Add a tile layer (e.g., OpenStreetMap)
L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
  attribution: 'Map data &copy; OpenStreetMap contributors'
}).addTo(map);

// Load the GeoTIFF image
var url = '/imagery/A19865-167_cog.tif';
fetch(url)
  .then(function(response) {
    return response.arrayBuffer();
  })
  .then(function(arrayBuffer) {
    // Create a GeoRasterLayer using the GeoTIFF data
    var geoRasterLayer = new GeoRasterLayer({
      url: url,
      arrayBuffer: arrayBuffer,
      pane: 'tilePane',
      opacity: 0.7
    });

    // Add the GeoRasterLayer to the map
    geoRasterLayer.addTo(map);

    // Fit the map view to the GeoRasterLayer bounds
    map.fitBounds(geoRasterLayer.getBounds());
  });
