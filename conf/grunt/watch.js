module.exports = {
  livereload: {
    options: {
      livereload: '<%= connect.options.livereload %>'
    },
    files: [
      'conf/manifest.*',
      'src/**/*'
    ],
    tasks: ['compile']
  },
  sass: {
    files: ['src/main/sass/**/*'],
    tasks: ['sass']
  }
};
