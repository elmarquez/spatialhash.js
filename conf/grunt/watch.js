'use strict';

module.exports = {
  test: {
    files: [
      'conf/**/*',
      'src/**/*',
      'test/**/*'
    ],
    tasks: ['compile','test']
  }
};
