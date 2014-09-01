var _ = require('underscore');

var PLUGIN_CONFIG = {
  classList: [{ src: 'lib/js/classList.js' }],
  markdown:  [{ src: 'plugin/markdown/marked.js'},
	      { src: 'plugin/markdown/markdown.js'}],
  highlight: [{ src: 'plugin/highlight/highlight.js',
		async: true, callback: function() { 
		  hljs.initHighlightingOnLoad(); 
		}}],
  zoom:      [{ src: 'plugin/zoom-js/zoom.js', async: true}],
  notes:     [{ src: 'plugin/notes/notes.js', async: true}],
  remotes:   [{ src: 'plugin/remotes/remotes.js'}],
  math:      [{ src: 'plugin/math/math.js', async: true }]
};

function Config (overrides) {
  var defaults = {
    title: '',
    description: '',
    author: '',
    options: {
      theme: 'default',
      transition: 'default'
    },
    plugins: ['markdown', 'notes']
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

Config.prototype = {
  constructor: Config,

  has_plugin: function (name) {
    return _.contains(this.plugins, name);
  },
  get_dependencies: function () {
    return _.flatten(_.map(this.plugins, function (p) {
      return PLUGIN_CONFIG[p];
    }), true);
  },
  get_files_for_dependencies: function () {
    return _.map(this.get_dependencies(), function (d) { return d.src });
  }
};

module.exports = Config;
