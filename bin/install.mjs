#!/usr/bin/env node
import { createHash } from 'node:crypto';
import { lstat, mkdir, readFile, readdir, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { createInterface } from 'node:readline/promises';
import { stdin, stdout } from 'node:process';

const packageRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const projectRoot = process.cwd();
const manifestPath = path.join(projectRoot, '.pushkincode-skills.json');
const destinations = {
  codex: '.agents/skills',
  claude: '.claude/skills',
  kimi: '.agents/skills',
  opencode: '.agents/skills',
};

const sha = (buffer) => createHash('sha256').update(buffer).digest('hex');
const posix = (value) => value.split(path.sep).join('/');

async function statOrNull(location) {
  try { return await lstat(location); }
  catch (error) { if (error.code === 'ENOENT') return null; throw error; }
}

// Never follow links within installation paths, including on repeated runs.
async function safePath(relative) {
  const segments = relative.split('/');
  if (!relative || segments.some((part) => !part || part === '.' || part === '..' || part.includes('\\'))) {
    throw new Error(`Invalid path: ${relative}`);
  }
  let current = projectRoot;
  for (const segment of segments) {
    current = path.join(current, segment);
    const info = await statOrNull(current);
    if (info?.isSymbolicLink()) throw new Error(`Symbolic link is not supported: ${posix(path.relative(projectRoot, current))}`);
  }
  return current;
}

async function listFiles(directory, prefix = '') {
  const result = [];
  for (const entry of await readdir(directory, { withFileTypes: true })) {
    const name = prefix ? `${prefix}/${entry.name}` : entry.name;
    if (entry.isDirectory()) result.push(...await listFiles(path.join(directory, entry.name), name));
    else if (entry.isFile()) result.push(name);
    else throw new Error(`Unsupported file type in skill: ${name}`);
  }
  return result.sort();
}

async function loadManifest() {
  const stat = await statOrNull(manifestPath);
  if (!stat) return { schema: 1, files: {} };
  if (!stat.isFile() || stat.isSymbolicLink()) throw new Error('Invalid installation record. No files were changed.');
  let data;
  try { data = JSON.parse(await readFile(manifestPath, 'utf8')); }
  catch { throw new Error('Cannot read .pushkincode-skills.json. No files were changed.'); }
  if (data.schema !== 1 || !data.files || typeof data.files !== 'object' || Array.isArray(data.files)) {
    throw new Error('Unsupported installation record. No files were changed.');
  }
  return data;
}

async function main() {
  const args = process.argv.slice(2);
  if (args.includes('--help')) {
    console.log('Использование: установщик [--agent codex|claude|kimi|opencode|all]');
    return;
  }
  let choice;
  if (args.length) {
    if (args.length !== 2 || args[0] !== '--agent') throw new Error('Неизвестные параметры. Используйте --help.');
    choice = args[1];
  } else {
    if (!stdin.isTTY) throw new Error('Выберите агента параметром --agent: codex, claude, kimi, opencode или all.');
    const prompt = createInterface({ input: stdin, output: stdout });
    try {
      console.log('Куда установить скиллы?\n1. Codex\n2. Claude Code\n3. Kimi Code\n4. OpenCode\n5. Для всех перечисленных');
      const answer = (await prompt.question('Выберите номер: ')).trim();
      choice = ({ '1': 'codex', '2': 'claude', '3': 'kimi', '4': 'opencode', '5': 'all' })[answer];
    } finally { prompt.close(); }
  }
  if (choice !== 'all' && !Object.hasOwn(destinations, choice)) throw new Error('Неизвестный агент. Используйте --help.');
  const roots = [...new Set(choice === 'all' ? Object.values(destinations) : [destinations[choice]])];
  const sourceRoot = path.join(packageRoot, 'skills');
  const skills = (await readdir(sourceRoot, { withFileTypes: true }))
    .filter((entry) => entry.isDirectory() && /^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(entry.name))
    .map((entry) => entry.name).sort();
  if (!skills.length) throw new Error('В пакете нет скиллов.');

  const record = await loadManifest();
  const actions = [];
  const conflicts = [];
  for (const root of roots) {
    for (const skill of skills) {
      const source = path.join(sourceRoot, skill);
      const sourceFiles = await listFiles(source);
      if (!sourceFiles.includes('SKILL.md')) throw new Error(`В ${skill} отсутствует SKILL.md.`);
      const targetDirectory = `${root}/${skill}`;
      const targetInfo = await statOrNull(await safePath(targetDirectory));
      if (targetInfo && !targetInfo.isDirectory()) { conflicts.push(targetDirectory); continue; }
      const tracked = Object.keys(record.files).filter((key) => key.startsWith(`${targetDirectory}/`));
      if (targetInfo && !tracked.length) { conflicts.push(targetDirectory); continue; }
      const existing = targetInfo ? await listFiles(await safePath(targetDirectory)) : [];
      // Validate the complete existing skill before updating any of its files.
      for (const item of existing) {
        const key = `${targetDirectory}/${item}`;
        const target = await safePath(key);
        if (!record.files[key] || sha(await readFile(target)) !== record.files[key]) conflicts.push(key);
      }
      for (const item of tracked) {
        if (!(await statOrNull(await safePath(item)))) conflicts.push(item);
      }
      for (const item of sourceFiles) {
        const key = `${targetDirectory}/${item}`;
        const content = await readFile(path.join(source, ...item.split('/')));
        actions.push({ key, target: await safePath(key), content });
      }
      for (const item of tracked) {
        if (!sourceFiles.includes(item.slice(targetDirectory.length + 1))) conflicts.push(item);
      }
    }
  }
  if (conflicts.length) {
    console.error('Установка остановлена: обнаружены существующие, изменённые или удалённые файлы скиллов. Ничего не перезаписано:');
    for (const item of [...new Set(conflicts)]) console.error(`  ${item}`);
    process.exitCode = 1;
    return;
  }
  for (const { key, target, content } of actions) {
    await mkdir(path.dirname(target), { recursive: true });
    await writeFile(target, content);
    record.files[key] = sha(content);
  }
  record.packageVersion = JSON.parse(await readFile(path.join(packageRoot, 'package.json'), 'utf8')).version;
  record.source = 'https://github.com/pushkincode/skills';
  await writeFile(manifestPath, `${JSON.stringify(record, null, 2)}\n`);
  console.log(`Готово: ${skills.join(', ')}. Папки: ${roots.join(', ')}.`);
  console.log('Начните новую сессию агента. Для обновления повторите команду установки.');
}

main().catch((error) => { console.error(`Ошибка: ${error.message}`); process.exitCode = 1; });
