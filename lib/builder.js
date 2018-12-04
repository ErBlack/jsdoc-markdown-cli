const path = require('path');
const fs = require('fs');
const jsdoc2md = require('jsdoc-to-markdown');

const pass = folder => process.stdout.write(`\u001b[33mpass\u001b[39m: ${folder}\n`);
const succ = folder => process.stdout.write(`\u001b[32msucc\u001b[39m: ${folder}\n`);
const rem = folder => process.stdout.write(`\u001b[32mrem \u001b[39m: ${folder}\n`);
const fail = (folder, e) => process.stdout.write(`\u001b[31mfail\u001b[39m: ${folder} ${e}\n`);

const configure = path.join(__dirname, 'conf.json');

const FILE_NAME = 'readme.md'

module.exports = function builder(targets, {
    dryRun,
    clearEmpty
}) {
    targets.forEach(({ files, folder }) => {
        if (dryRun) {
            pass(folder);

            return;
        }

        const readme = path.join(folder, FILE_NAME);

        jsdoc2md
            .render({
                configure,
                'name-format': 'code',
                files
            })
            .then(function(content) {
                if (!content) {
                    if (clearEmpty) {
                        fs.exists(path.join(folder, FILE_NAME), exists => {
                            if (exists) {
                                fs.unlink(
                                    path.join(folder, FILE_NAME),
                                    err => err ? fail(readme, err) : rem(readme)
                                );
                            } else {
                                pass(readme);
                            }
                        });
                    } else {
                        pass(readme);
                    }

                    return;
                }

                fs.writeFile(
                    path.join(folder, FILE_NAME),
                    content,
                    'utf8',
                    err => err ? fail(readme, err) : succ(readme)
                );
            });
    });
};
