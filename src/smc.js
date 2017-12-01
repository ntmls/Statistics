let initializeSamples = function(priors, data, count) {
    let samples = [];
    for (let i = 0; i < count; i++) {
        let params = parametersFromPriors(priors);
        let model = generateModel(params);
        let distance = compare(data, model, Number.MAX_VALUE);
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
        let newDistance = compare(data, newModel, threshold);

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
                scheduler.next(threshold, newSamples)); 
        }, 10);    
    }
};

// returns a threshold scheduler
let scheduleThresholdsByPercentage = function(
    maxDistance, 
    minThreshhold, 
    percent) 
{
    return {
        init: maxDistance,
        next: function(threshold, samples) {
            let ds = samples.map(function(x) {
                return x.distance;
            });
            let sorted = ds.sort(function(a,b) {
                return a - b;
            });
            let index = Math.floor(percent * sorted.length);
            return sorted[index];
        },
        stop: function(threshold, samples) {
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
