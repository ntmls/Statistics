// compose :: (b -> c) -> (a -> b) -> (a -> c)
var compose = function() {
    var fns = arguments;
    let countMinusOne = fns.length - 1;
  return function(a) {
    var result = a;
    for (var i = countMinusOne; i > -1; i--) {
        var f = fns[i]; 
        result = f(result);
    }
    return result;
  };
};

// sequence :: (b -> c) -> (a -> b) -> (a -> c)
var sequence = function() {
    var fns = arguments;
    let count = fns.length;
  return function(a) {
    var result = a;
    for (let i = 0; i < count; i++) {
        var f = fns[i]; 
        result = f(result);
    }
    return result;
  };
};

// a point free version of map
var map = function(f) {
    return function(obj) {
        return obj.map(f);
    }; 
}; 

// flatMap :: (a -> Array) -> Array -> Array
let flatMap = function(f) {
    return function(ar) {
        return ar.reduce(
            function(a, x) {
                return a.concat(f(x));
            }, []);
    }; 
}; 

// Array -> Array -> bool
let arraysAreEqual = function(a) {
    return function(b) {
        if (a.length != b.length) { return false; }
        for(let i = 0; i < a.length; i++) {
            if (a[i] != b[i]) {
                return false;
            }
        }
        return true;    
    };
}; 

// number -> Array
let arrayFromCount = function(count) {
    let result = [];
    for (let i = 0; i < count; i++) {
        result[i] = i;
    }
    return result;
};

// any :: (a -> bool) -> [a] -> bool
let any = function(f) {
    return function(ar) {
        for (let i = 0; i < ar.length; i++) {
            let result = f(ar[i]);
            if (result === true) { return true; }
        }
        return false;
    };
};

// isOne :: number -> bool
let isOne = function(n) {
    return n == 1;
};

// isOne :: number -> bool
let isZero = function(n) {
    return n == 0;
};

// isOne :: number -> bool
let isMinusOne = function(n) {
    return n == -1;
};

// isEqualTo :: any -> any -> bool
let isEqualTo = function(x) {
    return function(y) {
        return x == y;
    };
};

let max = function(a, b) {
    return Math.max(a,b);
};

let min = function(a, b) {
    return Math.min(a,b);
};

let add = function(a, b) {
    return a + b;
};

let multiply = function(a, b) {
    return a * b;
};

let reciprical = function(x) {
    return 1 / x;
}; 

let ignoreArg = function(f, value) {
    return function(x) {
        return f(value);  
    };
}; 