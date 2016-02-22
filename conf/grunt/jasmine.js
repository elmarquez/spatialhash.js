'use strict';

module.exports = {
    test: {
        src: 'dist/spatialhash.js',
        options: {
            specs: [
              'test/spec/constructor.js',
              'test/spec/hashing_functions.js',
              'test/spec/index.js',
              'test/spec/search.js'
            ],
            vendor: [
              'vendor/immutable/dist/immutable.js',
              'vendor/three.js/three.js'
            ]
        }
    }
};
