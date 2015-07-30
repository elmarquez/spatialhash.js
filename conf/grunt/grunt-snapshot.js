'use strict';

module.exports = function (grunt) {
  grunt.registerTask('snapshot', 'Prepare snapshot for release or review.',
    function () {
      var increment = grunt.config.get('increment');
      grunt.task.run(['bump-version','gitadd:snapshot']);
    }
  );
};
