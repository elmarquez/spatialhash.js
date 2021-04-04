/**
 * Get a list of hash keys for the cells occupied by the AABB.
 * @param {Object} aabb Axis aligned bounding box
 * @param {Number} cellSize Cell size
 * @param {Function} posHashFn Position hash function
 * @returns {Array} List of cell keys
 */
function getAABBCellKeys(aabb, cellSize, posHashFn) {
    return getAABBCells(aabb, cellSize).map(function (item) {
        return posHashFn(item);
    });
}

/**
 * Get a list of all intersecting cell positions for a specified envelope.
 * @param {Object} aabb Axis aligned bounding box
 * @param {Number} cellSize Cell size
 * @returns {Array} List of intersecting cell positions
 */
function getAABBCells(aabb, cellSize) {
    var i, j, k, max, min, points = [];
    max = {
        x: Math.ceil(aabb.max.x / cellSize) * cellSize,
        y: Math.ceil(aabb.max.y / cellSize) * cellSize,
        z: Math.ceil(aabb.max.z / cellSize) * cellSize
    };
    min = {
        x: Math.floor(aabb.min.x / cellSize) * cellSize,
        y: Math.floor(aabb.min.y / cellSize) * cellSize,
        z: Math.floor(aabb.min.z / cellSize) * cellSize
    };
    for (i = min.x; i < max.x; i += cellSize) {
        for (j = min.y; j < max.y; j += cellSize) {
            for (k = min.z; k < max.z; k += cellSize) {
                points.push({ x: i, y: j, z: k });
            }
        }
    }
    return points;
}

  /**
   * Get bounded hash key. Position values must be greater than or equal to zero,
   * greater than or equal to MIN, less than or equal to MAX. Position values
   * should be normalized to three dimensions.
   * @param {THREE.Vector3|Object} pos Position
   * @returns {String} Position hash key
   */
function getBoundedHashKey(pos, min, max, cellSize) {
    if (pos.x < 0 || pos.y < 0 || pos.z < 0) {
      throw new Error('Negative position value is not allowed');
    } else if (pos.x > max || pos.y > max || pos.z > max) {
      throw new Error('Position is greater than MAX');
    } else if (pos.x < min || pos.y < min || pos.z < min) {
      throw new Error('Position is less than MIN');
    }
    return getPositionHashKey(pos, cellSize);
  }

/**
 * Get the distance from P1 to P2.
 * @param {THREE.Vector3} p1 Point 1
 * @param {THREE.Vector3} p2 Point 2
 * @returns {Number} Distance
 */
function getDistance(p1, p2) {
    // normalize position to three dimensions
    if (p1.length < 3) {
        p1 = p1.push(0);
    }
    if (p2.length < 3) {
        p2 = p2.push(0);
    }
    return Math.sqrt(
        Math.pow(p2.x - p1.x, 2) +
        Math.pow(p2.y - p1.y, 2) +
        Math.pow(p2.z - p1.z, 2)
    );
}

/**
 * Get the distance from the plane to the point.
 * @param {Object} plane Plane
 * @param {Array} p Point
 */
function getDistanceToPoint(plane, p) {
    return getDotProduct(plane.normal, p) + plane.constant;
}

/**
 * Get vector dot product.
 * @param {THREE.Vector3} v1 Vector 1
 * @param {THREE.Vector3} v2 Vector 2
 * @returns {number}
 */
function getDotProduct(v1, v2) {
    return (v1.x * v2.x) + (v1.y * v2.y) + (v1.z * v2.z);
}

/**
 * Get position envelope.
 * @param {THREE.Vector3} pos Position
 * @param {Number} cellSize Cell size
 * @returns {Object}
 */
function getPositionEnvelope(pos, cellSize) {
    const min = {
        x: Math.floor(pos.x / cellSize) * cellSize,
        y: Math.floor(pos.y / cellSize) * cellSize,
        z: Math.floor(pos.z / cellSize) * cellSize
    };
    const max = {
        x: min.x + cellSize,
        y: min.y + cellSize,
        z: min.z + cellSize
    };
    return { min: min, max: max };
}

/**
 * Get position hash key. Position values from -Infinity to Infinity are valid.
 * Position values should be normalized to three dimensions.
 * @param {THREE.Vector3} pos Position
 * @param {Number} cellSize Cell size
 * @returns {String} Hashed position key
 */
function getPositionHashKey(pos, cellSize) {
    return Math.floor(pos.x / cellSize) * cellSize + ':' +
    Math.floor(pos.y / cellSize) * cellSize + ':' +
    Math.floor(pos.z / cellSize) * cellSize;
}

/**
 * Determine if the box intersects the frustum.
 * @param {Array} planes Frustum planes
 * @param {THREE.Box3} box Box
 * @returns {boolean}
 */
function intersectsBox(planes, box) {
    var d1, d2, i, p1 = { x: 0, y: 0, z: 0 }, p2 = { x: 0, y: 0, z: 0 };
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
        // if both are outside the plane then there is no intersection
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
function mergeArray(left, right) {
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
 * @returns {Object} copy of left with merged keys
 */
function mergeFields(left, right) {
    const result = Object.assign({}, left);
    // { key1: [item1, item2], key2: [item1, item2] }
    Object.keys(right).forEach(function (key) {
        if (key in result) {
            right[key].forEach(function (item) {
                result[key].push(item);
            });
        } else {
            result[key] = right[key];
        }
    });
    return result;
}

export default {
    getAABBCellKeys,
    getAABBCells,
    getBoundedHashKey,
    getDistance,
    getDistanceToPoint,
    getDotProduct,
    getPositionEnvelope,
    getPositionHashKey,
    intersectsBox,
    mergeArray,
    mergeFields
};
