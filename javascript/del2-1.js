/*
    FlemSem3\Collab\P2306\Del2
    python -m http.server

    This file adds a geoJson using JQuery
*/

// These are the headers for the results table
var headers = ["Photo ID","Photo Date","Scale"];

// This function sets data into the results table. The first item should always be the identifier.
function resultsTable(feature) {
    data = {
        data1: feature.properties.PHOTO_ID,        // set these to the geojson info you want
        data2: feature.properties.Photo_Date,
        data3: feature.properties.Scale
    }
    var table = document.getElementById("jsonResults");
    var row = document.createElement("tr");
    for(let x in data) {
        let tableCell = document.createElement("td");
        row.appendChild(tableCell);
        tableCell.textContent = data[x];
    }
    table.appendChild(row);
    // outputList.append('<input type="checkbox">')
};
// This function resets the results table
function resetTable() {
    resultsSection = document.getElementById("searchResults");
    resultsSection.removeAttribute("hidden");
    var table = document.getElementById("jsonResults"); // find the table
    table.innerHTML = "";                           // clear the table
    var row = document.createElement("tr");         //create the header row
    for (let title in headers) {                        // for each selected header
        let tableCell = document.createElement("th");   // create a header item
        row.appendChild(tableCell);                 // add the header item to the row
        tableCell.textContent = headers[title];      // put the current header into the item
    }
    table.appendChild(row);     // add the headers to the table
};
function tableCSS() {
    var table = document.getElementById("jsonResults");
    table.style.width = "50%";
    table.style.borderSpacing = "0";
    var head = table.getElementsByTagName("th");
    for (var i = 0; i < head.length; i++) {
        head[i].style.backgroundColor = "Gainsboro";
        head[i].style.textAlign = "left";
    }
    var body = table.getElementsByTagName("td");
    for (var i = 0; i < body.length; i++) {
        body[i].style.borderBottom = "solid 1px black";
    }
};


// Add map baselayers
const osm = L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
    maxZoom: 19,
    attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>'
});
const Esri_WorldImagery = L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}', {
    attribution: 'Tiles &copy; Esri &mdash; Source: Esri, i-cubed, USDA, USGS, AEX, GeoEye, Getmapping, Aerogrid, IGN, IGP, UPR-EGP, and the GIS User Community'
});
//Map declaration
const map = L.map('map', {
    center: [44.6, -78.5],
    zoom: 8,
    layers: [Esri_WorldImagery,osm]            
});
// Add baselayer info as array for layer control, control added lower to put it
// below the search bar
const baseLayers = {
    'Esri World Imagery': Esri_WorldImagery,
    'OpenStreetMap': osm
};
const baseControl = L.control.layers(baseLayers,null,{collapsed:false,position:'topleft'}).addTo(map);

// var showjson = L.FeatureGroup();
let photoJSON = L.geoJSON(null,{
    style: function(feature) {
        return {
            color: 'purple'
        }
    }
}).addTo(map); // Variable to hold the GeoJSON data
let sameJson;

let outputSection = document.getElementById("searchResults"); // html section for results
// let outputList = document.getElementById("jsonResults"); // HTML tablee to put the results into

// Add the geoJSON
$.getJSON('../imagery/aerialsCambium.json', function(data) {
    photoJSON.addData(data);
    sameJson = data;
    console.log(sameJson.features[1].properties) // for troubleshooting and viewing properties

    // .sort() orders by putting the lower number first, so if A - B is negative, A preceeds, if positive, B preceeds, if 0 they are equal
    sameJson.features.sort(function(a,b) { // sort the JSON so it shows up nicely
        var propA = a.properties.PHOTO_ID;
        var propB = b.properties.PHOTO_ID;
        return propA - propB;
    });
});
baseControl.addOverlay(photoJSON,"Aerial Image Locations");

var userIn = new L.FeatureGroup().addTo(map);  // variable to store user drawn inputs

// add drawing control bar
var drawControl = new L.Control.Draw({
    draw: {
        polygon: true,
        polyline: false,
        rectangle: false,
        circle: false,
        circlemarker: false,
        marker: false,
    },
    edit: {
        featureGroup: userIn
    }
});
map.addControl(drawControl);

var userShape = null;
// save user drawn items as new layers in the layer group
map.on('draw:created', function(e) {
    var layer = e.layer;
    userIn.addLayer(layer);

    //save the polygon to GeoJSON for later analysis
    userShape = layer.toGeoJSON();
    console.log('User Input: ',userShape);
});

// add a button to summon photos on a drawn layer or point
var ourCustomControl = L.Control.extend({
    options: {
        position: 'topright'
    },
    onAdd: function (map) {
        var container = L.DomUtil.create('button'); 
        container.innerText = 'Find Aerial Imagery';    // text for button
        container.style.backgroundColor = 'white';      // styles for the button
        container.style.borderWidth = '2px';            // these options make it look like
        container.style.borderColor = '#b4b4b4';        // all of the other buttons that
        container.style.borderRadius = '5px';           // are already there
        container.style.borderStyle = 'solid';
        container.style.width = '140px';
        container.style.height = '30px';
        
//Set the function of the button to check if the user input overlaps the aerials
        container.onclick = function(){             // when we click the button
            console.log('Pull the lever, Cronk.');   // display a message confirming the click
            resetTable();   // reset the table values

            if (userShape === null) {                  // if the user has not set an input
                console.log('Wrong levaaaaAAAAAAHHHHH!!!!!!');       // return an error message
                return;
            }
            numResults = 0; // count number of results for error handling
            //iterate through the json and check if the polygons overlap the user input
            sameJson.features.forEach(function(feature) {
                var geometry = feature.geometry;
                var item = feature.properties.PHOTO_ID;

                // check for null values, skip if present
                if(!geometry || !userShape) {
                    console.log('ERROR: Invalid geometry or userShape on Photo',item);
                    return; // skip if either item is null
                }
                // check that geojson items are polygons
                if(feature.geometry.type !== 'Polygon') {
                    console.log('ERROR: Not a polygon: Photo',item);
                    return;
                }
                console.log('Photo ID:',item);
                var overlap = turf.booleanContains(geometry,userShape) || turf.booleanContains(userShape,geometry);  // check user poly against air json for overlap
                
                if (overlap) {  // if the user polygon is fully within an aerial image, add it to the output list
                    resultsTable(feature);
                    numResults += 1;    // count the number of overlapping results
                }
                else {
                    console.log('No overlap.'); // report if there is no overlap
                }
            });
            if (numResults === 0) { // response if there are no photos
                let table = document.getElementById("jsonResults"); // find the table
                table.innerHTML = ""; // empty the table
                outputSection.append('There are no photos in this area.');
            }
            console.log('numResults',numResults);
            tableCSS();
        }
        return container;
    },
});
map.addControl(new ourCustomControl());