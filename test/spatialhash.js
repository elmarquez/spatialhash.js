'use strict';

describe('spatial index', function () {

  var config, index;

  beforeEach(function (done) {
    config = {};
    index = new SpatialHash(config);
    done();
  });

  describe('setup', function () {
    it('assigns the correct cell size', function (done) {
      config = {
        cellSize: 100
      };
      index = new SpatialHash(config);
      expect(index.cellSize).toEqual(config.cellSize);
      done();
    });
    it('assigns the correct conversion factor', function (done) {
      expect(index.conversionFactor).toEqual(0.1);
      config = {
        cellSize: 100
      };
      index = new SpatialHash(config);
      expect(index.conversionFactor).toEqual(0.01);
      done();
    });
    it('assigns the correct width', function (done) {
      expect(index.width).toEqual(100);
      config = {
        max: 2048
      };
      index = new SpatialHash(config);
      expect(index.width).toEqual(204.8);
      done();
    });
    it('assigns the specified position hash function', function (done) {
      expect(index.indexingStrategy).toEqual(index.getUnbounded3DHashKey);
      done();
    });
  });

  describe('position hashing functions', function () {
    describe('get bounded 2D hash key', function () {
      it('accepts only positive coordinate values', function (done) {
        done(false);
      });
    });
    describe('get bounded 3D hash key', function () {
      it('accepts only positive coordinate values', function (done) {
        done(false);
      });
    });
    describe('get unbounded 2D hash key', function () {
      it('accepts positive and negative coordinate values', function (done) {
        done(false);
      });
    });
    describe('get unbounded 3D hash key', function () {
      it('accepts positive and negative coordinate values', function (done) {
        done(false);
      });
    });
  });

  xdescribe('2D index', function () {

    it('should apply the specified configuration', function (done) {
      index = new SpatialHash({dimensions: SpatialHash.COORDINATE_DIMENSIONS.THREE});
      expect(index.dimensions).toEqual(SpatialHash.COORDINATE_DIMENSIONS.THREE);

      index = new SpatialHash({cellSize: 100});
      expect(index.cellSize).toEqual(100);

      index = new SpatialHash({max: 100});
      expect(index.max).toEqual(100);

      index = new SpatialHash({min: -100});
      expect(index.min).toEqual(100);

      done(false);
    });

    describe('entity contained by one bucket', function () {
      it('should add the entity to the correct bucket', function (done) {
        done(false);
      });
      it('should retrieve the entity from the bucket', function (done) {
        done(false);
      });
      it('should accept negative coordinate values', function (done) {
        done(false);
      });
    });

    describe('entity spanning two buckets', function () {
      it('should add the entity to the correct buckets', function (done) {
        done(false);
      });
      it('should retrieve the entity from each bucket', function (done) {
        done(false);
      });
    });

    describe('entity spanning four buckets', function () {
      it('should add the entity to the correct buckets', function (done) {
        done(false);
      });
      it('should retrieve the entity from each bucket', function (done) {
        done(false);
      });
    });

    it('should clear the index', function (done) {
      done(false);
    });

  });

  xdescribe('3D index', function () {

    describe('entity contained by one bucket', function () {
      it('should add entity to correct bucket', function (done) {
        done(false);
      });
      it('should retrieve the entity from the bucket', function (done) {
        done(false);
      });
    });

    describe('entity spanning two buckets', function () {
      it('should add entity to correct buckets', function (done) {
        done(false);
      });
      it('should retrieve the entity from each bucket', function (done) {
        done(false);
      });
    });

    describe('entity spanning four buckets', function () {
      it('should add entity to correct buckets', function (done) {
        done(false);
      });
      it('should retrieve the entity from each bucket', function (done) {
        done(false);
      });
    });

    it('should clear the index', function (done) {
      done(false);
    });

  });

});
