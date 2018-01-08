(function(exports) {
    
    function SMC(config) {
        
        var data = config.getData(); 
        var priors = config.getPriors();
        var scheduler = config.getScheduler();
        var threshold = scheduler.init;
        var oldParticles;
        var particleCount = 0;
        
        this.initializeParticles = function(_particleCount) {
            particleCount = _particleCount;
            let particles = [];
            for (let i = 0; i < particleCount; i++) {
                let params = config.generateParameters(priors);
                let model = config.generateModel(params);
                let distance = config.compare(model, Number.MAX_VALUE);
                let particle = {
                    parameters: params,
                    model: model,
                    distance: distance,
                    weight: 1.0
                };
                particles.push(particle);
            }
            oldParticles = _normalizeWeights(particles);
        };
        
        this.getParticles = function() {
            return oldParticles;  
        };
        
        let add = function(a,b) {
            return a+b;  
        };
        
        let divBy = function(denom) {
            return function(numer) {
                return numer / denom;
            };
        };
        
        let multBy = function(a) {
            return function(b) {
                return a*b;
            };
        };
        
        let probabilityOfParticle = function(particles, parameters) {
            
            // calculate all the probabilities of moving to these parameters
            // ftom the previous distribution of particles;
            let probs = particles.map(function(particle) {
                let move = config.subtractParameters(parameters, particle.parameters);
                return config.probabilityOfMove(move);
            });
            
            // normalize those probabilities
            let totalProb = probs.reduce(add, 0);
            probs = probs.map(divBy(totalProb));
            
            // include the probability of picking the particle from tge previous
            // set of particles. Aggregate the probabilities.
            var result = 0;            
            for (let i = 0; i < particleCount; i++) {
                let particle = particles[i];
                result = result + particle.weight * probs[i];
            }
            if (isNaN(totalProb)) throw 'Invalid Probablity';
            return result;
        };

        let sampleFromWeighted = function(particles) {
            let r = Math.random();
            let sum = 0;
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
                let move = config.getMove(oldParticle.parameters);
                let newParams = config.moveParameters(oldParticle.parameters, move);
                let priorProb = config.priorProbabilityOf(priors, newParams);
                if (priorProb > 0) {
                    let newModel = config.generateModel(newParams);
                    let importanceProb = probabilityOfParticle(oldParticles, newParams);
                    let newDistance = config.compare(newModel, threshold);

                    if (newDistance <= threshold && importanceProb > 0) {
                        let newWeight = priorProb / importanceProb; 
                        let newParticle = {
                            parameters: newParams,
                            model: newModel,
                            distance: newDistance,
                            weight: newWeight
                        };
                        newParticles.push(newParticle);
                        i = i + 1;
                        rejectCount = 0;
                    } else {
                        rejectCount = rejectCount + 1;
                        if (rejectCount > 1000) {
                            throw "stuck";
                        }
                    }
                } else {
                    rejectCount = rejectCount + 1;
                    if (rejectCount > 1000) {
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
    
    exports.ApproximateBayes =  {
        createScheduler: createScheduler,
        createSmc: createSmc
    };
    
})(typeof exports === 'undefined' ? this : exports); 