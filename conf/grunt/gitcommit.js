module.exports = {
  dist: {
    options: {
      message: '[<%= ticket %>] Release v<%= pkg.version %>\n\n' +
               'Release artifact to deployment repository.\n\n' +
               '<%= ticket %> #time 15m'
    },
    files: {
      src: ['bower.json', 'package.json', 'pom.xml']
    }
  }
};
