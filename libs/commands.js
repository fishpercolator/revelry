var fs = require('fs');
var Project = require('../libs/project.js');
var Config  = require('../libs/config.js');

// The 'new' command creates a new Revelry project
exports.new = function (opts) {
  var dir = opts.name;

  var config = new Config({
    title: opts.title || opts.name,
    description: opts.description || ""
  });

  var p = new Project(dir, undefined, opts.quiet);
  p.create(config, opts.jade);
};

// The 'build' command builds the HTML for a Revelry presentation
exports.build = function (opts) {
  var p = new Project('.', opts.target, opts.quiet);
  p.build();
};

// The 'upgrade' command rewrites the Revfile.json
exports.upgrade = function (opts) {
  var p = new Project('.', undefined, opts.quiet);
  p.upgrade();
};
