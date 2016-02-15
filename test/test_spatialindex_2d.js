'use strict';

describe('spatial index 2D', function () {

  var index;

  beforeEach(function (done) {
    index = new SpatialHash();
    done();
  });

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
