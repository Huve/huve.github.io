// Loads the demo
// This file contains UI and functions specific to sampling distribution of the mean.

window.onload=(function(){ 

    /* Initializes the demo */
    function __init__(){
        var parent = document.getElementById("demo-body");
        var parentWidth = parent.clientWidth;
        
        // Initial parameter values.
        // Bins = number of bins
        // Pop mean - population mean, etc
        BINS = 1000;
        POP_MEAN = 100;
        POP_SD = 10;
        DEFAULT_SAMPLE_SIZE = 10; 
        
        // Create the histograms.
        graphDimensions = calculateGraphDimensions(parentWidth);
        POP_SVG = createGraph("pop-graph", graphDimensions.width, graphDimensions.height);
        SDM_SVG = createGraph("sdm-graph", graphDimensions.width, graphDimensions.height);
        POPULATION = new histogram(POP_SVG, id="population", fill="steelblue", mean=POP_MEAN, sd=POP_SD, numBins=BINS);
        SDM = new histogram(SDM_SVG, id="sdm", fill="green", mean=POP_MEAN, sd=POP_SD/Math.sqrt(DEFAULT_SAMPLE_SIZE), numBins=BINS);
		
		// Initialize animation bins for sampling means.
		MODIFIER = 10;
		SAMPLE_MEAN_BINS = initalizeAnimationBins(SDM, MODIFIER);
		SAMPLE_MEAN_MAP = createBinMap(SDM, SAMPLE_MEAN_BINS, MODIFIER);
        
        // Set initial parameter values.
        setSampleSize(DEFAULT_SAMPLE_SIZE);
		
		updatePopText();
		
		drawAxisTicks(POP_SVG, graphDimensions, BINS);
		drawAxisTicks(SDM_SVG, graphDimensions, BINS, true);
    }
    
    /**
      * Updates the population shape based on the population chosen.
      * 
      * @param {string} newPopulation The codename for the new population.
      */
    function changePopulation(newPopulation){
        var sampleSize = getSampleSize();
		var dist = getDistFunction();
        if (newPopulation == "normal"){
			POP_MEAN = 100;
            POP_SD = 10;
            POPULATION.update(POP_MEAN, POP_SD, BINS, dist);
            SDM.update(POP_MEAN, POP_SD/Math.sqrt(sampleSize), BINS, dist);
        }
        else if (newPopulation == "uniform"){
			POP_MEAN = 100;
			POP_SD = 10;
            POPULATION.update(POP_MEAN, POP_SD, BINS, dist);
            lockSDM();
        }
        else if (newPopulation == "normal3"){
			POP_MEAN = 100;
            POP_SD = 2;
            POPULATION.update(POP_MEAN, POP_SD, BINS, dist);
            SDM.update(POP_MEAN, POP_SD/Math.sqrt(sampleSize), BINS, dist);
        }
		else if (newPopulation == "binomial"){
			POP_MEAN = 0.10;
			POP_SD = 0.30;
			lockSDM();
			POPULATION.binomialTransform(POP_MEAN);
		}
		updatePopText();
        //POPULATION.createData(false, dist);
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
        var wRatio = 16;
        var hRatio = 4;
        graphDimensions['width'] = Math.min(width - 200, 800);
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
        var sdText = "Sample SD: " + sampleSD;
        var container = document.getElementById("stats");
       // clearContainer("stats");
       // appendChildElement(meanText, container, "div");
       // appendChildElement(sdText, container, "div");
		updateSampleText(sampleMean, sampleSD);
    }
    
        
        
    /**
      * Draws a data based on frequencies of each value.
      *
      * @param {object} svg The svg object to draw the histogram on.
      * @param {array} sampleBins The frequencies associated with each bin in the histogram.
      * @param {string} color The color to draw the histogram.
      * @return draws the histogram on the svg.
      */
    function drawSampleData(svg, sampleBins, color="#ff8c00"){
      clearFromGraph(".sample");
      var binnedSample = getBins(POPULATION, sampleBins);
      for (var i = 0; i < binnedSample.length; i++){
          var dimensions = getPointDimensions(binnedSample[i], i);
          try{
		    var widthFinal = Math.ceil(graphDimensions.width / SAMPLE_MEAN_BINS.length);
			var xFinal = safeBinLimits(dimensions.x, widthFinal);
            var b = new bar("sample", xFinal, dimensions.y, widthFinal, dimensions.height, svg);
            b.draw(color, opacity=1);
          }
          catch(e){ };
      }
    }
        
	/**
	  * Locks the sample button once the means are stacked too high.
	  *
	  */
	function lockButton(buttonId){
		document.getElementById(buttonId).disabled = true;
	}
	
    /**
	  * Unlocks the sample button once the means are stacked too high.
	  *
	  */
	function unlockButton(buttonId){
		document.getElementById(buttonId).disabled = false;
	}
	
	/**
	  * Checks if the SDM graph needs to be locked.
	  *
	  */
	function checkSDMHeight(vals, max){
		for (var i = 0; i < vals.length; i++){
			if (vals[i] > max){
				lockButton("sample");
			}
			else{
			}
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
        var meanBar = new bar("samplemean", dimensions.x, 0,  dimensions.width, graphDimensions.height, svg);
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
      * Gets the current sample size.
      */
    function getSampleSize(){
        var sampleSize = document.getElementById("samplesize").value;
        return sampleSize;
    }
    
    /**
      * Sets the current sample size to a value.
      *
      * @param {int} sampleSize The size of the sample to be set.
      * @param {boolean} stop Whether or not the slider is stopped.
      */
    function setSampleSize(sampleSize, stop=false){
		resetAll();
        var sampleSizeHolder = document.getElementById("samplesize");
        var distFunction = getDistFunction();
        sampleSizeHolder.value = sampleSize;
        document.getElementById("samplesize").value = sampleSize;
            var newSEM = POP_SD / Math.sqrt(sampleSize);
            SDM.update(POP_MEAN, newSEM, BINS, distFunction);
    }
    
    function getDistFunction(){
        var selectedDistribution = document.getElementById("distributiontype").value;
        if (selectedDistribution == "normal" | selectedDistribution == "normal3"){
            return calculateNormalDistribution;
        }
        else if (selectedDistribution == "uniform"){
            return calculateUniformDistribution;
        }
		else if (selectedDistribution == "binomial"){
			return calculateBinomialDistribution;
		}
    }
    
    // UI
    
	// SAMPLE BUTTON (#sample)
    var sampleButton = document.getElementById("sample");
    sampleButton.onclick = function() {
		//var displayType = document.querySelector('input[name="displaytype"]:checked').value;
		var numSamples = document.querySelector('input[name="samplenumber"]:checked').value;
		var distType = document.getElementById("distributiontype").value;
		var barHeight = 10/parseFloat(numSamples);
		var maxNumBars = graphDimensions.height / barHeight;
		checkSDMHeight(SAMPLE_MEAN_BINS, maxNumBars);
		var n = getSampleSize();   
		if (n > 100 | n < 2){ 
			alert("Please enter an integer between 1 and 101 as a sample size");
			return;
		}
		else if (numSamples == "1"){
			var sampleStats = sampleOnce(n, animate=true, display=true, hAdjust=1, dist=distType);
			displaySampleStats(sampleStats[0], sampleStats[0]);
		}
		else if (numSamples == "25"){
			sampleMany(n, 1000, 5, distType); // 10k, 60
		}
		else{
			console.log("Sample display type is not set or number of samples is out of range");
		}
    };
	
	/**
	  * Sample one time from the population.
	  *
	  */
	function sampleOnce(n, animate=true, display=true, hAdjust=1, dist="other"){
		var sample = sampleData(POPULATION.data, n);
		var sampleMean = roundNumber(calculateAverage(sample), 2);
	
		var sampleSD = roundNumber(calculateStandardDev(sample), 2);
		var binInfo = processAnimatedBin(SAMPLE_MEAN_BINS, SAMPLE_MEAN_MAP, sampleMean, dist);
		var magnitude = Math.floor((binInfo.lower - POPULATION.minBin) / POPULATION.binValue);
		var dimensions = getPointDimensions(1, magnitude);
		if (display == true){
			drawSampleData(POP_SVG, sample);
		}
		if (animate == true & dist != "binomial"){
			animatedMeanBlock(SDM_SVG, 'none', 'red', dimensions, 
				binInfo.val, graphDimensions, SAMPLE_MEAN_BINS.length, hAdjust);
		}
		else if (animate == true & dist == "binomial"){
			animatedMeanBlock(SDM_SVG, 'none', 'red', dimensions, 
				binInfo.val, graphDimensions, SAMPLE_MEAN_BINS.length, hAdjust, 
				binomial=true, binInfo.index);
		}
		return([sampleMean, sampleSD]);
	}
	
	/** Draws many samples at one time
	  *
      * @param {int} the size of each sample.
      * @param {int} the number of samples to draw.
	  */
	function sampleMany(n, r, hAdjust, dist){
		for (var i = 0; i < r; i++){
			sampleOnce(n, true, false, hAdjust, dist);
		}
	}
	
	function resetData(dist=false){
		SAMPLE_MEAN_BINS = initalizeAnimationBins(SDM, MODIFIER);
		if(dist == "binomial"){
			SAMPLE_MEAN_MAP = createBinMap(SDM, SAMPLE_MEAN_BINS, MODIFIER, dist);
		}
		else{
			SAMPLE_MEAN_MAP = createBinMap(SDM, SAMPLE_MEAN_BINS, MODIFIER);
		}
	}
	
	// Reset controls
	function resetControls(){
	}
	
	function resetGraphs(distChange){
		clearFromGraph(".sample");
		clearFromGraph(".animatedMean");
		SDM_SVG.selectAll("text").remove();
		drawAxisTicks(SDM_SVG, graphDimensions, BINS, true, distChange);
		unlockButton("sample");
		updatePopText();
	}
	
	// Reset the entire graph.
	function resetAll(){
		var selectedDistribution = document.getElementById("distributiontype").value;
		resetControls();
		resetData(selectedDistribution);
		resetGraphs(selectedDistribution);
	}


	var resetButton = document.getElementById("reset");
	resetButton.onclick = function(){
		resetAll();
	}
	
	
	/**
	  * Onchange for number of samples, reset the graph.
	  */
	var numSamplesButton = document.getElementsByName('samplenumber');
	for (var i = 0; i < numSamplesButton.length; i++){
		numSamplesButton[i].onchange = function(){
			resetAll();
		}
	}

	
	// SAMPLE SIZE BOX (#samplesize)
	var sampleSizeInput = document.getElementById("samplesize");
	var validateInteger = function(i){
		 return(!isNaN(i) && parseInt(Number(i)) == i && !isNaN(parseInt(i, 10)) &&
		 parseInt(i) > 1 && parseInt(i) < 101);
	}
	sampleSizeInput.addEventListener("keypress", function(e){
		if (e.keyCode == 13){
			var sampleSize = sampleSizeInput.value;
			if (validateInteger(sampleSize)){
				setSampleSize(sampleSize);
			}
			else{
				alert("Please enter an integer between 1 and 101 as a sample size");
			}
		}
	});
	
	sampleSizeInput.onblur = function(){
		var sampleSize = sampleSizeInput.value;
		if (validateInteger(sampleSize)){
			setSampleSize(sampleSize);
		}
		else{
			alert("Please enter an integer between 1 and 101 as a sample size");
		}
	};
	
	/** Updates the population parameter text. **/
	function updatePopText(){
		var selectedDistribution = document.getElementById("distributiontype").value;
		if (selectedDistribution == "uniform"){
			displayText(POP_SVG, "Population parameters: mean = " + POP_MEAN, 20, 30, "steelblue");
		}
		else if (selectedDistribution == "binomial"){
			displayText(POP_SVG, "Population parameters: p = " + POP_MEAN, 20, 30, "steelblue");
		}
		else{
			displayText(POP_SVG, "Population parameters: mean = " + POP_MEAN + " sd = " + POP_SD, 20, 30, "steelblue");
		}
	}
	
		/** Updates the population parameter text. **/
	function updateSampleText(m, sd){
		displayText(SDM_SVG, "Sample statistics: mean = " + m + " sd = " + sd, 20, 30, "#ff8c00");
	}
	
	// DISTRIBUTION OPTIONS
	
	/** Hides or displays the SDM or population.
	  *
	  * @param {boolean} isChecked Whether or not the associated checkbox is checked.
	  * @param {string} distributionName The classname of the distribution bars to be hidden or shown.
	  */
    function changeDistributionDisplay(isChecked, distributionName){
        if (isChecked === true){
            if (distributionName == "histogrampopulation"){
                POPULATION.hidden = false;
                POPULATION.update(POP_MEAN, POP_SD, BINS, getDistFunction());
            }
            else if (distributionName == "histogramsdm"){
                SDM.hidden = false;
                SDM.update(POP_MEAN, POP_SD/Math.sqrt(getSampleSize()), BINS, calculateNormalDistribution);
            }
        }
        else{
            if (distributionName == "histogrampopulation"){
                POPULATION.hidden = true;
            }
            else if (distributionName == "histogramsdm"){
                SDM.hidden = true;
            }
            hideDistribution(distributionName, graphDimensions.height);
        }
    }
		
	// SDM CHECKBOX (#displaysdmdistribution)
	var sdmCheckbox = document.getElementById("displaysdmdistribution");
	sdmCheckbox.addEventListener("change", function(e) {
		var distType = document.getElementById("distributiontype").value;
		if (distType == "uniform" | distType == "binomial"){
			alert("Sorry, this demo can only display the sampling distribution of the mean when the population is normal.");
			if (this.checked){ this.checked = false };
		}
		else{
			changeDistributionDisplay(this.checked, "histogramsdm");
		}
	});
	

	// Change the population when a new option is chosen.
	var popDropDown = document.getElementById("distributiontype");
	popDropDown.onchange = function(){
		resetAll();
		changePopulation(this.value);
	}
	
	// Lock SDM from being turned on
	function lockSDM(){
		var sdmCheckbox = document.getElementById("displaysdmdistribution");
		sdmCheckbox.checked = false;
		changeDistributionDisplay(false, "histogramsdm");
	}
	
    __init__();


});