'use strict';

/**
 * Spatial index.
 * Objects are assumed to have an axis aligned bounding box.
 * @param {Object} config Configuration
 * @constructor
 * @see http://www.gamedev.net/page/resources/_/technical/game-programming/spatial-hashing-r2697
 */
function SpatialHash (config) {
  config = config || {};
  var self = this;

  self.INDEXING_STRATEGY = {
    BOUNDED_TWO: 'getBounded2DHashKey',
    BOUNDED_THREE: 'getBounded3DHashKey',
    UNBOUNDED_TWO: 'getUnbounded2DHashKey',
    UNBOUNDED_THREE: 'getUnbounded3DHashKey'
  };

  self.cellSize = 10;
  self.conversionFactor = -1;
  self.hashFn = null;
  self.indexingStrategy = self.INDEXING_STRATEGY.UNBOUNDED_THREE;
  self.max = 1000;
  self.min = 0;
  self.cells = {};
  self.objects = [];

  Object.keys(config).forEach(function (key) {
    self[key] = config[key];
  });

  self.conversionFactor = 1 / self.cellSize;
  self.indexingStrategy = self[self.indexingStrategy];
  self.width = (self.max - self.min) / self.cellSize;
}

/**
 * Add object to the spatial index.
 * @param {String} id Object identifier
 * @param {Object} aabb Axis aligned bounding box
 */
SpatialHash.prototype.addObject = function (id, aabb) {
  var pos, x, y, width;

  // determine which cell to put the element into
  //var cell = (Math.floor(x / this.cellSize)) + (Math.floor(y/this.cellSize)) * width;
  var z = typeof pos.z === 'undefined' ? 0 : pos.z;
  var cell = (x * this.conversionFactor) + (y * this.conversionFactor * width);
  // initialize the cell array if it does not already exist
  this.cells[cell] = this.cells.hasOwnProperty(cell) ? this.cells[cell] : [];

};

SpatialHash.prototype.addObjectVertices = function () {};

/**
 * Clear the index.
 */
SpatialHash.prototype.clear = function () {
  this.cells = {};
  this.objects = [];
};

/**
 * Get 2D hash key.
 * @param {Object|Array} pos Position
 */
SpatialHash.prototype.getBounded2DHashKey = function (pos) {};

/**
 * Get 3D hash key.
 * @param {Object|Array} pos Position
 */
SpatialHash.prototype.getBounded3DHashKey = function (pos) {};

/**
 * Get 2D hash key.
 * @param {Object|Array} pos Position
 */
SpatialHash.prototype.getUnbounded2DHashKey = function (pos) {};

/**
 * Get 3D hash key.
 * @param {Object|Array} pos Position
 * @returns {String} Hashed position key
 */
SpatialHash.prototype.getUnbounded3DHashKey = function (pos) {
  var key = Math.floor(pos[0]) + Math.floor(pos[1]) + Math.floor(pos[2]);
  return key;
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
