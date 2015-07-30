'use strict';

var merge = require('object-merge');

module.exports = function (grunt) {
  grunt.registerTask('load-manifest', 'Load the application manifest into the Grunt config.',
    function () {
      var app = grunt.config.get('app');
      var env;
      var mock = grunt.config.get('mock');
      var production = grunt.config.get('production');

      // Load the default application manifest. The manifest specifies which
      // files are to be loaded by the client application at run time.
      var manifest = grunt.file.readJSON('conf/manifest/default.json');

      // Load environment specific configuration.
      if (production) {
        grunt.log.ok('Loading production manifest');
        env = grunt.file.readJSON('conf/manifest/production.json');
        manifest = merge(manifest, env);
      } else {
        grunt.log.ok('Loading development manifest');
        env = grunt.file.readJSON('conf/manifest/development.json');
        manifest = merge(manifest, env);
      }

      // Include routes definitions for each service that has been enabled.
      Object.keys(app.services).forEach(function (service) {
        if (app.services[service]) {
          manifest.app.js.head.push('app/routes/' + service + '.js');
        }
      });

      // Include mocked or live service components.
      if (mock) {
        grunt.log.ok('Including mocked API service components');
        manifest.services.mocked.forEach(function (file) {
          manifest.app.js.head.push(file);
        });
      } else {
        grunt.log.ok('Including live API service components');
        manifest.services.live.forEach(function (file) {
          manifest.app.js.head.push(file);
        });
      }

      // Include extensions.
      manifest.extensions.forEach(function (path) {
        grunt.log.ok('Including development extensions');
        manifest.app.js.head.push(path);
      });

      // Set the manifest.
      grunt.config.set('manifest', manifest);
    }
  );
};
