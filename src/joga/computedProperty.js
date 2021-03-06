define(['joga/objectProperty', 'joga/dependencyTracker'], function (objectProperty, dependencyTracker) {

    function computedPropertyFactory(initialValue) {

        function computedProperty(value) {
            return computedProperty.evaluate(value, this);
        }

        objectProperty().mixinTo(computedProperty);

        computedProperty.evaluate = evaluate;
        computedProperty.initialize = initialize;
        computedProperty.applyWrapped = applyWrapped;
        computedProperty.unbind = unbind;
        
        computedProperty.initialize(initialValue);

        return computedProperty;
    }
    
    function evaluate(newValue, self) {
        var value,
            i;
        
        this.self = self;
        
        if (newValue !== undefined) {
            this.value = newValue;
            return this.self;
        }

        for (i = 0; i < this.dependencies.length; i++) {
            this.dependencies[i].unsubscribe(this.notify);
        }

        this.dependencies = [];
        this.wrapped = null;

        dependencyTracker.push(this.subscriber);

        this.value = this.computer.apply(this.self, arguments);

        dependencyTracker.pop();

        for (i = 0; i < this.dependencies.length; i++) {
            this.dependencies[i].subscribe(this.notify);
        }

        dependencyTracker.notify(this);

        return this.value;
    }
    
    function initialize(initialValue) {
        objectProperty().initialize.call(this, null);
        this.computer = initialValue;
        this.dependencies = [];
        this.value = null;
        this.wrapped = null;

        this.notify = function () {
            var observers = this.observers.slice(0),
                i;
            for (i = 0; i < observers.length; i++) {
                observers[i](this);
            }
            return this.self;
        }.bind(this);
        
        this.subscriber = function (property) {
            if (this.dependencies.indexOf(property) === -1) {
                this.dependencies.push(property);
            }
            this.wrapped = property;
        }.bind(this);

        this.evaluate(initialValue);
    }
    
    function applyWrapped(args) {
        this.wrapped.apply(this.self, args);
        return this.self;
    }

    function unbind() {
        var i;

        for (i = 0; i < this.dependencies.length; i++) {
            this.dependencies[i].unsubscribe(this.notify);
        }

        this.value = null;
        this.wrapped = null;

        return this;
    }

    return computedPropertyFactory;
});
