var Histogram = function() {

    function Bin(min, max, count, inclusive) {
        this.min = min;
        this.max = max;
        this.count = count;
        this.inclusive = inclusive;
        this.getWidth = function() {
            return this.max - this.min;
        };
    };
    
    Bin.prototype.inBin = function(value) {
        if (this.inclusive) {
            return (this.min <= value && value <= this.max);
        } else {
            return (this.min <= value && value < this.max);
        }
    };

  var toDensity = function(bins) {
      var binAreas = bins.map(function(x) { return new Bin(x.min, x.max, x.count * (x.max - x.min)); });
      var totalArea = binAreas.reduce(function(a, b) { return a + b.count;  }, 0);
      var normalizedArea = binAreas.map(function(x) { return new Bin(x.min, x.max, x.count / totalArea); });
      var binHeights = normalizedArea.map(function(x) { return new Bin(x.min, x.max, x.count / (x.max - x.min)); });
      return binHeights;
  };

    var create = function(data, binCount) {
        var first = (data.value === undefined) ? data[0] : data.value;
        var min = data.reduce(function(a,b) { return Math.min(a,b); }, first);
        var max = data.reduce(function(a,b) { return Math.max(a,b); }, first);
        var interval = (max - min) / binCount;
        var bins = [];
        for (var i = 0; i < binCount; i++) {
            var start = min + i * interval;
            var end;
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

  var exports = {
      "create": create,
      "toDensity": toDensity
  };

  return exports;
} ();
