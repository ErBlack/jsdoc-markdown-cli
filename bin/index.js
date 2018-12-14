#!/usr/bin/env node

const commander = require('commander');
const glob = require('glob');
const builder = require('../lib/builder');

const PRESETS = require('../lib/presets.json');

commander
    .version(require('../package').version)
    .usage('[options] <patterns ...>')
    .description('Generates readme.md')
    .option('-p --preset [preset]', 'Filenames and paths preset', String)
    .option('-d --dry-run', 'Don\'t create files')
    .option('-c --clear-empty', 'Delete empty files')
    .parse(process.argv);

const {
    args,
    dryRun,
    clearEmpty,
    preset = 'default'
} = commander;

if (!PRESETS[preset]) {
    throw new Error(`Unknown preset ${preset}`);
}

const {
    folders,
    filename
} = PRESETS[preset];

const targets = args.reduce((paths, pattern) => [
    ...paths,
    ...folders.reduce((folders, suffix) => [
        ...folders,
        ...glob.sync(`${pattern}*${suffix}`)
    ], [])
], [])
    .map(folder => ({
        folder,
        files: glob.sync(`${folder}${filename}`, { nodir: true })
    }))
    .filter(({ files }) => files.length);

builder(targets, {
    clearEmpty,
    dryRun
});
