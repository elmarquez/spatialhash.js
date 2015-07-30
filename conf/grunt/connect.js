'use strict';

var proxy = require('../proxy/middlewares');

module.exports = {
  options: {
    api: '<%= app.proxy.url %>',
    user: '<%= app.proxy.auth.user %>',
    pass: '<%= app.proxy.auth.pass %>',
    port: 8080,
    hostname: 'localhost',
    livereload: 35728
  },
  dist: {
    options: {
      open: true,
      base: '<%= app.dist %>',
      middleware: function (connect, options, middlewares) {
        proxy.api = options.api;
        proxy.auth.pass = options.pass;
        proxy.auth.user = options.user;
        proxy.middlewares.forEach(function(fn) {
          middlewares.unshift(fn);
        });
        return middlewares;
      }
    }
  },
  livereload: {
    options: {
      open: true,
      middleware: function (connect) {
        return [
          connect.static('<%= app.src %>')
        ];
      }
    }
  },
  test: {
    options: {
      base: '<%= app.dist %>',
      port: 8081
    }
  }
};
