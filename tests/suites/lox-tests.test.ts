import {describe, expect, it as baseIt} from "vitest";
import {LoxExecutor} from "../lib/lox-executor.js";
import $ from "dax-sh";
import {fileURLToPath} from "node:url";
import {dirname, join} from "node:path";
import {beforeEach} from "node:test";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

type Context = {
    executor: LoxExecutor,
    paths: Map<string, string>,
    compile: void
}

const it = baseIt.extend<Context>({
    executor: new LoxExecutor(),
    paths: async ({}, use) => {
        const paths = new Map<string, string>();
        const lsOutput = await $`ls ${$.path(__dirname)}/lox-code`.text();
        const keys = lsOutput.split('\n').map(line => line.trim());
        keys.forEach(key => {
            paths.set(key, join(__dirname, 'lox-code', key));
        })
        use(paths);
    },
    compile: [
        async ({executor}, use) => {
            await executor.compile();
            await use();
        },
        {auto: true, scope: 'worker'}
    ]
})

describe('Lox snippets', () => {

    describe('execution', () => {
        async function execFile(executor: LoxExecutor, paths: Map<string, string>, file: string, expected: string) {
            const output = await executor.run(paths.get(file)!);
            expect(output).toEqual(expected);
        }

        it('01-adition.lox', async ({executor, paths}) => {
            await execFile(executor, paths, '01-adition.lox', '2\n10\n9');
        });

        it('02-subtraction.lox', async ({executor, paths}) => {
            await execFile(executor, paths, '02-subtraction.lox', '0\n-40\n40\n-3');
        });
    });

    describe('memory check with valgrind', async () => {
        async function memCheck(executor: LoxExecutor, paths: Map<string, string>, file: string) {
            const ok = await executor.memCheck(paths.get(file)!);
            expect(ok).toBe(true);
        }

        it('01-adition.lox', async ({executor, paths}) => await memCheck(executor, paths, '01-adition.lox'));
        it('02-subtraction.lox', async ({executor, paths}) => await memCheck(executor, paths, '02-subtraction.lox'));
    })
})