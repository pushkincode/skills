import { test } from 'node:test';
import assert from 'node:assert/strict';
import { mkdtemp, readFile, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const installer = fileURLToPath(new URL('../bin/install.mjs', import.meta.url));
const fakeHome = (cwd) => path.join(cwd, '.test-home');
const runWith = (installerPath, cwd, agent, language = 'en') => {
  const home = fakeHome(cwd);
  const env = {
    ...process.env,
    HOME: home,
    USERPROFILE: home,
    CODEX_HOME: path.join(home, '.codex'),
    CLAUDE_CONFIG_DIR: path.join(home, '.claude'),
    KIMI_CODE_HOME: path.join(home, '.kimi-code'),
    XDG_CONFIG_HOME: path.join(home, '.config'),
  };
  return spawnSync(process.execPath, [installerPath, '--lang', language, '--agent', agent], { cwd, encoding: 'utf8', env });
};
const run = (cwd, agent) => runWith(installer, cwd, agent);

test('installs both skills for selected agents and can run again', async () => {
  const project = await mkdtemp(path.join(tmpdir(), 'pushkin skills test '));
  assert.equal(run(project, 'all').status, 0);
  for (const folder of ['.agents/skills', '.claude/skills']) {
    for (const name of ['how', 'spec']) {
      assert.match(await readFile(path.join(project, folder, name, 'SKILL.md'), 'utf8'), new RegExp(`name: ${name}`));
    }
  }
  for (const target of [
    '.codex/AGENTS.md',
    '.kimi-code/AGENTS.md',
    '.config/opencode/AGENTS.md',
  ]) {
    assert.match(await readFile(path.join(fakeHome(project), target), 'utf8'), /pushkincode-rules:start/);
  }
  assert.match(
    await readFile(path.join(fakeHome(project), '.claude/rules/pushkincode/general.md'), 'utf8'),
    /General working rules/,
  );
  assert.equal(run(project, 'all').status, 0);
  const record = JSON.parse(await readFile(path.join(project, '.pushkincode-skills.json'), 'utf8'));
  assert.equal(Object.keys(record.files).length, 4);
});

test('preserves local edits and does not update other files on conflict', async () => {
  const project = await mkdtemp(path.join(tmpdir(), 'pushkin skills test '));
  assert.equal(run(project, 'codex').status, 0);
  const edited = path.join(project, '.agents/skills/how/SKILL.md');
  await writeFile(edited, 'my changes');
  const before = await readFile(path.join(project, '.pushkincode-skills.json'), 'utf8');
  assert.notEqual(run(project, 'codex').status, 0);
  assert.equal(await readFile(edited, 'utf8'), 'my changes');
  assert.equal(await readFile(path.join(project, '.pushkincode-skills.json'), 'utf8'), before);
});

test('updates unmodified installed skills from a newer package', async () => {
  const project = await mkdtemp(path.join(tmpdir(), 'pushkin skills project '));
  const packageCopy = await mkdtemp(path.join(tmpdir(), 'pushkin skills package '));
  const { cp, mkdir } = await import('node:fs/promises');
  const sourceRoot = path.resolve(path.dirname(installer), '..');
  await cp(path.join(sourceRoot, 'skills'), path.join(packageCopy, 'skills'), { recursive: true });
  await cp(path.join(sourceRoot, 'rules'), path.join(packageCopy, 'rules'), { recursive: true });
  await mkdir(path.join(packageCopy, 'bin'));
  await cp(installer, path.join(packageCopy, 'bin/install.mjs'));
  await cp(path.join(sourceRoot, 'package.json'), path.join(packageCopy, 'package.json'));
  const copiedInstaller = path.join(packageCopy, 'bin/install.mjs');
  const runCopy = () => runWith(copiedInstaller, project, 'codex');
  assert.equal(runCopy().status, 0);
  const updated = '---\nname: how\ndescription: updated\n---\nNew version\n';
  await writeFile(path.join(packageCopy, 'skills/how/SKILL.md'), updated);
  await writeFile(path.join(packageCopy, 'rules/en/general.md'), '# Updated global rule\n');
  assert.equal(runCopy().status, 0);
  assert.equal(await readFile(path.join(project, '.agents/skills/how/SKILL.md'), 'utf8'), updated);
  assert.match(await readFile(path.join(fakeHome(project), '.codex/AGENTS.md'), 'utf8'), /Updated global rule/);
});

test('does not overwrite a pre-existing skill from another source', async () => {
  const project = await mkdtemp(path.join(tmpdir(), 'pushkin skills test '));
  const { mkdir } = await import('node:fs/promises');
  await mkdir(path.join(project, '.agents/skills/how'), { recursive: true });
  const existing = path.join(project, '.agents/skills/how/SKILL.md');
  await writeFile(existing, 'someone else');
  assert.notEqual(run(project, 'codex').status, 0);
  assert.equal(await readFile(existing, 'utf8'), 'someone else');
});

test('preserves existing global instructions around the managed block', async () => {
  const project = await mkdtemp(path.join(tmpdir(), 'pushkin skills test '));
  const { mkdir } = await import('node:fs/promises');
  const target = path.join(fakeHome(project), '.codex/AGENTS.md');
  await mkdir(path.dirname(target), { recursive: true });
  await writeFile(target, '# My instructions\n\nKeep this text.\n');
  assert.equal(run(project, 'codex').status, 0);
  const installed = await readFile(target, 'utf8');
  assert.match(installed, /^# My instructions/);
  assert.match(installed, /Keep this text\./);
  assert.match(installed, /pushkincode-rules:start/);
  assert.equal(run(project, 'codex').status, 0);
  assert.equal(await readFile(target, 'utf8'), installed);
});

test('does not overwrite a locally edited global rules block', async () => {
  const project = await mkdtemp(path.join(tmpdir(), 'pushkin skills test '));
  assert.equal(run(project, 'codex').status, 0);
  const target = path.join(fakeHome(project), '.codex/AGENTS.md');
  const edited = (await readFile(target, 'utf8')).replace('# Boundaries', '# My changed boundaries');
  await writeFile(target, edited);
  assert.notEqual(run(project, 'codex').status, 0);
  assert.equal(await readFile(target, 'utf8'), edited);
});

test('installs Russian rules and uses Russian output', async () => {
  const project = await mkdtemp(path.join(tmpdir(), 'pushkin skills test '));
  const result = runWith(installer, project, 'codex', 'ru');
  assert.equal(result.status, 0);
  assert.match(result.stdout, /Готово:/);
  const rules = await readFile(path.join(fakeHome(project), '.codex/AGENTS.md'), 'utf8');
  assert.match(rules, /# Общие правила работы/);
  assert.match(rules, /# Общие правила работы/);
});

test('switches installed rules to another language', async () => {
  const project = await mkdtemp(path.join(tmpdir(), 'pushkin skills test '));
  assert.equal(runWith(installer, project, 'all', 'en').status, 0);
  assert.equal(runWith(installer, project, 'all', 'ru').status, 0);
  assert.match(
    await readFile(path.join(fakeHome(project), '.codex/AGENTS.md'), 'utf8'),
    /# Общие правила работы/,
  );
  assert.match(
    await readFile(path.join(fakeHome(project), '.claude/rules/pushkincode/general.md'), 'utf8'),
    /# Общие правила работы/,
  );
});
