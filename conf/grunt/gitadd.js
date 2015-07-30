'use strict';

module.exports = {
  dist: {
    options: {},
    files: {
      src: ['bower.json', 'package.json', 'pom.xml']
    }
  },
  snapshot: {
    options: {
      all: true
    },
    files: {
      src: []
    }
  }
};
