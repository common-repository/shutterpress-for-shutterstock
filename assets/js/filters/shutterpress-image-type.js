import ShutterpressCheckboxFilters from './shutterpress-checkbox-filter';

var ShutterpressImageFilters = ShutterpressCheckboxFilters.extend(/** @lends wp.media.view.AttachmentFilters.All.prototype */{
    className: 'advanced-filters image-type-filter',
    id: 'shutterpress-image-type-filter',
    createFilters: function () {
        var filters = {};


        filters.photo = {
            text: wp.media.view.l10n.shutterpress.filters.image_type.photo,
            props: {
                image_type: 'photo',
            },
            priority: 20,
            id: 'shutterpress-image-type-photo'
        };

        filters.vector = {
            text: wp.media.view.l10n.shutterpress.filters.image_type.vector,
            props: {
                image_type: 'vector',
            },
            priority: 30,
            id: 'shutterpress-image-type-vector'
        };

        filters.illustration = {
            text: wp.media.view.l10n.shutterpress.filters.image_type.illustration,
            props: {
                image_type: 'illustration',
            },
            priority: 30,
            id: 'shutterpress-image-photo-illustration'
        };


        this.filters = filters;
        this.label = wp.media.view.l10n.shutterpress.filters.image_type.label;
        this.name = 'image_type';
        this.default = null;
        this.multiple = true
    }
});
export default ShutterpressImageFilters;