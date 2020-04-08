// mapid is the id of the div where the map will appear
var map = L
  .map('mapid')
  .setView([40.730610, -73.935242], 11);   // center position + zoom

// Add background to map (many diff options: https://leaflet-extras.github.io/leaflet-providers/preview/)
L.tileLayer(
    'https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png', {
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>',
    subdomains: 'abcd',
    maxZoom: 19
  }).addTo(map);

// Add a svg layer to the map 
L.svg().addTo(map);

// Create color palettes
var violation = {
  true: "red",
  false: "green"
}

// Plot map
d3.json("map-data-severity.json", function(data) {

  d3.select("#mapid")
    .select("svg")
    .selectAll("myCircle")
    .data(data)
    .enter()
    .append("circle")
      .attr("cx", function(d){ return map.latLngToLayerPoint([d.lat, d.lon]).x })
      .attr("cy", function(d){ return map.latLngToLayerPoint([d.lat, d.lon]).y })
      .attr("r", function(d) {
        if(d.severity == 0) {
          return (d.severity /3) + 5;  
        }
        else {
          return (d.severity ** (1/3)) * 4;
        }
      }) // change this to correlate with severity
      .style("fill", function(d) {
        return violation[d.violation];
      })
      .attr("stroke", false)
      .attr("fill-opacity", .8)

  // Function that update circle position if something change
  function update() {
    d3.selectAll("circle")
      .attr("cx", function(d){ return map.latLngToLayerPoint([d.lat, d.lon]).x })
      .attr("cy", function(d){ return map.latLngToLayerPoint([d.lat, d.lon]).y })
  }

  // If the user change the map (zoom or drag), update circle position:
  map.on("moveend", update) 
})