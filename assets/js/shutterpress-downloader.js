import ShutterpressImageModel from "./models/shutterpress-image-model";

/** @global ShuttepressQueue */

var ShutterpressDownloader = wp.media.View.extend({
    tagName: 'div',
    className: 'shutterpress-downloader',
    template: wp.template('shutterpress-downloader'),
    file: null,
    /**
     * Bind drag'n'drop events to callbacks.
     */
    initialize: function () {
        this.options = _.defaults(this.options, {
            state: false
        });
        this.on('upload-completed', function (attachment) {

            _.each(['file', 'loaded', 'size', 'percent'], (key) => {
                this.file.attachment.unset(key);
            });

            this.file.attachment.set(_.extend(attachment, {uploading: false}));
            wp.media.model.Attachment.get(attachment.id, this.file.attachment);

            var complete = ShutterpressQueue.all(function (attachment) {
                return !attachment.get('uploading');
            });

            if (complete)
                ShutterpressQueue.reset();
        });


        this.controller.on('download-file', this.downloadTrigger, this);

        return this;
    },

    events: {
        'click .download-shutterpress-image': 'download'
    },

    prepare() {
        return {
            'download': wp.media.view.l10n.shutterpress.download
        }
    },

    download() {
        this.addFileToQueue();
    },

    downloadTrigger(model, target) {
        if (this.model === model) {
            this.addFileToQueue();
        }
    },

    openMediaTab() {
        var state = this.options.state;
        if ('shutterpress' === this.controller.content.mode()) {
            this.controller.content.mode('browse');
        }
        state.get('selection').add(this.file.attachment);
        this.controller.trigger('library:selection:add');

    },

    addFileToQueue() {
        // Generate attributes for a new `Attachment` model.
        var attributes = _.extend({
            item: this.model,
            uploading: true,
            date: new Date(),
            menuOrder: 0,
            progress: 0,
            filename: '',
            uploadedTo: wp.media.model.settings.post.id
        });

        this.file = {
            shutterpressId: this.model.id,
            attachment: new wp.media.model.Attachment(attributes)
        }
        ShutterpressQueue.add(this.file.attachment);
        this.openMediaTab();
        this.getFile();
    },


    getFile() {
        var options = options || {};
        options.context = this;
        options.data = _.extend(options.data || {}, {
            action: 'cache-shutterpress',
            media_id: this.file.shutterpressId,
            post_id: wp.media.model.settings.post.id
        });
        // try cache first
        return wp.media.ajax(options).done(function (response) {
            this.trigger('upload-completed', response)
        }).fail(function () {
            // set percent to half
            this.file.attachment.set("percent", 30);
            this.downloadFile()
        });
    },

    downloadFile() {
        var options = options || {};
        options.context = this;
        options.data = _.extend(options.data || {}, {
            action: 'download-shutterpress',
            media_id: this.file.shutterpressId,
            search: this.options.search,
            post_id: wp.media.model.settings.post.id,
            description: this.model.get('description')
        });
        var t = this;
        var loading = setInterval(() => {
            t.incrementPercent();
        }, 1000);
        wp.media.ajax(options).done(function (response) {
            clearInterval(loading);
            this.trigger('upload-completed', response)
        }).fail(function (response) {
            clearInterval(loading);
            this.error(response.message, null, this.file);
        });

    },

    incrementPercent() {
        if (this.file.attachment.get('percent') < 99) {
            this.file.attachment.set({
                percent: this.file.attachment.get('percent') + 4
            })
        }
    },

    /**
     * Custom error callback.
     *
     * Add a new error to the errors collection, so other modules can track
     * and display errors. @see wp.Uploader.errors.
     *
     * @param  {string}        message
     * @param  {object}        data
     * @param  {plupload.File} file     File that was uploaded.
     */
    error(message, data, file) {
        if (file.attachment) {
            file.attachment.destroy();
        }

        wp.Uploader.errors.unshift({
            message: message || pluploadL10n.default_error,
            data: data,
            file: file
        });

    }


});

export default ShutterpressDownloader;