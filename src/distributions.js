var Distributions = function() {

    var sequence = function(n) {
        var result = [];
        for (var i = 0; i < n; i++) {
            result[i] = i;
        };
        return result;
    };

    function Bernoulli(p) {
        this.p = p;
        this.type = "bernoulli";
        this.sample = function() {
            var r = Math.random();
            if (r < p) {
                return true;
            } else {
                return false;
            }
        };

        this.sampleMany = function(count) {
            return sequence(count).map(this.sample);
        };

        this.densityAt = function(value) {
            if (value) {
                return p;
            } else {
                return 1 - p;
            }
        };
    }

    function Uniform(start, end) {
        this.start = start;
        this.end = end;
        this.type = "uniform";

        var length = end - start;

        this.sample = function() {
            var r = Math.random() * length;
            return start + r;
        };

        this.sampleMany = function(count) {
            return sequence(count).map(this.sample);
        };

        this.densityAt = function(value) {
            if (value < start) { return 0; }
            if (value >= end) { return 0; }
            return 1 / length;
        };
    };
    
    function Triangle(min, mode, max) {
        this.min = min;
        this.mode = mode;
        this.max = max;
        this.type = "triangle";
        
        var l1 = mode - min;
        var l2 = max - mode;
        var h = 2 / (l1 + l2);
        var slope1 = h / l1;
        var slope2 = h / l2;
        
        function densityAt(value) {
            if (value <= min) return 0;
            if (value >= max) return 0;
            if (value > min && value <= mode) {
                return slope1 * (value - min);
            }
            if (value > mode && value < max) {
                return slope2 * (max - value); 
            }
            return null;
        };
        
        var uniform1 = createUniform(min, max);
        var uniform2 = createUniform(0, densityAt(mode));
        
        this.sample = function() {
            var r1 = uniform1.sample();
            var r2 = uniform2.sample();
            while (r2 > densityAt(r1)) {
                r1 = uniform1.sample();
                r2 = uniform2.sample();
            }
            return r1;
        };Math
        
        this.sampleMany = function(count) {
            return sequence(count).map(this.sample);
        };
        
        this.densityAt = densityAt;

    }
    
    var factorial = function(n) {
         var result = 1;
        for (var i = 2; i <= n; i++) {
            result = result * i;
        }
        return result;
    }; 
    
    var choose = function(n, k) {
        var denom = factorial(k) * factorial(n - k);
        return factorial(n) / denom;
    };
    
    function Binomial(trials, rate) {
        this.trials = trials;
        this.rate = rate;
        
        function densityAt(value) {
            var a = choose(trials, value);
            var b = Math.pow(rate, value);
            var c = Math.pow(1 - rate, trials - value);
            return a * b * c;
        };
        
        this.sample = function() {
            var r = Math.random();
            var sum = 0;
            var d = 0;
            for (var i = 0; i <= trials; i++) {
                d = densityAt(i);
                sum = sum + d;
                if (r <= sum) { return i; }
            }
        };
        
        this.sampleMany = function(count) {
            return sequence(count).map(this.sample);
        };
        
        this.densityAt = densityAt;
    }

    var createBernoulli = function(p) { return new Bernoulli(p); };
    var createUniform = function(start, end) { return new Uniform(start, end); };
    var createTriangle = function(min, mode, max) { return new Triangle(min, mode, max); };
    var createBinomial = function(trials, rate) { return new Binomial(trials, rate); };
    
    var exports  = {
        "createBernoulli": createBernoulli,
        "createUniform": createUniform,
        "createTriangle": createTriangle,
        "createBinomial": createBinomial,
        "factorial": factorial, 
        "choose": choose
    };
    return exports;
    
} ();
