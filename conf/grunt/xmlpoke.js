'use strict';

module.exports = {
  parent: {
    options: {
      xpath: '/project/parent/version',
      value: '<%= pkg.parent.version %>'
    },
    files: {
      'pom.xml': 'pom.xml'
    }
  },
  version: {
    options: {
      xpath: '/project/version',
      value: '<%= pkg.version %>'
    },
    files: {
      'pom.xml': 'pom.xml'
    }
  }
};
