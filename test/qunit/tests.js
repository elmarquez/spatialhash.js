'use strict';

QUnit.test('should return a list of all intersecting cells for a given envelope', function (assert) {
  var index = new SpatialHash(), intersects;
  var box = new THREE.Box3(new THREE.Vector3(0,0,0), new THREE.Vector3(1,1,1));
  index.insert('box', -1, box);

  intersects = index.getCellsIntersectingAABB(box);
  assert.equal(intersects.length, 1, 'Passed');

  index = new SpatialHash();
  box = new THREE.Box3(new THREE.Vector3(0,0,0), new THREE.Vector3(99,99,99));
  index.insert('box', -1, box);
  intersects = index.getCellsIntersectingAABB(box);
  assert.equal(intersects.length, 1000, 'Passed');
});

QUnit.test('should create four cell to entity map entries', function (assert) {
  var index = new SpatialHash();
  var box = new THREE.Box3(new THREE.Vector3(1,1,1), new THREE.Vector3(11,11,1));
  index.insert('box', -1, box);

  var count = Object.keys(index.cells).length;
  assert.equal(count, 4, 'Passed');
});

QUnit.test('should create two entity to cell map entries', function (assert) {
  var index = new SpatialHash();
  var box = new THREE.Box3(new THREE.Vector3(0,0,0), new THREE.Vector3(11,11,1));
  index.insert('box', -1, box);

  var count = index.objects.box.length;
  assert.equal(count, 4, 'Passed');
});

QUnit.test('generates a hash key corresponding to the 3D bucket', function (assert) {
  var index = new SpatialHash();

  var hash = index.getUnboundedHashKey(new THREE.Vector3(-100,-100,-100));
  assert.equal(hash, '-10:-10:-10', 'Passed');

  hash = index.getUnboundedHashKey(new THREE.Vector3(-1,-1,-1));
  assert.equal(hash, '-1:-1:-1', 'Passed');

  hash = index.getUnboundedHashKey(new THREE.Vector3(1,1,1));
  assert.equal(hash, '0:0:0', 'Passed');

  hash = index.getUnboundedHashKey(new THREE.Vector3(500.5,500.10,500.75));
  assert.equal(hash, '50:50:50', 'Passed');

  hash = index.getUnboundedHashKey(new THREE.Vector3(1000,1000,1000));
  assert.equal(hash, '100:100:100', 'Passed');
});

QUnit.test('get cell envelope', function (assert) {
  var config = {};
  var index = new SpatialHash(config);

  var point = new THREE.Vector3(1, 1, 1);
  var env = index.getPositionEnvelope(point);

  assert.equal(index.cellSize, 10, 'Passed');

  assert.equal(env.max.x, 10, 'Passed');
  assert.equal(env.max.y, 10, 'Passed');
  assert.equal(env.max.z, 10, 'Passed');
  assert.equal(env.min.x, 0, 'Passed');
  assert.equal(env.min.y, 0, 'Passed');
  assert.equal(env.min.z, 0, 'Passed');

  point = new THREE.Vector3(10, 10, 10);
  env = index.getPositionEnvelope(point);

  assert.equal(env.max.x, 20, 'Passed');
  assert.equal(env.max.y, 20, 'Passed');
  assert.equal(env.max.z, 20, 'Passed');
  assert.equal(env.min.x, 10, 'Passed');
  assert.equal(env.min.y, 10, 'Passed');
  assert.equal(env.min.z, 10, 'Passed');
});

QUnit.test('get intersects', function (assert) {
  var config = {};
  var index = new SpatialHash(config);
  var box1, box2, intersects, p1, p2, p3, p4;

  p1 = new THREE.Vector3(9,9,9);
  p2 = new THREE.Vector3(11,11,11);
  box1 = new THREE.Box3(p1, p2);
  index.insert('box1', -1, box1, {});

  intersects = index.getCellsIntersectingAABB(box1);
  assert.equal(intersects.length, 8, 'Passed');

  p3 = new THREE.Vector3(1,1,1);
  p4 = new THREE.Vector3(100,100,100);
  box2 = new THREE.Box3(p3, p4);
  index.insert('box2', -1, box2, {});

  intersects = index.getCellsIntersectingAABB(box2);
  assert.equal(intersects.length, 1000, 'Passed');
});

