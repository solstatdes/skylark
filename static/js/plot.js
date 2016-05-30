// TRANSPOSE DATA FROM ROWS TO COLUMNS -- NEEDED FOR PLOTTING VIA D3.JS

function transpose (data) {
    dataJson = parseJSON(data.data);
    array = [];
    console.log(dataJson);
    for (var key in dataJson) {
        console.log(key);
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

// PLOT LIBPAGE DATA
function plot (dataset, target) {
    console.log(target);
    data = transpose(dataset)
    $('#'+target).empty();
    w = $('#'+target).width();
    h = (0.75*w);
    var padding = 40;
    var svg=d3.select("#"+target)
              .append("svg:svg")
              .attr("width", w)
              .attr("height", h);

    var xScale = d3.scale.linear()
                         .domain([d3.min(data, function(d) { return d[0]; }), d3.max(data, function(d) { return d[0]; })])
                         .range([padding, w-padding]);

    var yScale = d3.scale.linear()
                         .domain([d3.min(data, function(d) { return d[1];}), d3.max(data, function(d) { return d[1]; })])
                         .range([h-padding, padding]);



    
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
           return yScale(d[1]);
       })
       .attr("r", 3)
       .style("fill", "blue");

       
    svg.append("g")
       .attr("class", "axis")
       .attr("transform", "translate(0," + (h-padding) + ")")
       .call(xAxis);

    svg.append("g")
       .attr("class", "axis")
       .attr("transform", "translate(0," + padding + ")")
       .call(xAxisTop);

    svg.append("g")
       .attr("class", "axis")
       .attr("transform", "translate(" + padding + ",0)")
       .call(yAxis);


    if (parseJSON(dataset.data).k) {
        console.log('trying to plot');

        var yScaleRight = d3.scale.linear()
                             .domain([d3.min(data, function(d) { return d[2];}), d3.max(data, function(d) { return d[2]; })])
                             .range([h-padding, padding]);

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
               return yScaleRight(d[2]);
           })
           .attr("r", 3)
           .style("fill", "red");
           
        svg.append("g")
           .attr("class", "axis")
           .attr("transform", "translate("+ (w-padding) + ",0)")
           .call(yAxisRight);
    }

    
}

