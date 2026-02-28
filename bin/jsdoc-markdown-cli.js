#!/usr/bin/env node

import { Command } from 'commander';
import { glob } from 'glob';
import { builder } from '../lib/builder.js';
import { dirname } from 'path';
import { readFileSync } from 'fs';

const packageJson = JSON.parse(readFileSync(new URL('../package.json', import.meta.url), 'utf8'));

const program = new Command();

program
    .version(packageJson.version)
    .usage('example/**/*.js')
    .description('Generates README.md')
    .option('-d --dry-run', 'Don\'t create files')
    .option('-c --clear-empty', 'Delete empty files')
    .argument('<patterns...>', 'Glob patterns to match files')
    .parse(process.argv);

const {
    dryRun,
    clearEmpty,
} = program.opts();

const args = program.args;


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

await builder(Object.values(targets), {
    clearEmpty,
    dryRun
});
