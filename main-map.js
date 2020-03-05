// mapid is the id of the div where the map will appear
var map = L
  .map('mapid')
  .setView([40.730610, -73.935242], 11);   // center position + zoom

// Add a tile to the map = a background. Comes from OpenStreetmap
L.tileLayer(
    'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: 'Map data &copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a>',
    }).addTo(map);

// Add a svg layer to the map L.svg().addTo(map);

// Create data for circles:
var data = [
  {"lat": 40.848111, "lng": -73.909063, "size": 14, "color": "Close"},
  {"lat": 40.702, "lng": -73.948105, "size": 12, "color": "Close"},
  {"lat": 40.65836, "lng": -73.960466, "size": 9, "color": "Open"}
];

// Create color palettes
var violation = {
  "Close": "#fff",
  "Open": "#000"
}

// plot onto map
for ( var i = 0; i < data.length; ++i ) 
{
   L.circleMarker( 
     [data[i].lat, data[i].lng],
     {
       stroke: false,
       radius: data[i].size,
       color: violation[data[i].color],
       fillOpacity: 0.8
     })
      .addTo( map );
}

/*
// Select the svg area and add circles:
d3.select("#mapid")
  .select("svg")
  .selectAll("myCircles")
  .data(data)
  .enter()
  .append("circle")
    .attr("cx", function(d){ return map.latLngToLayerPoint([d.lat, d.lng]).x })
    .attr("cy", function(d){ return map.latLngToLayerPoint([d.lat, d.lng]).y })
    .attr("r", 14)
    .style("fill", "red")
    .attr("stroke", "red")
    .attr("stroke-width", 3)
    .attr("fill-opacity", .4)

// Function that update circle position if something change
function update() {
  d3.selectAll("circle")
    .attr("cx", function(d){ return map.latLngToLayerPoint([d.lat, d.lng]).x })
    .attr("cy", function(d){ return map.latLngToLayerPoint([d.lat, d.lng]).y })
}

// If the user change the map (zoom or drag), I update circle position:
map.on("moveend", update)
*/