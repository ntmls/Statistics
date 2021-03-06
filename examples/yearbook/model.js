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

/*
let colorDistanceSquared = function(a, b) {
    let dr = a.red - b.red; 
    let dg = a.green - b.green;
    let db = a.blue - b.blue; 
    return (dr*dr + dg*dg + db*db) / 195075; 
};
*/

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

let isBackGroundColor = function(a, b) {
    const thresh = 1070; // 195075 * .006 = 1070
    let delta = a.red - b.red;
    let dr2 = delta * delta;
    if (dr2 > thresh) { return false; }
    delta = a.green - b.green;
    let dg2 = delta * delta;
    if (dg2 > thresh) { return false; }
    delta  = a.blue - b.blue
    let db2 = delta * delta; 
    if (db2 > thresh) { return false; }
    let distSquared = (dr2 + dg2 + db2); 
    if (distSquared < thresh) {
        return true;
    } else {
        return false;
    }
};

function YearbookConfig(image) {
    let bgColor = new Color(250, 250, 250);
    var width = image.width;
    var height = image.height;
    let imageData = getImageData(image);
    let imageSamples = determineBackground(sampleImage(imageData));
    let dataLength = imageSamples.length;
    let bgCount = 0, nonBgCount = 0;
    for (let i = 0; i < dataLength; i++) {
        if (imageSamples[i].isBackground) {
            bgCount += 1;
        } else {
            nonBgCount += 1;
        }
    }
    
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
    
    function determineBackground(samples) {
        return samples.map(function(x) {
            return {
                point: x.point,
                color: x.color,
                isBackground: isBackGroundColor(bgColor, x.color)
            };
        });
    }
    
    this.getData = function() {
        return data;
    };
    
    this.getScheduler = function() {
        return ApproximateBayes.createScheduler(200000000000, 700, .95);
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
    
    let proposal = {
        x: Distributions.createNormal(0,2),
        y: Distributions.createNormal(0,2),
        width: Distributions.createNormal(0,5),
        height: Distributions.createNormal(0,5),
        gap: Distributions.createNormal(0,1),
        rows: Distributions.createNormal(0,1),
        cols: Distributions.createNormal(0,1)
    };
    
    /*
    Samples from a distribution that determines
    the amount to perturb the parameters
    */
    this.getMove = function() {
        return new ModelParams(
            Math.round(proposal.x.sample()),
            Math.round(proposal.y.sample()),
            Math.round(proposal.width.sample()),
            Math.round(proposal.height.sample()),
            Math.round(proposal.gap.sample()),
            Math.round(proposal.rows.sample()),
            Math.round(proposal.cols.sample())
        );
    };

    /*
    gets the probability that a set of parameters
    were perturbed by the specified amounts.
    */
    this.probabilityOfMove = function(move) {
        return proposal.x.densityAt(move.x) *
            proposal.y.densityAt(move.y) *
            proposal.width.densityAt(move.width) *
            proposal.height.densityAt(move.height) *
            proposal.gap.densityAt(move.gap) *
            proposal.rows.densityAt(move.rows) *
            proposal.cols.densityAt(move.cols);
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
        let inAndBg = 0,
            inAndNotBg = 0,
            outAndBg = 0,
            outAndNotBg = 0;
        for(let i = 0; i < dataLength; i++) {
            let sample = data.imageSamples[i];
            let isin = isPointInModel(sample.point, model);
            //let isBg = isBackGroundColor(bgColor, sample.color);
            if (isin) {
                if (sample.isBackground) {
                    inAndBg += 1;
                } else {
                    inAndNotBg += 1;
                }
            } else {
                if (sample.isBackground) {
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
    
    /*
    let createProposalDistribution = function(particles, selector, cap) {
        let values = particles.map(function(p) { return selector(p) * p.weight; });
        let mean = values.reduce(add, 0) / values.length;
        let errsqrd = values.map(function(v) { return (v-mean)*(v-mean); });
        let variance = errsqrd.reduce(add, 0) / values.length;
        let stdv = Math.min(Math.sqrt(variance), cap);
        return Distributions.createNormal(0, stdv);
    };
    */
    
    this.next = function(particles) {
        /*
        let xselector = function(p) { return p.parameters.x; };
        let yselector = function(p) { return p.parameters.y; };
        let wselector = function(p) { return p.parameters.width; };
        let hselector = function(p) { return p.parameters.height; };
        let gselector = function(p) { return p.parameters.gap; };
        let rselector = function(p) { return p.parameters.rows; };
        let cselector = function(p) { return p.parameters.cols; };
        
        proposal = {
            x: createProposalDistribution(particles, xselector, 100), 
            y: createProposalDistribution(particles, yselector, 100), 
            width: createProposalDistribution(particles, wselector, 100),
            height: createProposalDistribution(particles, hselector, 100),
            gap: createProposalDistribution(particles, gselector, 100),
            rows: createProposalDistribution(particles, rselector, 100),
            cols: createProposalDistribution(particles, cselector, 100)
        };
        */
        
    }; 
    
};