(function() {
    var just = {};

    just.property = function(initialValue) {
        var value = null,
        observers = [],
        f = function(newValue) {
            var i, previousValue;
            if (typeof(newValue) != 'undefined') {
                previousValue = value;
                value = newValue;
                for (i = 0; i < observers.length; i++) {
                    observers[i](value, previousValue);
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
        	self = this;
        	
        	for(dataKey in element.dataset) {
        		(function(dataKey){
        			var bindingFunction = self[dataKey],
            		dataValue = element.dataset[dataKey],
            		property = obj[dataValue];
        			
            		bindingFunction(property());
            		property.subscribe(bindingFunction);
        		})(dataKey);
        	}
        	
        	return this;
        };
        this.class = function(className, lastClassName) {
            if (lastClassName) {
                element.classList.remove(lastClassName);
            }
            element.classList.add(className);
        };
        this.title = function(title) {
        	element.title = title;
        }
    }

    window.just = just;
})();
