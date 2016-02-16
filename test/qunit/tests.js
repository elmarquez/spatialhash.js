'use strict';

QUnit.test('get intersects', function( assert ) {
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

QUnit.test('should create multiple cell to entity map entries', function( assert ) {
  var box, count;
  var config = {};
  var index = new SpatialHash(config);

  box = {
    min: {x:9, y:9, z:9},
    max: {x:11, y:11, z:11}
  };
  index.insert('box', box);
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

QUnit.test('remove object', function( assert ) {
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
  index.insert('box1', box1);
  index.insert('box2', box2);

  index.remove('box1');

  count = Object.keys(index.objects).length;
  assert.equal(count,  1, 'Passed');
});
