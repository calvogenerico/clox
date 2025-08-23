import $ from 'dax-sh';
import {dirname, join} from 'node:path';
import {fileURLToPath} from 'node:url';
import {existsSync} from 'node:fs';
import {nanoid} from 'nanoid';
import {tmpdir} from "os";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

export class LoxExecutor {
    cloxPath: string | null;
    private seed: string;
    private buildPath: string;

    constructor() {
        this.cloxPath = null;
        this.seed = nanoid();
        this.buildPath = join(tmpdir(), 'clox-test', this.seed);
    }

    async compile(): Promise<string> {
        const cloxRoot = join(__dirname, '..', '..');
        await $`cmake -S . -B ${$.path(this.buildPath)} -DCMAKE_BUILD_TYPE=Debug`.cwd(cloxRoot).quiet();
        await $`cmake --build ${$.path(this.buildPath)}`.cwd(cloxRoot).quiet();
        this.cloxPath = join(this.buildPath, 'clox');
        return this.cloxPath;
    }

    async tearDown(): Promise<void> {
        await $`rm -r ${$.path(this.buildPath)}`
    }

    async run(absPath: string): Promise<string> {
        if (this.cloxPath === null) {
            throw new Error('Cannot run without check clox is compiled');
        }

        return $`${this.cloxPath!} ${absPath}`.text();
    }

    async memCheck(absPath: string): Promise<boolean> {
        const res = await $`valgrind --error-exitcode=1 --tool=memcheck --leak-check=full -q ${this.cloxPath!} ${absPath} > /dev/null`.noThrow();
        if (res.code === 1) {
            await $`valgrind --error-exitcode=1 --tool=memcheck --leak-check=full ${this.cloxPath!} ${absPath}`.noThrow();
            return false;
        }
        return true;
    }
}
