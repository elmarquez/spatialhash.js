'use strict';

var nopt = require('nopt'), path = require('path');

// grunt console options
var knownOptions = {
  'api': String,          // API URL
  'increment': String,    // increment version by type: major, minor, patch, prerelease
  'instrument': Boolean,  // instrument distribution for test coverage analysis
  'mock': Boolean,        // use mocked service API
  'pass': String,         // API password
  'production': Boolean,  // production release
  'secrets': String,      // path to user credentials file
  'services': Array,      // service modules to include in UI
  'ticket': String,       // ticket associated with the release task
  'user': String          // API user account
};

module.exports = function (grunt) {
  // Load the Grunt task definitions and configurations from the /conf/grunt
  // folder.
  require('load-grunt-config')(grunt, {
    init: true,
    configPath: path.join(process.cwd(), 'conf', 'grunt'),
    loadGruntTasks: {
      pattern: 'grunt-*',
      config: require('./package.json'),
      scope: 'devDependencies'
    }
  });

  // Parse command line arguments. Grunt doesn't handle --options correctly so
  // we will parse them with nopt instead.
  var options = nopt(knownOptions, {}, process.argv, 2);

  // Load user secrets from file. The file should contain two lines, with the
  // user name on the first line and the password on the second line.
  var secrets = [null, null];
  if (options.secrets) {
    secrets = grunt.file.read(options.secrets).split('\n');
  }

  // Define general build configuration values.
  var app = {
    dist: 'dist',
    proxy: {
      auth: {
        user: options.user || secrets[0] || null,
        pass: options.pass || secrets[1] || null
      },
      url: options.api || 'http://localhost:8080/api'
    },
    services: {
      dashboard: true,
      dataRegistry: true,
      monitoring: true,
      userManagement: true,
      workflow: true
    },
    src: require('./bower.json').appPath || 'src/main/webapp/app'
  };

  // Application services. In some cases, we may wish to build a deployment
  // that does not use all admin services. This option identifies those
  // services to be included in the interface.
  if (options.services) {
    // disable all services
    Object.keys(app.services).forEach(function (svc) {
      app.services[svc] = false;
    });
    if (options.services.indexOf('all') > -1) {
      // enable all services
      Object.keys(app.services).forEach(function (svc) {
        app.services[svc] = true;
      });
    } else {
      // enable only selected services
      options.services[0].split(',').forEach(function (svc) {
        app.services[svc] = true;
      });
    }
  }
  grunt.config.set('app', app);

  // Increment version identifier by semver type.
  grunt.config.set('increment', options.increment || 'patch');

  // Instrumentation. Add instrumentation to Angular application modules to
  // enable test coverage analysis.
  grunt.config.set('instrument', options.instrument || false);

  // Service and data mocks. Configure the application to use mocked services
  // and data rather than a deployed API.
  grunt.config.set('mock', options.mock || false);

  // Console options.
  grunt.config.set('options', options);

  // Production deployment. Build a development deployment by default.
  grunt.config.set('production', options.production || false);

  // Selenium server. Specifies the name of the Protractor configuration file
  // to be loaded when running the functional test suite. Configuration files
  // are located in conf/protractor.
  grunt.config.set('selenium', options.selenium || 'localhost');

  // Release ticket number. Generating a release artifact creates a commit
  // that, in turn, requires a valid ticket identifier. The identifier here is
  // included in the commit message following the standard format. We require
  // only the number portion of the identifier.
  grunt.config.set('ticket', options.ticket);
};
