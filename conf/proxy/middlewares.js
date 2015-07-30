'use strict';

/**
 * Express middleware to proxy API requests to the data registry, monitoring
 * and user management servers in development, staging and production
 * environments.
 */
var S = require('string'), request = require('request');

var data,
  environments = JSON.stringify(['DEVELOPMENT','QA','STAGING','PRODUCTION']),
  err,
  options,
  priorities = JSON.stringify(['LOW','MEDIUM','HIGH']);

/**
 * Execute http request
 * @param req Request
 * @param res Response
 * @param options Request options
 */
function executeRequest(req, res, options) {
  console.log("%s %s", req.method, options.url);
  if (req.method === 'DELETE') {
    request.del(options).pipe(res);
  } else if (req.method === 'GET') {
    request.get(options).pipe(res);
  } else if (req.method === 'POST') {
    options.body = req.body;
    options.json = true;
    request.post(options).pipe(res);
  } else if (req.method === 'PUT') {
    options.body = req.body;
    options.json = true;
    request.put(options).pipe(res);
  }
}

module.exports = {
  // default URL to the API
  api: 'http://localhost:8080/',

  // API authentication credentials
  auth: {
    user: null,
    pass: null
  },

  // middleware functions should be listed here in reverse order to their
  // intended execution ex. C, B, A
  middlewares: [

    /**
     * Handle API service requests.
     * @param req Request
     * @param res Response
     * @param next Next
     */
      function (req, res, next) {
      var options = {};
      if (S(req.url).startsWith('/api')) {
        options = {
          auth: module.exports.auth.user ? module.exports.auth : null,
          headers: {'Access-Control-Allow-Origin': '*'},
          url: module.exports.api + S(req.url).chompLeft('/api').s
        };
        executeRequest(req, res, options);
      } else {
        next();
      }
    },

    /**
     * Get body data from POST, PUT request and add it to the request
     * object.
     * FIXME replace with connect body parser or equivalent
     * @param {Object} req Request
     * @param {Object} res Response
     * @param {Object} next Next
     */
      function (req, res, next) {
      if (req.method === 'POST' || req.method === 'PUT') {
        req.setEncoding('utf8');
        req.on('data', function (data) {
          req.body = JSON.parse(data);
          next();
        });
      } else {
        next();
      }
    }

  ]
};
