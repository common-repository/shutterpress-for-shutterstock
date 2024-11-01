import ShutterpressSelectFilters from "./shutterpress-select-filter";
var slugify = require('slugify')
var ShutterpressCategoryFilters = ShutterpressSelectFilters.extend(/** @lends wp.media.view.AttachmentFilters.All.prototype */{
    className: 'advanced-filters category-filter',
    id: 'shutterpress-category-filter',
    createFilters: function () {
        var filters = {};


        var priority = 1;
        filters.default = {
            text: wp.media.view.l10n.shutterpress.filters.categories.default,
            props: {
                category: null,
            },
            priority: priority,
            id: 'shutterpress-category-default'
        };
        var values = wp.media.view.l10n.shutterpress.filters.categories.values;
        for (let [key, value] of Object.entries(values)) {
            if (values.hasOwnProperty(key)) {
                priority++;
                filters[key] = {
                    text: values[key],
                    props: {
                        category: key,
                    },
                    priority: priority,
                    id: 'shutterpress-category-' + slugify(key)
                }
            }
        }


        this.filters = filters;
        this.label = wp.media.view.l10n.shutterpress.filters.categories.label;
        this.name = 'category';
        this.default = null;
    }
});
export default ShutterpressCategoryFilters;