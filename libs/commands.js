var fs = require('fs');
var Project = require('../libs/project.js');
var Config  = require('../libs/config.js');

// The 'new' command creates a new Revelry project
exports.new = function (name, opts) {
  var dir = name;

  var config = new Config({
    title: opts.title || name,
    description: opts.description || ""
  });

  var p = new Project(dir, undefined, opts.parent.quiet);
  p.create(config, opts.pug);
};

// The 'build' command builds the HTML for a Revelry presentation
exports.build = function (target, opts) {
  var p = new Project('.', target, opts.parent.quiet);
  p.build();
};

// The 'upgrade' command rewrites the Revfile.json
exports.upgrade = function (opts) {
  var p = new Project('.', undefined, opts.parent.quiet);
  p.upgrade();
};
