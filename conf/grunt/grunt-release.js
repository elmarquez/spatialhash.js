'use strict';

module.exports = function (grunt) {
  grunt.registerTask('release', 'Test the application, tag the release and push an artifact to Nexus.',
    function () {
      // Fail if we haven't specified a JIRA task ID for the release.
      grunt.task.run(['ensure-ticket']);

      // Fail if the test suite does not pass.
      grunt.task.run(['mock:on','compile','test','mock:off']);

      // Bump the version identifier. Stage modified files then commit. Tag the
      // latest commit.
      grunt.task.run(['bump-version','gitadd:dist','gitcommit:dist','gittag:dist']);

      // Build and release an artifact.
      grunt.task.run(['clean:release','compile','maven']);
    }
  );
};
