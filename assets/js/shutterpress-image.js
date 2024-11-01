var ShutterpressImage = wp.media.View.extend({
    tagName: 'li',
    className: 'attachment',
    template: wp.template('shutterpress-attachment'),
    events: {
        'click': 'toggleSelectionHandler',
        'keydown': 'toggleSelectionHandler',
        'click .check': 'checkClickHandler',
        'click .download': 'downloadClickHandler',
    },
    buttons: {
        check: true
    },

    initialize: function () {
        var selection = this.options.selection,
            options = _.defaults(this.options, {
                rerenderOnModelChange: true
            });

        this.listenTo(this.model, 'change', this.render);

        // Update the selection.
        this.listenTo(this.model, 'add', this.select);
        this.listenTo(this.model, 'remove', this.deselect);
        if (selection) {
            selection.on('reset', this.updateSelect, this);
            // Update the model's details view.
            this.listenTo(this.model, 'selection:single selection:unsingle', this.details);
            this.details(this.model, this.controller.state().get('selection'));
        }


    },

    /**
     * @returns {ShutterpressImage} Returns itself to allow chaining
     */
    dispose: function () {
        var selection = this.options.selection;

        if (selection) {
            selection.off(null, null, this);
        }
        /**
         * call 'dispose' directly on the parent class
         */
        wp.media.View.prototype.dispose.apply(this, arguments);
        return this;
    },
    /**
     * @returns {ShutterpressImage} Returns itself to allow chaining
     */
    render: function () {
        var options = _.defaults(this.model.toJSON(), {
            orientation: 'landscape',
            type: 'image',
            subtype: '',
            width: '',
            height: '',
            description: ''
        }, this.options);

        options.buttons = this.buttons;

        if ('image' === options.type) {
            options.size = this.imageSize();
        }

        this.views.detach();
        this.$el.html(this.template(options));

        // Check if the model is selected.
        this.updateSelect();

        this.views.render();

        return this;
    },

    /**
     * @param {Object} event
     */
    toggleSelectionHandler: function (event) {
        var method;

        // Don't do anything inside inputs and on the attachment check and remove buttons.
        if ('INPUT' === event.target.nodeName || 'BUTTON' === event.target.nodeName) {
            return;
        }

        // Catch arrow events
        if (37 === event.keyCode || 38 === event.keyCode || 39 === event.keyCode || 40 === event.keyCode) {
            this.controller.trigger('attachment:keydown:arrow', event);
            return;
        }

        // Catch enter and space events
        if ('keydown' === event.type && 13 !== event.keyCode && 32 !== event.keyCode) {
            return;
        }

        event.preventDefault();

        // In the grid view, bubble up an edit:attachment event to the controller.
        if (this.controller.isModeActive('grid')) {
            if (this.controller.isModeActive('edit')) {
                // Pass the current target to restore focus when closing
                this.controller.trigger('edit:attachment', this.model, event.currentTarget);
                return;
            }

            if (this.controller.isModeActive('select')) {
                method = 'toggle';
            }
        }

        if (event.shiftKey) {
            method = 'between';
        } else if (event.ctrlKey || event.metaKey) {
            method = 'toggle';
        }

        this.toggleSelection({
            method: method
        });

        this.controller.trigger('selection:toggle');
    },
    /**
     * @param {Object} options
     */
    toggleSelection: function (options) {
        var collection = this.collection,
            selection = this.options.selection,
            model = this.model,
            method = options && options.method,
            single, models, singleIndex, modelIndex;

        if (!selection) {
            return;
        }

        single = selection.single();
        method = _.isUndefined(method) ? selection.multiple : method;

        // If the `method` is set to `between`, select all models that
        // exist between the current and the selected model.
        if ('between' === method && single && selection.multiple) {
            // If the models are the same, short-circuit.
            if (single === model) {
                return;
            }

            singleIndex = collection.indexOf(single);
            modelIndex = collection.indexOf(this.model);

            if (singleIndex < modelIndex) {
                models = collection.models.slice(singleIndex, modelIndex + 1);
            } else {
                models = collection.models.slice(modelIndex, singleIndex + 1);
            }

            selection.add(models);
            selection.single(model);
            return;

            // If the `method` is set to `toggle`, just flip the selection
            // status, regardless of whether the model is the single model.
        } else if ('toggle' === method) {
            selection[this.selected() ? 'remove' : 'add'](model);
            selection.single(model);
            return;
        } else if ('add' === method) {
            selection.add(model);
            selection.single(model);
            return;
        }

        // Fixes bug that loses focus when selecting a featured image
        if (!method) {
            method = 'add';
        }

        if (method !== 'add') {
            method = 'reset';
        }

        if (this.selected()) {
            // If the model is the single model, remove it.
            // If it is not the same as the single model,
            // it now becomes the single model.
            selection[single === model ? 'remove' : 'single'](model);
        } else {
            // If the model is not selected, run the `method` on the
            // selection. By default, we `reset` the selection, but the
            // `method` can be set to `add` the model to the selection.
            selection[method](model);
            selection.single(model);
        }
    },

    updateSelect: function () {
        this[this.selected() ? 'select' : 'deselect']();
    },
    /**
     * @returns {unresolved|Boolean}
     */
    selected: function () {
        var selection = this.options.selection;
        if (selection) {
            return !!selection.get(this.model.cid);
        }
    },
    /**
     * @param {Backbone.Model} model
     * @param {Backbone.Collection} collection
     */
    select: function (model, collection) {
        var selection = this.options.selection,
            controller = this.controller;

        // Check if a selection exists and if it's the collection provided.
        // If they're not the same collection, bail; we're in another
        // selection's event loop.
        if (!selection || (collection && collection !== selection)) {
            return;
        }

        // Bail if the model is already selected.
        if (this.$el.hasClass('selected')) {
            // call download function
            return;
        }

        // Add 'selected' class to model, set aria-checked to true.
        this.$el.addClass('selected').attr('aria-checked', true);
        //  Make the checkbox tabable, except in media grid (bulk select mode).
        if (!(controller.isModeActive('grid') && controller.isModeActive('select'))) {
            this.$('.check').attr('tabindex', '0');
        }
    },
    /**
     * @param {Backbone.Model} model
     * @param {Backbone.Collection} collection
     */
    deselect: function (model, collection) {
        var selection = this.options.selection;

        // Check if a selection exists and if it's the collection provided.
        // If they're not the same collection, bail; we're in another
        // selection's event loop.
        if (!selection || (collection && collection !== selection)) {
            return;
        }
        this.$el.removeClass('selected').attr('aria-checked', false)
            .find('.check').attr('tabindex', '-1');
    },
    /**
     * @param {Backbone.Model} model
     * @param {Backbone.Collection} collection
     */
    details: function (model, collection) {
        var selection = this.options.selection,
            details;

        if (selection !== collection) {
            return;
        }

        details = selection.single();
        this.$el.toggleClass('details', details === this.model);
    },
    /**
     * @param {string} size
     * @returns {Object}
     */
    imageSize: function (size) {
        var sizes = this.model.get('sizes'), matched = false;

        size = size || 'medium';

        // Use the provided image size if possible.
        if (sizes) {
            if (sizes[size]) {
                matched = sizes[size];
            } else if (sizes.large) {
                matched = sizes.large;
            } else if (sizes.thumbnail) {
                matched = sizes.thumbnail;
            } else if (sizes.full) {
                matched = sizes.full;
            }

            if (matched) {
                return _.clone(matched);
            }
        }

        return {
            url: this.model.get('url'),
            width: this.model.get('width'),
            height: this.model.get('height'),
            orientation: this.model.get('orientation')
        };
    },


    /**
     * Add the model if it isn't in the selection, if it is in the selection,
     * remove it.
     *
     * @param  {[type]} event [description]
     * @return {[type]}       [description]
     */
    checkClickHandler: function (event) {
        var selection = this.options.selection;
        if (!selection) {
            return;
        }
        event.stopPropagation();
        if (selection.where({id: this.model.get('id')}).length) {
            selection.remove(this.model);
            // Move focus back to the attachment tile (from the check).
            this.$el.focus();
        } else {
            selection.add(this.model);
        }
    },

    /**
     * Add the model if it isn't in the selection, if it is in the selection,
     * remove it.
     *
     * @param  {[type]} event [description]
     * @return {[type]}       [description]
     */
    downloadClickHandler: function (event) {
        this.controller.trigger('download-file', this.model, event.currentTarget);
    }

});

export default ShutterpressImage;