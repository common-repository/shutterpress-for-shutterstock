import ShutterpressImagesModel from './shutterpress-images-model';


var ShutterpressSelection = ShutterpressImagesModel.extend({
    /**
     * Refresh the `single` model whenever the selection changes.
     * Binds `single` instead of using the context argument to ensure
     * it receives no parameters.
     *
     * @param {Array} [models=[]] Array of models used to populate the collection.
     * @param {Object} [options={}]
     */
    initialize: function (models, options) {
        /**
         * call 'initialize' directly on the parent class
         */
        ShutterpressImagesModel.prototype.initialize.apply(this, arguments);
        this.multiple = options && options.multiple;

        this.on('add remove reset', _.bind(this.single, this, false));
    },

    /**
     * If the workflow does not support multi-select, clear out the selection
     * before adding a new attachment to it.
     *
     * @param {Array} models
     * @param {Object} options
     * @returns {ShutterPressImagesModel[]}
     */
    add: function (models, options) {
        if (!this.multiple) {
            this.remove(this.models);
        }
        /**
         * call 'add' directly on the parent class
         */
        return ShutterpressImagesModel.prototype.add.call(this, models, options);
    },

    /**
     * Fired when toggling (clicking on) an attachment in the modal.
     *
     * @param {undefined|boolean|ShutterPressImagesModel} model
     *
     * @fires ShutterpressSelection#selection:single
     * @fires ShutterpressSelection#selection:unsingle
     *
     * @returns {Backbone.Model}
     */
    single: function (model) {
        var previous = this._single;

        // If a `model` is provided, use it as the single model.
        if (model) {
            this._single = model;
        }
        // If the single model isn't in the selection, remove it.
        if (this._single && !this.get(this._single.cid)) {
            delete this._single;
        }

        this._single = this._single || this.last();

        // If single has changed, fire an event.
        if (this._single !== previous) {
            if (previous) {
                previous.trigger('selection:unsingle', previous, this);

                // If the model was already removed, trigger the collection
                // event manually.
                if (!this.get(previous.cid)) {
                    this.trigger('selection:unsingle', previous, this);
                }
            }
            if (this._single) {
                this._single.trigger('selection:single', this._single, this);
            }
        }

        // Return the single model, or the last model as a fallback.
        return this._single;
    }
});


export default ShutterpressSelection;