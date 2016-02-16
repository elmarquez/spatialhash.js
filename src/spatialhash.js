'use strict';

/**
 * Two and three dimensional spatial indexing support for three.js.
 *
 * - Objects are assumed to have an axis aligned bounding box.
 * - cell size should be a power of 2 or 3
 * - Search by camera direction, screen coordinates
 * - Build index in a worker
 *
 * Positions will all be normalized to three dimensions. For two dimensional
 * points, a Z value of 0 is defined.
 *
 * The first entry for each cell is a THREE.Box3 that defines the bounding
 * envelope of the cell. The subsequent entries for each cell are
 * identifiers for those entities intersecting the cell.
 *
 * @param {Object} config Configuration
 * @constructor
 * @see http://www.gamedev.net/page/resources/_/technical/game-programming/spatial-hashing-r2697
 */
function SpatialHash(config) {
  config = config || {};
  var self = this;

  self.INDEXING_STRATEGY = {
    BOUNDED: 'getBoundedHashKey',
    UNBOUNDED: 'getUnboundedHashKey'
  };

  self.cells = {};
  self.cellSize = 10;
  self.conversionFactor = -1;
  self.envelopes = {};
  self.hashFn = null;
  self.indexingStrategy = self.INDEXING_STRATEGY.UNBOUNDED;
  self.max = 1000;
  self.min = 0;
  self.objects = {};

  Object.keys(config).forEach(function (key) {
    self[key] = config[key];
  });

  self.conversionFactor = 1 / self.cellSize;
  self.hashFn = self[self.indexingStrategy];
  self.width = (self.max - self.min) / self.cellSize;
}

/**
 * Clear the index.
 */
SpatialHash.prototype.clear = function () {
  this.cells = {};
  this.objects = {};
};

/**
 * Get bounded hash key. Position values must be greater than or equal to zero,
 * greater than or equal to MIN, less than or equal to MAX. Position values
 * should be normalized to three dimensions.
 * @param {Array} pos Position
 * @returns {String} Position hash key
 */
SpatialHash.prototype.getBoundedHashKey = function (pos) {
  if (pos[0] < 0 || pos[1] < 0 || pos[2] < 0) {
    throw new Error('Negative position value is not allowed');
  } else if (pos[0] > this.max || pos[1] > this.max || pos[2] > this.max) {
    throw new Error('Position is greater than MAX');
  } else if (pos[0] < this.min || pos[1] < this.min || pos[2] < this.min) {
    throw new Error('Position is less than MIN');
  }
  return Math.floor(pos[0] * this.conversionFactor) + ':' +
    Math.floor(pos[1] * this.conversionFactor) + ':' +
    Math.floor(pos[2] * this.conversionFactor);
};

/**
 * Get a list of all intersecting cell positions for a specified envelope.
 * @param {THREE.Box3} aabb Axis aligned bounding box
 * @param {Number} size Cell size
 * @returns {Array} List of intersecting cell positions
 */
SpatialHash.prototype.getCellsIntersectingAABB = function (aabb, size) {
  var i, j, k, points = [];
  var max = {
    x: Math.ceil(aabb.max.x/size) * size,
    y: Math.ceil(aabb.max.y/size) * size,
    z: aabb.max.z ? Math.ceil(aabb.max.z/size) * size : 0
  };
  var min = {
    x: Math.floor(aabb.min.x/size) * size,
    y: Math.floor(aabb.min.y/size) * size,
    z: aabb.min.z ? Math.floor(aabb.min.z/size) * size : 0
  };
  for (i = min.x; i < max.x; i += size) {
    for (j = min.y; j < max.y; j += size) {
      for (k = min.z; k < max.z; k += size) {
        points.push([i,j,k]);
      }
    }
  }
  return points;
};

/**
 * Get the list of cells that intersect the camera frustum.
 * @param {THREE.Frustum} frustum Camera frustum
 * @returns {Array}
 */
