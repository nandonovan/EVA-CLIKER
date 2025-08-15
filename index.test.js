const fs = require('fs');
const vm = require('vm');
const assert = require('assert');

const html = fs.readFileSync('index.html', 'utf8');
const scriptMatch = html.match(/<script>([\s\S]*?)<\/script>/);
if (!scriptMatch) throw new Error('Script tag not found');
const scriptContent = scriptMatch[1];

function extract(pattern) {
  const m = scriptContent.match(pattern);
  if (!m) throw new Error('Pattern not found');
  return m[0];
}

const code = [
  extract(/const state = {[\s\S]*?};/),
  extract(/function zoneCost\([\s\S]*?\}\s/),
  extract(/function clickBase\([\s\S]*?\}\s/),
  extract(/function upgradeCost\([\s\S]*?\}\s/),
  extract(/function biomeForZone\([\s\S]*?\}\s/)
].join('\n');

const context = {};
vm.createContext(context);
vm.runInContext(code, context);

const { state, zoneCost, clickBase, upgradeCost, biomeForZone } = context;

assert.strictEqual(zoneCost(1), 150);
assert.ok(Math.abs(zoneCost(2) - (150 * Math.pow(2, 1.35))) < 1e-9);

assert.strictEqual(clickBase(1), 1);
assert.ok(Math.abs(clickBase(5) - (1.0 * Math.pow(5, 0.9))) < 1e-9);

assert.strictEqual(upgradeCost(1), 50);
assert.ok(Math.abs(upgradeCost(3) - (50 * Math.pow(3, 1.15))) < 1e-9);

assert.strictEqual(biomeForZone(1).name, 'Laboratoire (Scientifiques)');
assert.strictEqual(biomeForZone(25).name, 'Far-West (Cowboys)');
assert.strictEqual(biomeForZone(95).name, 'Nexus d’Artefacts');

console.log('All tests passed');
