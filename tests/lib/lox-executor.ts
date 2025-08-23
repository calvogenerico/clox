import $ from 'dax-sh';
import {dirname, join} from 'node:path';
import {fileURLToPath} from "node:url";
import {existsSync} from "node:fs";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

export class LoxExecutor {
    cloxPath: string | null;

    constructor() {
        this.cloxPath = null;
    }

    checkCloxPath() {
        const cloxRoot = join(__dirname, '..', '..');
        const path = join(cloxRoot, 'cmake-build-debug', 'clox');
        if (existsSync(path)) {
            this.cloxPath = path;
        }
    }

    async compile(): Promise<string> {
        const cloxRoot = join(__dirname, '..', '..');
        await $`cmake -S . -B cmake-build-debug -DCMAKE_BUILD_TYPE=Debug`.cwd(cloxRoot).quiet();
        await $`cmake --build cmake-build-debug`.cwd(cloxRoot).quiet();
        this.cloxPath = join(cloxRoot, 'cmake-build-debug', 'clox');
        return this.cloxPath;
    }

    async run(absPath: string): Promise<string> {
        if (!this.cloxPath) {
            throw new Error('Cannot run without check cloc is compiled');
        }

        return  $`${this.cloxPath!} ${absPath}`.text();
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
