var fs = require('fs');
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
    this.writeFileJSON('Revfile.json', config);
  },

  // Build the project in this.dir into a www page in this.target
  build: function () {
    // Get the config first as a sanity check
    var config = this.config();

    // Create the target layout
    this.createTDir('');

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
  template: function (name) {
    var Handlebars = require('handlebars');
    var contents   = fs.readFileSync(__dirname+'/../templates/'+name+'.html');
    return Handlebars.compile(contents.toString('utf8'));
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
  }

};

module.exports = Project;
