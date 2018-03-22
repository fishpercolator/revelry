#!/usr/bin/env node

var commands = require('./libs/commands.js');

var pkginfo = require('pkginfo')(module);
var program = require('commander');

program
  .version(module.exports.version)
  .option('-q, --quiet', 'suppress non-essential messages')

program
  .command('new <name>')
  .description('Create a new Revelry project')
  .option('-t, --title <title>', 'The title of the presentation (defaults to name)')
  .option('-d, --description <desc>', 'A one-line description of the presentation')
  .option('--pug', 'Use Pug instead of Handlebars for the main presentation template')
  .action(commands.new);

program
  .command('build [<target>]')
  .description('Build the current Revelry project')
  .action(commands.build);

program
  .command('upgrade')
  .description('Upgrade Revfile.js to match current version of Revelry')
  .action(commands.upgrade);

program.parse(process.argv);

if (process.argv.length < 3) {
  program.help();
}
