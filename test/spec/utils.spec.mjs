import THREE from 'THREE';
import utils from '../../src/utils.mjs';

describe('utils', function () {

    describe('getAABBCellKeys', function () {
        it('returns a list of keys for the cells occupied by the aabb', function () {
            const fn = (v) => v;
            const p1 = new THREE.Vector3(0,0,0);
            const p2 = new THREE.Vector3(1,1,1);
            const box = new THREE.Box3(p1, p2);
            const keys = utils.getAABBCellKeys(box, 10, fn);
            expect(Array.isArray(keys)).toEqual(true);
        });
    });

    describe('getAABBCells', function () {
        it('returns a list with one cell when the envelope is smaller than the cell size', function () {
            const p1 = new THREE.Vector3(0,0,0);
            const p2 = new THREE.Vector3(1,1,1);
            const box = new THREE.Box3(p1, p2);
            const cells = utils.getAABBCells(box, 10);
            expect(Array.isArray(cells)).toEqual(true);
            expect(cells.length).toEqual(1);
        });
        it('returns a list with more than one cell when the envelope is larger than the cell size', function () {
            const p1 = new THREE.Vector3(-1,-1,-1);
            const p2 = new THREE.Vector3(1,1,1);
            const box = new THREE.Box3(p1, p2);
            const cells = utils.getAABBCells(box, 10);
            expect(cells.length).toEqual(8);
        });
    });

    describe('getDistance', function () {
        it('computes the correct distance between points', function () {
            const p1 = new THREE.Vector3(0,0,0);
            const p2 = new THREE.Vector3(1,0,0);
            var distance = utils.getDistance(p1, p2);
            expect(distance).toEqual(1);

            const p3 = new THREE.Vector3(0,-1,0);
            distance = utils.getDistance(p1, p3);
            expect(distance).toEqual(1);

            const p4 = new THREE.Vector3(1,1,0);
            distance = utils.getDistance(p1, p4);
            expect(distance).toEqual(Math.sqrt(2));
        });
    });

    describe('getDistanceToPoint', function () {
        it('returns the distance from the plane to the point', function () {
            const normal = new THREE.Vector3(0, 0, 1);
            const plane = new THREE.Plane(normal, 0);
            const point = new THREE.Vector3(1, 1, 1);
            const dist = utils.getDistanceToPoint(plane, point);
            expect(dist).toEqual(1);
        });
    });

    describe('getDotProduct', function () {
        it('returns the dot product of two vectors', function () {
            const v1 = new THREE.Vector3(0, 0, 1);
            const v2 = new THREE.Vector3(1, 0, 0);
            const result = utils.getDotProduct(v1, v2);

            expect(Array.isArray(result)).toEqual(false);
            expect(result).toEqual(0);
        });
    });

    describe('getPositionEnvelope', function () {
        it('returns the cell envelope', function () {
            var point = new THREE.Vector3(1, 1, 1);
            var env = utils.getPositionEnvelope(point, 10, 1);

            expect(env.max.x).toEqual(10);
            expect(env.max.y).toEqual(10);
            expect(env.max.z).toEqual(10);
            expect(env.min.x).toEqual(0);
            expect(env.min.y).toEqual(0);
            expect(env.min.z).toEqual(0);

            point = new THREE.Vector3(10, 10, 10);
            env = utils.getPositionEnvelope(point, 10, 1);

            expect(env.max.x).toEqual(20);
            expect(env.max.y).toEqual(20);
            expect(env.max.z).toEqual(20);
            expect(env.min.x).toEqual(10);
            expect(env.min.y).toEqual(10);
            expect(env.min.z).toEqual(10);
        });
    });

    describe('getPositionHashKey', function () {
        let hash = null;

        beforeEach(function (done) {
            done();
        });

        it('returns a hash key corresponding to the 3D bucket', function () {
            hash = utils.getPositionHashKey(new THREE.Vector3(-10, -10, -10), 16);
            expect(hash).toEqual('-16:-16:-16');

            hash = utils.getPositionHashKey(new THREE.Vector3(-1, -1, -1), 16);
            expect(hash).toEqual('-16:-16:-16');

            hash = utils.getPositionHashKey(new THREE.Vector3(1, 1, 1), 16);
            expect(hash).toEqual('0:0:0');

            hash = utils.getPositionHashKey(new THREE.Vector3(500.5, 500.10, 500.75), 16);
            expect(hash).toEqual('496:496:496');

            hash = utils.getPositionHashKey(new THREE.Vector3(9, 9, 9), 16);
            expect(hash).toEqual('0:0:0');
        });

        it('accepts positive and negative coordinate values', function () {
            hash = utils.getPositionHashKey(new THREE.Vector3(1, 1, 1), 16);
            expect(hash).toBeDefined();

            hash = utils.getPositionHashKey(new THREE.Vector3(-1, -1, -1), 16);
            expect(hash).toBeDefined();
        });

    });

    xdescribe('intersectsBox', function () {
        it('returns true when the cell intersects the camera frustrum', function () {
            const planes = [];
            const box = new THREE.Box3(1, 1, 1);

        });

        it('returns false when the cell does not intersect the camera frustrum', function () {
            fail();
        });
    });

    describe('mergeArray', function () {
        it('merges left and right arrays', function () {
            const left = [1];
            const right = [2, 3];
            const result = utils.mergeArray(left, right);

            expect(Array.isArray(result)).toEqual(true);
            expect(result.length).not.toEqual(right.length);
            expect(result.length).toEqual(3);
        });
    });

    describe('mergeFields', function () {
        it('merges unique fields from right to left', function () {
            const left = {
                f0: [0]
            };
            const right = {
                f1: [1, 2, 3],
                f2: [4, 5, 6]
            }
            const result = utils.mergeFields(left, right);
            const keys = Object.keys(result);

            expect(keys.length).toEqual(3);
        });
    });

});