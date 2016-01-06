'use strict';

module.exports = {
  options: {
    jshintrc: '.jshintrc',
    reporter: require('jshint-stylish')
  },
  dist: {
    src: [
      'Gruntfile.js',
      'src/**/*.js',
      'test/**/*.js'
    ]
  }
};
