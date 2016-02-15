'use strict';

/**
 * Two dimensional spatial hash. Objects are assumed to have an axis aligned
 * bounding box.
 * @TODO should work for both 2 and 3 dimensions
 * @param {Object} config Configuration
 * @constructor
 */
function SpatialHash (config) {
  config = config || {};
  var self = this;

  self.COORDINATE_DIMENSIONS = {
    TWO: 2,
    THREE: 3
  };

  self.cellSize = 10;
  self.conversionFactor = 1 / self.cellSize;
  self.dimensions = self.COORDINATE_DIMENSIONS.TWO;

  // the index
  self.max = 1000;
  self.min = 0;
  self.width = (self.max - self.min) / self.cellSize;

  self.cells = {};
  self.objects = [];

  Object.keys(config).forEach(function (key) {
    self[key] = config[key];
  });
}

/**
 * Add object to the spatial index.
 * @param {String} id Object identifier
 * @param {Object} aabb Axis aligned bounding box
 */
SpatialHash.prototype.addObject = function (id, aabb) {

  // determine which cell to put the element into
  //var cell = (Math.floor(x / this.cellSize)) + (Math.floor(y/this.cellSize)) * width;
  var z = typeof pos.z === 'undefined' ? 0 : pos.z;
  var cell = (x * this.conversionFactor) + (y * this.conversionFactor * width);
  // initialize the cell array if it does not already exist
  this.cells[cell] = this.cells.hasOwnProperty(cell) ? this.cells[cell] : [];

};

SpatialHash.prototype.addObjectVertices = function () {};

SpatialHash.prototype.clear = function () {
  this.cells = {};
  this.objects = [];
};

/**
 * Determine which buckets the AABB intersects.
 * @param {Object} aabb Axis aligned bounding box with min, max positions.
 */
SpatialHash.prototype.intersects = function (aabb) {

};

SpatialHash.prototype.nearest = function (pos) {
  // get the buckets nearest to the position
  // get the list of objects nearest to the position
};

SpatialHash.prototype.remove = function (id, pos) {};

/**
 * Update the bounding grid size.
 * @param {Number} x
 * @param {Number} y
 * @param {Number} z
 */
SpatialHash.prototype.setGridSize = function (x, y, z) {
  this.width = x;
  this.height = y;
};
