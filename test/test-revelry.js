var fs      = require('fs');
var path    = require('path');
var Project = require('../libs/project.js');
var Config  = require('../libs/config.js');

// Add a more sensible handler for exceptions
process.removeAllListeners('uncaughtException');
process.on('uncaughtException', function (exception) {
  console.log(exception.stack);
});

module.exports = {
  setUp: function (callback) {
    this_ = this;
    require('tmp').dir({unsafeCleanup: true}, function (err, dir) {
      if (err) throw err;
      this_.path = path.join(dir, 'project');
      callback();
    });
  },
  create: function (test) {
    createProject(this.path);

    // Test the Revfile exists and is correct
    var rfpath = path.join(this.path, 'Revfile.json');
    test.ok(fs.existsSync(rfpath));
    var rfdata = JSON.parse(fs.readFileSync(rfpath));
    test.equal(rfdata.title, "Test presentation");
    test.equal(rfdata.description, "☃☃☃");

    // Test a couple of other files
    var slidespath = path.join(this.path, 'slides.html');
    test.ok(fs.existsSync(slidespath));
    var slides = fs.readFileSync(slidespath, encoding='utf8');
    test.ok(slides.match("<h1>{{title}}</h1>"));
    var custompath = path.join(this.path, 'custom/custom.css');
    test.ok(fs.existsSync(custompath));
    test.done();
  }
};

// Create a test project in this.path with optional target. Config is
// a handful of test defaults if not specified
function createProject(path, target, config) {
  if (config == undefined)
    config = new Config({
      title: "Test presentation", 
      description: "☃☃☃",
      author: "John Smith"
    });
  var p = new Project(path, target);
  p.create(config);
  return p;
};
