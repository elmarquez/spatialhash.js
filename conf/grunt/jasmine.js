'use strict';

module.exports = {
    test: {
        src: 'dist/spatialhash.js',
        options: {
            specs: [
              //'test/constructor.js',
              //'test/hashing_functions.js',
              //'test/index_2d.js',
              'test/index.js'
              //'test/search.js'
            ],
            vendor: []
        }
    }
};
