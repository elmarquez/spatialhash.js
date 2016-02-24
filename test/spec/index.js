'use strict';

describe('spatial index', function () {

  var box, config, count, index, intersects, point;

  beforeEach(function (done) {
    config = {};
    index = new SpatialHash(config);
    done();
  });

  describe('clear', function () {
    it('should remove all entities from the index', function (done) {
      box = new THREE.Box3(
        new THREE.Vector3(0, 0, 0),
        new THREE.Vector3(100, 100, 100));
      point = new THREE.Box3(
        new THREE.Vector3(0, 0, 0),
        new THREE.Vector3(0, 0, 0));
      index.insert('point', 1, point, {});
      index.insert('box', -1, box, {});
      index.clear();

      expect(Object.keys(index.cells).length).toBe(0);
      expect(Object.keys(index.objects).length).toBe(0);

      done();
    });
  });

  describe('insert', function () {
    describe('entity intersecting one cell', function () {

      beforeEach(function (done) {
        box = new THREE.Box3(new THREE.Vector3(1,1,1), new THREE.Vector3(2,2,2));
        point = new THREE.Box3(new THREE.Vector3(1,1,1), new THREE.Vector3(1,1,1));
        done();
      });

      it('should create one cell to entity map entry', function (done) {
        index.insert('point', 1, point);
        index.insert('box', -1, box);

        count = Object.keys(index.cells).length;
        expect(count).toBe(1);

        Object.keys(index.cells).forEach(function (key) {
          count = index.cells[key].length;
          expect(count).toBe(2);
        });

        done();
      });

      it('should create two entity to cell map entries', function (done) {
        index.insert('point', 1, point);
        index.insert('box', -1, box);

        count = Object.keys(index.objects).length;
        expect(count).toBe(2);

        Object.keys(index.objects).forEach(function (key) {
          count = index.objects[key].length;
          expect(count).toBe(1);
        });

        done();
      });

    });

    describe('entity intersecting two cells', function () {

      beforeEach(function (done) {
        box = new THREE.Box3(new THREE.Vector3(0,0,0), new THREE.Vector3(11,1,1));
        done();
      });

      it('should create two cell to entity map entries', function (done) {
        index.insert('box', -1, box);

        count = Object.keys(index.cells).length;
        expect(count).toBe(2);

        Object.keys(index.cells).forEach(function (key) {
          count = index.cells[key].length;
          expect(count).toBe(1);
        });

        done();
      });

      it('should create two entity to cell map entries', function (done) {
        index.insert('box', -1, box);

        count = Object.keys(index.objects).length;
        expect(count).toBe(1);

        Object.keys(index.objects).forEach(function (key) {
          count = index.objects[key].length;
          expect(count).toBe(2);
        });

        done();
      });

    });

    describe('entity intersecting four cells', function () {

      beforeEach(function (done) {
        box = new THREE.Box3(new THREE.Vector3(1,1,1), new THREE.Vector3(11,11,1));
        done();
      });

      it('should create four cell to entity map entries', function (done) {
        index.insert('box', -1, box);
        count = Object.keys(index.cells).length;
        expect(count).toBe(4);
        done();
      });

      it('should create two entity to cell map entries', function (done) {
        index.insert('box', -1, box);
        count = index.objects.box.length;
        expect(count).toBe(4);
        done();
      });

    });

    describe('entity intersecting more than four cells', function () {

      beforeEach(function (done) {
        box = new THREE.Box3(new THREE.Vector3(0,0,0), new THREE.Vector3(100,100,100));
        done();
      });

      it('should create one hundred cell to entity map entries', function (done) {
        index.insert('box', -1, box);

        count = Object.keys(index.cells).length;
        expect(count).toBe(1000);

        Object.keys(index.cells).forEach(function (key) {
          count = index.cells[key].length;
          expect(count).toBe(1);
        });

        done();
      });

      it('should create one hundred entity to cell map entries', function (done) {
        index.insert('box', -1, box);

        count = Object.keys(index.objects).length;
        expect(count).toBe(1);

        Object.keys(index.objects).forEach(function (key) {
          count = index.objects[key].length;
          expect(count).toBe(1000);
        });

        done();
      });
    });
  });

  describe('intersects', function () {

    beforeEach(function (done) {
      box = {
        min: {x:0, y:0, z:-15},
        max: {x:5, y:5, z:-20}
      };
      point = {
        min: {x:15, y:15, z:1},
        max: {x:15, y:15, z:1}
      };
      done();
    });

    describe('AABB', function () {
      it('should return a list of all intersecting cells for a given envelope', function (done) {
        box = new THREE.Box3(new THREE.Vector3(0,0,0), new THREE.Vector3(1,1,1));
        index.insert('box', -1, box);
        intersects = index.getCellsIntersectingAABB(box);
        expect(intersects.length).toBe(1);

        box = new THREE.Box3(new THREE.Vector3(0,0,0), new THREE.Vector3(99,99,99));
        index.insert('box', -1, box);
        intersects = index.getCellsIntersectingAABB(box);
        expect(intersects.length).toBe(1000);

        done();
      });
    });

    describe('frustum', function () {

      it('should return a list of all cells intersecting the camera frustum', function (done) {
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
        expect(cells.length).toBe(1);

        // TODO need to ensure that it is returning the correct list of cells

        done();
      });
    });

  });

  describe('remove', function () {
    it('should remove an entity by id value', function (done) {
      box = new THREE.Box3(new THREE.Vector3(0,0,0), new THREE.Vector3(99,99,99));
      point = new THREE.Box3(new THREE.Vector3(1,1,1), new THREE.Vector3(1,1,1));

      index.insert('point', 1, point);
      index.insert('box', -1, box);
      index.remove('point');

      expect(Object.keys(index.cells).length).toBe(1000);
      expect(Object.keys(index.envelopes).length).toBe(1000);
      expect(Object.keys(index.objects).length).toBe(1);

      done();
    });
  });

});
