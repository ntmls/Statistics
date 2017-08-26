QUnit.module("List", function() {

    QUnit.test("Construct list", function( assert ) {
        var list = List.create()
            .prepend(1)
            .prepend(2)
            .prepend(3);

        var current = list;
        assert.equal(current.value, 3, "The valuu of the firsr item must be 3");
        assert.equal(current.isEmpty(), false, "The first item must not be empty");
        current = current.next;
        assert.equal(current.value, 2, "The valuu of the second item must be 2");
        assert.equal(current.isEmpty(), false, "The second item must not be empty");
        current = current.next;
        assert.equal(current.value, 1, "The valuu of the third item must be 1");
        assert.equal(current.isEmpty(), false, "The third item must not be empty");
        current = current.next;
        assert.equal(current.isEmpty(), true, "the final item must be empty");
        assert.equal(current.value, undefined, "The next of the final item must be undefined");
        assert.equal(current.value, undefined, "The value of the final item will be undefined");
    });

    QUnit.test("Filter list", function( assert ) {
        var list = List.create()
            .prepend(1)
            .prepend(2)
            .prepend(3);

        var greaterThanOne = function(x) { return x > 1; }
        var result = list.filter(greaterThanOne);

        var current = result;
        assert.equal(current.value, 2, "The valuu of the firsr item must be 3");
        current = current.next;
        assert.equal(current.value, 3, "The valuu of the second item must be 2");
        current = current.next;
        assert.equal(current.isEmpty(), true, "The final item must be empty");
    });

    QUnit.test("Concatenate lists (neither of them empty)", function( assert ) {
        var list1 = List.create()
            .prepend(1)
            .prepend(2)
            .prepend(3);

        var list2 = List.create()
            .prepend(4)
            .prepend(5);

        var result = list1.concat(list2);

        var current = result;
        assert.equal(current.value, 4, "The valuu of the firsr item must be 5");
        current = current.next;
        assert.equal(current.value, 5, "The valuu of the second item must be 5");
        current = current.next;
        assert.equal(current.value, 3, "The valuu of the firsr item must be 3");
        current = current.next;
        assert.equal(current.value, 2, "The valuu of the second item must be 2");
        current = current.next;
        assert.equal(current.value, 1, "The valuu of the firsr item must be 1");
        current = current.next;
        assert.equal(current.isEmpty(), true, "The final item must be empty");
    });

    QUnit.test("Concatenate lists (with an empty list)", function( assert ) {
        var list1 = List.create()
            .prepend(1)
            .prepend(2)
            .prepend(3);

        var list2 = List.create();
        var result = list1.concat(list2);

        var current = result;
        assert.equal(current.value, 3, "The valuu of the firsr item must be 3");
        current = current.next;
        assert.equal(current.value, 2, "The valuu of the second item must be 2");
        current = current.next;
        assert.equal(current.value, 1, "The valuu of the firsr item must be 1");
        current = current.next;
        assert.equal(current.isEmpty(), true, "The final item must be empty");
    });

    QUnit.test("Reverse list", function( assert ) {
        var list = List.create()
            .prepend(1)
            .prepend(2)
            .prepend(3);

        var result = list.reverse();

        var current = result;
        assert.equal(current.value, 1, "The valuu of the firsr item must be 1");
        current = current.next;
        assert.equal(current.value, 2, "The valuu of the second item must be 2");
        current = current.next;
        assert.equal(current.value, 3, "The valuu of the firsr item must be 3");
        current = current.next;
        assert.equal(current.isEmpty(), true, "The final item must be empty");
    });

    QUnit.test("Take from a list", function( assert ) {
        var list = List.create()
            .prepend(1)
            .prepend(2)
            .prepend(3);

        var result = list.take(2);

        var current = result;
        assert.equal(current.value, 2, "The valuu of the firsr item must be 1");
        current = current.next;
        assert.equal(current.value, 3, "The valuu of the second item must be 2");
        current = current.next;
        assert.equal(current.isEmpty(), true, "The final item must be empty");
    });

    QUnit.test("Sort list", function( assert ) {
        var count = 20;
        var list = List.create();
        for (var i = 0; i < count; i++) {
            var r = Math.floor(Math.random() * 10);
            list = list.prepend(r);
        }
        var comparer = function(a, b) {
            return a-b;  
        };
        var result = list.sort(comparer);
        var next = null;
        for (var i = 0; i < count - 1; i++) {
            next = result.next;
            assert.ok(result.value <= next.value);
            result = next;
        }
    });

    QUnit.test("Count a list", function( assert ) {
        var list = List.create()
            .prepend(1)
            .prepend(2)
            .prepend(3);

        var result = list.count();
        assert.equal(result, 3, "Count is 3")
    });

    QUnit.test("Reduce a list", function( assert ) {
        var list = List.create()
            .prepend(1)
            .prepend(2)
            .prepend(3);

        var result = list.reduce(function(a,b) { 
            return Math.min(a,b); 
        }, list.value);

        assert.equal(result, 1, "Minimum is 1")
    });

    QUnit.test("Map a list", function( assert ) {
        var list = List.create()
            .prepend(1)
            .prepend(2)
            .prepend(3);

        var result = list.map(function(x) { return x * 2; });

        var current = result;
        assert.equal(current.value, 2, "The valuu of the firsr item must be 2");
        current = current.next;
        assert.equal(current.value, 4, "The valuu of the second item must be 4");
        current = current.next;
        assert.equal(current.value, 6, "The valuu of the second item must be 6");
        current = current.next;
        assert.equal(current.isEmpty(), true, "The final item must be empty");
    });

    QUnit.test("Retrive an item at an index from a list", function( assert ) {
        var list = List.create()
            .prepend(1)
            .prepend(5)
            .prepend(3);

        var result = list.reverse();

        var current = result;
        assert.equal(result.at(0), 1, "The value at index 0 should be 1");
        assert.equal(result.at(1), 5, "The value at index 1 should be 5");
        assert.equal(result.at(2), 3, "The value at index 2 should be 3");
        assert.equal(result.at(3), undefined, "The value at index 4 should be undefined");
    });
    
    QUnit.test("Flat Map", function( assert ) {
        var list1 = List.create()
            .prepend(1)
            .prepend(2);
        var list2 = List.create()
            .prepend(3)
            .prepend(4);
        var result = list1.fmap(function(a) {
            return list2.fmap(function(b) {
                return List.lift(a + b);
            });
        });
        assert.equal(result.at(0), 5);
        assert.equal(result.at(1), 4);
        assert.equal(result.at(2), 6);
        assert.equal(result.at(3), 5);
        assert.equal(result.at(4), undefined);
    });
});