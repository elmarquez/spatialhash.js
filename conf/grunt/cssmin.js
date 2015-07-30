module.exports = {
  dist: {
    files: {
      '<%= app.dist %>/styles/main.min.css': '<%= manifest.minify.css %>'
    }
  }
};
