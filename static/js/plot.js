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

function plot () {

    var w = 500,
        h = 250;


    var dataset = transpose (libpage);
    console.log(dataset)

    var svg=d3.select("#lib-page-chart")
              .append("svg:svg")
              .attr("width", w)
              .attr("height", h);

    var xScale = d3.scale.linear()
                         .domain([d3.min(dataset, function(d) { return d[0]; }), d3.max(dataset, function(d) { return d[0]; })])
                         .range([0, w]);

    var yScale = d3.scale.linear()
                         .domain([d3.min(dataset, function(d) { return d[1];}), d3.max(dataset, function(d) { return d[1]; })])
                         .range([h, 0]);
    
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
       
    
    console.log('hello plot');
}
