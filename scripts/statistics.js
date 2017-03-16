// This file contains data and statistics functions.
// Alphabetically ordered.


 /**
  * Calculates the average of an array of values.
  *
  * @param {array} data The data to calculate the average from.
  * @return {float} avg The average of the array.
  */
function calculateAverage(data){
    var sum = 0;
    for (var i = 0; i < data.length; i++){
        sum += data[i];
    }
    var avg = sum / data.length;
    return(avg);
}
  
    
/**
  * Calculates the standard deviation of an array of data.
  *
  * @param {array} data The data.
  * @return {float} sd The standard deviation of the data.
  */
function calculateStandardDev(data){
    var mean = calculateAverage(data);
    var n = data.length;
    var sum = 0;
    for (i = 0; i < data.length; i++){
        var x = data[i] - mean;
        var xs = x * x;
        sum += xs
    }
    var sd = Math.sqrt((sum / n));
    sd = +(Math.round(sd + "e+2") + "e-2");
    return sd;
}


/**
  * Samples uniformly from the bin to create real data.
  * 
  * Should not be used with large bin sizes, as will not technically be normal.
  * 
  * @param {int} n The frequency of values in the bin; the number of cases to be drawn.
  * @param {float} minBinValue The minimum numeric value of the bin.
  * @param {float} binSize The width of the bin.
  * @return {array} data A uniformly sampled random set of data from the bin.
  */
function createDataFromDistribution(n, minBinValue, binSize){
    var data = [];
    if (n < .5) { return data; }
    else if (n < 1){
        var n = 1;
    }
    for(var s = 0; s < n; s++){
        data.push(Math.random() * binSize + minBinValue);
    }
    return data; 
}
   
   
/**
  * Calculates the y values of the probability density function.
  * @param {float} mean The mean of the distribution.
  * @param {float} sd The standard deviation of the distribution.
  * @param {float} iValue The (nth) value position value associated with the bar.
  * @return {float} height The y value of the given x for the normal PDF.
  */
function calculateNormalDistribution(mean, sd, iValue){
    var diff = iValue - mean;
    var numerator = Math.pow(diff, 2);
    var denominator = 2 * (Math.pow(sd, 2));
    var exponent = -(numerator/denominator);
    var eterm = Math.pow(Math.E, exponent);
    var fraction = 1 / ((Math.sqrt(2 * 3.14 * Math.pow(sd, 2))));
    var height = fraction * eterm * (window.innerHeight);
    return height;
}
    
     
/**
  * Samples data randomly from an array.
  *
  * @param {array} data The data to be sampled from.
  * @param {int} n The size of the desired sample.
  * @return {array} sample An array of the sampled data.
  */
function sampleData(data, n){
      var sample = [];
      for (var i = 0; i < n; i++){
        var r = Math.round(Math.random() * (data.length-1));
        var choice = data[r];
        sample.push(choice);
      }
      return sample;
}


    
/**
  * Rounds a number to a certain number of decimal places.
  *
  * @param {numeric} number The number to be rounded.
  * @param {integer} places The number of decimal places to be rounded to.
  * @return {numeric} roundedNumber The original number rounded to the number of places.
  */
function roundNumber(number, places){
    var roundedNumber = Math.round(number * Math.pow(10, places)) / Math.pow(10, places);
    return roundedNumber;
}
