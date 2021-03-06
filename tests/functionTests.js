QUnit.module("Functions", function() {

    QUnit.test("compose", function(assert) {
        let toUpper = function(x) { return x.toUpperCase(); };
        let reverse = function(x) { 
            return x
                .split("")
                .reverse()
                .join("");
        }; 
        let first = function(x) { return x.substr(0, 1); }
        let test = compose(
            first,
            reverse, 
            toUpper);
        let result = test("cat");
        assert.equal(result, "T"); 
    });

    QUnit.test("sequence", function(assert) {
        let toUpper = function(x) { return x.toUpperCase(); };
        let reverse = function(x) { 
            return x
                .split("")
                .reverse()
                .join("");
        }; 
        let first = function(x) { return x.substr(0, 1); }
        let test = sequence(
            reverse, 
            toUpper,
            first);
        let result = test("cat");
        assert.equal(result, "T"); 
    });

    QUnit.test("map (point free)", function(assert) {
        let double = function(x) { return x * 2; }; 
        let result = [1, 2, 3].map(double);
        assert.ok(
            arraysAreEqual
                (result)
                ([2, 4, 6]));
    });

    QUnit.test("arrayFromCount", function(assert) {
        let actual = arrayFromCount(3);
        let expected = [0, 1, 2];
        assert.ok(
            arraysAreEqual
                (actual)
                (expected));
    });

    QUnit.test("flatMap", function(assert) {
        let xs = [1, 2];
        let ys = [3, 4];
        let actual = flatMap(function(x) {
           return flatMap(function(y) {
               return [x + y];
           })(ys); 
        })(xs);
        let expected = [4, 5, 5, 6];
        assert.ok(arraysAreEqual
            (actual)
            (expected));
    });

    QUnit.test("any", function(assert) {
        let xs = [0, 2, 3, 4]; 
        let isSomeNumber = function(n) {
            return function(x) {
                return n === x;
            };
        };  
        let isTwo = isSomeNumber(2);
        let isTen = isSomeNumber(10);
        assert.equal(any(isTwo)(xs), true);
        assert.equal(any(isTen)(xs), false);
    });

    QUnit.test("isOne", function(assert) {
        assert.equal(isOne(1), true); 
        assert.equal(isOne(2), false);
        assert.equal(isOne(0), false);
        assert.equal(isOne(-1), false);
    });

    QUnit.test("isZero", function(assert) {
        assert.equal(isZero(1), false); 
        assert.equal(isZero(2), false);
        assert.equal(isZero(0), true);
        assert.equal(isZero(-1), false);
    });

    QUnit.test("isMinusOne", function(assert) {
        assert.equal(isMinusOne(1), false); 
        assert.equal(isMinusOne(2), false);
        assert.equal(isMinusOne(0), false);
        assert.equal(isMinusOne(-1), true);
    });

    QUnit.test("isEqualTo", function(assert) {
        let f = isEqualTo(12.3);
        assert.equal(f(12.3), true);
        assert.equal(f(45.6), false);
    });

});
