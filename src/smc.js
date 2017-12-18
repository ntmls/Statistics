(function(exports) {
    
    function SMC(config) {
        
        var data = config.data; 
        var particleCount = config.particleCount;
        var priors = config.priors;
        var oldParticles;
        var scheduler = config.scheduler;
        var threshold = scheduler.init;
        
        this.initializeSamples = function() {
            let samples = [];
            for (let i = 0; i < particleCount; i++) {
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
            oldParticles = _normalizeWeights(samples);
        };
        
        this.getParticles = function() {
            return oldParticles;  
        };

        let sampleFromWeighted = function(particles) {
            let r = Math.random();
            let sum = 0;
            //let count = samples.length;
            for (let i = 0; i < particleCount; i++) {
                sum = sum + particles[i].weight;
                if (r <= sum) {
                    return particles[i];
                }
            }
            return particles[particleCount - 1];
        };

        let sortByWeight = function(particles) {
            let sorted = particles.sort(function(a, b) {
                return b.weight - a.weight;
            });
            return sorted;
        }; 

        function _normalizeWeights(particles) {
            let weights = particles.map(function(x) { 
                return x.weight; 
            });  
            let sum = weights.reduce(add, 0);
            return particles.map(function(x) {
                return {
                    parameters: x.parameters, 
                    model: x.model,
                    distance: x.distance,
                    weight: x.weight / sum
                };
            });
        };
        
        this.normalizeWeights = _normalizeWeights;
        
        function _next() {
            let newParticles = [];
            let i = 0;
            let rejectCount = 0;
            let maxDist = 0;
            while (i < particleCount) {
                let oldParticle = sampleFromWeighted(oldParticles);
                let move = getMove(oldParticle.parameters);
                let newParams = moveParameters(oldParticle.parameters, move);
                let priorProb = priorProbabilityOf(priors)(newParams);
                let importanceProb = probabilityOfSample(oldParticles, newParams);
                let newModel = generateModel(newParams);
                let newDistance = compare(data, newModel, threshold);

                if (newDistance <= threshold &&
                    priorProb > 0 &&
                    importanceProb > 0) 
                {
                    let newWeight = priorProb / importanceProb; 
                    let newParticle = {
                        parameters: newParams,
                        model: newModel,
                        distance: newDistance,
                        weight: newWeight
                    };
                    newParticles.push(newParticle);
                    i = i + 1;
                } else {
                    rejectCount = rejectCount + 1;
                    if (rejectCount > 5000) {
                        throw "stuck";
                    }
                }
            }
            
            if (!scheduler.stop(threshold)) {
                oldParticles = sortByWeight(_normalizeWeights(newParticles));
                threshold = scheduler.next(threshold, newParticles); 
                return true;
            } else {
                return false; 
            };
        }
        
        this.next = _next;

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
    }
    
    function SmcConfig(
        data, 
        particleCount, 
        priors, 
        scheduler) 
    {
        this.data = data;
        this.particleCount = particleCount;
        this.priors = priors;
        this.scheduler = scheduler;
    }
    
    // returns a threshold scheduler
    let createScheduler = function(
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

    
    let createSmc = function(config) {
        return new SMC(config);
    };
    
    let createSmcConfig = function(
        data, 
        particleCount, 
        priors, 
        scheduler) 
    {
        return new SmcConfig(
            data, 
            particleCount, 
            priors, 
            scheduler
        );        
    };
    
    exports.ApproximateBayes =  {
        createScheduler: createScheduler,
        createSmcConfig: createSmcConfig, 
        createSmc: createSmc
    };
    
})(typeof exports === 'undefined' ? this : exports ); 


