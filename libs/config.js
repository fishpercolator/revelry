var _ = require('underscore');

var PLUGIN_CONFIG = {
  classList:      [{ src: 'lib/js/classList.js' }],
  markdown:       [{ src: 'plugin/markdown/marked.js'},
		   { src: 'plugin/markdown/markdown.js'}],
  highlight:      [{ src: 'plugin/highlight/highlight.js',
		     async: true, callback: function() {
		       hljs.initHighlightingOnLoad();
		  }}],
  zoom:           [{ src: 'plugin/zoom-js/zoom.js', async: true}],
  notes:          [{ src: 'plugin/notes/notes.js', async: true}],
  remotes:        [{ src: 'plugin/remotes/remotes.js'}],
  math:           [{ src: 'plugin/math/math.js', async: true }],
  leap:           [{ src: 'plugin/leap/leap.js', async: true }],
  'notes-server': [{ src: 'socket.io/socket.io.js', async: true },
		   { src: 'plugin/notes-server/client.js', async: true }]
  // No config for multiplex, as it's sufficiently complex to require
  // user configuration.
};

function Config (overrides) {
  var defaults = {
    title: '',
    description: '',
    author: '',
    options: {
      theme: 'black',
      transition: 'slide',
      controls: true,
      progress: true,
      history: true,
      center: true
    },
    plugins: ['markdown', 'notes'],
    meta: {
      "apple-mobile-web-app-capable": "yes",
      "apple-mobile-web-app-status-bar-style": "black-translucent",
      "viewport": "width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no, minimal-ui"
    }
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
