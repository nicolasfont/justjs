define(['joga/bindings/ElementBinding', 'joga/computedProperty'], function (ElementBinding, computedProperty) {

    function HTMLSelectElementBinding(element, model) {
        ElementBinding.call(this, element, model);
    }

    HTMLSelectElementBinding.prototype = new ElementBinding();

    var foreach = function () {
        if (this.foreach.dataExpression) {

            var selected = computedProperty(function () {
                if (this.selected.dataExpression) {
                    return this.selected.dataExpression.apply(this.model);
                }
                return this.foreach.options[0];
            }.bind(this));

            var computed = computedProperty(function () {
                var models = this.foreach.dataExpression.apply(this.model),
                    option,
                    i;

                this.foreach.options = [];

                for (i = 0; i < models.length; i++) {
                    option = document.createElement('option');

                    if (this.text.dataExpression) {
                        option.text = this.text.dataExpression.apply(models[i]);
                    } else {
                        option.text = String(models[i]);
                    }

                    option.selected = selected.apply(this.model) === models[i];

                    if (selected.apply(this.model) === models[i]) {
                        if (this.value.dataExpression) {
                            selected.applyWrapped([this.value.dataExpression.apply(models[i])]);
                        } else {
                            selected.applyWrapped([models[i]]);
                        }
                    }

                    this.foreach.options.push(option);
                }

                return this.foreach.options;
            }.bind(this));

            this.foreach.update = function () {
                var i,
                    nodes = computed();
                ElementBinding.removeChildNodes(this.element);
                for (i = 0; i < nodes.length; i++) {
                    this.element.appendChild(nodes[i]);
                }
                this.element.onchange = function () {
                    if (this.selected.dataExpression) {
                        var models = this.foreach.dataExpression.apply(this.model);
                        if (this.value.dataExpression) {
                            selected.applyWrapped([this.value.dataExpression.apply(models[this.element.selectedIndex])]);
                        } else {
                            selected.applyWrapped([models[this.element.selectedIndex]]);
                        }
                    }
                }.bind(this);
            }.bind(this);

            this.foreach.update();

            computed.subscribe(this.foreach.update);
        }
    };

    HTMLSelectElementBinding.prototype.foreach = function (dataExpression) {
        this.foreach.dataExpression = dataExpression;
        foreach.apply(this);
    };

    HTMLSelectElementBinding.prototype.text = function (dataExpression) {
        this.text.dataExpression = dataExpression;
        foreach.apply(this);
    };

    HTMLSelectElementBinding.prototype.value = function (dataExpression) {
        this.value.dataExpression = dataExpression;
        foreach.apply(this);
    };

    HTMLSelectElementBinding.prototype.selected = function (dataExpression) {
        this.selected.dataExpression = dataExpression;
        foreach.apply(this);
    };

    return HTMLSelectElementBinding;
});
