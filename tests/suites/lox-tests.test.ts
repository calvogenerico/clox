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
}

const it = baseIt.extend<Context>({
  paths: async ({}, use) => {
    const paths = new Map<string, string>();
    const lsOutput = await $`ls ${$.path(__dirname)}/lox-code`.text();
    const keys = lsOutput.split('\n').map(line => line.trim());
    keys.forEach(key => {
      paths.set(key, join(__dirname, 'lox-code', key));
    })
    use(paths);
  },
  executor: [
    async ({}, use) => {
      const executor = new LoxExecutor();
      await executor.compile();
      await use(executor);
      await executor.tearDown();
    },
    {auto: true, scope: 'worker'}
  ]
});

function repeatList<T>(list: T[], times: number): T[] {
  const res = new Array<T[]>(times);

  for (let i = 0; i < times; i++) {
    res[i] = list
  }

  return res.flat();
}

describe('Lox snippets', () => {
  describe('execution', () => {
    async function execFile(executor: LoxExecutor, paths: Map<string, string>, file: string, expected: string[]) {
      const output = await executor.run(paths.get(file)!);
      expect(output.split('\n')).toEqual(expected);
    }

    it('01-add.lox', async ({executor, paths}) => {
      await execFile(executor, paths, '01-add.lox', ['2', '10', '9']);
    });

    it('02-subtraction.lox', async ({executor, paths}) => {
      await execFile(executor, paths, '02-subtraction.lox', ['0', '-40', '40', '-3']);
    });

    it('03-ternary_operator.lox', async ({executor, paths}) =>
      await execFile(executor, paths, '03-ternary_operator.lox', repeatList(['ok'], 13) )
    );

    it('04-bound-methods.lox', async ({executor, paths}) =>
      await execFile(executor, paths, '04-bound-methods.lox', repeatList(['ok'], 2) )
    );

    it('05-strings_1.lox', async ({executor, paths}) =>
      await execFile(executor, paths, '05-strings_1.lox', ['ok1', 'ok2', 'ok3', 'ok4', 'ok5', 'ok6', 'ok7', 'ok8', 'ok9'] )
    );
  });

  describe('memory check with valgrind', async () => {
    async function memCheck(executor: LoxExecutor, paths: Map<string, string>, file: string) {
      const ok = await executor.memCheck(paths.get(file)!);
      expect(ok).toBe(true);
    }

    it('01-add.lox', async ({executor, paths}) => await memCheck(executor, paths, '01-add.lox'));
    it('02-subtraction.lox', async ({executor, paths}) => await memCheck(executor, paths, '02-subtraction.lox'));
    it('03-ternary_operator.lox', async ({executor, paths}) => await memCheck(executor, paths, '03-ternary_operator.lox'));
    it('04-bound-methods.lox', async ({executor, paths}) => await memCheck(executor, paths, '04-bound-methods.lox'));
    it('05-strings_1.lox', async ({executor, paths}) => await memCheck(executor, paths, '05-strings_1.lox'));
  })
})