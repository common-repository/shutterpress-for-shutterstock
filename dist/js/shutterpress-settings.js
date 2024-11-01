// debounce library

/*
 * jQuery throttle / debounce - v1.1 - 3/7/2010
 * http://benalman.com/projects/jquery-throttle-debounce-plugin/
 *
 * Copyright (c) 2010 "Cowboy" Ben Alman
 * Dual licensed under the MIT and GPL licenses.
 * http://benalman.com/about/license/
 */
(function (b, c) {
    var $ = b.jQuery || b.Cowboy || (b.Cowboy = {}), a;
    $.throttle = a = function (e, f, j, i) {
        var h, d = 0;
        if (typeof f !== "boolean") {
            i = j;
            j = f;
            f = c
        }

        function g() {
            var o = this, m = +new Date() - d, n = arguments;

            function l() {
                d = +new Date();
                j.apply(o, n)
            }

            function k() {
                h = c
            }

            if (i && !h) {
                l()
            }
            h && clearTimeout(h);
            if (i === c && m > e) {
                l()
            } else {
                if (f !== true) {
                    h = setTimeout(i ? k : l, i === c ? e - m : e)
                }
            }
        }

        if ($.guid) {
            g.guid = j.guid = j.guid || $.guid++
        }
        return g
    };
    $.debounce = function (d, e, f) {
        return f === c ? a(d, e, false) : a(d, f, e !== false)
    }
})(this);

$(document).ready(function () {

    var $element = $('input.validate-shutterpress-key');
    var api_url = 'http://shutterpress-api.herokuapp.com/v1/validate?key=';

    function append_icon() {
        $element.after('<span class="shutterpress-verification"></span>')
        $element.before('<span class="shutterpress-message">' + wp.media.view.l10n.shutterpress.license + '</span>')
    }

    function validate_key() {
        $element.parent().removeClass('valid').removeClass('invalid');
        var val = $element.val();
        var options = options || {};
        options.data = _.extend(options.data || {}, {
            action: 'validate-shutterpress',
            key: val,
        });
        wp.media.ajax(options).done(function (response) {
            if (response.status === 'passed') {
                $element.parent().removeClass('invalid').addClass('valid')
            } else {
                $element.parent().removeClass('valid').addClass('invalid')
            }
        })
    }

    $element.keyup($.debounce(250, validate_key));


    // run initially
    append_icon();
    validate_key();
})