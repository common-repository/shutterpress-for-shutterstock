import ShutterpressImage from './shutterpress-image';

var ShutterpressDetails = ShutterpressImage.extend({
    tagName: 'div',
    className: 'attachment-details',
    template: wp.template('shutterpress-attachment-details'),

    attributes: function () {
        return {
            'tabIndex': 0,
            'data-id': this.model.get('id')
        };
    },


    initialize: function () {
        this.options = _.defaults(this.options, {
            rerenderOnModelChange: false
        });

        this.on('ready', this.initialFocus);
        // Call 'initialize' directly on the parent class.
        ShutterpressImage.prototype.initialize.apply(this, arguments);
    },

    initialFocus: function () {
        if (!wp.media.isTouchDevice) {
            this.$('input[type="text"]').eq(0).focus();
        }
    },

});

export default ShutterpressDetails;