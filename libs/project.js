var _ = require('underscore');
var fs = require('fs-extra');
var path = require('path');
var toSource = require('tosource');
var npm = require('npm');
var jade = require('jade');
var Handlebars = require('handlebars');
var Config = require('../libs/config.js');

// Constructor for project
function Project (theDir, theTarget, quiet) {
  // Remember if we initialized with quiet mode
  this.quiet = quiet;

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
  create: function (config, jade) {
    this.createDir('', true);

    // Create the Revfile and slides.html template using the config
    this.writeFileJSON('Revfile.json', config);
    if (jade) {
      var slides = this.template('slides.jade', true);
      this.writeFile('slides.jade', slides);
    }
    else {
      var slides = this.template('slides.html', true);
      this.writeFile('slides.html', slides);
    }

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
    Handlebars.registerPartial('slides', this.readHtmlOrJadeFile('slides'));
    Handlebars.registerPartial('header', this.readHtmlOrJadeFile('custom/header'));

    // Find all other HTML and Jade files in the current dir (skipping 'slides'
    // since we've already done that)
    var this_ = this;
    fs.readdirSync(this.dir).forEach(function (fn) {
      var matches = fn.match(/^(\w+)\.(jade|html)$/);
      if (matches) {
        var name = matches[1];
        if (name != 'slides') {
          Handlebars.registerPartial(name, this_.readHtmlOrJadeFile(name));
        }
      }
    });

    // Register a helper that converts an object to source code for
    // inserting into a template (this is different from JSON, because
    // it includes function properties).
    Handlebars.registerHelper('source', function (obj) {
      var source = toSource(obj);
      return new Handlebars.SafeString(source);
    });
    Handlebars.registerHelper('ifplugin', function (name, options) {
      if (this.has_plugin(name)) {
	return new Handlebars.SafeString(options.fn(this));
      }
    });

    // Dynamically create some config
    config.options.dependencies = config.get_dependencies();

    // Compile the index template
    var template = this.template('base.html');
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
    _.each(['css', 'eot', 'ttf', 'woff'], function (ext) {
      this_.copyFromReveal('lib/font/league-gothic/league-gothic.'+ext);
    });
    _.each(['italic', 'regular', 'semibold', 'semibolditalic'], function (weight) {
      _.each(['eot','ttf','woff'], function (ext) {
        this_.copyFromReveal('lib/font/source-sans-pro/source-sans-pro-'+weight+'.'+ext);
      })
    })
    this.copyFromReveal('js/reveal.min.js');
    _.each(config.get_files_for_dependencies(), function (fn) {
      // If this is a plugin, copy the whole plugin
      if (fn.indexOf("plugin") == 0) {
        this_.copyFromReveal(path.dirname(fn));
      }
      // If it's something from Reveal's lib dir, copy it across
      else if (fn.indexOf("lib") == 0) {
        this_.copyFromReveal(fn);
      }
      // Otherwise, assume it's an npm thingy and copy the package.json
      else {
	this_.copyFromReveal('package.json');
      }
    });

    // Does the target have a package.json? OK, we need to npm install
    if (fs.existsSync(path.join(this.target, 'package.json'))) {
      process.chdir(this.target);
      npm.load({}, function (er) {
	if (er) throw er;
	npm.commands.install(function (er) {
	  if (er) throw er;
	});
      });
    }

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

    // We use eval instead of JSON.parse() because the user may have
    // put functions and the like in there.
    var config = new Config(eval('('+fs.readFileSync(revfile)+')'));

    // Note: Put legacy stuff here if config format changes
    return config;
  },

  // Log to console unless in quiet mode
  log: function (msg) {
    if (!this.quiet)
      console.log(msg);
  },

  // Get a template in Handlebars format
  template: function (name, contents_only) {
    var contents   = fs.readFileSync(__dirname+'/../templates/'+name).
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
    this.log(fn);
    return fs.writeFileSync(fn, (string||''));
  },
  readFile: function (name) {
    var fn = path.join(this.dir,name);
    return fs.readFileSync(fn, encoding='utf8');
  },
  // Specify a file (without extension) which may be HTML or
  // Jade. Return the HTML regardless.
  readHtmlOrJadeFile: function (name) {
    var jadefn = path.join(this.dir,name) + '.jade';
    if (fs.existsSync(jadefn)) {
      // Pass the config() as arguments to the Jade so we can access its
      // variables inside the Jade templates
      return jade.renderFile(jadefn, this.config());
    }
    else {
      return this.readFile(name+'.html');
    }
  },
  copyFromReveal: function (name) {
    var fn = path.join(this.reveal_dir, name);
    var target_fn = path.join(this.target, name);
    fs.ensureDirSync(path.dirname(target_fn));
    if (!fs.existsSync(target_fn)) {
      this.log(target_fn);
      return fs.copySync(fn, target_fn);
    }
  },
  copyFile: function (name, target_name) {
    var fn = path.join(this.dir, name);
    var target_fn = path.join(this.target, target_name);
    this.log(target_fn);
    return fs.copySync(fn, target_fn);
  },
  copyDir: function (fn) {
    var src    = path.join(this.dir, fn);
    var target = path.join(this.target, fn);
    var this_ = this;
    return fs.copySync(src, target, function (file) {
      this_.log(path.join(this_.target, file));
      return true;
    });
  }
};

module.exports = Project;
