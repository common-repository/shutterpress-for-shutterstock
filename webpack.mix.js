const mix = require('laravel-mix');

mix.js('assets/js/shutterpress.js', 'dist/js')
    .sass('assets/sass/shutterpress.scss', 'dist/css');

if (!mix.config.production) {
    mix.sourceMaps();
}