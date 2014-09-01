function Config (overrides) {
  var defaults = {
    title: '',
    description: '',
    author: '',
    options: {
      theme: 'default',
      transition: 'default'
    },
  };
  for (var item in defaults) {
    if (item in overrides) {
      this[item] = overrides[item];
    }
    else {
      this[item] = defaults[item];
    }
  }
}

module.exports = Config;
