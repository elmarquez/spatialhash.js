module.exports = {
  options: {
    jshintrc: '.jshintrc',
    reporter: require('jshint-stylish')
  },
  dist: {
    src: [
      'Gruntfile.js',
      'src/**/*.js',
      '!src/main/webapp/scripts/**/*.js'
    ]
  },
  test: {
    src: ['test/**/*.js']
  }
};
