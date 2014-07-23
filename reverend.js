#!/usr/bin/env node

var commands = require('./libs/commands.js');

var parser = require('nomnom');

parser.command('new')
  .help('Create a new Reverend project')
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
    }
  })
  .callback(commands.new);

parser.parse();
