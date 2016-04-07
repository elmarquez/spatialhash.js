/* globals getAABBCells, getPositionEnvelope, getPositionHash */
window.SpatialHash = (function () {
  'use strict';

  //---------------------------------------------------------------------------
  // Worker functions

  /**
   * Get a list of hash keys for the cells occupied by the AABB.
   * @param {Object} aabb Axis aligned bounding box
   * @param {Function} posHashFn Position hash function
   * @returns {Array} List of cell keys
   */
  function getAABBCellKeys (aabb, posHashFn) {
    return getAABBCells(aabb).map(function (item) {
      return posHashFn(item);
    });
  }

  /**
   * Get a list of all intersecting cell positions for a specified envelope.
   * @param {Object} aabb Axis aligned bounding box
   * @param {Number} cellSize Cell size
   * @returns {Array} List of intersecting cell positions
   */
  function getAABBCells (aabb, cellSize) {
    var i, j, k, max, min, points = [];
    max = {
      x: Math.ceil(aabb.max.x/cellSize) * cellSize,
      y: Math.ceil(aabb.max.y/cellSize) * cellSize,
      z: Math.ceil(aabb.max.z/cellSize) * cellSize
    };
    min = {
      x: Math.floor(aabb.min.x/cellSize) * cellSize,
      y: Math.floor(aabb.min.y/cellSize) * cellSize,
      z: Math.floor(aabb.min.z/cellSize) * cellSize
    };
    for (i = min.x; i < max.x; i += cellSize) {
      for (j = min.y; j < max.y; j += cellSize) {
        for (k = min.z; k < max.z; k += cellSize) {
          points.push({x:i,y:j,z:k});
        }
      }
    }
    return points;
  }

  /**
   * Get the distance from P1 to P2.
   * @param {Object} p1 Point 1
   * @param {Object} p2 Point 2
   * @returns {Number} Distance
   */
  function getDistance (p1, p2) {
    // normalize position to three dimensions
    p1.z = p1.hasOwnProperty('z') ? p1.z : 0;
    p2.z = p2.hasOwnProperty('z') ? p2.z : 0;
    return Math.sqrt(
      Math.pow(p2.x - p1.x, 2) +
      Math.pow(p2.y - p1.y, 2) +
      Math.pow(p2.z - p1.z, 2)
    );
  }

  /**
   * Get the distance from the plane to the point.
   * @param {Object} plane Plane
   * @param {Object} p Point
   */
  function getDistanceToPoint (plane, p) {
      return getDotProduct(plane.normal, p) + plane.constant;
  }

  /**
   * Get vector dot product.
   * @param {Object} v1 Vector 1
   * @param {Object} v2 Vector 2
   * @returns {number}
   */
  function getDotProduct (v1, v2) {
    return (v1.x * v2.x) + (v1.y * v2.y) + (v1.z * v2.z);
  }

  /**
   * Get position envelope.
   * @param {Object} pos Position
   * @param {Number} cellSize Cell size
   * @param {Number} conversionFactor Conversion factor
   * @returns {Object}
   */
  function getPositionEnvelope (pos, cellSize, conversionFactor) {
    var x = Math.floor(pos.x * conversionFactor) * cellSize;
    var y = Math.floor(pos.y * conversionFactor) * cellSize;
    var z = Math.floor(pos.z * conversionFactor) * cellSize;
    var min = {x:x, y:y, z:z};
    x += cellSize;
    y += cellSize;
    z += cellSize;
    var max = {x:x, y:y, z:z};
    return {min:min, max:max};
  }

  /**
   *
   * @param {Object} pos Position
   * @param {Number} conversionFactor Conversion factor
   * @returns {String}
   */
  function getUnboundedPositionHashKey (pos, conversionFactor) {
    return Math.floor(pos.x * conversionFactor) + ':' +
      Math.floor(pos.y * conversionFactor) + ':' +
      Math.floor(pos.z * conversionFactor);
  }

  /**
   * Determine if the box intersects the frustum.
   * @param {Array} planes Frustum planes
   * @param {Object} box Box
   * @returns {boolean}
   */
  function intersectsBox (planes, box) {
    var d1, d2, i, p1 = {x:0,y:0,z:0}, p2 = {x:0,y:0,z:0};
    for (i = 0; i < 6; i++) {
      var plane = planes[i];
      p1.x = plane.normal.x > 0 ? box.min.x : box.max.x;
      p2.x = plane.normal.x > 0 ? box.max.x : box.min.x;
      p1.y = plane.normal.y > 0 ? box.min.y : box.max.y;
      p2.y = plane.normal.y > 0 ? box.max.y : box.min.y;
      p1.z = plane.normal.z > 0 ? box.min.z : box.max.z;
      p2.z = plane.normal.z > 0 ? box.max.z : box.min.z;
      d1 = getDistanceToPoint(plane, p1);
      d2 = getDistanceToPoint(plane, p2);
      // if both are outside theh plane then there is no intersection
      if (d1 < 0 && d2 < 0) {
        return false;
      }
    }
    return true;
  }

  /**
   * Merge array from right to left.
   * @param {Array} left Left array
   * @param {Array} right Right array
   * @returns {Array}
   */
  function mergeArray (left, right) {
    var merged = [].concat(left);
    if (right !== null && right !== undefined) {
      if (Array.isArray(right)) {
        merged = merged.concat(right);
      } else {
        merged.push(right);
      }
    }
    return merged;
  }

  /**
   * Merge object fields from right to left.
   * The fields are objects with arrays as children.
   * @param {Object} left Left object field
   * @param {Object} right Right object field
   */
  function mergeFields (left, right) {
    // { key1: [item1, item2], key2: [item1, item2] }
    Object.keys(right).forEach(function (key) {
      if (left.hasOwnProperty(key)) {
        right[key].forEach(function (item) {
          left[key].push(item);
        });
      } else {
        left[key] = right[key];
      }
    });
  }

  //---------------------------------------------------------------------------
  // Index

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
   * @todo implement heirarchical spatial hashing
   * @todo revise object to cell map as follows:
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
  function Index(config) {
    config = config || {};
    var self = this;

    self.INDEXING_STRATEGY = {
      BOUNDED: 'getBoundedHashKey',
      UNBOUNDED: 'getUnboundedHashKey'
    };
    self.MAX_WORKERS = 16;

    // cell to object map. cells are identified by a position hash key. each cell record
    // contains an array with a list of object IDs
    self.cells = {};
    self.cellSize = 10;
    self.conversionFactor = -1;

    // cell to cell bounding envelope map. cells are identifed by a position hash key.
    // the bounding envelope identifies the min, max positions defining the cell.
    self.envelopes = {};
    self.indexingStrategy = self.INDEXING_STRATEGY.UNBOUNDED;
    self.max = 1000;
    self.min = 0;

    // object ID to cell hash key map. the map allows us to determine the set of cells that
    // an object occupies.
    self.objects = {};

    self.scripts = {
      EVAL: '/vendor/parallel.js/lib/eval.js',
      THREE: '/vendor/three.js/three.js'
    };

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
  Index.prototype.clear = function () {
    this.cells = {};
    this.objects = {};
  };

  /**
   * Get bounded hash key. Position values must be greater than or equal to zero,
   * greater than or equal to MIN, less than or equal to MAX. Position values
   * should be normalized to three dimensions.
   * @param {THREE.Vector3|Object} pos Position
   * @returns {String} Position hash key
   */
  Index.prototype.getBoundedHashKey = function (pos) {
    if (pos.x < 0 || pos.y < 0 || pos.z < 0) {
      throw new Error('Negative position value is not allowed');
    } else if (pos.x > this.max || pos.y > this.max || pos.z > this.max) {
      throw new Error('Position is greater than MAX');
    } else if (pos.x < this.min || pos.y < this.min || pos.z < this.min) {
      throw new Error('Position is less than MIN');
    }
    return this.getUnboundedHashKey(pos);
  };

  /**
   * Get the list of cells that intersect the axis aligned bounding box.
   * @param {THREE.Box3} aabb Axis aligned bounding box
   * @returns {Array} List of intersecting cells
   */
  Index.prototype.getCellsIntersectingAABB = function (aabb) {
    var intersects = {}, self = this;
    Object.keys(self.envelopes).forEach(function (cell) {
      if (aabb.intersectsBox(self.envelopes[cell])) {
        intersects[cell] = 0;
      }
    });
    return Object.keys(intersects);
  };

  /**
   * Get the list of cells that intersect the camera frustum.
   * @param {THREE.Frustum} frustum Camera frustum
   * @returns {Promise} List of intersecting cells
   */
  Index.prototype.getCellsIntersectingFrustum = function (frustum) {
    var opt, pa, planes = [], self = this;
    return new Promise(function (resolve, reject) {
      // convert frustum into a simplified object before passing it to the worker
      frustum.planes.forEach(function (plane) {
        planes.push({
          constant: plane.constant,
          normal: {
            x: plane.normal.x + 0,
            y: plane.normal.y + 0,
            z: plane.normal.z + 0
          }
        });
      });
      // worker options
      opt = {
        env: {
          envelopes: self.envelopes,
          planes: planes
        },
        evalPath: self.scripts.EVAL
      };
      // execute work
      pa = new Parallel(Object.keys(self.envelopes), opt);
      pa.require(self.scripts.THREE)
        .require({fn:getDistanceToPoint, name:'getDistanceToPoint'})
        .require({fn:getDotProduct, name:'getDotProduct'})
        .require({fn:intersectsBox, name:'intersectsBox'})
        .require({fn:mergeArray, name:'mergeArray'});
      pa.map(function (key) {
          return intersectsBox(global.env.planes, global.env.envelopes[key]) ? key : [];
        })
        .reduce(function (cell) {
          var result = [];
          result = mergeArray(result, cell[0]);
          result = mergeArray(result, cell[1]);
          return result;
        })
        .then(function (data, err) {
          if (err) {
            reject(err);
          } else {
            resolve(data);
          }
        });
    });
  };

  /**
   * Get scene entities intersecting the camera frustum.
   * @param {THREE.Frustum} frustum Camera frustum
   * @returns {Promise} List of scene entities
   */
  Index.prototype.getEntitiesIntersectingFrustum = function (frustum) {
    var self = this;
    return new Promise(function (resolve, reject) {
      self
        .getCellsIntersectingFrustum(frustum)
        .then(function (keys) {
          if (keys.length > 0) {
            // parallel doesn't do well with data of zero length
            var pa = new Parallel(keys, {env: {cells: self.cells}});
            pa.require({fn: mergeArray, name: 'mergeArray'});
            pa.map(function (key) {
                var result = [];
                if (global.env.cells[key] && Array.isArray(global.env.cells[key])) {
                  result = [].concat(global.env.cells[key]);
                }
                return result;
              })
              .reduce(function (objs) {
                var result = [];
                result = mergeArray(result, objs[0]);
                result = mergeArray(result, objs[1]);
                return result;
              })
              .then(function (data, err) {
                if (err) {
                  reject(err);
                } else {
                  resolve(data);
                }
              });
          }
        });
    });
  };

  /**
   * Get scene entities intersecting the screen rectangle.
   * @param {THREE.Box2} rec Screen rectangle
   * @returns {Array} List of scene entities
   */
  Index.prototype.getEntitiesIntersectingScreenRectangle = function (rec) {
    var p1 = new THREE.Vector3(rec.min.x, rec.min.y, 0);
    var p2 = new THREE.Vector3(rec.max.x, rec.max.y, 1);
    var aabb = new THREE.Box3().setFromPoints([p1, p2]);
    var items, self = this, uuid;
    var entities = this
      .getAABBCellKeys(aabb)
      .reduce(function (cells, key) {
        if (self.cells.hasOwnProperty(key)) {
          cells[key] = key;
        }
        return cells;
      }, {});
    //.reduce(function (intersects, cell) {
    //  cell.forEach(function (item) {
    //    // get cell then check whether each point intersects the rec
    //    console.info('item', item);
    //    // if there is an intersect, add the entity uuid to the intersects list
    //    //uuid = id.split(',')[0];
    //    //intersects[uuid] = intersects.hasOwnProperty(uuid) ? intersects[uuid] + 1 : 0; // count of elements belonging to the entity for testing
    //  });
    //  return intersects;
    //}, {});
    return Object.keys(entities);
  };

  /**
   * Get position hash key. Position values from -Infinity to Infinity are valid.
   * Position values should be normalized to three dimensions.
   * @param {THREE.Vector3|Object} pos Position
   * @param {Number} conversionFactor Conversion factor
   * @returns {String} Hashed position key
   */
  Index.prototype.getUnboundedHashKey = function (pos, conversionFactor) {
    return Math.floor(pos.x * conversionFactor) + ':' +
      Math.floor(pos.y * conversionFactor) + ':' +
      Math.floor(pos.z * conversionFactor);
  };

  /**
   * Get entity vertices intersecting the camera frustum.
   * @param {THREE.Frustum} frustum Camera frustum
   * @returns {Array}
   */
  Index.prototype.getVerticesIntersectingFrustum = function (frustum) {
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
  Index.prototype.insert = function (id, index, aabb, metadata) {
    var position, self = this;
    // the cells intersecting the aabb
    var cells = self
      .getAABBCells(aabb)
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
   * Insert all objects
   * @param {Array|Object} objs List of scene object records.
   * @returns {Promise}
   */
  Index.prototype.insertAll = function (objs) {
    var count = {objects:-1, faces:-1, edges:-1, vertices:-1}, opts, p, self = this;
    // transform objs to array if it was passed in as an object
    if (!Array.isArray(objs)) {
      objs = Object.keys(objs).reduce(function (list, key) {
        list.push(objs[key]);
        return list;
      }, []);
    }
    return new Promise(function (resolve, reject) {
      if (objs.length === 0) {
        resolve(count);
      }
      // check for null bounding boxes
      objs.forEach(function (obj) {
        if (!obj.aabb || !obj.aabb.max || !obj.aabb.min) {
          reject('Missing aabb', obj);
        }
      });
      opts = {
        env: {
          cellSize: self.cellSize,
          conversionFactor: self.conversionFactor
        },
        evalPath: self.scripts.EVAL
        //, maxWorkers: 8
      };
      p = new Parallel(objs, opts)
        .require(self.scripts.THREE)
        .require({fn:getAABBCells, name:'getAABBCells'})
        .require({fn:getPositionEnvelope, name:'getPositionEnvelope'})
        .require({fn:getUnboundedPositionHashKey, name:'getPositionHash'})
        .require({fn:mergeFields, name:'mergeFields'});
      p.map(function (obj) {
        var cells, position, record = {cells: {}, envelopes:{}, objects:{}};
        // the cells intersecting the aabb
        cells = getAABBCells(obj.aabb, global.env.cellSize)
          .reduce(function (intersects, vertex) {
            position = getPositionHash(vertex, global.env.conversionFactor);
            intersects[position] = getPositionEnvelope(vertex, global.env.cellSize, global.env.conversionFactor);
            return intersects;
          }, {});
        // add index entries
        Object.keys(cells).forEach(function (key) {
          // cell bounding envelopes
          record.envelopes[key] = cells[key];
          // cell id to object id map
          if (!record.cells.hasOwnProperty(key)) {
            record.cells[key] = [];
          }
          record.cells[key].push(obj.id);
          // object id to cell id map
          if (!record.objects.hasOwnProperty(obj.id)) {
            record.objects[obj.id] = [];
          }
          record.objects[obj.id].push(key);
        });
        return record;
      })
      .reduce(function (records) {
        // TODO count each type of entity
        mergeFields(records[0].cells, records[1].cells);
        Object.keys(records[1].envelopes).forEach(function (key) {
          records[0].envelopes[key] = records[1].envelopes[key];
        });
        mergeFields(records[0].objects, records[1].objects);
        return records[0];
      })
      .then(function (data, err) {
        if (err) {
          reject(err);
        } else {
          self.cells = data.cells;
          self.envelopes = data.envelopes;
          self.objects = data.objects;
          resolve(count);
        }
      });
    });
  };

  /**
   * Get the list of cells that intersect the AABB.
   * @param {THREE.Box3} aabb Axis aligned bounding box.
   * @returns {Array}
   */
  Index.prototype.intersects = function (aabb) {
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
  Index.prototype.intersectsViewSelection = function (frustum, p1, p2) {
    // get the list of cells that intersect the frustum
    // reduce the list of cells to those that intersect with p1 and p2
  };

  /**
   * Find
   * @param {Array} pos Position
   * @param {Number} radius Search radius
   * @param {Number} limit Maximum number of entities returned.
   */
  Index.prototype.near = function (pos, radius, limit) {
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
  Index.prototype.nearest = function (pos, limit) {
    // get the cells nearest to the position
    // get the list of objects nearest to the position
  };

  /**
   * Remove object from the index.
   * @param {String} id Object identifier
   */
  Index.prototype.remove = function (id) {
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

  return Index;

}());
