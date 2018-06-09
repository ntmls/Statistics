QUnit.module("Distributions", function() {


    QUnit.test("Create Bernoulli", function( assert ) {
		var bernoulli = Distributions.createBernoulli(.75);
        assert.notStrictEqual(bernoulli, undefined, "Bernoulli must be defined");
        assert.equal(bernoulli.p, .75, "Parameter 'p' must be set");
        assert.equal(bernoulli.type, "bernoulli", "Type must be 'bernoulli'.");

        var samples = bernoulli
          .sampleMany(1000)
          .filter(function(x) { return x !== undefined; });
        assert.equal(samples.length, 1000, "The number of samples asked for must exist");
        var zeros = samples.filter(function(x) { return x == false; });
        var ones = samples.filter(function(x) { return x == true; });
        assert.ok(ones.length > 0 && zeros.length > 0, "A sample must be true or falsr");
        assert.ok(true, "Number of true (out of 1000) = " + ones.length);
        assert.ok(true, "Number of false (out of 1000) = " + zeros.length);

        assert.equal(bernoulli.densityAt(true), .75,
                     "Given a value of true then the probability of sampling that value is 'p'.");
        assert.equal(bernoulli.densityAt(false), .25,
                     "Given a value of true then the probability of sampling that value is '1 - p'.");
    });

  QUnit.test("Create Uniform", function( assert ) {
  var uniform = Distributions.createUniform(-2, 3);
      assert.notStrictEqual(uniform, undefined, "Uniform must be defined");

      assert.equal(uniform.start, -2, "Parameter 'start' must be set");
      assert.equal(uniform.end, 3, "Parameter 'end' must be set");
      assert.equal(uniform.type, "uniform", "Type must be 'uniform'.");
      var samples = uniform
        .sampleMany(1000)
        .filter(function(x) { return x !== undefined; });
      assert.equal(samples.length, 1000, "The number of samples asked for must exist");
      assert.equal(uniform.densityAt(-3), 0,
                   "The probablity of a value lower than start should be zero.");
      assert.equal(uniform.densityAt(5), 0,
                   "The probablity of a value higher end should be zero.");
     assert.equal(uniform.densityAt(-1) * (uniform.end - uniform.start), 1,
                  "The probablity of a value between start and end times the length of the interval should be one.");

  });

  QUnit.test("Create Triangle", function( assert ) {
  var triangle = Distributions.createTriangle(-2, 1, 3);
      assert.notStrictEqual(triangle, undefined, "Triangle must be defined");

      assert.equal(triangle.min, -2, "Parameter 'min' must be set");
      assert.equal(triangle.mode, 1, "Parameter 'mode' must be set");
      assert.equal(triangle.max, 3, "Parameter 'max' must be set");
      assert.equal(triangle.type, "triangle", "Type must be 'triangle'.");
      
      var samples = triangle
        .sampleMany(1000)
        .filter(function(x) { return x !== undefined; });
      assert.equal(samples.length, 1000, "The number of samples asked for must exist");
      assert.equal(triangle.densityAt(-3), 0,
                   "The probablity of a value lower than start should be zero.");
      assert.equal(triangle.densityAt(5), 0,
                   "The probablity of a value higher end should be zero.");
     assert.equal(triangle.densityAt(1), .4,
                  "The probablity of a value between start and end must be greater than zero.");

  });
    
    var round = function(number, decimals) {
        var scale = Math.pow(10, decimals);
        return Math.round(number * scale) / scale;
    };
    
    QUnit.test("Create Binomial", function( assert ) {
        var distribution = Distributions.createBinomial(6, .3);
        assert.notStrictEqual(distribution, undefined, "Binomial must be defined");

        assert.equal(distribution.trials, 6, "Parameter 'trials' must be set");
        assert.equal(distribution.rate, .3, "Parameter 'rate' must be set");

        var samples = distribution
            .sampleMany(1000)
            .filter(function(x) { return x !== undefined; });
        assert.equal(samples.length, 1000, "The number of samples asked for must exist");
        
        var round4 = function(n) { return round(n, 4); };
        
        assert.equal(round4(distribution.densityAt(0)), .1176);
        assert.equal(round4(distribution.densityAt(1)), .3025);
        assert.equal(round4(distribution.densityAt(2)), .3241);
        assert.equal(round4(distribution.densityAt(3)), .1852);
        assert.equal(round4(distribution.densityAt(4)), .0595);
        assert.equal(round4(distribution.densityAt(5)), .0102);
    });
    
        QUnit.test("Create Normal", function( assert ) {
        var distribution = Distributions.createNormal(2, 3);
        assert.notStrictEqual(distribution, undefined, "Normal must be defined");

        assert.equal(distribution.mean, 2, "Parameter 'mean' must be set");
        assert.equal(distribution.stdv, 3, "Parameter 'standardDeviation' must be set");

        var samples = distribution
            .sampleMany(1000)
            .filter(function(x) { return x !== undefined; });
        assert.equal(samples.length, 1000, "The number of samples asked for must exist");
        
        var round4 = function(n) { return round(n, 4); };
        
        assert.equal(round4(distribution.densityAt(0)), .1065);
        assert.equal(round4(distribution.densityAt(1)), .1258);
        assert.equal(round4(distribution.densityAt(2)), .133);
        assert.equal(round4(distribution.densityAt(3)), .1258);
        assert.equal(round4(distribution.densityAt(4)), .1065);
        assert.equal(round4(distribution.densityAt(5)), .0807);
    });
    
    QUnit.test("factorial", function( assert ) {
       assert.equal(Distributions.factorial(4), 4*3*2*1); 
    });
    
    
    QUnit.test("choose", function( assert ) {
        assert.equal(Distributions.choose(4, 4), 1); 
        assert.equal(Distributions.choose(4, 3), 4); 
        assert.equal(Distributions.choose(4, 2), 6); 
        assert.equal(Distributions.choose(4, 1), 4); 
        assert.equal(Distributions.choose(4, 0), 1); 
    });

});
