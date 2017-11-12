/*global QUnit Histogram List:true*/

QUnit.module("Histogram", function() {

    QUnit.test("Generate Histogram from array", function( assert ) {
        var data = [1, 2.1, 2.2, 3, 3.1, 3.2, 5];
        var bins = 5;
        var histogram = Histogram.create(data,  bins);
        assert.notStrictEqual(histogram, undefined, "Histogram must be defined");
        assert.equal(histogram.length, bins, "The number of bins must equal the nummber requested.");
        assert.equal(histogram[0].count, 1, "Expected one in the first bin.");
        assert.equal(histogram[1].count, 2, "Expected two in the second bin.");
        assert.equal(histogram[2].count, 3, "Expected three in the third bin.");
        assert.equal(histogram[3].count, 0, "Expected zero in the fourth bin.");
        assert.equal(histogram[4].count, 1, "Expected one in the fifth bin.");
    });

    QUnit.test("Generate Histogram from list", function( assert ) {
        var data = List.create()
            .prepend(1)
            .prepend(2.1)
            .prepend(2.2)
            .prepend(3)
            .prepend(3.1)
            .prepend(3.2)
            .prepend(5);
            var bins = 5;
        var histogram = Histogram.create(data,  bins);
        assert.notStrictEqual(histogram, undefined, "Histogram must be defined");
        assert.equal(histogram.length, bins, "The number of bins must equal the nummber requested.");
        assert.equal(histogram[0].count, 1, "Expected one in the first bin.");
        assert.equal(histogram[1].count, 2, "Expected two in the second bin.");
        assert.equal(histogram[2].count, 3, "Expected three in the third bin.");
        assert.equal(histogram[3].count, 0, "Expected zero in the fourth bin.");
        assert.equal(histogram[4].count, 1, "Expected one in the fifth bin.");
    });
    
    QUnit.test("update()", function( assert ) {
        var data = List.create()
            .prepend(1)
            .prepend(2.1)
            .prepend(2.2)
            .prepend(3)
            .prepend(3.1)
            .prepend(3.2)
            .prepend(5);
            var bins = 5;
        var histogram = Histogram.create(data,  bins);
        var newData = List.create()
            .prepend(1)
            .prepend(4);
        var newHistogram = Histogram.update(histogram, newData);
        assert.equal(newHistogram[0].count, 1);
        assert.equal(newHistogram[1].count, 0);
        assert.equal(newHistogram[2].count, 0);
        assert.equal(newHistogram[3].count, 1);
        assert.equal(newHistogram[4].count, 0);
    });

});
