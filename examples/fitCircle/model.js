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

// generateModel :: ModelParams -> Model
let generateModel = function(modelParams) {
    return new Circle(
        modelParams.x, 
        modelParams.y, 
        modelParams.radius);
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

let compare = function(data, model) {
    let sum = 0;
    if (data.imageSamples.count === undefined) {
        data.imageSamples.count = data.imageSamples.length;
    }
    let bgColor = new Color(255, 255, 255);
    let countIn = 0;
    let countOut = 0;
    let len = data.imageSamples.count;
    for(let i = 0; i < len; i++) {
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
    }
    if (countIn == 0 || countOut == 0) { return 99999 };
    return sum;
};

let getPriors = function(width, height) {
    return {
        x: Distributions.createUniform(0, width),
        y: Distributions.createUniform(0, height),
        radius: Distributions.createTriangle(0, 50, width)
    };
};

let parametersFromPriors = function(priors) {
    return new ModelParams(
        Math.floor(priors.x.sample()),
        Math.floor(priors.y.sample()),
        Math.floor(priors.radius.sample())
    );
}; 

let priorProbabilityOf = function(priors) {
    return function(parameters) {
        return priors.x.densityAt(parameters.x) * 
            priors.y.densityAt(parameters.y) *
            priors.radius.densityAt(parameters.radius) 
    };
};

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
    radius: Distributions.createTriangle(-60, 0, 60), 
}; 

let getMove = function() {
    return new ModelParams(
        proposal.x.sample(),
        proposal.y.sample(),
        proposal.radius.sample()
    );    
};

let probabilityOfMove = function(move) {
    return proposal.x.densityAt(move.x) * 
        proposal.y.densityAt(move.y) * 
        proposal.radius.densityAt(move.radius);
};

let moveParameters = function(parameter, move) {
    return new ModelParams(
        parameter.x + move.x, 
        parameter.y + move.y,
        parameter.radius + move.radius
    );
};

let subtractParameters = function(a, b) {
    return new ModelParams(
        a.x - b.x, 
        a.y - b.y, 
        a.radius - b.radius
    );
}; 