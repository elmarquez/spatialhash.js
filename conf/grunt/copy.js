module.exports = {
  dist: {
    cwd: '<%= app.src %>',
    src: [ '**/*', '!**/sass/**/*' ],
    dest: '<%= app.dist %>',
    expand: true
  },
  instrumented: {
    cwd: '<%= dist %>',
    src: [ '<%= dist %>/instrumented/**/*.js' ],
    dest: '<%= dist %>/app',
    expand: true
  },
  vendor: {
    cwd: 'vendor',
    src: [ '**/*', '!**/src/**/*', '!**/test/**/*' ],
    dest: '<%= app.dist %>/vendor',
    expand: true
  }
};
