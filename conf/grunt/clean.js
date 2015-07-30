'use strict';

module.exports = {
  build: ['<%= app.dist %>', '.tmp'],
  app: [
    '<%= app.dist %>/app/**/*.js'
  ],
  dist: [
    '<%= app.dist %>/app/controllers',
    '<%= app.dist %>/app/directives',
    '<%= app.dist %>/app/extensions',
    '<%= app.dist %>/app/filters',
    '<%= app.dist %>/app/mock',
    '<%= app.dist %>/app/routes',
    '<%= app.dist %>/app/services',
    '<%= app.dist %>/app/*.js',
    '!<%= app.dist %>/app/app.min.js',
    '!<%= app.dist %>/app/app.min.map'
  ],
  mock: ['<%= app.dist %>/app/mock'],
  release: ['admin-client-<%= pkg.version %>.zip']
};
