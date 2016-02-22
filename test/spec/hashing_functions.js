'use strict';

describe('position hashing functions', function () {

  var config, env, err, hash, index, point;

  beforeEach(function (done) {
    config = {};
    index = new SpatialHash(config);
    done();
  });

  describe('get position envelope', function () {
    it('returns the cell envelope', function (done) {

      point = {x:1, y:1, z:1};
      env = index.getPositionEnvelope(point);

      expect(env.max.x).toEqual(10);
      expect(env.max.y).toEqual(10);
      expect(env.max.z).toEqual(10);
      expect(env.min.x).toEqual(0);
      expect(env.min.y).toEqual(0);
      expect(env.min.z).toEqual(0);

      //point = {x:10, y:10, z:10};
      //env = index.getPositionEnvelope(point);
      //
      //expect(env.max.x).toEqual(20);
      //expect(env.max.y).toEqual(20);
      //expect(env.max.z).toEqual(20);
      //expect(env.min.x).toEqual(10);
      //expect(env.min.y).toEqual(10);
      //expect(env.min.z).toEqual(10);

      done();
    });
  });

  describe('get bounded 3D hash key', function () {

    beforeEach(function (done) {
      err = null;
      done();
    });

    it('generates a hash key corresponding to the 2D bucket', function (done) {
      hash = index.getBoundedHashKey([0,0,0]);
      expect(hash).toEqual('0:0:0');

      hash = index.getBoundedHashKey([1,1,1]);
      expect(hash).toEqual('0:0:0');

      hash = index.getBoundedHashKey([500.5,500.10,500.75]);
      expect(hash).toEqual('50:50:50');

      hash = index.getBoundedHashKey([1000,1000,1000]);
      expect(hash).toEqual('100:100:100');
      done(false);
    });

    it('accepts positive coordinate values', function (done) {
      hash = index.getBoundedHashKey([1,1,1]);
      expect(hash).toBeDefined();
      done();
    });

    it('accepts coordinate values greater than or equal to the min bound', function (done) {
      hash = index.getBoundedHashKey([1,1,0]);
      expect(hash).toBeDefined();
      try {
        index.getBoundedHashKey([-1,0,1]);
      } catch (e) {
        err = e;
      }
      expect(err).toBeDefined();
      done();
    });

    it('accepts coordinate values less than or equal to the max bound', function (done) {
      hash = index.getBoundedHashKey([1000,1000,1000]);
      expect(hash).toBeDefined();
      try {
        index.getBoundedHashKey([1001,1,1000]);
      } catch (e) {
        err = e;
      }
      expect(err).toBeDefined();
      done();
    });

    it('rejects coordinate values less than zero', function (done) {
      try {
        index.getBoundedHashKey([-1,1,0]);
      } catch (e) {
        err = e;
      }
      expect(err).toBeDefined();
      done();
    });

  });

  describe('get unbounded 3D hash key', function () {

    beforeEach(function (done) {
      err = null;
      done();
    });

    it('generates a hash key corresponding to the 2D bucket', function (done) {
      hash = index.getUnboundedHashKey([-100,-100,-100]);
      expect(hash).toEqual('-10:-10:-10');

      hash = index.getUnboundedHashKey([-1,-1,-1]);
      expect(hash).toEqual('-1:-1:-1');

      hash = index.getUnboundedHashKey([1,1,1]);
      expect(hash).toEqual('0:0:0');

      hash = index.getUnboundedHashKey([500.5,500.10,500.75]);
      expect(hash).toEqual('50:50:50');

      hash = index.getUnboundedHashKey([1000,1000,1000]);
      expect(hash).toEqual('100:100:100');
      done(false);
    });

    it('accepts positive and negative coordinate values', function (done) {
      hash = index.getUnboundedHashKey([1,1,1]);
      expect(hash).toBeDefined();

      hash = index.getUnboundedHashKey([-1,-1,-1]);
      expect(hash).toBeDefined();

      done();
    });

  });

});
