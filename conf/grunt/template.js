/**
 * Build application HTML page
 */
module.exports = {
  options: {
    data: {
      app: '<%= app %>',
      manifest: '<%= manifest %>',
      pkg: '<%= pkg %>'
    }
  },
  dist: {
    files: {
      '<%= app.dist %>/index.html': [ '<%= app.src %>/index.html' ]
    }
  }
};
