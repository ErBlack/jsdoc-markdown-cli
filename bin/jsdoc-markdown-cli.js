#!/usr/bin/env node

const { Command } = require('commander');
const program = new Command();
const glob = require('glob');
const builder = require('../lib/builder');
const { dirname } = require('path');

program
    .version(require('../package').version)
    .usage('example/**/*.js')
    .description('Generates readme.md')
    .option('-d --dry-run', 'Don\'t create files')
    .option('-c --clear-empty', 'Delete empty files')
    .argument('<patterns...>', 'Glob patterns to match files')
    .parse(process.argv);

const {
    args,
    dryRun,
    clearEmpty,
} = program;


const targets = args.reduce((folders, pattern) => {
    const paths = glob.sync(pattern, { nodir: true });

    paths.forEach(path => {
        const folder = dirname(path);

        if (!folders[folder]) {
            folders[folder] = {
                folder,
                files: []
            };
        }

        folders[folder].files.push(path);
    });

    return folders;
}, {});

builder(Object.values(targets), {
    clearEmpty,
    dryRun
});
