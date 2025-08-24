import {describe, it, expect} from "vitest";
import {LoxExecutor} from "../lib/lox-executor.js";
import $ from 'dax-sh';
import {join} from "node:path";
import {existsSync} from "node:fs";
import {tmpdir} from "os";


describe('LoxExecutor', () => {
    it('can compile lox', async () => {
        const executor = new LoxExecutor();
        const cloxPath = await executor.compile();
        expect(existsSync(cloxPath)).toBe(true);
        expect(cloxPath.startsWith(join(tmpdir(), 'clox-test'))).toBe(true);
        await executor.tearDown();
    });

    it('can exec a lox script and return the output', async () => {
        const executor = new LoxExecutor();
        await executor.compile();
        const tempFile = join(tmpdir(), 'test_01.lox');
        await $`echo "print 1 + 11;" > ${$.path(tempFile)}`.quiet();

        const output = await executor.run(tempFile);
        expect(output).toBe("12");
        await executor.tearDown();
    });
})