import { join } from 'path';
import { writeFile, unlink } from 'fs/promises';
import { existsSync } from 'fs';
import jsdoc2md from 'jsdoc-to-markdown';

const pass = folder => process.stdout.write(`\u001b[33mpass\u001b[39m: ${folder}\n`);
const success = folder => process.stdout.write(`\u001b[32msuccess\u001b[39m: ${folder}\n`);
const removed = folder => process.stdout.write(`\u001b[32mremoved \u001b[39m: ${folder}\n`);
const fail = (folder, e) => process.stdout.write(`\u001b[31mfail\u001b[39m: ${folder} ${e}\n`);

const FILE_NAME = 'README.md'

export async function builder(targets, {
    dryRun,
    clearEmpty
}) {
    for (const { files, folder } of targets) {
        if (dryRun) {
            pass(folder);
            continue;
        }

        const readmeFilePath = join(folder, FILE_NAME);

        try {
            const content = await jsdoc2md.render({
                'name-format': 'code',
                files
            });

            if (!content) {
                if (clearEmpty) {
                    if (existsSync(join(folder, FILE_NAME))) {
                        await unlink(join(folder, FILE_NAME));
                        removed(readmeFilePath);
                    } else {
                        pass(readmeFilePath);
                    }
                } else {
                    pass(readmeFilePath);
                }

                continue;
            }

            
            await writeFile(
                join(folder, FILE_NAME),
                content,
                'utf8'
            );
            
            success(readmeFilePath);
        } catch (error) {
            fail(readmeFilePath, error);
        }
    }
}
