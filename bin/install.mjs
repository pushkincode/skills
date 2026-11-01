#!/usr/bin/env node
import { createHash } from 'node:crypto';
import { lstat, mkdir, readFile, readdir, writeFile } from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { createInterface } from 'node:readline/promises';
import { stdin, stdout } from 'node:process';

const packageRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const projectRoot = process.cwd();
const manifestPath = path.join(projectRoot, '.pushkincode-skills.json');
const homeRoot = os.homedir();
const rulesManifestPath = path.join(homeRoot, '.pushkincode-rules.json');
const destinations = {
  codex: '.agents/skills',
  claude: '.claude/skills',
  kimi: '.agents/skills',
  opencode: '.agents/skills',
};
const ruleTargets = {
  codex: path.join(process.env.CODEX_HOME || path.join(homeRoot, '.codex'), 'AGENTS.md'),
  kimi: path.join(process.env.KIMI_CODE_HOME || path.join(homeRoot, '.kimi-code'), 'AGENTS.md'),
  opencode: path.join(process.env.XDG_CONFIG_HOME || path.join(homeRoot, '.config'), 'opencode', 'AGENTS.md'),
};
const claudeRulesRoot = path.join(process.env.CLAUDE_CONFIG_DIR || path.join(homeRoot, '.claude'), 'rules', 'pushkincode');
const blockStart = '<!-- pushkincode-rules:start -->';
const blockEnd = '<!-- pushkincode-rules:end -->';

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

