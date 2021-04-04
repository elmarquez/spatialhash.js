import { Box3, Vector3 } from 'three';
import utils from './utils.mjs';

/**
 * Two and three dimensional spatial indexing support for three.js. This
 * library was originally designed to support screen space drag selection 
 * operations for a point cloud editing application. However, it should 
 * generalize to other applications as well.
 *
 * - Objects are assumed to have an axis aligned bounding box
 * - cell size should be a power of 2 or 3
 * - Search by camera direction, screen coordinates
 *
 * Positions will all be normalized to three dimensions. For two dimensional
 * points, a Z value of 0 is defined.
 *
 * The first entry for each cell is a THREE.Box3 that defines the bounding
 * envelope of the cell. The subsequent entries for each cell are
 * identifiers for those entities intersecting the cell.
 *
 * - spatial hash can be used in 3D model space or 2D screen space
 * 
 * @todo build index in a worker
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
class SpatialIndex {

  // cell to object map. cells are identified by a position hash key. each cell record
  // contains an array with a list of object IDs
  cells = {};

  // configuration
  config = {
    cellSize: 32,
    max: 3200,
    min: -3200
  };

  // cell to cell bounding envelope map. cells are identifed by a position hash key.
  // the bounding envelope identifies the min, max positions defining the cell.
  envelopes = {};

  // object ID to cell hash key map. the map allows us to determine the set of cells that
  // an object occupies.
  objects = {};

  /**
   * Constructor
   * @param {Object} cfg - Configuration 
   */
  constructor(cfg) {
    this.config = Object.assign(this.config, cfg || {});
  }

  /**
   * 
   * @param aabb 
   * @param cellSize 
   */
  getAABBCells(aabb, cellSize) {
    return utils.getAABBCells(aabb, cellSize);
  }

  /**
   * Get the list of cells that intersect the axis aligned bounding box.
   * @param {THREE.Box3} aabb Axis aligned bounding box
   * @returns {Array} List of intersecting cells
   */
  getCellsIntersectingAABB(aabb) {
    var intersects = {};
    var self = this;
    Object.keys(self.envelopes).forEach(function (cell) {
      if (aabb.intersectsBox(self.envelopes[cell])) {
        intersects[cell] = 0;
      }
    });
    return Object.keys(intersects);
  }

  /**
   * Get the list of cells that intersect the camera frustum.
   * @param {THREE.Frustum} frustum Camera frustum
   * @returns {Promise} List of intersecting cells
   */
  getCellsIntersectingFrustum(frustum) {
    var opt, pa, planes = [], self = this, start = new Date().getTime();
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
        .require({ fn: utils.getDistanceToPoint, name: 'getDistanceToPoint' })
        .require({ fn: utils.getDotProduct, name: 'getDotProduct' })
        .require({ fn: utils.intersectsBox, name: 'intersectsBox' })
        .require({ fn: utils.mergeArray, name: 'mergeArray' });
      pa.map(function (key) {
        return utils.intersectsBox(global.env.planes, global.env.envelopes[key]) ? key : [];
      })
        .reduce(function (cell) {
          var result = [];
          result = utils.mergeArray(result, cell[0]);
          result = utils.mergeArray(result, cell[1]);
          return result;
        })
        .then(function (data, err) {
          console.info('getCellsIntersectingFrustum', new Date().getTime() - start);
          if (err) {
            reject(err);
          } else {
            resolve(data);
          }
        });
    });
  }

  /**
   * Get scene entities intersecting the camera frustum.
   * @param {THREE.Frustum} frustum Camera frustum
   * @returns {Promise} List of scene entities
   */
  getEntitiesIntersectingFrustum(frustum) {
    var self = this, start = new Date().getTime();
    return new Promise(function (resolve, reject) {
      self
        .getCellsIntersectingFrustum(frustum)
        .then(function (keys) {
          if (keys.length > 0) {
            // parallel doesn't do well with data of zero length
            var pa = new Parallel(keys, { env: { cells: self.cells } });
            pa.require({ fn: utils.mergeArray, name: 'mergeArray' });
            pa.map(function (key) {
              var result = [];
              if (global.env.cells[key] && Array.isArray(global.env.cells[key])) {
                result = [].concat(global.env.cells[key]);
              }
              return result;
            })
              .reduce(function (objs) {
                var result = [];
                result = utils.mergeArray(result, objs[0]);
                result = utils.mergeArray(result, objs[1]);
                return result;
              })
              .then(function (data, err) {
                console.info('getEntitiesIntersectingFrustum', new Date().getTime() - start);
                if (err) {
                  reject(err);
                } else {
                  resolve(data);
                }
              });
          }
        });
    });
  }

  /**
   * Get scene entities intersecting the screen rectangle.
   * @param {THREE.Box2} rec Screen rectangle
   * @returns {Array} List of scene entities
   */
  getEntitiesIntersectingScreenRectangle(rec) {
    var self = this;
    var p1 = new Vector3(rec.min.x, rec.min.y, 0);
    var p2 = new Vector3(rec.max.x, rec.max.y, 1);
    var aabb = new Box3().setFromPoints([p1, p2]);
    var entities = this
      .getAABBCellKeys(aabb)
      .reduce(function (cells, key) {
        if (key in self.cells) {
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
  }

  /**
   * Get entity vertices intersecting the camera frustum.
   * @param {THREE.Frustum} frustum Camera frustum
   * @returns {Array}
   */
  getVerticesIntersectingFrustum(frustum) {
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
  }

  /**
   * Insert object into the index.
   * @param {String} id Object identifier
   * @param {Number} index Element index
   * @param {THREE.Box2|THREE.Box3} aabb Axis aligned bounding box
   * @param {Object} metadata Object metadata
   */
  insert(id, index, aabb, metadata) {
    var position, self = this;
    // the cells intersecting the aabb
    var cells = utils.getAABBCells(aabb, self.cellSize)
      .reduce(function (intersects, vertex) {
        position = self.getPositionHash(vertex);
        intersects[position] = utils.getPositionEnvelope(vertex, self.cellSize);
        return intersects;
      }, {});
    // add index entries
    Object.keys(cells).forEach(function (cell) {
      // record bounding envelope for the cell
      self.envelopes[cell] = cells[cell];
      // add cell to entity entity id mapping
      if (!(cell in self.cells)) {
        self.cells[cell] = [];
      }
      self.cells[cell].push(id);
      // add entity id to cell mapping
      if (!(id in self.objects)) {
        self.objects[id] = [];
      }
      self.objects[id].push(cell);
    });
  }

  /**
   * Insert all objects
   * @param {Array|Object} objs List of scene object records.
   * @returns {Promise}
   */
  insertAll(objs) {
    var count = { objects: -1, faces: -1, edges: -1, vertices: -1 }, opts, p, self = this;
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
      } else {
        // check for null bounding boxes
        objs.forEach(function (obj) {
          if (!obj.aabb || !obj.aabb.max || !obj.aabb.min) {
            reject('Missing aabb', obj);
          }
        });
        opts = {
          env: {
            cellSize: self.cellSize,
          },
          evalPath: self.scripts.EVAL
          //, maxWorkers: 8
        };
        p = new Parallel(objs, opts)
          .require(self.scripts.THREE)
          .require({ fn: utils.getAABBCells, name: 'getAABBCells' })
          .require({ fn: utils.getPositionEnvelope, name: 'getPositionEnvelope' })
          .require({ fn: utils.getUnboundedPositionHashKey, name: 'getPositionHash' })
          .require({ fn: utils.mergeFields, name: 'mergeFields' });
        p.map(function (obj) {
          var cells, position, record = { cells: {}, envelopes: {}, objects: {} };
          // the cells intersecting the aabb
          cells = utils.getAABBCells(obj.aabb, self.cellSize)
            .reduce(function (intersects, vertex) {
              position = utils.getPositionHash(vertex, self.cellSize);
              intersects[position] = utils.getPositionEnvelope(vertex, self.cellSize);
              return intersects;
            }, {});
          // add index entries
          Object.keys(cells).forEach(function (key) {
            // cell bounding envelopes
            record.envelopes[key] = cells[key];
            // cell id to object id map
            if (!(key in record.cells)) {
              record.cells[key] = [];
            }
            record.cells[key].push(obj.id);
            // object id to cell id map
            if (!(obj.id in record.objects)) {
              record.objects[obj.id] = [];
            }
            record.objects[obj.id].push(key);
          });
          return record;
        })
          .reduce(function (records) {
            // TODO count each type of entity
            utils.mergeFields(records[0].cells, records[1].cells);
            Object.keys(records[1].envelopes).forEach(function (key) {
              records[0].envelopes[key] = records[1].envelopes[key];
            });
            utils.mergeFields(records[0].objects, records[1].objects);
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
      }
    });
  }

  /**
   * Get the list of cells that intersect the AABB.
   * @param {THREE.Box3} aabb Axis aligned bounding box.
   * @returns {Array}
   */
  intersects(aabb) {
    var intersects = [], self = this;
    Object.keys(self.envelopes).forEach(function (envelope) {
      if (envelope.intersectsBox(aabb)) {
        intersects.push(envelope);
      }
    });
    return intersects;
  }

  /**
   * Find those entities that intersect or are contained within the screen
   * selection.
   * @param {THREE.Frustum} frustum Camera frustum
   * @param {THREE.Vector3} p1 Screen position 1
   * @param {THREE.Vector3} p2 Screen position 2
   * @returns {Array} Scene objects intersecting or contained within the selection rectangle.
   */
  intersectsViewSelection(frustum, p1, p2) {
    // get the list of cells that intersect the frustum
    // reduce the list of cells to those that intersect with p1 and p2
  }

  /**
   * Find
   * @param {Array} pos Position
   * @param {Number} radius Search radius
   * @param {Number} limit Maximum number of entities returned.
   */
  near(pos, radius, limit) {
    limit = limit || Infinity;
    var searchVolume = new Box3().setFromCenterAndSize(pos, radius);

    // get the cells nearest to the position
    // get the list of objects nearest to the position
  }

  /**
   * Find the nearest set of entities to the specified point. Return the list in
   * order of proximity.
   * @param {THREE.Vector3} pos Position to search from
   * @param {Number} limit Limit of number of records to return
   * @returns {Array}
   */
  nearest(pos, limit) {
    // get the cells nearest to the position
    // get the list of objects nearest to the position
  }

  /**
   * Remove object from the index.
   * @param {String} id Object identifier
   */
  remove(id) {
    var i, self = this;
    // remove object from all cells
    if (id in this.objects) {
      this.objects[id].forEach(function (cell) {
        i = self.cells[cell].indexOf(id);
        if (i > -1) {
          self.cells[cell].splice(i, 1);
        }
      });
    }
    // remove object envelope, record
    delete this.envelopes[id];
    delete this.objects[id];
  }

  /**
   * Reset the index.
   */
     reset() {
      this.cells = {};
      this.envelopes = {};
      this.objects = {};
    }  
}

export default SpatialIndex;
