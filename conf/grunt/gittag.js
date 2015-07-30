'use strict';

module.exports = {
  dist: {
    options: {
      message: 'Release v<%= pkg.version %>',
      tag: 'v<%= pkg.version %>'
    }
  }
};
