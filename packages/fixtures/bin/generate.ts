import {
  mkdir,
  readFile,
  readdir,
  rm,
  stat,
  writeFile,
} from "node:fs/promises";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";
import type { Fixture, FixtureFile } from "../src/define";
import { compare } from "../src/compare";
import { renderFixture } from "../src/define";

const here = dirname(fileURLToPath(import.meta.url));
const fixturesDir = resolve(here, "../fixtures");

type Args = {
  command: string;
  only?: string;
  out: string;
};

function parseArgs(argv: string[]): Args {
  const args: Args = {
    command: argv[0] ?? "build",
    out: resolve(here, "../out"),
  };
  for (let index = 1; index < argv.length; index += 2) {
    const flag = argv[index];
    const value = argv[index + 1];
    if (flag === "--only" && value) {
      args.only = value;
    } else if (flag === "--out" && value) {
      args.out = resolve(process.cwd(), value);
    } else {
      throw new Error(`Unknown argument "${flag}"`);
    }
  }
  return args;
}

async function loadFixtures(only?: string): Promise<Fixture[]> {
  const entries = await readdir(fixturesDir);
  const modules = entries
    .filter((entry) => {
      return entry.endsWith(".fixture.ts");
    })
    .sort();

  const loaded: Fixture[] = [];
  for (const entry of modules) {
    const url = pathToFileURL(join(fixturesDir, entry)).href;
    const module = (await import(url)) as { default?: Fixture };
    if (!module.default) {
      throw new Error(`${entry} has no default export`);
    }
    if (!only || module.default.name === only) {
      loaded.push(module.default);
    }
  }
  if (only && loaded.length === 0) {
    throw new Error(`No fixture named "${only}"`);
  }
  return loaded;
}

async function writeAll(files: FixtureFile[], out: string): Promise<void> {
  for (const file of files) {
    const target = join(out, file.path);
    await mkdir(dirname(target), { recursive: true });
    await writeFile(target, file.bytes);
    console.log(`${file.path}  ${file.bytes.byteLength} bytes`);
  }
}

async function readTree(
  root: string,
  prefix = "",
): Promise<Map<string, Uint8Array>> {
  const found = new Map<string, Uint8Array>();
  let entries: string[];
  try {
    entries = await readdir(join(root, prefix));
  } catch {
    return found;
  }
  for (const entry of entries) {
    const relativePath = prefix ? `${prefix}/${entry}` : entry;
    const info = await stat(join(root, relativePath));
    if (info.isDirectory()) {
      for (const [path, bytes] of await readTree(root, relativePath)) {
        found.set(path, bytes);
      }
    } else {
      found.set(
        relativePath,
        new Uint8Array(await readFile(join(root, relativePath))),
      );
    }
  }
  return found;
}

async function main(): Promise<void> {
  const args = parseArgs(process.argv.slice(2));
  const fixtures = await loadFixtures(args.only);

  if (args.command === "build") {
    for (const fixture of fixtures) {
      await rm(join(args.out, fixture.name), { recursive: true, force: true });
      await writeAll(renderFixture(fixture), args.out);
    }
    return;
  }

  if (args.command === "check") {
    const expected = fixtures.flatMap((fixture) => {
      return renderFixture(fixture);
    });
    const wanted = new Set(
      fixtures.map((fixture) => {
        return fixture.name;
      }),
    );
    const onDisk = new Map<string, Uint8Array>();
    for (const [path, bytes] of await readTree(args.out)) {
      if (wanted.has(path.split("/")[0] ?? "")) {
        onDisk.set(path, bytes);
      }
    }
    const differences = compare(expected, onDisk);
    if (differences.length === 0) {
      console.log(`${expected.length} files match`);
      return;
    }
    for (const difference of differences) {
      console.error(`${difference.path}: ${difference.reason}`);
    }
    throw new Error(`${differences.length} files differ from out/`);
  }

  throw new Error(`Unknown command "${args.command}"`);
}

main().catch((error: unknown) => {
  console.error(error instanceof Error ? error.message : error);
  process.exitCode = 1;
});
