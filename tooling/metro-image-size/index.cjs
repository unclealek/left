'use strict';
const { readFileSync } = require('node:fs');
const modern = require('image-size-modern');

// Expo 54's Metro calls this with either image bytes or a file path. Upstream
// image-size 2 removed the path overload; retain it without copying parser code.
function imageSize(input) {
  return modern.imageSize(typeof input === 'string' ? readFileSync(input) : input);
}
module.exports = imageSize;
module.exports.default = imageSize;
module.exports.imageSize = imageSize;
module.exports.disableTypes = modern.disableTypes;
module.exports.types = modern.types;
