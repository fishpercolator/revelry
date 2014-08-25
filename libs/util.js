
// Takes a dir name, makes sure it ends with a / and removes ./ from the start
exports.canonicalize = function (dir) {
  return dir.replace(/\/?$/, '/').replace(/^\.\//, '');
}
