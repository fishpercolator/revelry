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

    // Compile the index template
    var template = this.template('base');
    this.writeTFile('index.html', template(config));

    // Copy relevant files from Reveal.js
    this.copyFromReveal('css', 'reveal.css');
    this.copyFromReveal('css/theme', config.theme+'.css');
    this.copyFromReveal('lib/js', 'html5shiv.js');
    this.copyFromReveal('lib/js', 'head.min.js');
    this.copyFromReveal('js', 'reveal.min.js')
  },

  // Get the config from the current Revfile
  config: function () {
    var revfile = path.join(this.dir,'Revfile.json');
    if (!fs.existsSync(revfile)) throw "Not a Revelry project dir!";
    return new Config(JSON.parse(fs.readFileSync(revfile)));
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
    console.log(dn);
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
  copyFromReveal: function (dir, name) {
    var fn = path.join(this.reveal_dir, dir, name);
    var target_dir = path.join(this.target, dir);
    fs.ensureDirSync(target_dir);
    var target_fn = path.join(target_dir, name);
    if (!fs.existsSync(target_fn)) {
      console.log(target_fn);
      return fs.copySync(fn, target_fn);
    }
  }
};

module.exports = Project;
