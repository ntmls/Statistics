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
        Math.random() * 100 + 25);
    
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
    let scheduler = ApproximateBayes.createScheduler(99999999, 10, .90);
    let dataLength = imageSamples.length;
    
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
        let sum = 0;
        let countIn = 0;
        let countOut = 0;
        for(let i = 0; i < dataLength; i++) {
            let sample = data.imageSamples[i];
            let isin = isPointInModel(sample.point, model);
            let isBg = isBackGroundColor(bgColor)(sample.color);
            if (isin) {
                if (isBg) {
                    sum = sum + 1;
                } 
                countIn++;
            } else {
                if (!isBg) {
                    sum = sum + 1;
                }
                countOut++;
            }

            // exit early if we can for performance reasons
            if (sum > threshold) { return sum; }
        }
        if (countIn == 0 || countOut == 0) { return 99999999 };
        return sum * sum;
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
    
}

let randomStepByOne = function() {
    let r = Math.random();
    if (r < .333) { return -1; }
    if (r < .666) { return 1; }
    return 0;
};

let randomStepByInteger = function(number) {
    let r = Math.random();
    let n = Math.floor(.5 + Math.random() * (number + .5));
    if (r < .5) {
        return n;
    } else {
        return -n;
    }
};

let proposal = {
    x: Distributions.createTriangle(-60, 0, 60), 
    y: Distributions.createTriangle(-60, 0, 60), 
    radius: Distributions.createTriangle(-15, 0, 15), 
}; 

