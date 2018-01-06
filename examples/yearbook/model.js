function Point(x, y) {
    this.x = x;
    this.y = y;
};

// shiftPointLeft :: number -> Point -> Point
let shiftPointRight = function(x) {
    return function(point) {
        return new Point(
            point.x + x, 
            point.y);     
    };
};

// shiftPointDown :: number -> Point -> Point
var shiftPointDown = function(y) {
    return function(point) {
        return new Point(
            point.x, 
            point.y + y);     
    };
};

// numberToPoint :: number -> point
var numberToPoint = function(x) {
    return new Point(x, 0);  
}; 

// A rectangle is just a point with a width and a height. 
function Rect(point, width, height) {
    this.point = point;
    this.width = width; 
    this.height = height;
}

// translateRect :: (Point -> Point) -> Rect -> Rect
let translateRect = function(f) {
    return function(rect) {
        return new Rect(
            f(rect.point), 
            rect.width,
            rect.height
        );  
    };
};

// pointToRect :: Point -> Rect
let pointToRect = function(point) {
    return new Rect(point, 0, 0);  
}; 

// makeRectWider :: number -> Rect -> Rect
let makeRectWider = function(amount) {
    return function(rect) {
        return new Rect(
            rect.point,
            rect.width + amount,
            rect.height
        );  
    };
};

// makeRectTaller :: number -> Rect -> Rect
let makeRectTaller = function(amount) {
    return function(rect) {
        return new Rect(
            rect.point,
            rect.width,
            rect.height + amount
        );  
    };
};

// distributes values
let spreadIndices = function(size, gap) {
    return function(indices) {
        let interval = (size + gap) / indices.length;
        return map(function(x) { 
            return x * interval; 
        })(indices);
    }; 
};

function ModelParams(x, y, width, height, gap, rows, cols) {
    this.x = x;
    this.y = y;
    this.width = width;
    this.height = height;
    this.gap = gap;
    this.rows = rows;
    this.cols = cols;
}

// makeRowPoints :: width -> gap -> (number -> [point])
let makeRowPoints = function(xOffset, width, gap) {
   return sequence(
        arrayFromCount,
        spreadIndices(width, gap),
        map(function(x) { return x + xOffset; }),
        map(numberToPoint)
    );
}; 

// makeRow :: number -> number -> number -> (number -> [points])
let makeRow = function(xOffset, width, gap, columns) {
    return function(y) {
        let points = makeRowPoints(xOffset, width, gap)(columns);
        return map(shiftPointDown(y))(points);     
    };
};  
    
let isPointInRect = function(point, rect) {
    if (point.x < rect.point.x) { return  false; } 
    if (point.y < rect.point.y) { return  false; }
    if (point.x > rect.point.x + rect.width) { return  false; }
    if (point.y > rect.point.y + rect.height) { return  false; }
    return true;
};

let isPointInModel = function(point, model) {
    let count = model.length;
    for(let i = 0; i < count; i++) {
        if (isPointInRect(point, model[i])) { return true; } 
    }
    return false;
};

function Color(red, green, blue) {
    this.red = red;
    this.green = green;
    this.blue = blue; 
}; 

