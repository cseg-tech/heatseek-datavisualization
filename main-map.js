makeMap();

function makeMap() {
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

  // Plot map + parse data
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


    // data parsing
    var parseMonthDayYear = d3.timeFormat("%d-%b"); // d3.utcParse() // fix this

    var dataForTimeline = [],
        dateToCrimeCount = {};
    
    data.forEach(function(d, idx) {

        d.a = parseMonthDayYear(new Date(d.a)) ;
       // d.created_at = parseMonthDayYear(d.created_at);
        if (!dateToCrimeCount[d.a]) {
            var dataCount = [d.t, 1];
            dateToCrimeCount[d.a] = dataCount;
        }
        dateToCrimeCount[d.a][0] += d.t;
        dateToCrimeCount[d.a][1] += 1;

    });

    Object.keys(dateToCrimeCount).forEach(function(time) {
        dateToCrimeCount[time] = dateToCrimeCount[time][0] / dateToCrimeCount[time][1];
        dataForTimeline.push({ TIME: new Date(time), TEMP: dateToCrimeCount[time] });
    });
    dataForTimeline.sort(function(a,b) { return a.TIME - b.TIME; });

    makeTimeline(data, dataForTimeline);
    //makeLegend();  
  
  })

  // If the user change the map (zoom or drag), update circle position:
  map.on("moveend", update) 

}

// Creates the event timeline and sets up callbacks for brush changes
function makeTimeline(dataForMap, dataForTimeline) {

  var margin = { top: 10, right: 10, bottom: 20, left: 25 },
      width  = 600 - margin.left - margin.right,
      height = 80 - margin.top  - margin.bottom;

  var timelineSvg = d3.select("#timeline-container").append("svg")
      .attr("width", width + margin.left + margin.right)
      .attr("height", height + margin.top + margin.bottom);

  var timeline = timelineSvg.append("g")
      .attr("class", "timeline")
      .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

  var x = d3.scaleTime()
      .domain(d3.extent(dataForTimeline.map(function(d) { return d.TIME; })))
      .range([0, width]);

  var y = d3.scaleLinear()
      .domain(d3.extent(dataForTimeline.map(function(d) { return d.TEMP; })))
      .range([height, 0]);

  var xAxis = d3.axisBottom()
      .scale(x);

  var yAxis = d3.axisLeft()
      .scale(y);

  var area = d3.area()
      .x(function(d) { return x(d.TIME); })
      .y0(height)
      .y1(function(d) { return y(d.TEMP); });

  timeline.append("path")
      .datum(dataForTimeline)
      .attr("class", "area")
      .attr("d", area);

  timeline.append("g")
      .attr("class", "x axis")
      .attr("transform", "translate(0," + height + ")")
      .call(xAxis);

  timeline.append("g")
      .attr("class", "y axis")
      .call(yAxis);

  timeline.append("text")
      .attr("transform", "rotate(-90)")
      .attr("dy", "1em")
      .style("text-anchor", "end")
      .text("Temperature");

  // Add brush to timeline, hook up to callback
  var brush = d3.brushX()
      .on("brush", function() { brushCallback(brush, dataForMap); });

  timeline.append("g")
      .attr("class", "x brush")
      .call(brush)
    .selectAll("rect")
      .append("rect")
      .attr("y", -6)
      .attr("height", height + 7);

  //console.log(d3.)
  //brush.event(timeline.select('g.x.brush')); // dispatches a single brush event
}

// this part isn't working
function brushCallback(brush, dataForMap) {
  if (d3.event.selection == null) {
      updateMapPoints([]);
  } else {
      var newDateRange = brush.extent(),
          filteredData = [];

      dataForMap.forEach(function(d) {
          if (d.TIME >= newDateRange[0] && d.TIME <= newDateRange[1]) {
              filteredData.push(d);
          }
      });
      updateMapPoints(filteredData);
      console.log(filteredData);
  }
}

// Updates the points displayed on the map, to those in the passed data array
function updateMapPoints(data) {
  /*
  var circles = mapSvg.selectAll("circle").data(data, function(d) { return d.TIME + d.TOT; });

  circles // update existing points
      .on("mouseover", tipMouseover)
      .on("mouseout", tipMouseout)
      .attr("fill", function(d) { return colorScale(d.CR); })
      .attr("cx", function(d) { return projection([+d.longitude, +d.latitude])[0]; })
      .attr("cy", function(d) { return projection([+d.longitude, +d.latitude])[1]; })
      .attr("r",  function(d) { return radiusScale(+d.TOT); });

  circles.enter().append("circle") // new entering points
      .on("mouseover", tipMouseover)
      .on("mouseout", tipMouseout)
      .attr("fill", function(d) { return colorScale(d.CR); })
      .attr("cx", function(d) { return projection([+d.longitude, +d.latitude])[0]; })
      .attr("cy", function(d) { return projection([+d.longitude, +d.latitude])[1]; })
      .attr("r",  0)
    .transition()
      .duration(500)
      .attr("r",  function(d) { return radiusScale(+d.TOT); });

  circles.exit() // exiting points
      .attr("r",  function(d) { return radiusScale(+d.TOT); })
    .transition()
      .duration(500)
      .attr("r", 0).remove();
  */
};

function update() {
  d3.selectAll("circle")
    .attr("cx", function(d){ return map.latLngToLayerPoint([d.la, d.lo]).x })
    .attr("cy", function(d){ return map.latLngToLayerPoint([d.la, d.lo]).y })
};