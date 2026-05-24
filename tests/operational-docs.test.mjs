import { readFileSync } from 'node:fs';
import { test } from 'node:test';
import assert from 'node:assert/strict';

const docs = [
  'docs/PATCH-OPERATIONS.md',
  'HANDOFF.md',
];

for (const path of docs) {
  test(`${path} documents Hermes as the active operator`, () => {
    const body = readFileSync(path, 'utf8');

    assert.match(body, /Hermes/, `${path} should name Hermes as the active operator`);
    assert.doesNotMatch(
      body,
      /claude\s+"patch:|Claude Code|@anthropic-ai\/claude-code|claude login|claude --version/i,
      `${path} should not instruct operators to use Claude Code`,
    );
  });
}

test('operation guide includes Hermes cron and project evidence rules', () => {
  const body = readFileSync('docs/PATCH-OPERATIONS.md', 'utf8');

  assert.match(body, /Hermes cron job/, 'operation guide should route recurring operation through Hermes cron');
  assert.match(body, /GitHub Project #4/, 'operation guide should point task tracking at GitHub Project #4');
  assert.match(body, /Issue\/PR/, 'operation guide should keep durable evidence in Issues and PRs');
});
