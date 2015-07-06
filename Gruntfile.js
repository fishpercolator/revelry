module.exports = function(grunt) {
  grunt.loadNpmTasks('grunt-contrib-nodeunit');
  grunt.loadNpmTasks('grunt-subgrunt');
  grunt.initConfig({
    nodeunit: {
      all: ['test/test-*.js']
    },
    subgrunt: {
      options: {
        npmClean: true
      },
      buildReveal: {
        'node_modules/reveal.js': 'default'
      }
    }
  });
  grunt.registerTask('default', ['subgrunt', 'nodeunit']);
};
