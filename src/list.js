var List = function() {
    
    var ListNode = function(value, next) {
        this.value = value;
        this.next = next;
    };
    
    ListNode.prototype.isEmpty = function() {
        return this.next === null;
    };
    
    ListNode.prototype.prepend = function(value) {
        return new ListNode(value, this);
    };
    
    ListNode.prototype.filter = function(predicate) {
        var current = this;
        var result = create();
        while (!current.isEmpty()) {
            if (predicate(current.value)) { 
                result = result.prepend(current.value);
            }
            current = current.next;   
        }
        return result;                     
    };
    
    ListNode.prototype.concat = function(list) {
        var result = this;
        var current = list;
        while (!current.isEmpty()) {
            result = result.prepend(current.value);
            current = current.next;
        }
        return result;
    };
    
    ListNode.prototype.reverse = function() {
        var current = this;
        var result = create();
        while (!current.isEmpty()) {
            result = result.prepend(current.value);
            current = current.next;   
        }
        return result;
    };
    
    ListNode.prototype.sort = function(comparer) {
        if (this.isEmpty()) { return this; }
        var pivot = this;
        var lessThanPivot = function(value) {
            return comparer(pivot.value, value) <= 0;
        };
        var moreThanPivot = function(value) {
            return comparer(pivot.value, value) > 0;
        };
        var lessThan = pivot.next
            .filter(lessThanPivot)
            .sort(comparer);
        var moreThan = pivot.next
            .filter(moreThanPivot)
            .sort(comparer);
        lessThan = lessThan.prepend(pivot.value);
        var result = lessThan.concat(moreThan.reverse());
        return result;
    };
    
    ListNode.prototype.take = function(count) {
        var c = 0;
        var current = this;
        var result = create();
        while (!current.isEmpty() && c < count) {
            result = result.prepend(current.value);
            current = current.next;   
            c++;
        }
        return result;  
    };
    
    ListNode.prototype.map = function(f) {
        var current = this;
        var result = create();
        while (!current.isEmpty()) {
            result = result.prepend(f(current.value));
            current = current.next;   
        }
        return result;  
    };
    
    ListNode.prototype.fmap = function(f) {
        var current = this;
        var result = create();
        while (!current.isEmpty()) {
            result = result.concat(f(current.value));
            current = current.next;   
        }
        return result;  
    };
    
    ListNode.prototype.reduce = function(f, initial) {
        var accumulator = initial;
        var current = this;
        while (!current.isEmpty()) {
            accumulator = f(accumulator, current.value);
            current = current.next;   
        }
        return accumulator;  
    };
    
    ListNode.prototype.count = function() {
        var accumulator = 0;
        var current = this;
        while (!current.isEmpty()) {
            accumulator++;
            current = current.next;   
        }
        return accumulator;  
    };
    
    ListNode.prototype.at = function(index) {
        var c = 0;
        var current = this;
        while (true) {
            if (c >= index || current.isEmpty()) {
                return current.value;
            }
            c++;
            current = current.next;   
        }
    };
    
    var create = function() {
        return new ListNode(undefined, null);
    };
    
    var lift = function(value) {
        return new ListNode(undefined, null)
            .prepend(value);
    };
    
    var exports = {
        create: create,
        lift: lift
    };
    
    return exports;
    
} ();