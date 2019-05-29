// This file contains graping functions, particularly for d3.
// Alphabetically ordered.
// WORK IN PROGRESS


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

/** Displays text on a graph */
function displayText(g, t, x, y){
	g.selectAll("text").remove()
	g.append("text")
    .attr("x", x)
    .attr("y", y)
    .text(function(d) { return t });
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
  * Computes the numerical bin width for a histogram.
  *
  * @param {integer} numBins The number of bins in a histogram.
  * @param {numeric} sd The standard deviation of the distribution.
  * @param {integer} numSds The number of sds the histogram should represent.
  * @return {numeric} The numerical width of each bin in a histogram.
  */
function computeBinWidth(numBins, sd, numSds){
	var binVal = (numSds / numBins) * sd;
	return (binVal);
}

/** 
  * Computes the minimum bin value for a histogram.
  *
  * @param {integer} numBins The number of bins in a histogram.
  * @param {numeric} The mean of the distribution.
  * @param {numeric} The width of the bins in the histogram.
  * @return {numeric} The lowest value in the histogram.
  */
function computeMinBin(numBins, mean, binWidth){
    var minBin = mean - (numBins / 2) * binWidth;
	return(minBin);
}


/**
  * Maps bin lower and upper values to a bin index.
  *
  * @param {histogram} The histogram to be binned.
  * @param {array} Array of bins to be mapped to.
  * @return {array} Two-dimensional array of lower and upper values.
  */
function createBinMap(histogram, animatedBins, modifier=1){
	var binMap = new Array(animatedBins.length).fill(0);
	for (var i = 0; i < animatedBins.length; i++){
		var map = []
		var minVal = histogram.minBin + (i * histogram.binValue * modifier);
		var maxVal = minVal + (histogram.binValue * modifier);
		map[0] = minVal;
		map[1] = maxVal;
		binMap[i] = map;
	}
	return(binMap);
}


/** 
  * Initalizes animation bins based on histogram bins.
  *
  * @param {object} histogram The histogram with which the bins will be used.
  * @return {array} animationBins an array of 0 of size based on number of bins in histogram.
  */
function initalizeAnimationBins(histogram, modifier=1){
	var animationBins = new Array(histogram.numBins / modifier).fill(0);
	return(animationBins);
}


/**
  * Puts a point in its bin
  * TODO
  */
function processAnimatedBin(bins, map, value){
	var binInfo = {
            index: null,
            lower: null,
            val: value
    }
	for (var i = 0; i < bins.length; i++){
		var lower = map[i][0];
		var upper = map[i][1];
		if (lower > value || upper < value){
			// do nothing because out of bin range.
		}
		else if (lower < value && upper > value){
			bins[i] = bins[i] + 1;
			binInfo.index = i;
			binInfo.val = bins[i];
			binInfo.lower = map[i][0];
			return(binInfo);
		}
		else if (Math.abs(value - upper) < .01){
			// skip this and default to lower bin val next iteration
		}
		else if (Math.abs(value - lower) < .01){
			bins[i] = bins[i] + 1;
			binInfo.index = i;
			binInfo.val = bins[i];
			binInfo.lower = map[i][0];
			return(binInfo);
		}
		else{
			// this is an error
			console.log("Binning error for: " + value);
			return(null);
		}
	}
}

/** Safely determines bin limits as multiple of bin pixel width.
  */
function safeBinLimits(val, binWidth){
	var remainder = val % binWidth;
	var safeBin = val - remainder;
	return(safeBin);
}

/**
  * Animated mean bar
  */
function animatedMeanBlock(svg, id, fill, dims, thisBin, graphDims, total_bins){
	var barHeight = 10;
	var yfinal = graphDims.height - (thisBin - 1) * barHeight;
	var widthFinal = graphDims.width / total_bins;
	var xFinal = safeBinLimits(dims.x, widthFinal);
	console.log(xFinal, widthFinal, xFinal % widthFinal);
	var meanBlock = svg.append('rect')
	.attr('x', Math.round(dims.x))
	.attr('y', 0)
	.attr('fill', fill)
	.attr('width', widthFinal + 1)
	.attr('height', barHeight)
	.attr('class', 'animatedMean')
	.attr('id', id + 'meanBlock');
	
	meanBlock.transition()
	.attr('y', yfinal-10);
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
    /* histogram for graphs on the WISE site */
    /* TODO (finish doc) */
    this.id = id;
    this.fill = fill;
    this.mean = mean;
    this.sd = sd;
	this.text = mean + " " + sd
    this.binValue = 0; 
    this.bars = [];
    this.heights = [];
    this.data = [];
    this.barWidth = graphDimensions.width / numBins;
	this.binValue = computeBinWidth(numBins, POP_SD, 6);
	this.minBin = computeMinBin(numBins, mean, this.binValue);
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

    