SpatialHash.prototype.getCellsIntersectingFrustum = function (frustum) {
  var intersects = [], self = this;
  Object.keys(self.envelopes).forEach(function (cell) {
    if (frustum.intersectsObject(self.envelopes[cell])) {
      intersects.push(cell);
    }
  });
  return intersects;
};

/**
 * Get the distance from P1 to P2.
 * @param {Array} p1 Point 1
 * @param {Array} p2 Point 2
 * @returns {Number}
 */
SpatialHash.prototype.getDistance = function (p1, p2) {
  // if two dimensions are provided per point, then add a third with value of
  // zero so that don't have to do any more checks
  p1[2] = p1.length === 2 ? 0 : p1[2];
  p2[2] = p2.length === 2 ? 0 : p2[2];
  return Math.sqrt(
    Math.pow(p2[2] - p1[2], 2) +
    Math.pow(p2[1] - p1[1], 2) +
    Math.pow(p2[0] - p1[0], 2)
  );
};

/**
 * Get position hash key. Position values from -Infinity to Infinity are valid.
 * Position values should be normalized to three dimensions.
 * @param {Object|Array} pos Position
 * @returns {String} Hashed position key
 */
SpatialHash.prototype.getUnboundedHashKey = function (pos) {
  return Math.floor(pos[0] * this.conversionFactor) + ':' +
    Math.floor(pos[1] * this.conversionFactor) + ':' +
    Math.floor(pos[2] * this.conversionFactor);
};

/**
 * Insert object into the index.
 * @param {String} id Object identifier
 * @param {THREE.Box2|THREE.Box3} aabb Axis aligned bounding box
 */
SpatialHash.prototype.insert = function (id, aabb) {
  var key, self = this;
  // the cells intersecting the aabb
  var cells = self
    .getCellsIntersectingAABB(aabb, this.cellSize)
    .reduce(function (entries, p) {
      key = self.hashFn(p);
      entries[key] = id;
      return entries;
    }, {});
  // add index entries
  Object.keys(cells).forEach(function (cell) {
    // add cell to entity entity id mapping
    if (!self.cells.hasOwnProperty(cell)) {
      self.cells[cell] = [];
    }
    self.cells[cell].push(cells[cell]);
    // add entity id to cell mapping
    if (!self.objects.hasOwnProperty(id)) {
      self.objects[id] = [];
    }
    self.objects[id].push(cell);
  });
};

/**
 * Determine which cells the AABB intersects.
 * @param {THREE.Box3} aabb Axis aligned bounding box with min, max positions.
 */
SpatialHash.prototype.intersects = function (aabb) {

};

/**
 * Find those entities that intersect or are contained within the screen
 * selection.
 * @param {THREE.Frustum} frustum Camera frustum
 * @param {THREE.Vector3} p1 Screen position 1
 * @param {THREE.Vector3} p2 Screen position 2
 * @returns {Array} Scene objects intersecting or contained within the selection rectangle.
 */
SpatialHash.prototype.intersectsViewSelection = function (frustum, p1, p2) {
  // get the list of cells that intersect the frustum
  // reduce the list of cells to those that intersect with p1 and p2
};

/**
 *
 * @param pos
 * @param limit
 */
SpatialHash.prototype.near = function (pos, limit) {
  // get the cells nearest to the position
  // get the list of objects nearest to the position
};

/**
 *
 * @param pos
 */
SpatialHash.prototype.nearest = function (pos) {
  // get the cells nearest to the position
  // get the list of objects nearest to the position
};

/**
 * Remove object from the index.
 * @param {String} id Object identifier
 */
SpatialHash.prototype.remove = function (id) {
  var i, self = this;
  // remove object from all cells
  if (this.objects.hasOwnProperty(id)) {
    this.objects[id].forEach(function (cell) {
      i = self.cells[cell].indexOf(id);
      if (i > -1) {
        self.cells[cell].splice(i,1);
      }
    });
  }
  // remove object record
  delete this.objects[id];
};
