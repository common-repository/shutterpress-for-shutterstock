import ShutterpressCheckboxFilters from './shutterpress-checkbox-filter';

var ShutterpressOrientationFilters = ShutterpressCheckboxFilters.extend(/** @lends wp.media.view.AttachmentFilters.All.prototype */{
    className: 'advanced-filters orientation-filter',
    id: 'shutterpress-gender-filter',
    createFilters: function () {
        var filters = {};


        filters.horizontal = {
            text: wp.media.view.l10n.shutterpress.filters.orientation.horizontal,
            props: {
                orientation: 'horizontal',
            },
            priority: 20,
            id: 'shutterpress-orientation-horizontal'
        };

        filters.vertical = {
            text: wp.media.view.l10n.shutterpress.filters.orientation.vertical,
            props: {
                orientation: 'vertical',
            },
            priority: 30,
            id: 'shutterpress-orientation-vertical'
        };


        this.filters = filters;
        this.label = wp.media.view.l10n.shutterpress.filters.orientation.label;
        this.name = 'orientation';
        this.default = null;
        this.multiple = false
    }
});
export default ShutterpressOrientationFilters;