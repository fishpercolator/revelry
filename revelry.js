#!/usr/bin/env node

var commands = require('./libs/commands.js');

var parser = require('nomnom').options({
  version: {
    flag: true,
    help: 'Print version',
    callback: function () {
      return "v"+JSON.parse(require('fs').readFileSync(__dirname+'/package.json'))['version'];
    }
  },
  quiet: {
    flag: true,
    abbr: 'q',
    help: 'Suppress non-essential messages',
  }
});

parser.command('new')
  .help('Create a new Revelry project')
  .options({
    name: {
      position: 1,
      metavar: '<name>',
      help: 'The name of the new project',
      required: true
    },
    title: {
      abbr: 't',
      help: 'The title of the presentation (defaults to name)'
    },
    description: {
      abbr: 'd',
      help: 'A one-line description of the presentation'
    },
    haml: {
      flag: true,
      help: 'Use HAML instead of HTML for the main presentation template'
    }
  })
  .callback(commands.new);

parser.command('build')
  .help('Build the current Revelry project')
  .options({
    target: {
      position: 1,
      metavar: '<target>',
      help: 'The target directory to build into',
      required: false
    }
  })
  .callback(commands.build);

parser.command('upgrade')
  .help('Upgrade the Revfile.js to match the current version of Revelry')
  .callback(commands.upgrade);

parser.parse();
