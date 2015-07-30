'use strict';

module.exports = function (grunt) {
  grunt.registerTask('compile', 'Compile a distributable version of the application in /dist.',
    function () {
      // Load package.json and manifest.json into Grunt.
      grunt.task.run(['load-package','load-manifest']);

      // Lint then build the base distribution.
      grunt.task.run([
        'jshint:dist',
        'clean:build',
        'copy:dist',
        'copy:vendor',
        'template'
      ]);

      // Prepare production release.
      if (grunt.config.get('production')) {
        grunt.task.run(['cssmin','uglify','clean:dist']);
      } else if (grunt.config.get('instrument')) {
        grunt.task.run(['shell:instrument']);
      }
    }
  );
};