QUnit.test('should create multiple cell to entity map entries', function (assert) {
  var box, count;
  var config = {};
  var index = new SpatialHash(config);

  box = {
    min: {x:9, y:9, z:9},
    max: {x:11, y:11, z:11}
  };
  index.insert('box', -1, box);
  count = Object.keys(index.cells).length;
  assert.equal(count, 8, 'Passed');

  Object.keys(index.cells).forEach(function (key) {
    count = index.cells[key].length;
    assert.equal(count, 1, 'Passed');
  });

  Object.keys(index.objects).forEach(function (key) {
    count = index.objects[key].length;
    assert.equal(count, 8, 'Passed');
  });

});

QUnit.test('remove object', function (assert) {
  var box1, box2, count;
  var config = {};
  var index = new SpatialHash(config);

  box1 = {
    min: {x:9, y:9, z:9},
    max: {x:11, y:11, z:11}
  };
  box2 = {
    min: {x:9, y:9, z:9},
    max: {x:11, y:11, z:11}
  };
  index.insert('box1', -1, box1);
  index.insert('box2', -1, box2);

  index.remove('box1');

  count = Object.keys(index.objects).length;
  assert.equal(count,  1, 'Passed');
});

QUnit.test('find cells intersecting the camera frustum', function (assert) {
  var index = new SpatialHash();
  var box1 = new THREE.Box3(new THREE.Vector3(3,3,3), new THREE.Vector3(4,4,4));
  var box2 = new THREE.Box3(new THREE.Vector3(-3,-3,-3), new THREE.Vector3(-4,-4,-4));
  index.insert('box1', -1, box1);
  index.insert('box2', -1, box2);

  var scene = new THREE.Scene();
  var camera = new THREE.PerspectiveCamera();
  scene.add(camera);
  camera.updateMatrixWorld();

  var frustum = new THREE.Frustum();
  var matrix = new THREE.Matrix4().multiplyMatrices(camera.projectionMatrix, camera.matrixWorldInverse);
  frustum.setFromMatrix(matrix);

  var cells = index.getCellsIntersectingFrustum(frustum);
  assert.equal(cells.length, 1, 'Passed');
});

QUnit.test('returns the cell envelope', function (assert) {
  var index = new SpatialHash();

  var point = new THREE.Vector3(1, 1, 1);
  var env = index.getPositionEnvelope(point);

  assert.equal(env.min.x, 0, 'Passed');
  assert.equal(env.min.y, 0, 'Passed');
  assert.equal(env.min.z, 0, 'Passed');
  assert.equal(env.max.x, 10, 'Passed');
  assert.equal(env.max.y, 10, 'Passed');
  assert.equal(env.max.z, 10, 'Passed');

  point = new THREE.Vector3(10, 10, 10);
  env = index.getPositionEnvelope(point);

  assert.equal(env.min.x, 10, 'Passed');
  assert.equal(env.min.y, 10, 'Passed');
  assert.equal(env.min.z, 10, 'Passed');
  assert.equal(env.max.x, 20, 'Passed');
  assert.equal(env.max.y, 20, 'Passed');
  assert.equal(env.max.z, 20, 'Passed');

  point = new THREE.Vector3(15, 15, 15);
  env = index.getPositionEnvelope(point);

  assert.equal(env.min.x, 10, 'Passed');
  assert.equal(env.min.y, 10, 'Passed');
  assert.equal(env.min.z, 10, 'Passed');
  assert.equal(env.max.x, 20, 'Passed');
  assert.equal(env.max.y, 20, 'Passed');
  assert.equal(env.max.z, 20, 'Passed');

  point = new THREE.Vector3(-1, -1, -1);
  env = index.getPositionEnvelope(point);

  assert.equal(env.min.x, -10, 'Passed');
  assert.equal(env.min.y, -10, 'Passed');
  assert.equal(env.min.z, -10, 'Passed');
  assert.equal(env.max.x, 0, 'Passed');
  assert.equal(env.max.y, 0, 'Passed');
  assert.equal(env.max.z, 0, 'Passed');
});
