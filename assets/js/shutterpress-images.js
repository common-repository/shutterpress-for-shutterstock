import ShutterpressImage from './shutterpress-image'

var ShutterpressImages = wp.media.View.extend({
    tagName: 'ul',
    className: 'attachments',

    attributes: {
        tabIndex: -1
    },

    initialize: function () {
        this.el.id = _.uniqueId('__shutterpress-images-view-');

        _.defaults(this.options, {
            sortable: false,
            refreshSensitivity: wp.media.isTouchDevice ? 300 : 200,
            refreshThreshold: 3,
            resize: true,
            idealColumnWidth: $(window).width() < 640 ? 135 : 150
        });

        this._viewsByCid = {};
        this.$window = $(window);
        this.resizeEvent = 'resize.media-modal-columns';

        this.collection.on('add', function (attachment) {
            this.views.add(this.createAttachmentView(attachment), {
                at: this.collection.indexOf(attachment)
            });
        }, this);

        this.collection.on('remove', function (attachment) {
            var view = this._viewsByCid[attachment.cid];
            delete this._viewsByCid[attachment.cid];

            if (view) {
                view.remove();
            }
        }, this);

        this.collection.on('reset', this.render, this);
        // Throttle the scroll handler and bind this.
        this.scroll = _.chain(this.scroll).bind(this).throttle(this.options.refreshSensitivity).value();

        this.options.scrollElement = this.options.scrollElement || this.el;
        $(this.options.scrollElement).on('scroll', this.scroll);

        _.bindAll(this, 'setColumns');

        if (this.options.resize) {
            this.on('ready', this.bindEvents);
            this.controller.on('open', this.setColumns);

            // Call this.setColumns() after this view has been rendered in the DOM so
            // attachments get proper width applied.
            _.defer(this.setColumns, this);
        }
    },

    /**
     * @param {ShutterpressImage} attachment
     * @returns {wp.media.View}
     */
    createAttachmentView: function (attachment) {
        var view = new ShutterpressImage({
            model: attachment,
            collection: this.collection,
            selection: this.options.selection,
            controller: this.controller
        });

        return this._viewsByCid[attachment.cid] = view;
    },

    bindEvents: function () {
        this.$window.off(this.resizeEvent).on(this.resizeEvent, _.debounce(this.setColumns, 50));
    },

    prepare: function () {
        // Create all of the Attachment views, and replace
        // the list in a single DOM operation.
        if (this.collection.length) {
            this.views.set(this.collection.map(this.createAttachmentView, this));

            // If there are no elements, clear the views and load some.
        } else {
            this.views.unset();
            this.collection.more();
        }
    },

    scroll: function () {
        var view = this,
            el = this.options.scrollElement,
            scrollTop = el.scrollTop,
            toolbar;

        // The scroll event occurs on the document, but the element
        // that should be checked is the document body.
        if (el === document) {
            el = document.body;
            scrollTop = $(document).scrollTop();
        }

        if (!$(el).is(':visible') || !this.collection.hasMore()) {
            return;
        }

        toolbar = this.views.parent.toolbar;

        // Show the spinner only if we are close to the bottom.
        if (el.scrollHeight - (scrollTop + el.clientHeight) < el.clientHeight / 3) {
            toolbar.get('spinner').show();
        }

        if (el.scrollHeight < scrollTop + (el.clientHeight * this.options.refreshThreshold)) {
            this.collection.more().done(function () {
                view.scroll();
                toolbar.get('spinner').hide();
            });
        }
    },

    setColumns: function () {
        var prev = this.columns,
            width = this.$el.width();

        if (width) {
            this.columns = Math.min(Math.round(width / this.options.idealColumnWidth), 12) || 1;

            if (!prev || prev !== this.columns) {
                this.$el.closest('.media-frame-content').attr('data-columns', this.columns);
            }
        }
    },

    show() {
        this.$el.removeClass('hidden');
    },
    hide() {
        this.$el.addClass('hidden');
    }

});

export default ShutterpressImages;