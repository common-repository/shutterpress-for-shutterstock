var ShutterpressImageModel = Backbone.Model.extend(/** @lends wp.media.model.Attachment.prototype */{
    /**
     * Triggered when attachment details change
     * Overrides Backbone.Model.sync
     *
     * @param {string} method
     * @param {wp.media.model.Attachment} model
     * @param {Object} [options={}]
     *
     * @returns {Promise}
     */
    sync: function (method, model, options) {
        // If the attachment does not yet have an `id`, return an instantly
        // rejected promise. Otherwise, all of our requests will fail.
        if (_.isUndefined(this.id)) {
            return $.Deferred().rejectWith(this).promise();
        }

        // Overload the `read` request so Attachment.fetch() functions correctly.
        if ('read' === method) {
            options = options || {};
            options.context = this;
            options.data = _.extend(options.data || {}, {
                action: 'get-shutterpress-image',
                id: this.id
            });
            return wp.media.ajax(options);

            // Overload the `update` request so properties can be saved.
        }else if ( 'update' === method ) {
            // If we do not have the necessary nonce, fail immeditately.
            if ( ! this.get('nonces') || ! this.get('nonces').update ) {
                return $.Deferred().rejectWith( this ).promise();
            }

            options = options || {};
            options.context = this;

            // Set the action and ID.
            options.data = _.extend( options.data || {}, {
                action:  'save-attachment',
                id:      this.id,
                nonce:   this.get('nonces').update,
                post_id: wp.media.model.settings.post.id
            });

            // Record the values of the changed attributes.
            if ( model.hasChanged() ) {
                options.data.changes = {};

                _.each( model.changed, function( value, key ) {
                    options.data.changes[ key ] = this.get( key );
                }, this );
            }

            return wp.media.ajax( options );

            // Overload the `delete` request so attachments can be removed.
            // This will permanently delete an attachment.
        } else {
            /**
             * Call `sync` directly on Backbone.Model
             */
            return Backbone.Model.prototype.sync.apply(this, arguments);
        }
    },

    progress: function() {
        if ( this.$bar && this.$bar.length ) {
            this.$bar.width( this.model.get('percent') + '%' );
        }
    },

}, {
    /**
     * Create a new model on the static 'all' attachments collection and return it.
     *
     * @static
     *
     * @param {Object} attrs
     * @returns {ShutterpressImageModel}
     */
    create: function (attrs) {
        var Images = ShutterpressImageModel;
        return Images.all.push(attrs);
    },
    /**
     * Create a new model on the static 'all' attachments collection and return it.
     *
     * If this function has already been called for the id,
     * it returns the specified attachment.
     *
     * @static
     * @param {string} id A string used to identify a model.
     * @param {Backbone.Model|undefined} attachment
     * @returns {ShutterpressImageModel}
     */
    get: _.memoize(function (id, attachment) {
        var Images = ShutterpressImageModel;
        return Images.all.push(attachment || {id: id});
    })
});

export default ShutterpressImageModel