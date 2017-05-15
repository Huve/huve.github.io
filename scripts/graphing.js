// This file contains graping functions, particularly for d3.
// Alphabetically ordered.


/**
  * A bar object representing a histogram bin.
  * @param {svg} svg The class of this bar to be drawn.
  * @param {int} x The x position of the bar in pixels.
  * @param {int} y The y position in pixels to plot the top of the bar.
  * @param {int} w The width of the bar in pixels.
  * @param {int} h The height of the bar in pixels.
  */   
function bar(c, x, y, w, h, svg){
    /**
      * Draws the bar.
      * @param {string} fill The hexcode or color name  to color the bar.
      */
    this.y = y;
    this.h = h;
    this.draw = function(fill, opacity=1){
        this.bar = svg.append('rect');
        this.bar.attr('x', x)
        .attr('y', y)
        .attr('width', w)
        .attr('height', h)
        .attr('fill', fill)
        .attr('stroke', fill)
        .attr('class', c)
        .style({'opacity': opacity});
    }
    /**
      * Adjust the y value of the bar.
      * @param {numeric} y The new y value of the bar.
      * @param {numeric} h The new required height of the bar.
      */
    this.adjustY = function(y, h){
        this.bar.transition()
        .attr('y', y)
        .attr('height', h); 
    }
    return this;
}

/**
  * Hides a distribution.
  * @param {string} distributionClass The classname of the bars in the distribution.
  * @param {int} graphHeight The height of the graph.
  */
function hideDistribution(distributionClass, graphHeight){
    var allBars = d3.selectAll("." + distributionClass);
    for (b = 0; b < allBars[0].length; b ++){
        var thisBar = d3.select(allBars[0][b]);
        thisBar.transition()
        .attr('y', graphHeight + 1)
        .duration(500);
    }        
}




/** 
  * Creates an svg object to graph on.
  * @param {string} elementId The id of the DOM object to append a graph.
  * @param {int} w The width of the graph.
  * @param {int} h The height of the graph.
  */
function createGraph(elementId, w, h){
    var graph = d3.select("#" + elementId)
        .append('svg')
        .attr('width', w)
        .attr('height', h)
        .attr('id', elementId + 'graph')
        .style('background-color', 'white');
    return graph;
}


/**
  * Bins each datapoint based on a histogram's bin sizes and values.
  *
  * @param {object} histogram The histogram for which binning is to be applied.
  * @param {array} data The data to be binned.
  * @return {array} allBins An array with the frequency (height) of each bin.
  */
function getBins(histogram, data){
    var allBins = new Array(BINS).fill(0);  
    for (var i = 0; i < data.length; i++){
        var bin = Math.floor((data[i] - histogram.minBin) / histogram.binValue);
        allBins[bin] += 1;
    }
    return allBins;  
}

    
/**
  * Creates a histogram of a distribution.
  * @param {svg} svg The svg object to plot the bar on.
  * @param {string} id The id of the histogram.
  * @param {string} fill The color to fill the bars.
  * @param {float} mean The mean of the distribution.
  * @param {float} sd The standard deviation of the distributions.
  * @param {int} numBins The number of bins to be draw in the histogram.
  * @return {object} this The this histogram.
  */
function histogram(svg, id, fill, mean, sd, numBins){
    this.id = id;
    this.fill = fill;
    this.mean = mean;
    this.sd = sd;
    this.binValue = 0; 
    this.bars = [];
    this.heights = [];
    this.data = [];
    this.barWidth = graphDimensions.width / numBins;
    this.binValue = (6 / numBins) * POP_SD; // .000005 * numBins; /*(6 / numBins) * sd;*/
    this.minBin = mean - (numBins / 2) * this.binValue;
    this.numBins = numBins;
    this.hidden=false;
    // Create the data for the histogram.
    this.createData = function(firstDraw, distFunction){
        this.data = [];
        for (var i = 0; i < numBins; i++){
            var iValue = i * this.binValue + this.binValue + this.minBin;
            var x = i * this.barWidth;
            var distValue = distFunction(this.mean, this.sd, iValue);
            this.heights.push(distValue);
            var y = graphDimensions.height - distValue;
            var height = graphDimensions.height - y;
            // Draw the bar if this is the first data creation.
            if  (firstDraw == true){
                var b = new bar("histogram" + this.id, x, y, this.barWidth, height, svg);
                this.bars.push(b);
                b.draw(this.fill); 
            }
            else if (this.hidden == false){
                var b = this.bars[i];
                b.adjustY(y, height);
            }
            if (this.id != "sem"){
                var binData = createDataFromDistribution(distValue, iValue, this.binValue);
                for (n = 0; n < binData.length; n++) {
                    this.data.push(binData[n]);
                }
            }
        }   
    }
    this.updateSd = function(sd, distFunction){
        console.log(typeof(distFunction));
        this.sd = sd;
        this.createData(false, distFunction);
    }
    // add the data to the histogram.
    this.createData(true, calculateNormalDistribution);

    // Verify similar area under curve
    /*var sum = this.heights.reduce((pv, cv) => pv+cv, 0); 
    console.log(sum);*/
    return this;
}

    