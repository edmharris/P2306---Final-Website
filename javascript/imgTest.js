// initalize leaflet map
var map = L.map('map').setView([44.6, -78.5], 5);

// add OpenStreetMap basemap
L.tileLayer('http://{s}.tile.osm.org/{z}/{x}/{y}.png', {
    attribution: '&copy; <a href="http://osm.org/copyright">OpenStreetMap</a> contributors'
}).addTo(map);

var url_to_geotiff_file = "imagery/14_A17851-133_cog_web_mercator.tif";

fetch(url_to_geotiff_file)
  .then(response => response.arrayBuffer())
  .then(arrayBuffer => {
    parseGeoraster(arrayBuffer).then(georaster => {
      console.log("georaster:", georaster);

      /*
          GeoRasterLayer is an extension of GridLayer,
          which means can use GridLayer options like opacity.

          Just make sure to include the georaster option!

          http://leafletjs.com/reference-1.2.0.html#gridlayer
      */
      var layer = new GeoRasterLayer({
          georaster: georaster,
          resolution: 200,
          opacity: 1
      });
      layer.addTo(map);

      map.fitBounds(layer.getBounds());
  });
});