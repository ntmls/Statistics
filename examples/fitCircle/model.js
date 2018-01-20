function Point(x, y) {
    this.x = x;
    this.y = y;
};

// constructs a circle
function Circle(x, y, radius) {
    this.x = x;
    this.y = y;
    this.radius = radius;
}

function Color(red, green, blue) {
    this.red = red;
    this.green = green;
    this.blue = blue; 
};

function ModelParams(x, y, radius) {
    this.x = x;
    this.y = y;
    this.radius = radius;
}

// determines whether a point is whithin a circle
var isPointInModel = function(point, model) {
    var dx = point.x - model.x;
    var dy = point.y - model.y;
    var dist = Math.sqrt(dx * dx + dy * dy);
    if (dist < model.radius) {
        return true;
    } else {
        return false;
    }
};

let colorDistanceSquared = function(a, b) {
    let dr = a.red - b.red; 
    let dg = a.green - b.green;
    let db = a.blue - b.blue; 
    return (dr*dr + dg*dg + db*db) / 195075; 
};

let isBackGroundColor = function(bgColor) {
    return function(color) {
        let dist = colorDistanceSquared(bgColor, color);
        return (dist < .006);
    };
};

function FitCircleConfig() {
    
    let imageWidth = 640,
        imageHeight = 480;
    let target = new Circle(
        Math.random() * imageWidth,
        Math.random() * imageHeight, 
        Math.random() * 200 + 25);
    
    let bgColor = new Color(255, 255, 255);
    
    // samples the pixels whithin an image.
    let createTargetImage = function(width, height, target) {
        var points = poisson2d.create(width, height, 7, 60);
        var count = points.length;
        var result = [];
        for(var i = 0; i < count; i++) {
            let point = points[i];
            var color;
            if (isPointInModel(point, target)) {
                color = new Color(0, 0, 0);
            } else {
                color = bgColor;
            }
            result.push({
                point: point,
                color: color
            });
        }
        return result;
    };
    
    let imageSamples = createTargetImage(
        imageWidth, 
        imageHeight, 
        target);
    let data = {
        target: target,
        imageSamples: imageSamples
    };
    let scheduler = ApproximateBayes.createScheduler(99999999, 10, .75);
    let dataLength = imageSamples.length;
    let bgCount = 0, nonBgCount = 0;
    for (let i = 0; i < dataLength; i++) {
        if (isBackGroundColor(bgColor)(imageSamples[i].color)) {
            bgCount += 1;
        } else {
            nonBgCount += 1;
        }
    }
    
    this.getData = function() {
        return data;  
    };
    
    this.getScheduler = function() {
        return scheduler;
    };
    
    this.generateModel = function(modelParams) {
        return new Circle(
            modelParams.x, 
            modelParams.y, 
            modelParams.radius);
    };
    
    this.compare = function(model, threshold) {
        let inAndBg = 0,
            inAndNotBg = 0,
            outAndBg = 0,
            outAndNotBg = 0;
        for(let i = 0; i < dataLength; i++) {
            let sample = data.imageSamples[i];
            let isin = isPointInModel(sample.point, model);
            let isBg = isBackGroundColor(bgColor)(sample.color);
            if (isin) {
                if (isBg) {
                    inAndBg += 1;
                } else {
                    inAndNotBg += 1;
                }
            } else {
                if (isBg) {
                    outAndBg += 1;
                } else {
                    outAndNotBg += 1;
                }
            }
        }
        let inCount = inAndBg + inAndNotBg;
        let outCount = outAndBg + outAndNotBg;
        let e1 = inCount - nonBgCount;
        let e2 = outCount - bgCount;
        let e3 = inAndBg;
        let e4 = outAndNotBg;
        return e1 * e1 + e2 * e2 + e3 * e3 + e4 * e4;
    };

    this.getPriors = function() {
        return {
            x: Distributions.createUniform(0, imageWidth),
            y: Distributions.createUniform(0, imageHeight),
            radius: Distributions.createTriangle(5, 50, imageWidth)
        };
    };

    this.generateParameters = function(priors) {
        return new ModelParams(
            Math.floor(priors.x.sample()),
            Math.floor(priors.y.sample()),
            Math.floor(priors.radius.sample())
        );
    }; 

    this.priorProbabilityOf = function(priors, parameters) {
        return priors.x.densityAt(parameters.x) * 
            priors.y.densityAt(parameters.y) *
            priors.radius.densityAt(parameters.radius) 
    };
    
    this.getMove = function() {
        return new ModelParams(
            proposal.x.sample(),
            proposal.y.sample(),
            proposal.radius.sample()
        );    
    };

    this.probabilityOfMove = function(move) {
        return proposal.x.densityAt(move.x) * 
            proposal.y.densityAt(move.y) * 
            proposal.radius.densityAt(move.radius);
    };

    this.moveParameters = function(parameter, move) {
        return new ModelParams(
            parameter.x + move.x, 
            parameter.y + move.y,
            parameter.radius + move.radius
        );
    };

    this.subtractParameters = function(a, b) {
        return new ModelParams(
            a.x - b.x, 
            a.y - b.y, 
            a.radius - b.radius
        );
    }; 
    
    let createProposalDistribution = function(values, cap) {
        let valueMin = values.reduce(min, values[0]);
        let valueMax = values.reduce(max, values[0]);
        let stdv = Math.min((valueMax - valueMin) * .5, cap);
        return Distributions.createNormal(0, stdv);
    };
    
    this.next = function(particles) {
        let xs = particles.map(function(p) { return p.parameters.x; });
        let ys = particles.map(function(p) { return p.parameters.y; });
        let rs = particles.map(function(p) { return p.parameters.radius; });
        
        proposal = {
            x: createProposalDistribution(xs, 45), 
            y: createProposalDistribution(ys, 45), 
            radius: createProposalDistribution(rs, 15) 
        };
        
    }; 
    
}

let proposal = {
    x: Distributions.createNormal(0, 45), 
    y: Distributions.createNormal(0, 45),
    radius: Distributions.createNormal(0, 5)
};