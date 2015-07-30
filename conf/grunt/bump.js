'use strict';

module.exports = {
  options: {
    files: ['bower.json', 'package.json'],
    updateConfigs: [],
    commit: false,
    commitMessage: 'Release v%VERSION%',
    commitFiles: ['bower.json', 'package.json'],
    createTag: false,
    tagName: 'v%VERSION%',
    tagMessage: 'Version %VERSION%',
    push: false,
    pushTo: 'origin',
    gitDescribeOptions: '--tags --always --abbrev=1 --dirty=-d'
  }
};
