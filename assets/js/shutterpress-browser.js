import ShutterpressImages from './shutterpress-images'
import ShutterpressToolbar from './shutterpress-toolbar'
import ShutterpressSearch from './filters/shutterpress-search'
import ShutterpressDetails from './shutterpress-details'
import ShutterpressSidebar from './shutterpress-sidebar'
import ShutterpressEmpty from './shutterpress-empty'
import ShutterpressGenderFilter from './filters/shutterpress-gender'
import ShutterpressDownloader from './shutterpress-downloader';
import ShutterpressAdvancedLink from "./filters/shutterpress-advanced-trigger";
import ShutterpressAdvancedFilters from "./filters/shutterpress-advanced-filters";
import ShutterpressAdvanced from "./filters/shutterpress-advanced";
import ShutterpressFilterButton from "./filters/shutterpress-filter-button";
import ShutterpressOrientationFilter from "./filters/shutterpress-orientations";
import ShutterpressImageTypeFilter from "./filters/shutterpress-image-type";
import ShutterpressCategoryFilters from "./filters/shutterpress-category";
import ShutterpressSafeFilters from "./filters/shutterpress-safe";
import ShutterpressColorFilter from "./filters/shutterpress-color";
import ShutterpressFilterClose from "./filters/shutterpress-filter-close";

