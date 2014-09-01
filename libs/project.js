var _ = require('underscore');
var fs = require('fs-extra');
var path = require('path');
var Handlebars = require('handlebars');
var Config = require('../libs/config.js');

// Constructor for project
function Project (theDir, theTarget) {
  // dir is the project dir
  this.dir = path.normalize(theDir || '.');
  // target is the dir we build to (defaults to this.dir/www)
  this.target = path.normalize(theTarget || path.join(this.dir,'www'));

  // Find the path to reveal.js
  this.reveal_dir = path.normalize(require.resolve('reveal.js/js/reveal.js')+'/../..');
}

Project.prototype = {
  constructor: Project,

  // Create a new project in this.dir with the specified config
  create: function (config) {
    this.createDir('', true);

    // Create the Revfile and slides.html template using the config
    this.writeFileJSON('Revfile.json', config);
    var slides = this.template('slides', true);
    this.writeFile('slides.html', slides);

    // Create a .gitignore file and some stubs
    this.writeFile('.gitignore', "www/\n");
    this.createDir('img');
    this.createDir('custom');
    this.writeFile('custom/custom.css');
    this.writeFile('custom/header.html');

  },

  // Build the project in this.dir into a www page in this.target
  build: function () {
    // Get the config first as a sanity check
    var config = this.config();

    // Create the target layout
    this.createTDir('');

    // Register partials that will be interpolated into the base
    // template
    Handlebars.registerPartial('slides', this.readFile('slides.html'));
    Handlebars.registerPartial('header', this.readFile('custom/header.html'));

    // Register a helper that converts an object to JSON for inserting
    // into a template
    Handlebars.registerHelper('json', function (config) {
      return new Handlebars.SafeString(JSON.stringify(config));
    });
    Handlebars.registerHelper('ifplugin', function (name, options) {
      if (this.has_plugin(name)) {
	return new Handlebars.SafeString(options.fn(this));
      }
    });

    // Dynamically create some config
    config.options.dependencies = config.get_dependencies();

    // Compile the index template
    var template = this.template('base');
    this.writeTFile('index.html', template(config));

    // Copy the image dir
    this.copyDir('img');
    this.copyFile('custom/custom.css', 'css/custom.css');

    // Copy relevant files from Reveal.js
    this.copyFromReveal('css/reveal.css');
    this.copyFromReveal('css/print/pdf.css');
    this.copyFromReveal('css/print/paper.css');
    this.copyFromReveal('css/theme/'+config.options.theme+'.css');
    if (config.has_plugin('highlight')) {
      this.copyFromReveal('lib/css/zenburn.css');
    }
    this.copyFromReveal('lib/js/html5shiv.js');
    this.copyFromReveal('lib/js/head.min.js');
    var this_ = this;
    _.each(['eot', 'svg', 'ttf', 'woff'], function (ext) {
      this_.copyFromReveal('lib/font/league_gothic-webfont.'+ext);
    });
    this.copyFromReveal('js/reveal.min.js');
    _.each(config.get_files_for_dependencies(), function (fn) {
      this_.copyFromReveal(fn);
    });
  },

  // Rewrite the Revfile.json with any new values loaded from the
  // config defaults since it was created
  upgrade: function () {
    var config = this.config();
    this.writeFileJSON('Revfile.json', config);
  },

  // Get the config from the current Revfile
  config: function () {
    var revfile = path.join(this.dir,'Revfile.json');
    if (!fs.existsSync(revfile)) throw "Not a Revelry project dir!";
    var config = new Config(JSON.parse(fs.readFileSync(revfile)));

    // Note: Put legacy stuff here if config format changes

    return config;
  },

  // Get a template in Handlebars format
  template: function (name, contents_only) {
    var contents   = fs.readFileSync(__dirname+'/../templates/'+name+'.html').
      toString('utf8');
    if (contents_only) return contents;
    return Handlebars.compile(contents);
  },

  // Utility functions for manipulating files in Revelry projects
  createDir: function (name, mustnt_exist) {
    return this._createDir(this.dir, name, mustnt_exist);
  },
  createTDir: function (name, mustnt_exist) {
    return this._createDir(this.target, name, mustnt_exist);
  },
  _createDir: function (root, name, mustnt_exist) {
    var dn = path.join(root,name);
    if (mustnt_exist && fs.existsSync(dn))
      throw "Directory already exists: "+dn;
    return fs.mkdirsSync(dn);
  },
  writeFile: function (name, string) {
    return this._writeFile(this.dir, name, string);
  },
  writeFileJSON: function (name, object) {
    return this.writeFile(name, JSON.stringify(object, null, 4));
  },
  writeTFile: function (name, string) {
    return this._writeFile(this.target, name, string);
  },
  _writeFile: function (root, name, string) {
    var fn = path.join(root,name);
    console.log(fn);
    return fs.writeFileSync(fn, (string||''));
  },
  readFile: function (name) {
    var fn = path.join(this.dir,name);
    var contents = fs.readFileSync(fn);
    return contents.toString('utf8');
  },
  copyFromReveal: function (name) {
    var fn = path.join(this.reveal_dir, name);
    var target_fn = path.join(this.target, name);
    fs.ensureDirSync(path.dirname(target_fn));
    if (!fs.existsSync(target_fn)) {
      console.log(target_fn);
      return fs.copySync(fn, target_fn);
    }
  },
  copyFile: function (name, target_name) {
    var fn = path.join(this.dir, name);
    var target_fn = path.join(this.target, target_name);
    console.log(target_fn);
    return fs.copySync(fn, target_fn);
  },    
  copyDir: function (fn) {
    var src    = path.join(this.dir, fn);
    var target = path.join(this.target, fn);
    var this_ = this;
    return fs.copySync(src, target, function (file) {
      console.log(path.join(this_.target, file));
      return true;
    });
  }
};

module.exports = Project;
