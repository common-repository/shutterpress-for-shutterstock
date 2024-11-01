import ShutterpressImageModel from './shutterpress-image-model';

var ShutterpressImagesModel = Backbone.Collection.extend(/** @lends wp.media.model.Attachments.prototype */{

    /**
     * @type {ShutterpressImageModel}
     */
    model: ShutterpressImageModel,
    /**
     * @param {Array} [models=[]] Array of models used to populate the collection.
     * @param {Object} [options={}]
     */
    initialize: function (models, options) {
        options = options || {};

        this.props = new Backbone.Model();

        this.filters = options.filters || {};
        this.props.on('change', _.debounce(this._changeFilteredProps,250), this);
        this.props.on('change:query', _.debounce(this._changeQuery,250), this);

        this.props.set(_.defaults(options.props || {}));

    },

    /**
     * Start mirroring another attachments collection, clearing out any models already
     * in the collection.
     *
     * @param {wp.media.model.Attachments} The attachments collection to mirror.
     * @returns {wp.media.model.Attachments} Returns itself to allow chaining
     */
    mirror: function (attachments) {
        if (this.mirroring && this.mirroring === attachments) {
            return this;
        }

        this.unmirror();
        this.mirroring = attachments;

        // Clear the collection silently. A `reset` event will be fired
        // when `observe()` calls `validateAll()`.
        this.reset([], {silent: true});
        this.observe(attachments);

        return this;
    },
    /**
     * Stop mirroring another attachments collection.
     */
    unmirror: function () {
        if (!this.mirroring) {
            return;
        }

        this.unobserve(this.mirroring);
        delete this.mirroring;
    },

    /**
     * If the `query` property is set to true, query the server using
     * the `props` values, and sync the results to this collection.
     *
     * @access private
     *
     * @param {Backbone.Model} model
     * @param {Boolean} query
     */
    _changeQuery: function (model, query) {
        if (query) {
            this.props.on('change', _.debounce(this._requery,250), this);
            this._requery();
        } else {
            this.props.off('change', this._requery, this);
        }
    },
    /**
     * @access private
     *
     * @param {Backbone.Model} model
     */
    _changeFilteredProps: function (model) {
        // If this is a query, updating the collection will be handled by
        // `this._requery()`.
        if (this.props.get('query')) {
            return;
        }

        var changed = _.chain(model.changed).map(function (t, prop) {
            var filter = ShutterpressImagesModel.filters[prop],
                term = model.get(prop);

            if (!filter) {
                return;
            }

            if (term && !this.filters[prop]) {
                this.filters[prop] = filter;
            } else if (!term && this.filters[prop] === filter) {
                delete this.filters[prop];
            } else {
                return;
            }

            // Record the change.
            return true;
        }, this).any().value();

        if (!changed) {
            return;
        }

        // If no `ShutterPressImagesModel` model is provided to source the searches
        // from, then automatically generate a source from the existing
        // models.
        if (!this._source) {
            this._source = new ShutterpressImagesModel(this.models);
        }

        this.reset(this._source.filter(this.validator, this));
    },

    /**
     * If the collection is a query, create and mirror an Attachments Query collection.
     *
     * @access private
     */
    _requery: function (refresh) {
        var props;
        if (this.props.get('query')) {
            props = this.props.toJSON();
            props.cache = (true !== refresh);
            this.mirror(ShutterpressQuery.get(props));
        }
    },

    /**
     * Retrieve more attachments from the server for the collection.
     *
     * Only works if the collection is mirroring a Query Attachments collection,
     * and forwards to its `more` method. This collection class doesn't have
     * server persistence by itself.
     *
     * @param {object} options
     * @returns {Promise}
     */
    more: function (options) {
        var deferred = jQuery.Deferred(),
            mirroring = this.mirroring,
            attachments = this;

        if (!mirroring || !mirroring.more) {
            return deferred.resolveWith(this).promise();
        }
        // If we're mirroring another collection, forward `more` to
        // the mirrored collection. Account for a race condition by
        // checking if we're still mirroring that collection when
        // the request resolves.
        mirroring.more(options).done(function () {
            if (this === attachments.mirroring) {
                deferred.resolveWith(this);
            }
        }).fail(function (message) {
            if (this === attachments.mirroring) {
                deferred.rejectWith(this, message);
            }
        })

        return deferred.promise();
    },
    /**
     * Whether there are more attachments that haven't been sync'd from the server
     * that match the collection's query.
     *
     * Only works if the collection is mirroring a Query Attachments collection,
     * and forwards to its `hasMore` method. This collection class doesn't have
     * server persistence by itself.
     *
     * @returns {boolean}
     */
    hasMore: function () {
        return this.mirroring ? this.mirroring.hasMore() : false;
    },

    validateDestroyed: false,
    /**
     * Checks whether an attachment is valid.
     *
     * @param {wp.media.model.Attachment} attachment
     * @returns {Boolean}
     */
    validator: function (attachment) {

        // Filter out contextually created attachments (e.g. headers, logos, etc.).
        if (
            !_.isUndefined(attachment.attributes.context) &&
            '' !== attachment.attributes.context
        ) {
            return false;
        }

        if (!this.validateDestroyed && attachment.destroyed) {
            return false;
        }
        return _.all(this.filters, function (filter) {
            return !!filter.call(this, attachment);
        }, this);
    },

    /**
     * Add or remove an attachment to the collection depending on its validity.
     *
     * @param {wp.media.model.Attachment} attachment
     * @param {Object} options
     * @returns {wp.media.model.Attachments} Returns itself to allow chaining
     */
    validate: function (attachment, options) {
        var valid = this.validator(attachment),
            hasAttachment = !!this.get(attachment.cid);

        if (!valid && hasAttachment) {
            this.remove(attachment, options);
        } else if (valid && !hasAttachment) {
            this.add(attachment, options);
        }

        return this;
    },

    /**
     * Add or remove all attachments from another collection depending on each one's validity.
     *
     * @param {wp.media.model.Attachments} attachments
     * @param {object} [options={}]
     *
     * @fires wp.media.model.Attachments#reset
     *
     * @returns {wp.media.model.Attachments} Returns itself to allow chaining
     */
    validateAll: function (attachments, options) {
        options = options || {};

        _.each(attachments.models, function (attachment) {
            this.validate(attachment, {silent: true});
        }, this);

        if (!options.silent) {
            this.trigger('reset', this, options);
        }
        return this;
    },
    /**
     * Start observing another attachments collection change events
     * and replicate them on this collection.
     *
     * @param {wp.media.model.Attachments} The attachments collection to observe.
     * @returns {wp.media.model.Attachments} Returns itself to allow chaining.
     */
    observe: function (attachments) {
        this.observers = this.observers || [];
        this.observers.push(attachments);

        attachments.on('add change remove', this._validateHandler, this);
        attachments.on('reset', this._validateAllHandler, this);
        this.validateAll(attachments);
        return this;
    },
    /**
     * Stop replicating collection change events from another attachments collection.
     *
     * @param {wp.media.model.Attachments} The attachments collection to stop observing.
     * @returns {wp.media.model.Attachments} Returns itself to allow chaining
     */
    unobserve: function (attachments) {
        if (attachments) {
            attachments.off(null, null, this);
            this.observers = _.without(this.observers, attachments);

        } else {
            _.each(this.observers, function (attachments) {
                attachments.off(null, null, this);
            }, this);
            delete this.observers;
        }

        return this;
    },
    /**
     * @access private
     *
     * @param {wp.media.model.Attachments} attachment
     * @param {wp.media.model.Attachments} attachments
     * @param {Object} options
     *
     * @returns {wp.media.model.Attachments} Returns itself to allow chaining
     */
    _validateHandler: function (attachment, attachments, options) {
        // If we're not mirroring this `attachments` collection,
        // only retain the `silent` option.
        options = attachments === this.mirroring ? options : {
            silent: options && options.silent
        };

        return this.validate(attachment, options);
    },
    /**
     * @access private
     *
     * @param {wp.media.model.Attachments} attachments
     * @param {Object} options
     * @returns {wp.media.model.Attachments} Returns itself to allow chaining
     */
    _validateAllHandler: function (attachments, options) {
        return this.validateAll(attachments, options);
    },


}, {
    filters: {

        search: function (attachment) {
            if (!this.props.get('search')) {
                return true;
            }
            return _.any(['description'], function (key) {
                var value = attachment.get(key);
                return value && -1 !== value.search(this.props.get('search'));
            }, this);
        },

    }
});

