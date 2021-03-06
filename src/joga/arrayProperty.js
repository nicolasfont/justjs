define(['joga/objectProperty'], function (objectProperty) {
    
    function arrayPropertyFactory(initialValue) {

        function arrayProperty(value) {
            return arrayProperty.evaluate(value, this);
        }

        objectProperty().mixinTo(arrayProperty);

        arrayProperty.push = push;
        arrayProperty.pop = pop;
        arrayProperty.remove = remove;
        arrayProperty.clear = clear;
        arrayProperty.shift = shift;
        arrayProperty.unshift = unshift;
        arrayProperty.reverse = reverse;
        arrayProperty.sort = sort;
        arrayProperty.forEach = forEach;

        arrayProperty.initialize(initialValue);

        return arrayProperty;
    }

    function push(value) {
        this.value.push(value);
        this.notify();
        return this;
    }

    function pop() {
        var popped = this.value.pop();
        this.notify();
        return popped;
    }

    function remove(value) {
        var index = this.value.indexOf(value);
        while (index !== -1) {
            this.value.splice(index, 1);
            index = this.value.indexOf(value);
        }
        this.notify();
        return this;
    }

    function clear() {
        this.applySelf([[]]);
        this.notify();
        return this;
    }

    function shift() {
        var shifted = this.applySelf().shift();
        this.notify();
        return shifted;
    }

    function unshift(value) {
        this.applySelf().unshift(value);
        this.notify();
        return this;
    }

    function reverse() {
        this.applySelf().reverse();
        this.notify();
        return this;
    }

    function sort(comparator) {
        this.applySelf().sort(comparator);
        this.notify();
        return this;
    }

    function forEach(iterator) {
        var i;
        if (this.applySelf().forEach) {
            this.value.forEach(iterator.bind(this.self));
        } else {
            for (i = 0; i < this.value.length; i++) {
                iterator.call(this.self, this.value[i], i);
            }
        }
        return this;
    }

    return arrayPropertyFactory;
});