async function assertNoLinks(location) {
  const resolved = path.resolve(location);
  const root = path.parse(resolved).root;
  const relative = path.relative(root, resolved);
  let current = root;
  for (const segment of relative.split(path.sep).filter(Boolean)) {
    current = path.join(current, segment);
    const info = await statOrNull(current);
    if (info?.isSymbolicLink()) throw new Error(`Symbolic link is not supported: ${current}`);
  }
  return resolved;
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

async function loadRulesManifest() {
  const stat = await statOrNull(rulesManifestPath);
  if (!stat) return { schema: 1, files: {}, blocks: {} };
  if (!stat.isFile() || stat.isSymbolicLink()) throw new Error('Invalid global rules installation record. No files were changed.');
  let data;
  try { data = JSON.parse(await readFile(rulesManifestPath, 'utf8')); }
  catch { throw new Error('Cannot read .pushkincode-rules.json. No files were changed.'); }
  if (data.schema !== 1 || !data.files || !data.blocks ||
      typeof data.files !== 'object' || Array.isArray(data.files) ||
      typeof data.blocks !== 'object' || Array.isArray(data.blocks)) {
    throw new Error('Unsupported global rules installation record. No files were changed.');
  }
  return data;
}

function managedBlock(content) {
  return `${blockStart}\n${content.trimEnd()}\n${blockEnd}`;
}

function replaceManagedBlock(existing, block) {
  const start = existing.indexOf(blockStart);
  const end = existing.indexOf(blockEnd);
  if (start === -1 && end === -1) {
    if (!existing) return `${block}\n`;
    const separator = existing.endsWith('\n\n') ? '' : existing.endsWith('\n') ? '\n' : '\n\n';
    return `${existing}${separator}${block}\n`;
  }
  if (start === -1 || end === -1 || end < start ||
      existing.indexOf(blockStart, start + blockStart.length) !== -1 ||
      existing.indexOf(blockEnd, end + blockEnd.length) !== -1) {
    throw new Error('Malformed PushkinCode rules block. No files were changed.');
  }
  return `${existing.slice(0, start)}${block}${existing.slice(end + blockEnd.length)}`;
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
      console.log('Для какого агента установить скиллы и глобальные правила?\n1. Codex\n2. Claude Code\n3. Kimi Code\n4. OpenCode\n5. Для всех перечисленных');
      const answer = (await prompt.question('Выберите номер: ')).trim();
      choice = ({ '1': 'codex', '2': 'claude', '3': 'kimi', '4': 'opencode', '5': 'all' })[answer];
    } finally { prompt.close(); }
  }
  if (choice !== 'all' && !Object.hasOwn(destinations, choice)) throw new Error('Неизвестный агент. Используйте --help.');
  const selectedAgents = choice === 'all' ? Object.keys(destinations) : [choice];
  const roots = [...new Set(choice === 'all' ? Object.values(destinations) : [destinations[choice]])];
  const sourceRoot = path.join(packageRoot, 'skills');
  const skills = (await readdir(sourceRoot, { withFileTypes: true }))
    .filter((entry) => entry.isDirectory() && /^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(entry.name))
    .map((entry) => entry.name).sort();
  if (!skills.length) throw new Error('В пакете нет скиллов.');

  await assertNoLinks(rulesManifestPath);
  const record = await loadManifest();
  const rulesRecord = await loadRulesManifest();
  const actions = [];
  const ruleActions = [];
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
  const rulesSourceRoot = path.join(packageRoot, 'rules');
  const ruleFiles = await listFiles(rulesSourceRoot);
  ruleFiles.sort((left, right) => {
    if (left === 'general.md') return -1;
    if (right === 'general.md') return 1;
    return left.localeCompare(right);
  });
  if (!ruleFiles.length || ruleFiles.some((item) => !item.endsWith('.md'))) {
    throw new Error('В пакете нет корректных файлов глобальных правил.');
  }
  const ruleContents = new Map();
  for (const item of ruleFiles) {
    ruleContents.set(item, await readFile(path.join(rulesSourceRoot, ...item.split('/'))));
  }
  const combinedRules = [...ruleContents.values()].map((content) => content.toString('utf8').trim()).join('\n\n');

  if (selectedAgents.includes('claude')) {
    await assertNoLinks(claudeRulesRoot);
    const targetRootInfo = await statOrNull(claudeRulesRoot);
    if (targetRootInfo && !targetRootInfo.isDirectory()) conflicts.push(claudeRulesRoot);
    for (const [item, content] of ruleContents) {
      const key = `claude/${item}`;
      const target = await assertNoLinks(path.join(claudeRulesRoot, ...item.split('/')));
      const targetInfo = await statOrNull(target);
      if (targetInfo && (!targetInfo.isFile() || !rulesRecord.files[key] ||
          sha(await readFile(target)) !== rulesRecord.files[key])) conflicts.push(target);
      if (!targetInfo && rulesRecord.files[key]) conflicts.push(target);
      ruleActions.push({ type: 'file', key, target, content });
    }
  }

  const block = managedBlock(combinedRules);
  for (const agent of selectedAgents.filter((item) => item !== 'claude')) {
    const target = await assertNoLinks(ruleTargets[agent]);
    const targetInfo = await statOrNull(target);
    if (targetInfo && !targetInfo.isFile()) { conflicts.push(target); continue; }
    const existing = targetInfo ? await readFile(target, 'utf8') : '';
    const start = existing.indexOf(blockStart);
    const end = existing.indexOf(blockEnd);
    if (start !== -1 && end !== -1 && end >= start) {
      const oldBlock = existing.slice(start, end + blockEnd.length);
      if (!rulesRecord.blocks[agent] || sha(oldBlock) !== rulesRecord.blocks[agent]) conflicts.push(target);
    } else if (start !== -1 || end !== -1 || rulesRecord.blocks[agent]) {
      conflicts.push(target);
    }
    ruleActions.push({ type: 'block', agent, target, content: replaceManagedBlock(existing, block), block });
  }
  if (conflicts.length) {
    console.error('Установка остановлена: обнаружены существующие, изменённые или удалённые управляемые файлы. Ничего не перезаписано:');
    for (const item of [...new Set(conflicts)]) console.error(`  ${item}`);
    process.exitCode = 1;
    return;
  }
  for (const { key, target, content } of actions) {
    await mkdir(path.dirname(target), { recursive: true });
    await writeFile(target, content);
    record.files[key] = sha(content);
  }
  for (const action of ruleActions) {
    await mkdir(path.dirname(action.target), { recursive: true });
    await writeFile(action.target, action.content);
    if (action.type === 'file') rulesRecord.files[action.key] = sha(action.content);
    else rulesRecord.blocks[action.agent] = sha(action.block);
  }
  record.packageVersion = JSON.parse(await readFile(path.join(packageRoot, 'package.json'), 'utf8')).version;
  record.source = 'https://github.com/pushkincode/skills';
  rulesRecord.packageVersion = record.packageVersion;
  rulesRecord.source = record.source;
  await writeFile(manifestPath, `${JSON.stringify(record, null, 2)}\n`);
  await writeFile(rulesManifestPath, `${JSON.stringify(rulesRecord, null, 2)}\n`);
  console.log(`Готово: скиллы ${skills.join(', ')}; глобальные правила для ${selectedAgents.join(', ')}.`);
  console.log('Начните новую сессию агента. Для обновления повторите команду установки.');
}

main().catch((error) => { console.error(`Ошибка: ${error.message}`); process.exitCode = 1; });
