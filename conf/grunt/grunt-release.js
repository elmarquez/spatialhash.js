'use strict';

module.exports = function (grunt) {
  grunt.registerTask('release', 'Test the application, then tag and push the commit to origin.',
    function () {
      // Fail if the test suite does not pass.
      grunt.task.run(['compile','test','bump']);
    }
  );
};
