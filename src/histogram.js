let Histogram = function() {
    
    // Represends one bar on the histogram
    function Bin(min, max, count, inclusive) {
        this.min = min;
        this.max = max;
        this.count = count;
        this.inclusive = inclusive;
        this.getWidth = function() {
            return this.max - this.min;
        };
    };
    
    // Determines if a value is within a bin
    Bin.prototype.inBin = function(value) {
        if (this.inclusive) {
            return (this.min <= value && value <= this.max);
        } else {
            return (this.min <= value && value < this.max);
        }
    };
    
    // Changes counts into densities
    let toDensity = function(bins) {
        let binAreas = bins.map(function(x) { return new Bin(x.min, x.max, x.count * (x.max - x.min)); });
        let totalArea = binAreas.reduce(function(a, b) { return a + b.count;  }, 0);
        let normalizedArea = binAreas.map(function(x) { return new Bin(x.min, x.max, x.count / totalArea); });
        let binHeights = normalizedArea.map(function(x) { return new Bin(x.min, x.max, x.count / (x.max - x.min)); });
        return binHeights;
    };

    // Creates a histogram from data
    let create = function(data, binCount) {
        let first = (data.value === undefined) ? data[0] : data.value;
        let min = data.reduce(function(a,b) { return Math.min(a,b); }, first);
        let max = data.reduce(function(a,b) { return Math.max(a,b); }, first);
        let interval = (max - min) / binCount;
        let bins = [];
        for (let i = 0; i < binCount; i++) {
            let start = min + i * interval;
            let end = 0;
            if (i == binCount - 1) {
              end = max;
            } else {
              end = min + i * interval + interval;
            }
            bins[i] = new Bin(start, end, 0, i == binCount - 1);
            bins[i].count = data.reduce(function(a,b) {
                if(bins[i].inBin(b)) {
                    return a + 1;
                } else {
                    return a;
                }                    
            }, 0);
        }
        return bins;
    };
    
    let update = function(histogram, data) {
        let bins = [];
        let binCount = histogram.length;
        for (let i = 0; i < binCount; i++) {
            bins[i] = new Bin(
                histogram[i].min, 
                histogram[i].max, 
                0, i == binCount - 1);
            bins[i].count = data.reduce(function(a,b) {
                if(bins[i].inBin(b)) {
                    return a + 1;
                } else {
                    return a;
                }                    
            }, 0);
        }
        return bins;
    };

    let exports = {
        "create": create,
        "update": update,
        "toDensity": toDensity
    };

    return exports;
} ();