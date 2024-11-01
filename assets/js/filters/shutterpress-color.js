import ShutterpressColorFilters from './shutterpress-color-picker-filter';

var ShutterpressColorFilter = ShutterpressColorFilters.extend(/** @lends wp.media.view.AttachmentFilters.All.prototype */{
    className: 'advanced-filters color-filter',
    id: 'shutterpress-color-filter',
    createFilters: function () {
        var filters = {};


        filters.color = {
            text: wp.media.view.l10n.shutterpress.filters.color.text,
            props: {
                color: null,
            },
            priority: 20,
            id: 'shutterpress-color-picker'
        };


        this.filters = filters;
        this.label = wp.media.view.l10n.shutterpress.filters.color.text;
        this.name = 'color';
    }
});
export default ShutterpressColorFilter;