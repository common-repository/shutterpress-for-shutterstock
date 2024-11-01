import ShutterpressImagesModel from './models/shutterpress-images-model';

window.getShutterPressQuery = function (props) {
    return new ShutterpressImagesModel(null, {
        props: _.extend(_.defaults(props || {}, {orderby: 'date'}), {query: true})
    });
};