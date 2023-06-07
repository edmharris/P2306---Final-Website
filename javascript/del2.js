/*
    FlemSem3\Collab\P2306\Del2
    python -m http.server

    This file adds a geoJson using JQuery
*/

// These are the headers for the results table; leave the first blank
var headers = [" ","Photo ID","Photo Date","Scale"];

// This function sets data into the results table. The first item should always be the identifier.
function resultsTable(feature) {
    data = [ " ",                           // leave this blank
        feature.properties.PHOTO_ID,        // set these to the geojson info you want
        feature.properties.Photo_Date,
        feature.properties.Scale
    ];
    var table = $("#jsonResults");
    var row = $("<tr>");
    var checkCell = $("<td>");
    for(let x = 0; x < data.length; x++) {
        if(x === 0) {
            var cBox = $('<input>').attr({type:"checkbox",id:'cbox'+data[1]}).prop("checked",false);
            checkCell.append(cBox);
            row.append(checkCell);
        }
        else {
            row.append($('<td>').text(data[x]));
        }
    }
    table.append(row);
    // table.appendChild(row);
    // outputList.append('<input type="checkbox">')
};
// This function resets the results table
function resetTable() {
    resultsSection = $("#searchResults");
    resultsSection.empty();
    $('#resultsTitle').show();
    var table = $('<table>').attr('id','jsonResults');
    var tableHead = $('<tr>');
    for (let title in headers) {    
        tableHead.append($('<th>').text(headers[title]));
    }
    table.append(tableHead);
    resultsSection.append(table);
};
function tableCSS() {
    $('#jsonResults').css({"width":"50%","border-spacing":"0"});
    $('th').css({"background-color":"Gainsboro","text-align":"left"});
    $('td').css("border-bottom","solid 1px black");
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
                // console.log('Photo ID:',item);
                var overlap = turf.booleanContains(geometry,userShape) || turf.booleanContains(userShape,geometry);  // check user poly against air json for overlap
                
                if (overlap) {  // if the user polygon is fully within an aerial image, add it to the output list
                    resultsTable(feature);
                    numResults += 1;    // count the number of overlapping results
                }
                else {
                    // console.log('No overlap.'); // report if there is no overlap
                }
            });
            if (numResults === 0) { // response if there are no photos
                $('#searchResults').empty();
                $('#searchResults').append('<p>There are no photos in this area.</p>');
            }
            else {
                tableCSS();
            }
            console.log('numResults',numResults);
        }
        return container;
    },
});
map.addControl(new ourCustomControl());