import { test } from 'node:test';
import assert from 'node:assert/strict';
import { mkdtemp, readFile, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const installer = fileURLToPath(new URL('../bin/install.mjs', import.meta.url));
const run = (cwd, agent) => spawnSync(process.execPath, [installer, '--agent', agent], { cwd, encoding: 'utf8' });

test('installs both skills for selected agents and can run again', async () => {
  const project = await mkdtemp(path.join(tmpdir(), 'pushkin skills test '));
  assert.equal(run(project, 'all').status, 0);
  for (const folder of ['.agents/skills', '.claude/skills']) {
    for (const name of ['how', 'spec']) {
      assert.match(await readFile(path.join(project, folder, name, 'SKILL.md'), 'utf8'), new RegExp(`name: ${name}`));
    }
  }
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
  await mkdir(path.join(packageCopy, 'bin'));
  await cp(installer, path.join(packageCopy, 'bin/install.mjs'));
  await cp(path.join(sourceRoot, 'package.json'), path.join(packageCopy, 'package.json'));
  const copiedInstaller = path.join(packageCopy, 'bin/install.mjs');
  const runCopy = () => spawnSync(process.execPath, [copiedInstaller, '--agent', 'codex'], { cwd: project, encoding: 'utf8' });
  assert.equal(runCopy().status, 0);
  const updated = '---\nname: how\ndescription: updated\n---\nNew version\n';
  await writeFile(path.join(packageCopy, 'skills/how/SKILL.md'), updated);
  assert.equal(runCopy().status, 0);
  assert.equal(await readFile(path.join(project, '.agents/skills/how/SKILL.md'), 'utf8'), updated);
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
