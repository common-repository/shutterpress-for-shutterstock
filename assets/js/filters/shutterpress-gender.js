import ShutterpressCheckboxFilters from './shutterpress-checkbox-filter';

var ShutterpressGenderFilters = ShutterpressCheckboxFilters.extend(/** @lends wp.media.view.AttachmentFilters.All.prototype */{
    className: 'advanced-filters gender-filter',
    id: 'shutterpress-gender-filter',
    createFilters: function () {
        var filters = {};


        filters.female = {
            text: wp.media.view.l10n.shutterpress.filters.gender.female,
            props: {
                people_gender: 'female',
            },
            priority: 20,
            id: 'shutterpress-gender-female'
        };

        filters.male = {
            text: wp.media.view.l10n.shutterpress.filters.gender.male,
            props: {
                people_gender: 'male',
            },
            priority: 30,
            id: 'shutterpress-gender-male'
        };


        this.filters = filters;
        this.label = wp.media.view.l10n.shutterpress.filters.gender.label;
        this.name = 'people_gender';
        this.default = 'both';
        this.multiple = false
    }
});
export default ShutterpressGenderFilters;