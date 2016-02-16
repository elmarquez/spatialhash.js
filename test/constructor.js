'use strict';

describe('constructor', function () {

  var config, hash, index;

  beforeEach(function (done) {
    config = {};
    index = new SpatialHash(config);
    done();
  });

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

  // FIXME this belongs somewhere else
  it('computes the correct distance between points', function (done) {
    var distance = index.getDistance([0,0,0],[1,0,0]);
    expect(distance).toEqual(1);

    distance = index.getDistance([0,0,0],[0,-1,0]);
    expect(distance).toEqual(1);

    distance = index.getDistance([0,0,0],[1,1,0]);
    expect(distance).toEqual(Math.sqrt(2));

    done();
  });

});
