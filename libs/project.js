var fs = require('fs');
var Handlebars = require('handlebars');
var util = require('../libs/util.js');

// Constructor for project
function Project (theDir, theTarget) {
  // dir is the project dir
  this.dir = util.canonicalize(theDir || '.');
  // target is the dir we build to (defaults to this.dir/www)
  this.target = util.canonicalize(theTarget || this.dir+'www');
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
  },

  // Get the config from the current Revfile
  config: function () {
    var revfile = this.dir+'Revfile.json';
    if (!fs.existsSync(revfile)) throw "Not a Revelry project dir!";
    return JSON.parse(fs.readFileSync(revfile));
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
    var dn = root+name;
    if (fs.existsSync(dn)) {
      if (mustnt_exist) {
	throw "Directory already exists: "+dn;
      }
      else {
	return;
      }
    }
    console.log(dn);
    return fs.mkdirSync(dn);
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
    var fn = root+name;
    console.log(fn);
    return fs.writeFileSync(fn, (string||''));
  },
  readFile: function (name) {
    var fn = this.dir+name;
    var contents = fs.readFileSync(fn);
    return contents.toString('utf8');
  }
};

module.exports = Project;
