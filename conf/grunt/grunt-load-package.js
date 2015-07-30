'use strict';

module.exports = function (grunt) {
  grunt.registerTask('load-package', 'Load the contents of package.json into Grunt.',
    function () {
      grunt.config.set('pkg', grunt.file.readJSON('package.json'));
    }
  );
};