window.ShutterpressQuery = ShutterpressImagesModel.extend({
    /**
     * @param {array}  [models=[]]  Array of initial models to populate the collection.
     * @param {object} [options={}]
     */
    initialize: function (models, options) {
        var allowed;

        options = options || {};
        ShutterpressImagesModel.prototype.initialize.apply(this, arguments);

        this.args = options.args;
        this._hasMore = true;
        this.created = new Date();

    },

    /**
     * Whether there are more attachments that haven't been sync'd from the server
     * that match the collection's query.
     *
     * @returns {boolean}
     */
    hasMore: function () {
        return this._hasMore;
    },
    /**
     * Fetch more attachments from the server for the collection.
     *
     * @param   {object}  [options={}]
     * @returns {Promise}
     */
    more: function (options) {
        var query = this;

        // If there is already a request pending, return early with the Deferred object.
        if (this._more && 'pending' === this._more.state()) {
            return this._more;
        }

        if (!this.hasMore()) {
            return jQuery.Deferred().resolveWith(this).promise();
        }

        options = options || {};
        options.remove = false;

        return this._more = this.fetch(options).done(function (resp) {
            if (_.isEmpty(resp) || -1 === this.args.per_page || resp.length < this.args.per_page) {
                query._hasMore = false;
            }
        });
    },

    /**
     * Overrides Backbone.Collection.sync
     * Overrides wp.media.model.Attachments.sync
     *
     * @param {String} method
     * @param {Backbone.Model} model
     * @param {Object} [options={}]
     * @returns {Promise}
     */
    sync: function (method, model, options) {
        var args, fallback;

        // Overload the read method so Attachment.fetch() functions correctly.
        if ('read' === method) {
            options = options || {};
            options.context = this;
            options.data = _.extend(options.data || {}, {
                action: 'query-shutterpress',
                post_id: wp.media.model.settings.post.id
            });

            // Clone the args so manipulation is non-destructive.
            args = _.clone(this.args);

            // Determine which page to query.
            if (-1 !== args.per_page) {
                args.page = Math.round(this.length / args.per_page) + 1;
            }

            options.data.query = args;
            return wp.media.ajax(options);

            // Otherwise, fall back to Backbone.sync()
        } else {
            /**
             * Call wp.media.model.Attachments.sync or Backbone.sync
             */
            fallback = ShutterPressImagesModel.prototype.sync ? ShutterPressImagesModel.prototype : Backbone;
            return fallback.sync.apply(this, arguments);
        }
    }
}, {
    /**
     * @readonly
     */
    defaultArgs: {
        per_page: 40
    },

    defaultProps: {},
    /**
     * A map of JavaScript query properties to their Shutterpress query equivalents.
     *
     * @readonly
     */
    propmap: {
        'search': 'query',
        'perPage': 'per_page',
    },
    /**
     * Creates and returns an Attachments Query collection given the properties.
     *
     * Caches query objects and reuses where possible.
     *
     * @static
     * @method
     *
     * @param {object} [props]
     * @param {Object} [options]
     *
     * @returns {ShutterpressQuery} A new ShutterpressImagesModel Query collection.
     */
    get: (function () {
        /**
         * @static
         * @type Array
         */
        var queries = [];

        /**
         * @returns {Query}
         */
        return function (props, options) {
            var args = {},
                defaults = ShutterpressQuery.defaults,
                query,
                cache = !!props.cache || _.isUndefined(props.cache);

            // Remove the `query` property. This isn't linked to a query,
            // this *is* the query.
            delete props.query;
            delete props.cache;

            // Fill default args.
            _.defaults(props, defaults);


            _.each(['include', 'exclude'], function (prop) {
                if (props[prop] && !_.isArray(props[prop])) {
                    props[prop] = [props[prop]];
                }
            });

            // Generate the query `args` object.
            // Correct any differing property names.
            _.each(props, function (value, prop) {
                if (_.isNull(value)) {
                    return;
                }

                args[ShutterpressQuery.propmap[prop] || prop] = value;
            });

            // Fill any other default query args.
            _.defaults(args, ShutterpressQuery.defaultArgs);

            // Search the query cache for a matching query.
            if (cache) {
                query = _.find(queries, function (query) {
                    return _.isEqual(query.args, args);
                });
            } else {
                queries = [];
            }

            // Otherwise, create a new query and add it to the cache.
            if (!query) {
                query = new ShutterpressQuery([], _.extend(options || {}, {
                    props: props,
                    args: args
                }));
                queries.push(query);
            }

            return query;
        };
    }())
});

export default ShutterpressImagesModel;