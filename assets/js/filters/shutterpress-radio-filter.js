var ShutterpressRadioFilters = wp.media.View.extend(/** @lends wp.media.view.AttachmentFilters.prototype */{
    className: 'radio-shutterpress-filters',


    keys: [],
    checked: [],

    initialize: function () {
        this.createFilters();
        this.createChecked();
        _.extend(this.filters, this.options.filters);
        var $mainLabel = $('<span></span>', {'text': this.label, 'class': 'group-label'});
        // Build `<option>` elements.
        this.$el.html(_.chain(this.filters).map(function (filter, value) {
            var $el = $('<input />', {
                type: 'radio',
                name: filter.name,
                value: value,
                id: filter.id,
                checked: filter.checked
            });
            var t = this;
            $el.on('change', function (e) {
                t.radioChange($(this), e)
            });
            var $label = $('<label />', {for: filter.id, text: filter.text});
            var $wrapper = $('<span>', {'class': 'radio-component'}).append($el).append($label);
            return {
                el: $wrapper[0],
                priority: filter.priority || 50
            };
        }, this).sortBy('priority').pluck('el').value());
        this.$el.prepend($mainLabel);
        this.$el.wrap('<div class="' + this.className + '"></div>');
        this.controller.on('update-filters', _.bind(this.updateFilters, this));
        this.radioChange(this.$el);
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
        this.model.set(this.getValue());

    },

    getValue() {
        if (!this.checked.length) {
            return null;
        }

        var filter = this.filters[this.checked];
        if (filter) {
            return filter.props
        }
    },

    radioChange($element) {
        this.checked = $element.val();
    }
});

export default ShutterpressRadioFilters;