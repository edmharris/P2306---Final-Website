// initalize leaflet map
var map = L.map('map').setView([44.6, -78], 8);

// add OpenStreetMap basemap
L.tileLayer('http://{s}.tile.osm.org/{z}/{x}/{y}.png', {
    attribution: '&copy; <a href="http://osm.org/copyright">OpenStreetMap</a> contributors'
}).addTo(map);

var photoArray = ["imagery/3857tifs/13_A18252-070_cog_web_mercator.tif"];
var imgList = new Object();

// L.GeoRasterLayer.ChangeOp = L.GeoRasterLayer.extend({
//   setOpacity: function(opacity) {
//     this._container.style.opacity = opacity;
//   }
// });

for (x in photoArray) {
  fetch(photoArray[x])
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
        leafID = layer._leaflet_id;
        layer.addTo(map);
        Object.defineProperty(imgList,"pic",{value:leafID,configurable: true});

        map.fitBounds(layer.getBounds());
    });
  });
};

var ourCustomControl = L.Control.extend({
  options: {
    position: 'topright'
  },
  onAdd: function (map) {
    var container = L.DomUtil.create('button'); 
    container.innerText = 'Change Opacity';    // text for button
    container.style.backgroundColor = 'white';      // styles for the button
    container.style.borderWidth = '2px';            // these options make it look like
    container.style.borderColor = '#b4b4b4';        // all of the other buttons that
    container.style.borderRadius = '5px';           // are already there
    container.style.borderStyle = 'solid';
    container.style.width = '140px';
    container.style.height = '30px';
      
//Set the function of the button to check if the user input overlaps the aerials
    container.onclick = function(){
      map.eachLayer(function(layer) {
        if(layer.opacity === 1) {
          layer.setStyle()
        }
        else {
          L.layer.setOpacity(1);
        }
      });
    }
    return container;
  },
});
map.addControl(new ourCustomControl());