'use strict';

module.exports = {
  dist: {
    cwd: 'dist',
    expand: true,
    files: {
      'dist/spatialhash.min.js': 'dist/spatialhash.js'
    }
  },
  options: {
    banner: '/* Copyright (c) <%= grunt.template.today("yyyy") %> <%= pkg.author %>. Compiled <%= grunt.template.today("yyyy-mm-dd hh:mm:ss") %> */\n',
    mangle: false,
    screwIE8: true,
    sourceMap: true
  }
};
