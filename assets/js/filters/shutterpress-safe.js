import ShutterpressRadioFilters from './shutterpress-radio-filter';

var ShutterpressSafeFilters = ShutterpressRadioFilters.extend(/** @lends wp.media.view.AttachmentFilters.All.prototype */{
    className: 'advanced-filters safe-filter',
    id: 'shutterpress-safe-filter',
    createFilters: function () {
        var filters = {};


        filters.yes = {
            text: wp.media.view.l10n.shutterpress.filters.safe.yes,
            props: {
                safe: true,
            },
            name:'safe-search-shutterpress',
            priority: 20,
            id: 'shutterpress-safe-yes'
        };

        filters.no = {
            text: wp.media.view.l10n.shutterpress.filters.safe.no,
            props: {
                safe: false,
            },
            priority: 30,
            name:'safe-search-shutterpress',
            id: 'shutterpress-safe-no'
        };


        this.filters = filters;
        this.label = wp.media.view.l10n.shutterpress.filters.safe.label;
        this.name = 'safe';
    }
});
export default ShutterpressSafeFilters;