var ShutterpressFilterButton = wp.media.View.extend(/** @lends wp.media.view.Search.prototype */{
    tagName: 'a',
    className: 'shutterpress-start-filter button-primary button-large',
    defaults: {
        text: '',
        disabled: false
    },

    initialize: function () {
        /**
         * Create a model with the provided `defaults`.
         *
         * @member {Backbone.Model}
         */
        this.model = new Backbone.Model(this.defaults);

        // If any of the `options` have a key from `defaults`, apply its
        // value to the `model` and remove it from the `options object.
        _.each(this.defaults, function (def, key) {
            var value = this.options[key];
            if (_.isUndefined(value)) {
                return;
            }

            this.model.set(key, value);
            delete this.options[key];
        }, this);

        this.listenTo(this.model, 'change', this.render);
    },

    /**
     * @returns {wp.media.view.Button} Returns itself to allow chaining
     */
    render: function () {
        var classes = [this.className],
            model = this.model.toJSON();

        classes = _.uniq(classes.concat(this.options.classes));
        this.el.className = classes.join(' ');

        this.$el.attr('disabled', model.disabled);
        this.$el.text(this.model.get('text'));

        return this;
    },

    events: {
        'click': 'triggerFilter',
    },

    triggerFilter: function () {
        this.controller.trigger('update-filters', this.model, event.currentTarget);
    }
});

export default ShutterpressFilterButton;