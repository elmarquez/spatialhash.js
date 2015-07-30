module.exports = {
  dist: {
    options: {
      collapseWhitespace: true,
      conservativeCollapse: true,
      collapseBooleanAttributes: true,
      removeCommentsFromCDATA: true,
      removeOptionalTags: true
    },
    files: [{
      expand: true,
      cwd: '<%= app.dist %>',
      src: ['*.html', 'views/{,*/}*.html'],
      dest: '<%= app.dist %>'
    }]
  }
};
