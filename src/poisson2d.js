(function(exports) {
                
    var randomVector = function() {
        let l = 2;
        var r1, r2;
        while(l > 1) {
            r1 = Math.random() * 2 - 1;
            r2 = Math.random() * 2 - 1;
            l = Math.sqrt(r1 * r1 + r2 * r2); 
        }
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
        var f = function(x,y) {
            return 1.0;  
        };
        return createAdaptive(width, height, minRadius, minRadius, f, tries);
    };
    
    var createAdaptive = function(width, height, minRadius, maxRadius, f, tries) {
        var cellSize = maxRadius / Math.sqrt(2); 
        var active = [];
        var grid = [];
        var cols = Math.floor(width / cellSize);
        var rows = Math.floor(height / cellSize);
        var output = [];
        
        var push = function(row, col, point) {
            active.push(point); 
            output.push(point);
            let index = row * cols + col;
            if (grid[index] === undefined) {
                grid[index] = [];
            }
            grid[index].push(point);
        };
        
        var isRejected = function(v1, v2, f) {v2
            let maxd = Math.max(
                minRadius + (maxRadius - minRadius) * f(v1.x, v1.y), 
                minRadius + (maxRadius - minRadius) * f(v2.x, v2.y));
            let dx = v1.x - v2.x;
            let dy = v1.y - v2.y;
            let dist = Math.sqrt(dx * dx + dy * dy);
            return dist < maxd;
        };
        
        var r = {
            x: Math.random() * width,
            y: Math.random() * height
        };
        var row = Math.floor(r.x / cellSize);
        var col = Math.floor(r.y / cellSize);
        push(row, col, r);

        while(active.length > 0) {
            var current = active.pop();
            var currentDensity = f(current.x, current.y);
            var currentDist = minRadius + (maxRadius - minRadius) * currentDensity;
            for (let k = 0; k < tries; k++) {
                let r = Math.random() * currentDist + currentDist;
                let v = scaleVector(randomVector(), r);
                var newDensity = f(v.x, v.y);
                var newDist = minRadius + (maxRadius - minRadius) * newDensity;
                v.x = v.x + current.x;
                v.y = v.y + current.y;
                let ok = true;
                for (let i = -2; i <= 2; i++) {
                    for (let j = -2; j <= 2; j++) {
                        let rIndex = Math.floor(v.x / cellSize) + i;
                        let cIndex = Math.floor(v.y / cellSize) + j;
                        let item = grid[rIndex * cols + cIndex]; 
                        if (item !== undefined) {
                            let count = item.length;
                            for(let l = 0; l < count; l++) {
                                if (isRejected(item[l], v, f)) {
                                    ok = false;
                                    break;
                                }
                            }
                        } 
                        if (!ok) { break; }
                    }
                    if (!ok) { break; }
                }    
                if (ok) {
                    if (v.x >= 0 && v.y >= 0 && v.x < width && v.y < height) {
                        let rIndex = Math.floor(v.x / cellSize);
                        let cIndex = Math.floor(v.y / cellSize);
                        push(rIndex, cIndex, v);
                    }
                }   
            }
        }
        return output;
    };
    
    exports.poisson2d = {
        create: create,
        createAdaptive: createAdaptive
    }; 
    
})(typeof exports === 'undefined' ? this : exports);