let colorDistanceSquared = function(a, b) {
    let dr = a.red - b.red; 
    let dg = a.green - b.green;
    let db = a.blue - b.blue; 
    return (dr*dr + dg*dg + db*db) / 195075; 
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

function YearbookConfig(image) {
    
    var width = image.width;
    var height = image.height;
    let imageData = getImageData(image);
    let imageSamples = sampleImage(imageData);
    let dataLength = imageSamples.length;
    let bgColor = new Color(250, 250, 250);
    
    let data = {
        "image": image,
        "imageSamples": imageSamples
    };
    
    this.getPriors = function() {
        return {
            x: Distributions.createTriangle(0, 0, width * .2),
            y: Distributions.createTriangle(0, 0, height * .2),
            width: Distributions.createTriangle(0, width, width),
            height: Distributions.createTriangle(0, height, height),
            gap: Distributions.createTriangle(0, 0, width * .25),
            rows: Distributions.createUniform(4, 7),
            cols: Distributions.createUniform(4, 7)
        };
    };
    
    this.getData = function() {
        return data;
    };
    
    this.getScheduler = function() {
        return ApproximateBayes.createScheduler(200000000000, 700, .90);
    };
    
    this.generateParameters = function(priors) {
        return new ModelParams(
            Math.floor(priors.x.sample()),
            Math.floor(priors.y.sample()),
            Math.floor(priors.width.sample()),
            Math.floor(priors.height.sample()),
            Math.floor(priors.gap.sample()),
            Math.floor(priors.rows.sample()),
            Math.floor(priors.cols.sample())
        );
    }; 
    
    this.generateModel = function(modelParams) {
        let rectWidth = ((modelParams.width + modelParams.gap) / modelParams.cols) - modelParams.gap;
        let rectHeight = ((modelParams.height + modelParams.gap) / modelParams.rows) - modelParams.gap;

        // toGrid :: number -> [rect]
        let toGrid = sequence(
            arrayFromCount, 
            spreadIndices(modelParams.height, modelParams.gap), 
            map(function(y) { return y + modelParams.y; }),
            flatMap(makeRow(modelParams.x, modelParams.width, modelParams.gap, modelParams.cols)), 
            map(pointToRect), 
            map(makeRectWider(rectWidth)), 
            map(makeRectTaller(rectHeight))
        );

        return toGrid(modelParams.rows);
    };
    
    this.isBackGroundColor = function(color) {
        let dist = colorDistanceSquared(bgColor, color);
        return (dist < .006);
    };
    
    /*
    Samples from a distribution that determines
    the amount to perturb the parameters
    */
    this.getMove = function() {
        return new ModelParams(
            randomStepByInteger(5),
            randomStepByInteger(5),
            randomStepByInteger(5),
            randomStepByInteger(5),
            randomStepByOne(),
            randomStepByOne(),
            randomStepByOne()
        );
    };

    /*
    gets the probability that a set of parameters
    were perturbed by the specified amounts.
    */
    this.probabilityOfMove = function(move) {
        let probInRange = function(min, max, value) {
            if (value < min) { return 0; }
            if (value > max) { return 0; }
            return 1 / ((max - min) + 1);
        };
        return probInRange(-5, 5, move.x) * 
             probInRange(-5, 5, move.y) * 
             probInRange(-5, 5, move.width)* 
             probInRange(-5, 5, move.height) * 
             probInRange(-1, 1, move.gap) * 
             probInRange(-1, 1, move.rows) * 
             probInRange(-1, 1, move.cols) 
    };
    
    this.priorProbabilityOf = function(priors, parameters) {
        return priors.x.densityAt(parameters.x) * 
            priors.y.densityAt(parameters.y) *
            priors.width.densityAt(parameters.width) *
            priors.height.densityAt(parameters.height) * 
            priors.gap.densityAt(parameters.gap) *
            priors.rows.densityAt(parameters.rows) *
            priors.cols.densityAt(parameters.cols);
    };
    
    this.moveParameters = function(parameter, move) {
        return new ModelParams(
            parameter.x + move.x, 
            parameter.y + move.y,
            parameter.width + move.width,
            parameter.height + move.height,
            parameter.gap + move.gap,
            parameter.rows + move.rows,
            parameter.cols + move.cols
        );
    };
    
    this.subtractParameters = function(a, b) {
        return new ModelParams(
            a.x - b.x, 
            a.y - b.y, 
            a.width - b.width,
            a.height - b.height,
            a.gap - b.gap, 
            a.rows - b.rows, 
            a.cols - b.cols
        );
    }; 

    this.compare = function(model, threshold) {
        let sum = 0;
        let maxX = 0;
        let maxY = 0;
        let cornerX = 0;
        let cornerY = 0;
        let countIn = 0;
        let countOut = 0;
        for(let i = 0; i < dataLength; i++) {
            let sample = imageSamples[i];
            let isin = isPointInModel(sample.point, model);
            let isBg = this.isBackGroundColor(sample.color);
            if (isin) {
                if (isBg) {
                    sum = sum + 1;
                } 
            } else {
                if (!isBg) {
                    sum = sum + 1;
                }
            }
            if (sample.point.x > maxX) { maxX = sample.point.x }
            if (sample.point.y > maxY) { maxY = sample.point.y }

            if (sum > threshold) { return sum; }
        }
        let lastRect = model[model.length - 1]; 
        if (lastRect.point.x + lastRect.width > maxX) { sum = sum * 10 }
        if (lastRect.point.y + lastRect.height > maxY) { sum = sum * 10 }
        return sum * sum;
    };
    
};