import {describe, it, expect} from "vitest";
import {LoxExecutor} from "../lib/lox-executor.js";
import $ from 'dax-sh';
import {fileURLToPath} from "node:url";
import {dirname, join} from "node:path";
import {existsSync} from "node:fs";
import {tmpdir} from "os";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

describe('LoxExecutor', () => {
    it('can compile lox', async () => {
        const executor = new LoxExecutor();
        await $`rm -r ${join(__dirname, '..', '..', 'cmake-build-debug')}`
        await executor.compile();
        expect(existsSync(join(__dirname, '..', '..', 'cmake-build-debug', 'clox'))).toBe(true);
    });

    it('can exec a lox script and return the output', async () => {
        const executor = new LoxExecutor();
        executor.checkCloxPath();
        const tempFile = join(tmpdir(), 'test_01.lox');
        await $`echo "print 1 + 11;" > ${$.path(tempFile)}`.quiet();

        const output = await executor.run(tempFile);
        expect(output).toBe("12");
    });
})