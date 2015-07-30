'use strict';

module.exports = function (grunt) {
  grunt.registerTask('bump-version', 'Bump version identifier in bower.json, package.json, pom.xml.',
    function () {
      // Reload package.json before updating pom.xml to ensure that we have the
      // latest version ID in memory.
      var increment = grunt.config.get('increment');
      grunt.task.run(['bump:' + increment, 'load-package', 'xmlpoke']);
    }
  );
};
