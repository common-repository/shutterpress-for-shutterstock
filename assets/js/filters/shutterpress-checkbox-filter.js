var ShutterpressCheckboxFilters = wp.media.View.extend(/** @lends wp.media.view.AttachmentFilters.prototype */{
    className: 'checkbox-shutterpress-filters',


    keys: [],
    checked: [],

    initialize: function () {
        this.createFilters();
        this.createChecked();
        _.extend(this.filters, this.options.filters);
        var $mainLabel = $('<span></span>', {'text': this.label, 'class': 'group-label'});
        // Build `<option>` elements.
        this.$el.html(_.chain(this.filters).map(function (filter, value) {
            var $el = $('<input />', {type: 'checkbox', value: value, id: filter.id});
            var t = this;
            $el.on('change', function (e) {
                t.checkboxChange($(this), e)
            });
            var $label = $('<label />', {for: filter.id, text: filter.text});
            var $wrapper = $('<span>', {'class': 'checkbox-component'}).append($el).append($label);
            return {
                el: $wrapper[0],
                priority: filter.priority || 50
            };
        }, this).sortBy('priority').pluck('el').value());
        this.$el.prepend($mainLabel);
        this.$el.wrap('<div class="' + this.className + '"></div>');
        this.controller.on('update-filters', _.bind(this.updateFilters, this));
    },

    /**
     * @abstract
     */
    createFilters: function () {
        this.filters = {};
    },

    /**
     * @abstract
     */
    createChecked: function () {
        this.checked = [];
    },

    updateFilters: function () {
        this.model.set(this.name, this.getValue());

    },

    getValue() {
        if (!this.checked.length) {
            return null;
        }
        if (!this.multiple && this.checked.length > 1) {
            return this.default;
        }
        if (this.multiple) {
            return this.checked;
        }

        return this.checked[0];
    },

    checkboxChange($element) {
        var value = $element.val();
        var checked = $element.is(':checked');
        if (checked) {
            this.checked.push(value);
        } else {
            this.checked = this.checked.filter(function (val) {

                return value !== val;

            });
        }

    }
});

export default ShutterpressCheckboxFilters;