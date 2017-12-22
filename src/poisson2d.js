(function(exports) {
                
    var randomVector = function() {
        let r1 = Math.random() - .5;
        let r2 = Math.random() - .5;
        let l = Math.sqrt(r1 * r1 + r2 * r2); 
        return {
            x: r1 / l,
            y: r2 / l
        };
    };

    var scaleVector = function(vector, scale) {
        return {
            x: vector.x * scale,
            y: vector.y * scale
        };
    };
    
    var create = function(width, height, minRadius, tries) {
        var cellSize = minRadius / Math.sqrt(2); 
        var active = [];
        var grid = [];
        var cols = Math.floor(width / cellSize);
        var rows = Math.floor(height / cellSize);
        var output = [];
        
        var r = {
            x: Math.random() * width,
            y: Math.random() * height
        };
        active.push(r); 
        output.push(r);
        var row = Math.floor(r.x / cellSize);
        var col = Math.floor(r.y / cellSize);
        grid[row * cols + col] = r;

        while(active.length > 0) {
            var current = active.pop();
            for (let k = 0; k < tries; k++) {
                let r = Math.random() * minRadius + minRadius;
                let v = scaleVector(randomVector(), r);
                v.x = v.x + current.x;
                v.y = v.y + current.y;
                let ok = true;
                for (let i = -2; i <= 2; i++) {
                    for (let j = -2; j <= 2; j++) {
                        let rIndex = Math.floor(v.x / cellSize) + i;
                        let cIndex = Math.floor(v.y / cellSize) + j;
                        let item = grid[rIndex * cols + cIndex]; 
                        if (item !== undefined) {
                            let dx = item.x - v.x;
                            let dy = item.y - v.y;
                            let dist = Math.sqrt(dx * dx + dy * dy);
                            if (dist < minRadius) {
                                ok = false;
                            }
                        } 
                    }
                }    
                if (ok) {
                    if (v.x >= 0 && v.y >= 0 && v.x < width && v.y < height) {
                        let rIndex = Math.floor(v.x / cellSize);
                        let cIndex = Math.floor(v.y / cellSize);
                        let index = rIndex * cols + cIndex;
                        grid[index] = v;
                        active.push(v);
                        output.push(v);
                    }
                }   
            }
        }
        return output;
    };
    
    exports.poisson2d = {
        create: create
    }; 
    
})(typeof exports === 'undefined' ? this : exports);