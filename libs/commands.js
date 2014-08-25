var fs = require('fs');
var Project = require('../libs/project.js');

// The 'new' command creates a new Revelry project
exports.new = function (opts) {
  var dir = './'+opts.name;

  var config = {
    title: opts.title || opts.name,
    description: opts.description || ""
  };

  var p = new Project(dir);
  p.create(config);
};

// The 'build' command builds the HTML for a Revelry presentation
exports.build = function (opts) {
  var p = new Project('.', opts.target);
  p.build();
};
