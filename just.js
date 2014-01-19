(function() {
    var just = {};

    just.property = function(initialValue) {
        var value = null,
        observers = [],
        f = function(newValue) {
            var i;
            if (typeof(newValue) != 'undefined') {
                value = newValue;
                for (i = 0; i < observers.length; i++) {
                    observers[i](value);
                }
                return this;
            }
            return value;
        };
        f.subscribe = function(observer) {
            observers.push(observer);
            return this;
        };
        f.unsubscribe = function(observer) {
            var index = observers.indexOf(observer);
            if (index != -1) {
                observers.splice(index, 1);
            }
            return this;
        };
        f(initialValue);
        return f;
    };
    
    just.binding = function(element, obj) {
        return new just.Binding(element, obj).bind();
    };
    
    just.Binding = function(element, obj) {
        this.bind = function() {
        	var dataKey,
        	dataValue,
        	property,
        	bindingFunction,
        	value;
        	
        	for(dataKey in element.dataset) {
        		bindingFunction = this[dataKey];
        		dataValue = element.dataset[dataKey];
        		property = obj[dataValue];
        		value = property();
        		bindingFunction(value);
        	}
        	
        	return this;
        };
        this.class = function(className) {
        	element.className = className;
        };
    }

    window.just = just;
})();
