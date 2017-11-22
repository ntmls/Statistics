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

let sampleFromWeighted = function(samples) {
    let r = Math.random();
    let sum = 0;
    let count = samples.length;
    for (let i = 0; i < count; i++) {
        sum = sum + samples[i].weight;
        if (r <= sum) {
            return samples[i];
        }
    }
    return samples[count - 1];
};

let sortByWeight = function(samples) {
    let sorted = samples.sort(function(a, b) {
        return b.weight - a.weight;
    });
    return sorted;
}; 

let normalizeWeights = function(samples) {
    let weights = samples.map(function(x) { 
        return x.weight; 
    });  
    let sum = weights.reduce(add, 0);
    return samples.map(function(x) {
        return {
            parameters: x.parameters, 
            model: x.model,
            distance: x.distance,
            weight: x.weight / sum
        };
    });
};

let resample = function(
    oldSamples, count, priors, data, scheduler, threshold) {

    let newSamples = [];
    let i = 0;
    let rejectCount = 0;
    let maxDist = 0;
    while (i < count) {
        let oldSample = sampleFromWeighted(oldSamples);
        let move = getMove(oldSample.parameters);
        let newParams = moveParameters(oldSample.parameters, move);
        let priorProb = priorProbabilityOf(priors)(newParams);
        let importanceProb = probabilityOfSample(oldSamples, newParams);
        let newModel = generateModel(newParams);
        let newDistance = compare(data, newModel);

        if (newDistance <= threshold &&
            priorProb > 0 &&
            importanceProb > 0) 
        {
            let newWeight = priorProb / importanceProb; 
            let newSample = {
                parameters: newParams,
                model: newModel,
                distance: newDistance,
                weight: newWeight
            };
            newSamples.push(newSample);
            i = i + 1;

            // keep track of the maximum distance so we can take a shortcut
            // and jump to it if it is lower than the next scheduled distance       
            maxDist = Math.max(newDistance, maxDist);

        } else {
            rejectCount = rejectCount + 1;
            if (rejectCount > 5000) {
                throw "stuck";
            }
        }
    }
    render(data, newSamples);
    if (!scheduler.stop(threshold)) {
        setTimeout(function() {
            resample(
                sortByWeight(normalizeWeights(newSamples)), 
                count, 
                priors, 
                data,
                scheduler, 
                scheduler.next(threshold, maxDist)); 
        }, 10);    
    }
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
