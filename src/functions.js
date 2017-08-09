
    var createNormal = function(mean, stdev) {
        var a = 1 / (stdev * (Math.sqrt(2.0 * Math.PI)));
        var b = (2 * stdev);
        return function(x) {
            return a * Math.exp(-(((x - mean) * (x - mean))/b)); 
        }
    };

    var createTriangle = function(min, mode, max) {
        var l1 = mode - min;
        var l2 = max - mode;
        var h = 2 / (l1 + l2);
        var slope1 = h / l1;
        var slope2 = h / l2;
        return function(x) {
            if (x <= min) return 0;
            if (x >= max) return 0;
            if (x > min && x <= mode) {
                return slope1 * (x - min);
            }
            if (x > mode && x < max) {
                return slope2 * (max - x); 
            }
            return x;
        }
    }
    
    var drawSamples = function(f, min, max, count, maxValue) {
        var result = [];
        for (var i = 0; i < count; i++) {
            result.push(drawSample(f, min, max, maxValue));
        }
        return result;
    };

    var drawSample = function(f, min, max, maxValue) {
        var r1 = Math.random() * (max - min) + min;
        var r2 = Math.random() * maxValue;
        while (true) {
            if (r2 <= f(r1)) {
                return r1;
            }
            r1 = Math.random() * (max - min) + min;
            r2 = Math.random() * maxValue;
        }
    };

    var createRange = function(min, max, n) {
        var delta = max - min; 
        var xs = [];
        var inc = delta / n;
        for(var i = 0; i < n; i++) {
            xs[i] = min + i * inc;
        }
        return xs;
    };

    var createHistogram = function(samples, start, end, binCount) {
        var min = samples.reduce(Math.min, samples[0]);
        var max = samples.reduce(Math.max, samples[0]);
        var delta = end - start;
        var bins = [];
        for (var i = 0; i < binCount; i++) {
            var bin = {
                "count": 0,
                "start": start + (i / binCount) * delta,
                "end":  start + ((i + 1) / binCount) * delta
            };
            bin.count = samples.filter(function(x) { return x > bin.start && x <= bin.end; }).length;
            bins[i] = bin;
        }
        bins[0].count += samples.filter(function(x) { return x <= start; }).length;
        bins[binCount - 1].count += samples.filter(function(x) { return x > end; }).length;
        return bins;
    };

    var add = function(a,b) {
        return a + b;
    };

    var multiply = function(a,b) { 
        return a * b;
    };

    var sum = function(values) {
        return values.reduce(add, 0);
    };

    var normalize = function(values) {
        var s = sum(values);
        return values.map(function(a) { return a / s; });
    };

    var zip = function(xs, ys, combine) {
        var length = Math.min(xs.length, ys.length);
        var result = [];
        for (var i = 0; i < length; i++) {
            result.push(combine(xs[i], ys[i]));
        }
        return result;
    };