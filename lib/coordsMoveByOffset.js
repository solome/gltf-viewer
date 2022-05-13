"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.coordsMoveByOffset = coordsMoveByOffset;

var _formatRad = require("./formatRad");

function coordsMoveByOffset(coords, offset, layout) {
  var longitude = coords.longitude,
      latitude = coords.latitude;
  longitude = longitude - offset.x / layout.width * 3;
  latitude = latitude - offset.y / layout.height * 3;
  longitude = (0, _formatRad.formatRad)(longitude);
  return {
    longitude: longitude,
    latitude: latitude
  };
}