var fs = require('fs');

// The 'new' command creates a new Reverend project
exports.new = function (opts) {
  var dir = opts.name.replace(/\/?$/, '/');
  
  console.log(dir);
  fs.mkdirSync(dir);
  var config = {
    title: opts.title || opts.name,
    description: opts.description || ""
  };

  var revfile = dir+'Revfile.json';
  console.log(revfile);
  fs.writeFile(revfile, JSON.stringify(config, null, 4), function (err) {
    if (err) throw err;
  });
};
