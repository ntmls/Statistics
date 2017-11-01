// getImageData = string -> ImageData 
let getImageData = function(image) {
    let canvas = document.createElement("Canvas");
    canvas.width = image.width;
    canvas.height = image.height; 
    let ctx = canvas.getContext('2d');
    ctx.drawImage(image, 0, 0);
    return ctx.getImageData(0, 0, image.width, image.height); 
}; 
            
let getPixel = function(imageData) {
    let scanWidth = imageData.width * 4;
    return function(point) {
        let index = point.y * scanWidth + point.x * 4;
        return new Color(
            imageData.data[index], 
            imageData.data[index+1], 
            imageData.data[index+2], 
        );
    };
};

// samples the pixels whithin an image.
var sampleImage = function(imageData, count) {
    var xs = Distributions.createUniform(0, imageData.width - 1);
    var ys = Distributions.createUniform(0, imageData.height - 1);
    var result = [];
    for(var i = 0; i < count; i++) {
        let x = Math.floor(xs.sample());
        let y = Math.floor(ys.sample());
        let point = new Point(x, y);
        result.push({
            "point": point,
            "color": getPixel(imageData)(point)
        });
    }
    return result;
};

let initializeSamples = function(priors, imageSamples, count) {
    let samples = [];
    for (let i = 0; i < count; i++) {
        let params = parametersFromPriors(priors);
        let model = generateModel(params);
        let distance = compare(imageSamples, model);
        let sample = {
            parameters: params,
            model: model,
            distance: distance,
            weight: 1.0
        };
        samples.push(sample);
    }
    return samples;
};

/*
let scheduleThresholds = function(maxDistance, intervals) {
    let schedule = List.create();
    for(let i = 0; i <= intervals; i++) {
        schedule = schedule.prepend((maxDistance / intervals) * i);
    }
    return schedule;
};
*/

// returns a threshold scheduler
let scheduleThresholdsByPercentage = function(maxDistance, minDistance, percent) {
    return {
        init: maxDistance,
        next: function(threshold, max) {
           return Math.min(threshold * percent, max);
        },
        stop: function(threshold, max) {
            if (threshold < minDistance) { 
                return true;
            }
            return false;
        }
    }; 
};

let probabilityOfSample = function(oldSamples, parameters) {
    let totalProb = 0; 
    for (let i = 0; i < oldSamples.length; i++) {
        let oldSample = oldSamples[i];
        let move = subtractParameters(parameters, oldSample.parameters);
        let prob = oldSample.weight * probabilityOfMove(move);
        totalProb = totalProb + prob;
    }
    if (isNaN(totalProb)) throw 'Invalid Probablity';
    return totalProb;
};
