'use strict';

module.exports = function (grunt) {
  grunt.registerTask('mock', 'Enable and disable mock flag',
    function (arg) {
      if (arg && arg === 'on') {
        grunt.config.set('mock', true);
        grunt.log.ok('Set mock flag to true');
      } else if (arg && arg === 'off') {
        grunt.config.set('mock', false);
        grunt.log.ok('Set mock flag to false');
      }
    }
  );
};
