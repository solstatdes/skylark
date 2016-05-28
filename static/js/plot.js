// TRANSPOSE DATA FROM ROWS TO COLUMNS -- NEEDED FOR PLOTTING VIA D3.JS

function transpose (data) {
    array = [parseJSON(data.data).x, parseJSON(data.data).n]
    var data_transposed = array[0].map(function(col, i) {
        return array.map(function(row) {
            return row[i]
        })
    });
    return data_transposed
}

// PLOT LIBPAGE DATA
function plot () {
    $('#lib-page-chart').empty();

    var w = 500,
        h = 250;

    w = $('#lib-page-chart').width();
    h = (0.75*w);

    var padding = 20;


    var dataset = transpose (libpage);
    console.log(dataset)

    var svg=d3.select("#lib-page-chart")
              .append("svg:svg")
              .attr("width", w)
              .attr("height", h);

    var xScale = d3.scale.linear()
                         .domain([d3.min(dataset, function(d) { return d[0]; }), d3.max(dataset, function(d) { return d[0]; })])
                         .range([padding, w-padding]);

    var yScale = d3.scale.linear()
                         .domain([d3.min(dataset, function(d) { return d[1];}), d3.max(dataset, function(d) { return d[1]; })])
                         .range([h-padding, padding]);

    var xAxis = d3.svg.axis()
                      .scale(xScale)
                      .orient("bottom");


    var yAxis = d3.svg.axis();
    
    svg.selectAll("circle")
       .data(dataset)
       .enter()
       .append("circle")
       .attr("cx", function(d) {
           return xScale(d[0]);
       })
       .attr("cy", function(d) {
           return yScale(d[1]);
       })
       .attr("r", 2);
       
    svg.append("g")
       .attr("class", "axis")
       .attr("transform", "translate(0," + (h-padding) + ")")
       .call(xAxis);
    
}

