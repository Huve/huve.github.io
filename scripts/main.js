// Loads the demo
// This file contains UI and functions specific to sampling distribution of the mean.

window.onload=(function(){ 
    /**
      * Initializes the demo
      */
    function __init__(){
        // Initial parameter values.
        BINS = 1000;
        POP_MEAN = 100;
        POP_SD = 10;
        DEFAULT_SAMPLE_SIZE = 25; 
        
        // Set initial parameter values.
        document.getElementById("samplesize").value = DEFAULT_SAMPLE_SIZE;
        
        // Create the histograms.
        graphDimensions = calculateGraphDimensions(window.innerWidth);
        svg = createGraph("graph", graphDimensions.width, graphDimensions.height);
        POPULATION = new histogram(svg, id="population", fill="steelblue", mean=POP_MEAN, sd=POP_SD, numBins=BINS);
        SDM = new histogram(svg, id="sem", fill="green", mean=POP_MEAN, sd=POP_SD/Math.sqrt(DEFAULT_SAMPLE_SIZE), numBins=BINS);
        
        // Draw a sample when the sample button is clicked
        document.getElementById('sample').onclick = function() {
           n = document.getElementById("samplesize").value;            
           var sample = sampleData(POPULATION.data, n);
           var sampleMean = roundNumber(calculateAverage(sample), 2);
           var sampleSD = roundNumber(calculateStandardDev(sample), 2);
           drawSampleData(svg, sample); 
           drawSampleMean(svg, sampleMean);
           displaySampleStats(sampleMean, sampleSD);

        }
        
        var sampleBox = document.getElementById("samplesize");
        sampleBox.addEventListener("keyup", keyHandler, false);
      
        // Change the population when a new option is chosen.
        var popDropDown = document.getElementById("distributiontype");
        popDropDown.onchange = function(){
            changePopulation(this.value);
        }
    }
    
    /**
      * Updates the population shape based on the population chosen.
      * 
      * @param {string} newPopulation The codename for the new population.
      */
    function changePopulation(newPopulation){
        var sampleSize = document.getElementById("samplesize").value;
        if (newPopulation == "normal"){
            POP_SD = 10;
            POPULATION.updateSd(POP_SD);
            SDM.updateSd(POP_SD/Math.sqrt(sampleSize));
        }
        else if (newPopulation == "normal2"){
            POP_SD = 5;
            POPULATION.updateSd(POP_SD);
            SDM.updateSd(POP_SD/Math.sqrt(sampleSize));
        }
        else if (newPopulation == "normal3"){
            POP_SD = 2;
            POPULATION.updateSd(POP_SD);
            SDM.updateSd(POP_SD/Math.sqrt(sampleSize));
        }
        POPULATION.createData();
    }
    
    /**
      * Appends a child element to a parent.
      *
      * @param {string} child The content to be added in between the tags.
      * @param {DOM Object} parent The element in the DOM to which the child is to be added.
      * @param {string} tag The tag that will wrap the content.
      */
    function appendChildElement(child, parent, tag){
        var node = document.createElement(tag);
        var text = document.createTextNode(child);
        node.appendChild(text);
        parent.appendChild(node);
    }
    
    
    /**
      * Calculates the dimensions of the graph based on the window size.
      * @param {int} width The width of the window.
      * @return {array} graphDimensions - [x, y] dimensions of the graph. 
      */
    function calculateGraphDimensions(width){
        var graphDimensions = {};
        var wRatio = 1600;
        var hRatio = 900;
        graphDimensions['width'] = Math.min(width - 200, 1200);
        graphDimensions['height'] = Math.min((graphDimensions.width * hRatio) / wRatio, 450);
        return graphDimensions;
    }
    

    /**
      * Removes all children from a container.
      *
      * @param {string} container The id of the container.
      */
    function clearContainer(container){
       var parent = document.getElementById(container);
       while(parent.firstChild){
           parent.removeChild(parent.firstChild);
       }
    }
    
    
    /**
      * Dislpays statistics of the sample.
      * 
      * @param {float} sampleMean The mean of the sample.
      * @param {float} sampleSD The standard deviation of the sample.
      */
    function displaySampleStats(sampleMean, sampleSD){
        var meanText = "Sample mean: " +  sampleMean;
        var sdText = "Sample sd: " + sampleSD;
        var container = document.getElementById("stats");
        clearContainer("stats");
        appendChildElement(meanText, container, "div");
        appendChildElement(sdText, container, "div");
    }
        
        
    /**
      * Draws a data based on frequencies of each value.
      *
      * @param {object} svg The svg object to draw the histogram on.
      * @param {array} sampleBins The frequencies associated with each bin in the histogram.
      * @param {string} color The color to draw the histogram.
      * @return draws the histogram on the svg.
      */
    function drawSampleData(svg, sampleBins, color="orange"){
      clearFromGraph(".sample");
      var binnedSample = getBins(POPULATION, sampleBins);
      for (var i = 0; i < binnedSample.length; i++){
          var dimensions = getPointDimensions(binnedSample[i], i);
          try{
            var b = new bar("sample", dimensions.x, dimensions.y, dimensions.width, dimensions.height, svg);
            b.draw(color, opacity=1);
          }
          catch(e){ };
      }
    }
        
            
    /**
      * Draws the sample mean on the graph.
      *
      * @param {float} mean The sample mean.
      * @param {SVG Object} svg The graph object on which to draw the mean.
      */
    function drawSampleMean(svg, mean){
        clearFromGraph(".samplemean");
        var magnitude = Math.floor((mean - POPULATION.minBin) / POPULATION.binValue);
        var dimensions = getPointDimensions(1, magnitude);
        var meanBar = new bar("samplemean", dimensions.x, dimensions.y, dimensions.width, dimensions.height, svg);
        meanBar.draw("red", opacity=1);    
    }
        
        
    /**
      * Gets the dimensions of a sampled point in the graph.
      *
      * @param {integer} magnitude The number of times this point occurs.
      * @param {integer} pixels The pixel position of the point.
      * @return {object} dimensions of the point {x:int, y:int, height:int, width:int}
      */
    function getPointDimensions(magnitude, pixels){
        var dimensions = {
            x: 0,
            y: 0,
            height: 0,
            width: graphDimensions['width'] / BINS
        }
        dimensions.x = pixels * dimensions.width;
        dimensions.y = graphDimensions['height'] - magnitude * 10;
        dimensions.height = graphDimensions['height'] - dimensions.y
        return dimensions;
    }
    
    
    /**
      * Clears all elements of a specific identifer from the graph.
      * 
      * @param {string} identifier The class, id, or SVG type of the element.
      */
    function clearFromGraph(identifier){
        var selection = d3.selectAll(identifier).remove();
    }
   
   
    /**
      * Handles key events.
      * @param {event} e The event object.
      */
    function keyHandler(e){
        if (document.activeElement.id == "samplesize"){
            var sampleSize = document.getElementById("samplesize").value;
            var newSEM = POP_SD / Math.sqrt(sampleSize);
            SDM.updateSd(newSEM);
        }
    }

    
    __init__();
    
});