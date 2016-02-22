'use strict';

QUnit.test('get intersects', function (assert) {
  var config = {};
  var index = new SpatialHash(config);
  var box, intersects;

  box = {
    min: {x:9, y:9, z:9},
    max: {x:11, y:11, z:11}
  };
  intersects = index.getCellsIntersectingAABB(box, 10);
  assert.equal(intersects.length, 8, 'Passed');

  box = {
    min: {x:1, y:1, z:1},
    max: {x:100, y:100, z:100}
  };
  intersects = index.getCellsIntersectingAABB(box, 10);
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
  var box1, box2;
  var index = new SpatialHash();
  box1 = {
    min: {x:3, y:3, z:3},
    max: {x:4, y:4, z:4}
  };
  box2 = {
    max: {x:-3, y:-3, z:-3},
    min: {x:-4, y:-4, z:-4}
  };
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

  var point = [1, 1, 1];
  var env = index.getPositionEnvelope(point);

  assert.equal(env.min.x, 0, 'Passed');
  assert.equal(env.min.y, 0, 'Passed');
  assert.equal(env.min.z, 0, 'Passed');
  assert.equal(env.max.x, 10, 'Passed');
  assert.equal(env.max.y, 10, 'Passed');
  assert.equal(env.max.z, 10, 'Passed');

  point = [10, 10, 10];
  env = index.getPositionEnvelope(point);

  assert.equal(env.min.x, 10, 'Passed');
  assert.equal(env.min.y, 10, 'Passed');
  assert.equal(env.min.z, 10, 'Passed');
  assert.equal(env.max.x, 20, 'Passed');
  assert.equal(env.max.y, 20, 'Passed');
  assert.equal(env.max.z, 20, 'Passed');

  point = [15, 15, 15];
  env = index.getPositionEnvelope(point);

  assert.equal(env.min.x, 10, 'Passed');
  assert.equal(env.min.y, 10, 'Passed');
  assert.equal(env.min.z, 10, 'Passed');
  assert.equal(env.max.x, 20, 'Passed');
  assert.equal(env.max.y, 20, 'Passed');
  assert.equal(env.max.z, 20, 'Passed');

  point = [-1, -1, -1];
  env = index.getPositionEnvelope(point);

  assert.equal(env.min.x, -10, 'Passed');
  assert.equal(env.min.y, -10, 'Passed');
  assert.equal(env.min.z, -10, 'Passed');
  assert.equal(env.max.x, 0, 'Passed');
  assert.equal(env.max.y, 0, 'Passed');
  assert.equal(env.max.z, 0, 'Passed');
});
