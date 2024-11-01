var ShutterpressSelectFilters = wp.media.View.extend(/** @lends wp.media.view.AttachmentFilters.prototype */{
    tagName: 'div',
    className: 'shutterpress-select-filters',

    keys: [],

    initialize: function () {
        this.createFilters();
        _.extend(this.filters, this.options.filters);

        var $mainLabel = $('<span></span>', {'text': this.label, 'class': 'group-label'});
        var $select = $('<select />');
        // Build `<option>` elements.
        $select.html(_.chain(this.filters).map(function (filter, value) {
            return {
                el: $('<option></option>').val(value).html(filter.text)[0],
                priority: filter.priority || 50
            };
        }, this).sortBy('priority').pluck('el').value());

        this.$el.prepend($select);
        this.$el.prepend($mainLabel);
        this.controller.on('update-filters', _.bind(this.change, this));
    },

    /**
     * @abstract
     */
    createFilters: function () {
        this.filters = {};
    },

    /**
     * When the selected filter changes, update the Attachment Query properties to match.
     */
    change: function () {
        var filter = this.filters[this.getValue()];
        if (filter) {
            this.model.set(filter.props);
        }
    },

    getValue() {
        return this.$el.find('select').val();
    }

});

export default ShutterpressSelectFilters;