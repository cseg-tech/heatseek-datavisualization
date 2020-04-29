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
d3.json("hs-severity.json", function(data) {

  d3.select("#mapid")
    .select("svg")
    .selectAll("myCircle")
    .data(data)
    .enter()
    .append("circle")
      .attr("cx", function(d){ return map.latLngToLayerPoint([d.la, d.lo]).x })
      .attr("cy", function(d){ return map.latLngToLayerPoint([d.la, d.lo]).y })
      .attr("r", function(d) {
        if(d.s == 0) {
          return (d.s /3) + 5;  
        }
        else {
          return (d.s ** (1/3)) * 4;
        }
      }) // change this to correlate with severity
      .style("fill", function(d) {
        return violation[d.v];
      })
      .attr("stroke", false)
      .attr("fill-opacity", .8)

  // Function that update circle position if something change
  function update() {
    d3.selectAll("circle")
      .attr("cx", function(d){ return map.latLngToLayerPoint([d.la, d.lo]).x })
      .attr("cy", function(d){ return map.latLngToLayerPoint([d.la, d.lo]).y })
  }

      //add brush to timeline, hook to callback
      var brush = d3.svg.brush()
      .x(x);
      .on("brush", function(){ brushCallback(brush, data);})
      .extent([new Date("7/1/2014"), new Date("8/1/2014")]); // initial value
    
    slider.append("g")
      .attr("class", "x brush")
      .call(brush)
      .selectAll("rect")
      .attr("y", "-10")
      .attr("height", height + 10);

      brush.event(slider.select('g,x.brush')); //dispatches a single brush event

  });

  // Called whenever the timeline brush range (extent) is updated
  // Filters the map data to those points that fall within the selected timeline range
  function brushCallback(d3.slider().brush, data) {
    if (brush.empty()) {
        update([]);
    } else {
        var newDateRange = brush.extent(),
            filteredData = [];

        data.forEach(function(d) {
            if (d.TIME >= newDateRange[0] && d.TIME <= newDateRange[1]) {
                filteredData.push(d);
            }
        });
        update(filteredData);
    }
}

  // If the user change the map (zoom or drag), update circle position:
  map.on("moveend", update) 
})