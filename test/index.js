'use strict';

describe('spatial index', function () {

  var box, config, index, intersects, point;

  beforeEach(function (done) {
    config = {};
    index = new SpatialHash(config);
    done();
  });

  describe('entity intersecting one cell', function () {

    beforeEach(function (done) {
      box = {
        min: {x:1, y:1, z:1},
        max: {x:2, y:2, z:2}
      };
      point = {
        min: {x:1, y:1, z:1},
        max: {x:1, y:1, z:1}
      };
      done();
    });

    it('should create one cell to entity map entry', function (done) {
      index.insert('point', point);
      index.insert('box', box);

      var count = Object.keys(index.cells).length;
      expect(count).toBe(1);

      Object.keys(index.cells).forEach(function (key) {
        count = index.cells[key].length;
        expect(count).toBe(2);
      });

      done();
    });

    it('should create two entity to cell map entries', function (done) {
      index.insert('point', point);
      index.insert('box', box);

      var count = Object.keys(index.objects).length;
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
      box = {
        min: {x:0, y:0, z:0},
        max: {x:11, y:1, z:1}
      };
      point = {
        min: {x:0, y:0, z:0},
        max: {x:11, y:1, z:1}
      };
      done();
    });

    it('should create two cell to entity map entries', function (done) {
      index.insert('point', point);
      index.insert('box', box);

      var count = Object.keys(index.cells).length;
      expect(count).toBe(2);

      Object.keys(index.cells).forEach(function (key) {
        count = index.cells[key].length;
        expect(count).toBe(2);
      });

      done();
    });

    it('should create two entity to cell map entries', function (done) {
      index.insert('point', point);
      index.insert('box', box);

      var count = Object.keys(index.objects).length;
      expect(count).toBe(2);

      Object.keys(index.objects).forEach(function (key) {
        count = index.objects[key].length;
        expect(count).toBe(2);
      });

      done();
    });

  });

  describe('entity intersecting four cells', function () {

    beforeEach(function (done) {
      box = {
        min: {x:0, y:0, z:0},
        max: {x:11, y:11, z:1}
      };
      point = {
        min: {x:0, y:0, z:0},
        max: {x:11, y:11, z:1}
      };
      done();
    });

    it('should create four cell to entity map entries', function (done) {
      index.insert('point', point);
      index.insert('box', box);

      var count = Object.keys(index.cells).length;
      expect(count).toBe(4);

      Object.keys(index.cells).forEach(function (key) {
        count = index.cells[key].length;
        expect(count).toBe(2);
      });

      done();
    });

    it('should create two entity to cell map entries', function (done) {
      index.insert('point', point);
      index.insert('box', box);

      var count = Object.keys(index.objects).length;
      expect(count).toBe(2);

      Object.keys(index.objects).forEach(function (key) {
        count = index.objects[key].length;
        expect(count).toBe(4);
      });

      done();
    });

  });

  describe('entity intersecting more than four cells', function () {

    beforeEach(function (done) {
      box = {
        min: {x:0, y:0, z:0},
        max: {x:100, y:100, z:100}
      };
      point = {
        min: {x:0, y:0, z:0},
        max: {x:100, y:100, z:100}
      };
      done();
    });

    it('should create one hundred cell to entity map entries', function (done) {
      index.insert('point', point);
      index.insert('box', box);

      var count = Object.keys(index.cells).length;
      expect(count).toBe(1000);

      Object.keys(index.cells).forEach(function (key) {
        count = index.cells[key].length;
        expect(count).toBe(2);
      });

      done();
    });

    it('should create one hundred entity to cell map entries', function (done) {
      index.insert('point', point);
      index.insert('box', box);

      var count = Object.keys(index.objects).length;
      expect(count).toBe(2);

      Object.keys(index.objects).forEach(function (key) {
        count = index.objects[key].length;
        expect(count).toBe(1000);
      });

      done();
    });
  });

  describe('clear function', function () {
    it('should remove all entities from the index', function (done) {
      done(false);
    });
  });

  describe('get intersects function', function () {
    it('should return a list of all intersecting cells for a given envelope', function (done) {
      var intersects = [];
      expect(intersects.length).toBe(0);
      done();
    });
  });

});
