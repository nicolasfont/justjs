(function() {
    var joga = {};

    function DependencyTracker() {
        var observers = [];

        this.subscribe = function(observer) {
            observers.push(observer);
            return this;
        };

        this.unsubscribe = function(observer) {
            var index = observers.indexOf(observer);
            if (index !== -1) {
                observers.splice(index, 1);
            }
            return this;
        };

        this.notify = function(changedProperty) {
            var i;
            for (i = 0; i < observers.length; i++) {
                observers[i](changedProperty);
            }
            return this;
        };
    }
    joga.dependencyTracker = new DependencyTracker();

    function objectProperty(initialValue) {
        var value = null,
            observers = [];

        function objectProperty(newValue) {
            if (newValue === undefined) {
                joga.dependencyTracker.notify(objectProperty);
                return value;
            }
            value = newValue;
            objectProperty.notify();
            return this;
        }

        objectProperty.subscribe = function(observer) {
            observers.push(observer);
            return this;
        };

        objectProperty.unsubscribe = function(observer) {
            var index = observers.indexOf(observer);
            if (index !== -1) {
                observers.splice(index, 1);
            }
            return this;
        };

        objectProperty.notify = function() {
            var i;
            for (i = 0; i < observers.length; i++) {
                observers[i](objectProperty);
            }
            return this;
        };

        objectProperty(initialValue);

        return objectProperty;
    }
    joga.property = objectProperty;

    function computedProperty(f) {
        var observers = [],
            dependencies = [],
            wrapped;

        function computedProperty(newValue) {
            var value,
                i,
                subscriber = function(property) {
                    if (dependencies.indexOf(property) === -1) {
                        dependencies.push(property);
                    }
                };

            if(newValue !== undefined && wrapped) {
                wrapped(newValue);
                return this;
            }

            for (i = 0; i < dependencies.length; i++) {
                dependencies[i].unsubscribe(computedProperty.notify);
            }

            dependencies = [];
            wrapped = null;

            joga.dependencyTracker.subscribe(subscriber);

            value = f();

            joga.dependencyTracker.unsubscribe(subscriber);

            if (typeof value === "function" && value.subscribe && value.unsubscribe) {
                wrapped = value;
                value = wrapped();
                subscriber(wrapped);
            }

            for (i = 0; i < dependencies.length; i++) {
                dependencies[i].subscribe(computedProperty.notify);
            }

            return value;
        }

        computedProperty.subscribe = function(observer) {
            observers.push(observer);
            return this;
        };

        computedProperty.unsubscribe = function(observer) {
            var index = observers.indexOf(observer);
            if (index !== -1) {
                observers.splice(index, 1);
            }
            return this;
        };

        computedProperty.notify = function() {
            var i;
            computedProperty();
            for (i = 0; i < observers.length; i++) {
                observers[i](computedProperty);
            }
            return this;
        };

        computedProperty();

        return computedProperty;
    }
    joga.computedProperty = computedProperty;

    function ElementBinding(element, obj) {
        var dataKey,
            bindingFunction,
            dataValue,
            property,
            i,
            child;

        this.el = element;
        this.obj = obj;

        for (dataKey in element.dataset) {
            bindingFunction = this[dataKey],
            dataValue = element.dataset[dataKey],
            property = joga.computedProperty(new Function("return " + dataValue).bind(obj));

            bindingFunction = bindingFunction.bind(this);
            bindingFunction(property);
            property.subscribe(bindingFunction);
        }
        
        for (i = 0; i < element.childNodes.length; i++) {
            child = element.childNodes[i];
            child.binding = new ElementBinding(child, obj);
        }
    }
    
    ElementBinding.prototype.id = function(id) {
        this.el.id = id();
    };

    ElementBinding.prototype.class = function(property) {
        if (this.lastClassName) {
            this.el.classList.remove(this.lastClassName);
        }
        this.lastClassName = property();
        this.el.classList.add(this.lastClassName);
    };

    ElementBinding.prototype.title = function(property) {
        this.el.title = property();
    };

    ElementBinding.prototype.text = function(property) {
        var i,
            childNodes = [];

        for (i = 0; i < this.el.childNodes.length; i++) {
            childNodes.push(this.el.childNodes[i]);
        }

        for (i = 0; i < childNodes.length; i++) {
            this.el.removeChild(childNodes[i]);
        }

        this.el.appendChild(document.createTextNode(property()));
    };

    ElementBinding.prototype.onclick = function(property) {
        this.el.onclick = function(e) {
            property().call(this.obj, e);
        }.bind(this);
    };

    ElementBinding.prototype.element = function(property) {
        var i,
            childNodes = [];

        for (i = 0; i < this.el.childNodes.length; i++) {
            childNodes.push(this.el.childNodes[i]);
        }

        for (i = 0; i < childNodes.length; i++) {
            this.el.removeChild(childNodes[i]);
        }

        this.el.appendChild(property());
    };

    ElementBinding.prototype.value = function(property) {
        this.el.value = property();

        this.el.onchange = function() {
            property(this.el.value);
        }.bind(this);
    };

    joga.ElementBinding = ElementBinding;
    
    function element(el, obj) {
        var element = el,
            div;

        if (!(el instanceof HTMLElement)) {
            div = document.createElement("div");
            div.innerHTML = el;
            element = div.firstChild;
        }

        element.binding = new ElementBinding(element, obj);

        return element;
    }
    joga.element = element;

    window.joga = joga;
})();