import {markOgBuildStart, svgToJpeg} from './events/svg-to-jpeg.js';
import {buildAllCss} from './events/build-css.js';
import {buildAllJs} from './events/build-js.js';

export default {
  markOgBuildStart,
  svgToJpeg,
  buildAllCss,
  buildAllJs
};
