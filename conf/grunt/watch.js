'use strict';

module.exports = {
  livereload: {
    options: {
      livereload: '<%= connect.options.livereload %>'
    },
    files: [
      'conf/**/*',
      'src/**/*',
      'test/**/*'
    ],
    tasks: ['compile']
  }
};