var ShutterpressBrowser = wp.media.View.extend(/** @lends wp.media.view.AttachmentsBrowser.prototype */{
    tagName: 'div',
    className: 'shutterpress-browser attachments-browser',

    initialize: function () {
        _.defaults(this.options, {
            search: true,
        });


        this.createToolbar();
        this.createSidebar();
        this.createStatus();

        // Create the list of images.
        this.createImages();


        this.updateContent();

        this.collection.on('add remove reset', this.updateContent, this);
    },

    /**
     * @returns {ShutterpressBrowser} Returns itself to allow chaining
     */
    dispose: function () {
        this.options.selection.off(null, null, this);
        wp.media.View.prototype.dispose.apply(this, arguments);
        return this;
    },

    createImages() {
        this.images = new ShutterpressImages({
            controller: this.controller,
            collection: this.collection,
            selection: this.options.selection,
            scrollElement: this.options.scrollElement,
            idealColumnWidth: this.options.idealColumnWidth,
        });

        this.views.add(this.images);
        this.images.hide();
    },

    createSidebar: function () {
        var options = this.options,
            selection = options.selection,
            sidebar = this.sidebar = new ShutterpressSidebar({
                controller: this.controller
            });

        this.views.add(sidebar);


        selection.on('selection:single', this.createSingle, this);
        selection.on('selection:unsingle', this.disposeSingle, this);

        if (selection.single()) {
            this.createSingle();
        }
    },

    createSingle: function () {
        var sidebar = this.sidebar,
            single = this.options.selection.single();

        sidebar.set('details', new ShutterpressDetails({
            controller: this.controller,
            model: single,
            priority: 80
        }));

        sidebar.set('downloader', new ShutterpressDownloader({
            controller: this.controller,
            model: single,
            state: this.model,
            search: this.collection.props.get('search'),
            priority: 90
        }));

        // Show the sidebar on mobile
        if (this.model.id === 'insert') {
            sidebar.$el.addClass('visible');
        }
    },

    disposeSingle: function () {
        var sidebar = this.sidebar;
        sidebar.unset('details');
        sidebar.unset('downloader');
        // Hide the sidebar on mobile
        sidebar.$el.removeClass('visible');
    },

    updateContent: function () {
        var view = this,
            noItemsView;

        noItemsView = view.status;

        noItemsView.hide();
        if (!this.collection.length) {
            this.startLoading();
            this.clearErrors();
            this.dfd = this.collection.more().done(function () {
                if (!view.collection.length) {
                    noItemsView.show()
                } else {
                    noItemsView.hide()
                }
                view.stopLoading()
            }).fail(
                function (message) {
                    noItemsView.show();
                    view.displayError(message);

                    view.stopLoading();
                }
            );
        } else {
            view.images.show();
            noItemsView.hide();
            this.stopLoading();
        }
    },

    createToolbar: function () {
        var toolbarOptions;

        toolbarOptions = {
            controller: this.controller,
        };

        if (this.controller.isModeActive('grid')) {
            toolbarOptions.className = 'media-toolbar wp-filter';
        }

        /**
         * @member {ShutterpressToolbar}
         */
        this.toolbar = new ShutterpressToolbar(toolbarOptions);

        this.views.add(this.toolbar);

        this.advancedFilters = new ShutterpressAdvanced({
            controller: this.controller,
            priority: 50
        });
        this.toolbar.set('advanced-filters', this.advancedFilters);

        this.toolbar.set('spinner', new wp.media.view.Spinner({
            priority: -60
        }));
        this.addToolbarFilters();

    },

    addToolbarFilters() {

        // Search is an input, screen reader text needs to be rendered before
        this.toolbar.set('searchLabel', new wp.media.view.Label({
            value: wp.media.view.l10n.shutterpress.search,
            attributes: {
                'for': 'media-search-input'
            },
            priority: 60
        }).render());
        this.toolbar.set('search', new ShutterpressSearch({
            controller: this.controller,
            model: this.collection.props,
            priority: 60
        }).render());

        this.advancedFilters.set('advanced-link', new ShutterpressAdvancedLink({
            controller: this.controller,
            model: this.collection.props,
            text: wp.media.view.l10n.shutterpress.advanced,
            priority: -10
        }).render());

        this.filtersContainer = new ShutterpressAdvancedFilters({
            controller: this.controller,
            model: this.collection.props,
            priority: 10
        });
        this.advancedFilters.set('filters-container', this.filtersContainer).render();

        var ImageTypeFilter = new ShutterpressImageTypeFilter({
            controller: this.controller,
            model: this.collection.props,
            priority: -100
        });
        this.filtersContainer.set('image-type-filter', ImageTypeFilter.render());

        var CategoryFilter = new ShutterpressCategoryFilters({
            controller: this.controller,
            model: this.collection.props,
            priority: -95
        });
        this.filtersContainer.set('category-filter', CategoryFilter.render());

        var GenderFilters = new ShutterpressGenderFilter({
            controller: this.controller,
            model: this.collection.props,
            priority: -90
        });
        this.filtersContainer.set('gender-filter', GenderFilters.render());

        var SafeFilter = new ShutterpressSafeFilters({
            controller: this.controller,
            model: this.collection.props,
            priority: -85
        });
        this.filtersContainer.set('safe-filter', SafeFilter.render());

        var OrientationFilter = new ShutterpressOrientationFilter({
            controller: this.controller,
            model: this.collection.props,
            priority: -80
        });
        this.filtersContainer.set('orientation-filter', OrientationFilter.render());

        var ColorFilter = new ShutterpressColorFilter({
            controller: this.controller,
            model: this.collection.props,
            priority: -70
        });
        this.filtersContainer.set('color-filter', ColorFilter.render());


        this.filtersContainer.set('update-filter', new ShutterpressFilterButton({
            controller: this.controller,
            model: this.collection.props,
            priority: 20,
            text: wp.media.view.l10n.shutterpress.search,
        }));

        this.filtersContainer.set('close-advanced-filter', new ShutterpressFilterClose({
            controller: this.controller,
            model: this.collection.props,
            priority: 10,
            text: ' ',
        }));
    },

    createStatus: function () {
        var statusOptions;

        statusOptions = {
            controller: this.controller,
            message: wp.media.view.l10n.shutterpress.noMedia,
            retry: wp.media.view.l10n.shutterpress.retry,
            browser: this
        };

        if (this.controller.isModeActive('grid')) {
            statusOptions.className = 'media-toolbar wp-filter';
        }

        /**
         * @member {wp.media.view.Toolbar}
         */
        this.status = new ShutterpressEmpty(statusOptions);

        this.status.hide();

        this.views.add(this.status);

    },

    displayError(error) {
        this.images.hide();
        this.status.model.set('message', wp.media.view.l10n.shutterpress.error);
        this.status.model.set('error', error.message);
        if (error.code === 2) {
            this.status.model.set('link', {
                url: wp.media.view.l10n.shutterpress.url,
                text: wp.media.view.l10n.shutterpress.link,
            });
        }
    },

    clearErrors() {
        this.status.model.set('message', wp.media.view.l10n.shutterpress.noMedia);
        this.status.model.set('error', '');
    },

    stopLoading() {
        this.toolbar.get('spinner').hide();
    },
    startLoading() {
        this.toolbar.get('spinner').show();
    }

});

export default ShutterpressBrowser;
