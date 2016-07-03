// TRANSPOSE DATA FROM ROWS TO COLUMNS -- NEEDED FOR PLOTTING VIA D3.JS

function transpose (data, type) {
    if (type == 'nk') {
        dataJson = parseJSON(data.data);
    } else {
        dataJson = data;
    };
    array = [];
    for (var key in dataJson) {
        array.push(dataJson[key]);
     }
    //array = [parseJSON(data.data).x, parseJSON(data.data).n, parseJSON(data.data).k]
    var data_transposed = array[0].map(function(col, i) {
        return array.map(function(row) {
            return row[i]
        })
    });
    return data_transposed
}

// PLOT TRANSMITTANCE AND REFLECTANCE
function plotTR (dataset, type, target) {
    data = transpose(dataset, type);
    $('#'+target).empty();
    w = $('#'+target).width();
    h = (0.75*w);
    var padding = 40;

    d3.select("#"+target).selectAll("svg").remove();

    var svg=d3.select("#"+target)
              .append("svg:svg")
              .attr("width", w)
              .attr("height", h);

    var xScale = d3.scale.linear()
                         .domain([d3.min(data, function(d) { return d[0]; }), d3.max(data, function(d) { return d[0]; })])
                         .range([padding, w-padding*2]);

    
    var yScale = d3.scale.linear()
                         .domain([0,1])
                         .range([h-padding*2, padding]);

    var yScaleRight = d3.scale.linear()
                         .domain([0,1])
                         .range([h-padding*2, padding]);

    var xAxis = d3.svg.axis()
                      .scale(xScale)
                      .orient("bottom");

    
    var xAxisTop = d3.svg.axis()
                      .scale(xScale)
                      .orient("top");


    var yAxis = d3.svg.axis()
                      .scale(yScale)
                      .orient("left")
                      .ticks(5);
    
    var yAxisRight = d3.svg.axis()
                      .scale(yScaleRight)
                      .orient("right")
                      .ticks(5);
    
    var transmittance = d3.svg.line()
        .x(function(d) {return xScale(d[0]);})
        .y(function(d) {return yScale(d[1]);})
        .interpolate("basis");

    svg.append("path")
       .attr("d", transmittance(data))
       .attr("stroke", "blue")
       .attr("fill", "none");

    var reflectance = d3.svg.line()
        .x(function(d) {return xScale(d[0]);})
        .y(function(d) {return yScaleRight(d[2]);})
        .interpolate("basis");

    svg.append("path")
       .attr("d", transmittance(data))
       .attr("stroke", "blue")
       .attr("fill", "none");

    svg.append("path")
       .attr("d", reflectance(data))
       .attr("stroke", "red")
       .attr("fill", "none");

    svg.selectAll("circle")
       .data(data)
       .enter()
       .append("circle")
       .attr("cx", function(d) {
           return xScale(d[0]);
       })
       .attr("cy", function(d) {
           return yScale(d[1]);
       })
       .attr("r", 2)
       .style("fill", "blue");

    svg.selectAll("rect")
       .data(data)
       .enter()
       .append("circle")
       .attr("cx", function(d) {
           return xScale(d[0]);
       })
       .attr("cy", function(d) {
           return yScaleRight(d[2]);
       })
       .attr("r", 2)
       .style("fill", "red");

    svg.append("g")
       .attr("class", "axis")
       .attr("transform", "translate(0," + (h-padding*2) + ")")
       .call(xAxis);

    svg.append("g")
       .attr("class", "axis")
       .attr("transform", "translate(0," + padding + ")")
       .call(xAxisTop);

    svg.append("g")
       .attr("class", "axis")
       .attr("transform", "translate(" + padding + ",0)")
       .call(yAxis);

    svg.append("text")
       .attr("text-anchor", "middle")
       .attr("transform", "translate("+(w/1.5) + "," + (h-padding)+")")
       .text("Wavelength (micron)");

    svg.append("text")
       .attr("text-anchor", "middle") 
       .attr("transform", "translate("+ padding/10 +","+(h/2)+")")
       .text("T")
       .style("fill", "blue");

    svg.append("g")
       .attr("class", "axis")
       .attr("transform", "translate("+ (w-padding*2) + ",0)")
       .call(yAxisRight);
    
    svg.append("text")
       .attr("text-anchor", "middle") 
       .attr("transform", "translate("+ (w-(padding*1.2)) +","+(h/2)+")")
       .text("R")
       .style("fill", "red");
};

