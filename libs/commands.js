var fs = require('fs');

// The 'new' command creates a new Reverend project
exports.new = function (opts) {
  var dir = opts.name.replace(/\/?$/, '/'); // ensure there is a slash at end
  
  console.log(dir);
  fs.mkdirSync(dir);
  var config = {
    title: opts.title || opts.name,
    description: opts.description || ""
  };

  var revfile = dir+'Revfile.json';
  console.log(revfile);
  fs.writeFileSync(revfile, JSON.stringify(config, null, 4));
};

// The 'build' command builds the HTML for a Reverend presentation
exports.build = function (opts) {
  var proj = process.cwd();
  var revfile = proj+'/Revfile.json';
  if (!fs.existsSync(revfile)) throw "Not a Reverend project dir!";

  var target = (opts.target || proj+'/www').replace(/\/?$/, '/');
  if (!fs.existsSync(target)) fs.mkdirSync(target);

  var Handlebars = require('handlebars');
  var data     = fs.readFileSync('../templates/base.html');
  var context  = JSON.parse(fs.readFileSync(revfile));
  var template = Handlebars.compile(data.toString('utf8'));
  var html     = template(context);
  fs.writeFileSync(target+'index.html', html);
  console.log(target+'index.html');
};
