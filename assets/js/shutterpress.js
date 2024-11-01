import ShutterpressBrowser from './shutterpress-browser'
import ShutterpressImages from './models/shutterpress-images-model'
import ShutterpressSelection from './models/shutterpress-selection-model'
import './shutterpress-helpers'

var oldLibrary = wp.media.controller.Library;
var oldMediaFrame = wp.media.view.MediaFrame.Post;
var oldMediaFrameSelect = wp.media.view.MediaFrame.Select;

window.ShutterpressQueue = new ShutterpressImages([], {query: false});
window.ShutterpressQueueErrors = new Backbone.Collection();


// Extending the current media library frame to add a new tab
wp.media.view.MediaFrame.Post = oldMediaFrame.extend({

    /**
     * overwrite router to
     *
     * @param {wp.media.view.Router} routerView
     */
    browseRouter: function (routerView) {
        oldMediaFrame.prototype.browseRouter.apply(this, arguments);
        routerView.set({
            shutterpress: {
                text: wp.media.view.l10n.shutterpress.title,
                priority: 60
            }
        });
    },

    /**
     * Bind region mode event callbacks.
     *
     * @see media.controller.Region.render
     */
    bindHandlers: function () {
        oldMediaFrame.prototype.bindHandlers.apply(this, arguments);
        this.on('content:create:shutterpress', this.shutterpressContent, this);
    },

    /**
     * Render callback for the content region in the `browse` mode.
     *
     * @param {wp.media.controller.Region} contentRegion
     */
    shutterpressContent: function (contentRegion) {
        var state = this.state();
        if (!state.get('shutterpress-images')) {
            state.set('shutterpress-images', getShutterPressQuery());
            // Watch for downloaded images.
            state.get('library').observe(ShutterpressQueue);
        }

        if (!state.get('shutterpress-selection')) {
            var props;
            props = state.get('shutterpress-images').props.toJSON();
            props = _.omit(props, 'orderby', 'query');


            state.set('shutterpress-selection', new ShutterpressSelection(null, {
                multiple: false,
                props: props
            }));
        }

        this.$el.removeClass('hide-toolbar');

        // Browse our library of attachments.
        contentRegion.view = new ShutterpressBrowser({
            collection: state.get('shutterpress-images'),
            selection: state.get('shutterpress-selection'),
            controller: this,
            model: state,
            idealColumnWidth: state.get('idealColumnWidth'),
            suggestedWidth: state.get('suggestedWidth'),
            suggestedHeight: state.get('suggestedHeight'),
        });
    },

    getFrame(id) {
        return this.states.findWhere({id: id});
    }


});


// Order is important, post is based on the old select
wp.media.view.MediaFrame.Select = oldMediaFrameSelect.extend({

    /**
     * overwrite router to
     *
     * @param {wp.media.view.Router} routerView
     */
    browseRouter: function (routerView) {
        oldMediaFrameSelect.prototype.browseRouter.apply(this, arguments);
        routerView.set({
            shutterpress: {
                text: wp.media.view.l10n.shutterpress.title,
                priority: 60
            }
        });
    },

    /**
     * Bind region mode event callbacks.
     *
     * @see media.controller.Region.render
     */
    bindHandlers: function () {
        oldMediaFrameSelect.prototype.bindHandlers.apply(this, arguments);
        this.on('content:create:shutterpress', this.shutterpressContent, this);
    },

    /**
     * Render callback for the content region in the `browse` mode.
     *
     * @param {wp.media.controller.Region} contentRegion
     */
    shutterpressContent: function (contentRegion) {
        var state = this.state();
        if (!state.get('shutterpress-images')) {
            state.set('shutterpress-images', getShutterPressQuery());
            // Watch for downloaded images.
            state.get('library').observe(ShutterpressQueue);
        }

        if (!state.get('shutterpress-selection')) {
            var props;
            props = state.get('shutterpress-images').props.toJSON();
            props = _.omit(props, 'orderby', 'query');


            state.set('shutterpress-selection', new ShutterpressSelection(null, {
                multiple: false,
                props: props
            }));
        }

        this.$el.removeClass('hide-toolbar');

        // Browse our library of attachments.
        contentRegion.view = new ShutterpressBrowser({
            collection: state.get('shutterpress-images'),
            selection: state.get('shutterpress-selection'),
            controller: this,
            model: state,
            idealColumnWidth: state.get('idealColumnWidth'),
            suggestedWidth: state.get('suggestedWidth'),
            suggestedHeight: state.get('suggestedHeight'),
        });
    },

    getFrame(id) {
        return this.states.findWhere({id: id});
    }


});


