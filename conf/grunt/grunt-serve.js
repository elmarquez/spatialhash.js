module.exports = function(grunt) {
  grunt.registerTask('serve',
    'Serve the application from the /dist folder on the localhost.',
    ['connect::keepalive']
  );
};
