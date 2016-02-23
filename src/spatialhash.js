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
 * TODO:
 *
 * the objects map should work as
 *
 * {
 *   uuid: {
 *     index: {
 *       cell: cellId,
 *       position: [x,y,z]
 *     }
 *   }
 * }
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
  self.indexingStrategy = self.INDEXING_STRATEGY.UNBOUNDED;
  self.max = 1000;
  self.min = 0;
  self.objects = {};

  Object.keys(config).forEach(function (key) {
    self[key] = config[key];
  });

  self.conversionFactor = 1 / self.cellSize;
  self.getPositionHash = self[self.indexingStrategy];
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
    z: Math.ceil(aabb.max.z/size) * size
  };
  var min = {
    x: Math.floor(aabb.min.x/size) * size,
    y: Math.floor(aabb.min.y/size) * size,
    z: Math.floor(aabb.min.z/size) * size
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
  var intersects = {}, self = this;
  Object.keys(self.envelopes).forEach(function (cell) {
    if (frustum.intersectsBox(self.envelopes[cell])) {
      intersects[cell] = 0;
    }
  });
  return Object.keys(intersects);
};

/**
 * Get the distance from P1 to P2.
 * @param {Array} p1 Point 1
 * @param {Array} p2 Point 2
 * @returns {Number}
 */
SpatialHash.prototype.getDistance = function (p1, p2) {
  p1[2] = p1.length === 2 ? 0 : p1[2];
  p2[2] = p2.length === 2 ? 0 : p2[2];
  return Math.sqrt(
    Math.pow(p2[2] - p1[2], 2) +
    Math.pow(p2[1] - p1[1], 2) +
    Math.pow(p2[0] - p1[0], 2)
  );
};

/**
 * Get scene entities intersecting the camera frustum.
 * @param {THREE.Frustum} frustum Camera frustum
 * @returns {Array}
 */
SpatialHash.prototype.getEntitiesIntersectingFrustum = function (frustum) {
  var uuid;
  var entities = this
    .getCellsIntersectingFrustum(frustum)
    // get a map of entities intersecting the cells
    .reduce(function (intersects, cell) {
      cell.forEach(function (id) {
        uuid = id.split(',')[0];
        intersects[uuid] = intersects.hasOwnProperty(uuid) ? intersects[uuid] + 1 : 0; // count of elements belonging to the entity for testing
      });
      return intersects;
    }, {});
  return Object.keys(entities);
};

/**
 * Get scene entities intersecting the camera frustum.
 * @param {THREE.Vector2} p1 Point 1
 * @param {THREE.Vector2} p2 Point 2
 * @returns {Array}
 */
SpatialHash.prototype.getEntitiesIntersectingScreenRectangle = function (p1, p2) {
  var intersects = [];
  return intersects;
};

/**
 * Get position envelope.
 * @param {Array} pos Position
 * @returns {THREE.Box3}
 */
SpatialHash.prototype.getPositionEnvelope = function (pos) {
  var x = Math.floor(pos[0] * this.conversionFactor) * this.cellSize;
  var y = Math.floor(pos[1] * this.conversionFactor) * this.cellSize;
  var z = Math.floor(pos[2] * this.conversionFactor) * this.cellSize;
  var min = new THREE.Vector3(x, y, z);
  x += this.cellSize;
  y += this.cellSize;
  z += this.cellSize;
  var max = new THREE.Vector3(x, y, z);
  return new THREE.Box3(min, max);
};

/**
 * Get position hash key. Position values from -Infinity to Infinity are valid.
 * Position values should be normalized to three dimensions.
 * @param {Object|Array} pos Position
 * @returns {String} Hashed position key
 */
SpatialHash.prototype.getUnboundedHashKey = function (pos) {
  return (Math.floor(pos[0] * this.conversionFactor) * this.cellSize) + ':' +
    (Math.floor(pos[1] * this.conversionFactor) * this.cellSize) + ':' +
    (Math.floor(pos[2] * this.conversionFactor) * this.cellSize);
};

/**
 * Get entity vertices intersecting the camera frustum.
 * @param {THREE.Frustum} frustum Camera frustum
 * @returns {Array}
 */
SpatialHash.prototype.getVerticesIntersectingFrustum = function (frustum) {
  var entities = this
    .getCellsIntersectingFrustum(frustum)
    // get a map of entities intersecting the cells
    .reduce(function (intersects, cell) {
      cell.forEach(function (id) {
        intersects[id] = 0;
      });
      return intersects;
    }, {});
  return Object.keys(entities);
};

/**
 * Insert object into the index.
 * @param {String} id Object identifier
 * @param {Number} index Element index
 * @param {THREE.Box2|THREE.Box3} aabb Axis aligned bounding box
 * @param {Object} metadata Object metadata
 */
SpatialHash.prototype.insert = function (id, index, aabb, metadata) {
  // TODO need to store element index somewhere
  var max, min, position, self = this;
  // the cells intersecting the aabb
  var cells = self
    .getCellsIntersectingAABB(aabb, this.cellSize)
    .reduce(function (intersects, vertex) {
      position = self.getPositionHash(vertex);
      intersects[position] = self.getPositionEnvelope(vertex);
      return intersects;
    }, {});
  // add index entries
  Object.keys(cells).forEach(function (cell) {
    // record bounding envelope for the cell
    self.envelopes[cell] = cells[cell];
    // add cell to entity entity id mapping
    if (!self.cells.hasOwnProperty(cell)) {
      self.cells[cell] = [];
    }
    self.cells[cell].push(id);
    // add entity id to cell mapping
    if (!self.objects.hasOwnProperty(id)) {
      self.objects[id] = [];
    }
    self.objects[id].push(cell);
  });
};

/**
 * Get the list of cells that intersect the AABB.
 * @param {THREE.Box3} aabb Axis aligned bounding box.
 * @returns {Array}
 */
SpatialHash.prototype.intersects = function (aabb) {
  var intersects = [], self = this;
  Object.keys(self.envelopes).forEach(function (envelope) {
    if (envelope.intersectsBox(aabb)) {
      intersects.push(envelope);
    }
  });
  return intersects;
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
 * Find
 * @param {Array} pos Position
 * @param {Number} radius Search radius
 * @param {Number} limit Maximum number of entities returned.
 */
SpatialHash.prototype.near = function (pos, radius, limit) {
  limit = limit || Infinity;
  var searchVolume = new THREE.Box3().setFromCenterAndSize(pos, radius);

  // get the cells nearest to the position
  // get the list of objects nearest to the position
};

/**
 * Find the nearest set of entities to the specified point. Return the list in
 * order of proximity.
 * @param {THREE.Vector3} pos Position to search from
 * @param {Number} limit Limit of number of records to return
 * @returns {Array}
 */
SpatialHash.prototype.nearest = function (pos, limit) {
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
  // remove object envelope, record
  delete this.envelopes[id];
  delete this.objects[id];
};
