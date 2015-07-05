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
    var custompath = path.join(this.path, 'custom', 'custom.css');
    test.ok(fs.existsSync(custompath));
    test.done();
  },
  build: function(test) {
    var p = createProject(this.path);

    // Try building the project with the default setup and check it
    // looks the way we expect
    p.build();

    var this_ = this;
    var targetFn = function () {
      // This horrid construction pushes the arguments to this
      // function onto the end of an array.
      var args = [this_.path, 'www'].
	concat(Array.prototype.slice.call(arguments));
      return path.join.apply(this, args);
    };
    test.ok(fs.existsSync(targetFn('index.html')));
    test.ok(fs.existsSync(targetFn('js', 'reveal.js'))); // FIXME
    test.ok(fs.existsSync(targetFn('plugin', 'markdown', 'example.md')));
    test.ok(!fs.existsSync(targetFn('plugin', 'zoom')));
    test.ok(!fs.existsSync(targetFn('lib', 'css', 'zenburn.css')));

    // Check the index.html contains our default config
    var index = fs.readFileSync(targetFn('index.html'), encoding='utf8');
    test.ok(index.match('<h1>Test presentation</h1>'));
    test.ok(index.match('<h2>☃☃☃</h2>'));
    test.ok(index.match('<meta name="author" content="John Smith">'));
    test.ok(index.match('plugin/markdown/marked.js'));
    test.ok(!index.match('plugin/zoom-js/zoom.js'));
    test.ok(!index.match('lib/css/zenburn.css'));

    // Change config
    var config = p.config();
    config.options.controls = false;
    config.plugins.push('highlight');
    config.author = 'The Doctor';
    p.writeFileJSON('Revfile.json', config);

    // Modify the header & CSS
    p.writeFile(path.join('custom', 'header.html'),
		'<meta name="x-test" description="test">');
    p.writeFile(path.join('custom', 'custom.css'),
		'h2 { color: blue; }');

    p.build();
    test.ok(fs.existsSync(targetFn('lib', 'css', 'zenburn.css')));
    index = fs.readFileSync(targetFn('index.html'), encoding='utf8');
    test.ok(index.match('<meta name="author" content="The Doctor">'));
    test.ok(index.match('lib/css/zenburn.css'));
    test.ok(index.match('controls:false'));
    test.ok(!index.match('controls:true'));
    test.ok(index.match('history:true'));
    test.ok(index.match('<meta name="x-test" description="test">'));

    var css = fs.readFileSync(targetFn('css', 'custom.css'), encoding='utf8');
    test.ok(css.match('h2 { color: blue; }'));

    test.done();
  },
  jade: function (test) {
    var p = createProject(this.path, undefined, undefined, true);

    var jade_fn = path.join(this.path, 'slides.jade');
    test.ok(fs.existsSync(jade_fn));

    // Overwrite this file with our own template
    p.writeFile('slides.jade', "section\n  h3.someclass= title\n  h4(style='color:blue')= description");
    // Put something in the header.html
    p.writeFile(path.join('custom', 'header.html'),
		'<meta name="x-test" description="test">');

    p.build();

    var index = fs.readFileSync(path.join(this.path, 'www', 'index.html'),
				encoding='utf8');
    test.ok(index.match('<h3 class="someclass">Test presentation</h3>'));
    test.ok(index.match('<h4 style="color:blue">☃☃☃</h4>'));
    test.ok(index.match('<meta name="x-test" description="test">'));

    test.done();
  }
  // TODO: Test for upgrade?
};

// Create a test project in this.path with optional target. Config is
// a handful of test defaults if not specified
function createProject(path, target, config, jade) {
  if (config == undefined)
    config = new Config({
      title: "Test presentation",
      description: "☃☃☃",
      author: "John Smith"
    });
  var p = new Project(path, target, true);
  p.create(config, jade);
  return p;
};
