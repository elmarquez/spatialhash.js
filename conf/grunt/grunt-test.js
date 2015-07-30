'use strict';

module.exports = function (grunt) {
  grunt.registerTask('test', 'Run test suite against the distribution.',
    function () {
      //grunt.log.error('WARNING: tests will execute against the MOCK API');
      //grunt.config.set('mock', true);

      if (grunt.config.get('selenium') === 'localhost') {
        if (grunt.config.get('options').build === false) {
          grunt.task.run(['connect:test','protractor']);
        } else {
          grunt.task.run(['compile','connect:test','protractor']);
        }
      } else {
        grunt.task.run(['compile','protractor']);
      }
    });
};
