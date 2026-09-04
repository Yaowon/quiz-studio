#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';
import { spawnSync } from 'node:child_process';

const root = path.resolve(process.argv[2] || '.');
const required = ['index.html', 'design-studio.html', 'styles.css', 'quiz-config.js', 'quiz-core.js', 'quiz-runtime.js', 'studio.js'];
const fail = (message) => { console.error(`FAIL: ${message}`); process.exitCode = 1; };
const read = (name) => fs.readFileSync(path.join(root, name), 'utf8');

for (const name of required) if (!fs.existsSync(path.join(root, name))) fail(`missing required file ${name}`);
if (process.exitCode) process.exit(process.exitCode);

for (const name of required.filter((item) => item.endsWith('.js'))) {
  const check = spawnSync(process.execPath, ['--check', path.join(root, name)], { encoding: 'utf8' });
  if (check.status !== 0) fail(`${name} syntax error: ${check.stderr.trim()}`);
}

const context = { console, globalThis: {} };
vm.createContext(context);
try {
  vm.runInContext(read('quiz-config.js'), context, { filename: 'quiz-config.js' });
  vm.runInContext(read('quiz-core.js'), context, { filename: 'quiz-core.js' });
} catch (error) {
  fail(`cannot load config/core: ${error.message}`);
}
const config = context.globalThis.PERSONA_QUIZ_CONFIG;
const core = context.globalThis.PersonaQuizCore;
for (const error of core?.validate?.(config) || ['PersonaQuizCore did not load']) fail(error);

for (const testCase of config.scoringTestCases || []) {
  const actual = core.score(config, testCase.answers).winner.id;
  if (actual !== testCase.expected) fail(`${testCase.name}: expected ${testCase.expected}, received ${actual}`);
}
const counts = core.seededSimulation(config, 3000, 20260904);
const missingResults = Object.entries(counts).filter(([, count]) => count === 0).map(([id]) => id);
if (missingResults.length) fail(`random simulation never produces: ${missingResults.join(', ')}`);

const runtime = read('quiz-runtime.js');
const studio = read('studio.js');
const runtimeContracts = ['返回上一题', 'persona-quiz-layer-move', 'exportResultImage', 'openNameGate', "layer.type === 'image'"];
const studioContracts = ['formal-preview', 'persona-quiz-config', 'type="color"', '素材 URL', 'localStorage'];
for (const token of runtimeContracts) if (!runtime.includes(token)) fail(`runtime contract missing: ${token}`);
for (const token of studioContracts) if (!studio.includes(token)) fail(`studio contract missing: ${token}`);

if (!process.exitCode) {
  console.log('PASS schema, scoring cases, simulation coverage, syntax, and workbench contracts');
  console.log(`Simulation: ${JSON.stringify(counts)}`);
}
