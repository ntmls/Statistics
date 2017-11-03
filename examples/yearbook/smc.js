let initializeSamples = function(priors, data, count) {
    let samples = [];
    for (let i = 0; i < count; i++) {
        let params = parametersFromPriors(priors);
        let model = generateModel(params);
        let distance = compare(data, model);
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
