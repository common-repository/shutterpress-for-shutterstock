var ShutterpressEmpty = wp.media.View.extend(/** @lends wp.media.view.Toolbar.prototype */{
    tagName: 'div',
    className: 'shutterpress-empty',
    template: wp.template('shutterpress-empty'),

    events: {
        'click .retry': 'retry'
    },

    defaults: {
        message: '',
        link: false,
        retry: true,
    },

    initialize: function () {
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

    prepare() {
        return this.model.toJSON()
    },


    retry() {
        this.options.browser.updateContent();
    },

    show() {
        this.$el.removeClass('hidden');
    },
    hide() {
        this.$el.addClass('hidden');
    }


});

export default ShutterpressEmpty;