// PLOT LIBPAGE DATA
function plot (dataset, type, target) {
    data = transpose(dataset, type);
    $('#'+target).empty();
    w = $('#'+target).width();
    h = (0.75*w);
    var padding = 40;

    d3.select("#"+target).selectAll("svg").remove();

    var svg=d3.select("#"+target)
              .append("svg:svg")
              .attr("width", w)
              .attr("height", h);

    var xScale = d3.scale.linear()
                         .domain([d3.min(data, function(d) { return d[0]; }), d3.max(data, function(d) { return d[0]; })])
                         .range([padding, w-padding*2]);

    
    if (type == 'nk') {
        var yScale = d3.scale.linear()
                             .domain([d3.min(data, function(d) { return d.slice(-1)[0];}), d3.max(data, function(d) { return d.slice(-1)[0]; })])
                             .range([h-padding*2, padding]);
    };

    if (type == 'TR') {
        var yScale = d3.scale.linear()
                             .domain([0,1])
                             .range([h-padding*2, padding]);
    };



    
    var xAxis = d3.svg.axis()
                      .scale(xScale)
                      .orient("bottom");

    
    var xAxisTop = d3.svg.axis()
                      .scale(xScale)
                      .orient("top");


    var yAxis = d3.svg.axis()
                      .scale(yScale)
                      .orient("left")
                      .ticks(5);
    
    
    svg.selectAll("circle")
       .data(data)
       .enter()
       .append("circle")
       .attr("cx", function(d) {
           return xScale(d[0]);
       })
       .attr("cy", function(d) {
           return yScale(d.slice(-1)[0]);
       })
       .attr("r", 3)
       .style("fill", "blue");

       
    svg.append("g")
       .attr("class", "axis")
       .attr("transform", "translate(0," + (h-padding*2) + ")")
       .call(xAxis);

    svg.append("g")
       .attr("class", "axis")
       .attr("transform", "translate(0," + padding + ")")
       .call(xAxisTop);

    svg.append("g")
       .attr("class", "axis")
       .attr("transform", "translate(" + padding + ",0)")
       .call(yAxis);

    svg.append("text")
       .attr("text-anchor", "middle")
       .attr("transform", "translate("+(w/1.5) + "," + (h-padding)+")")
       .text("Wavelength (micron)");

    svg.append("text")
       .attr("text-anchor", "middle") 
       .attr("transform", "translate("+ padding/10 +","+(h/2)+")")
       .text("n")
       .style("fill", "blue");


    if (type == 'nk') {
        if (parseJSON(dataset.data).k) {

            var yScaleRight = d3.scale.linear()
                                 .domain([d3.min(data, function(d) { return d[1];}), d3.max(data, function(d) { return d[1]; })])
                                 .range([h-padding*2, padding]);

            var yAxisRight = d3.svg.axis()
                              .scale(yScaleRight)
                              .orient("right")
                              .ticks(5);

            svg.selectAll("rect")
               .data(data)
               .enter()
               .append("circle")
               .attr("cx", function(d) {
                   return xScale(d[0]);
               })
               .attr("cy", function(d) {
                   return yScaleRight(d[1]);
               })
               .attr("r", 3)
               .style("fill", "red");
               
            svg.append("g")
               .attr("class", "axis")
               .attr("transform", "translate("+ (w-padding*2) + ",0)")
               .call(yAxisRight);
            
            svg.append("text")
               .attr("text-anchor", "middle") 
               .attr("transform", "translate("+ (w-(padding*1.2)) +","+(h/2)+")")
               .text("k")
               .style("fill", "red");
        };
    };

    
}

