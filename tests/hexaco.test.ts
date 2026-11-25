import { test } from 'node:test';
import assert from 'node:assert/strict';
import {
  bandFor,
  HEXACO_100_NORMS,
  HEXACO_100_NORMS_CZ,
  HEXACO_SCALES,
  NORM_GROUPS,
  normalCdf,
  normFor,
  parseHexacoParams,
  parseNormHash,
  toPercentile,
} from '../src/utils/hexaco.ts';

const EXAMPLE =
  'questionnaire=2026-10&created=2026-11&honesty-humility=3.5&sincerity=3.25&fairness=4&greed-avoidance=2.75&modesty=4&emotionality=3.188&fearfulness=2.5&anxiety=3.75&dependence=3.25&sentimentality=3.25&extraversion=3.375&social-self-esteem=4&social-boldness=2.75&sociability=3.5&liveliness=3.25&agreeableness=3.063&forgivingness=2.75&gentleness=3.5&flexibility=2.75&patience=3.25&conscientiousness=3.688&organization=3.5&diligence=4.25&perfectionism=3.75&prudence=3.25&openness=3.813&aesthetic-appreciation=4&inquisitiveness=3.5&creativity=4.25&unconventionality=3.5&altruism=4.25';

test('normalCdf matches known values', () => {
  assert.ok(Math.abs(normalCdf(0) - 0.5) < 1e-7);
  assert.ok(Math.abs(normalCdf(1) - 0.841345) < 1e-6);
  assert.ok(Math.abs(normalCdf(-1.96) - 0.024998) < 1e-6);
});

test('toPercentile: sanity checks against the hexaco.org norms', () => {
  const e = HEXACO_100_NORMS.emotionality;
  const mid = toPercentile(3.43, e.total);
  assert.ok(Math.abs(mid.z) < 1e-12);
  assert.equal(mid.percentile, 50);
  const plusOne = toPercentile(4.05, e.total);
  assert.ok(Math.abs(plusOne.z - 1) < 1e-12);
  assert.equal(plusOne.percentile, 84);
  // "Roughly 30": z = (3.43 - 3.69) / 0.48 = -0.54 → 29.4.
  assert.equal(toPercentile(3.43, e.women).percentile, 29);
  assert.equal(toPercentile(3.43, e.men).percentile, 76);
});

test('toPercentile clamps to 1–99', () => {
  assert.equal(toPercentile(1, { m: 4.9, sd: 0.1 }).percentile, 1);
  assert.equal(toPercentile(5, { m: 1.1, sd: 0.1 }).percentile, 99);
  for (const id of HEXACO_SCALES) {
    for (const group of NORM_GROUPS) {
      for (const sample of ['cz', 'ca'] as const) {
        const norm = normFor(id, sample, group);
        for (const score of [1, 5]) {
          const { percentile } = toPercentile(score, norm);
          assert.ok(percentile >= 1 && percentile <= 99, `${id} ${sample} ${group} ${score}`);
        }
      }
    }
  }
});

test('bandFor boundaries', () => {
  assert.equal(bandFor(1), 'low');
  assert.equal(bandFor(15), 'low');
  assert.equal(bandFor(16), 'below');
  assert.equal(bandFor(30), 'below');
  assert.equal(bandFor(31), 'average');
  assert.equal(bandFor(69), 'average');
  assert.equal(bandFor(70), 'above');
  assert.equal(bandFor(84), 'above');
  assert.equal(bandFor(85), 'high');
  assert.equal(bandFor(99), 'high');
});

test('norm tables: 31 hexaco.org scales, 30 Czech scales, plausible values', () => {
  assert.equal(HEXACO_SCALES.length, 31);
  assert.deepEqual(Object.keys(HEXACO_100_NORMS).sort(), [...HEXACO_SCALES].sort());
  assert.deepEqual(
    Object.keys(HEXACO_100_NORMS_CZ).sort(),
    HEXACO_SCALES.filter((id) => id !== 'altruism').sort()
  );
  for (const table of [HEXACO_100_NORMS, HEXACO_100_NORMS_CZ]) {
    for (const [id, norms] of Object.entries(table)) {
      for (const group of NORM_GROUPS) {
        assert.ok(norms[group].sd > 0, `${id} ${group} SD`);
        assert.ok(norms[group].m >= 1 && norms[group].m <= 5, `${id} ${group} mean`);
      }
    }
  }
  for (const { alpha } of Object.values(HEXACO_100_NORMS)) assert.ok(alpha > 0 && alpha < 1);
});

test('normFor falls back to hexaco.org norms only for Czech Altruism', () => {
  assert.deepEqual(normFor('altruism', 'cz', 'women'), { m: 4.06, sd: 0.6, fallback: true });
  assert.deepEqual(normFor('altruism', 'ca', 'women'), { m: 4.06, sd: 0.6, fallback: false });
  assert.deepEqual(normFor('emotionality', 'cz', 'men'), { m: 2.91, sd: 0.53, fallback: false });
});

test('parseHexacoParams accepts the PsychoTRON example URL', () => {
  const result = parseHexacoParams(`?${EXAMPLE}`);
  assert.equal(result.status, 'valid');
  if (result.status !== 'valid') return;
  assert.equal(Object.keys(result.scores).length, 31);
  assert.equal(result.scores.emotionality, 3.188);
  assert.equal(result.questionnaire, '2026-10');
  assert.equal(result.created, '2026-11');
  // Other questionnaire revisions are accepted.
  assert.equal(parseHexacoParams(`?${EXAMPLE.replace('questionnaire=2026-10', 'questionnaire=2027-03')}`).status, 'valid');
});

test('parseHexacoParams rejects missing, non-numeric and out-of-range values', () => {
  assert.deepEqual(parseHexacoParams(''), { status: 'empty' });
  const without = EXAMPLE.replace('&altruism=4.25', '');
  assert.deepEqual(parseHexacoParams(without), { status: 'invalid', invalidKeys: ['altruism'] });
  for (const bad of ['abc', '5.01', '0.99', '', '-3', '3e0', 'Infinity']) {
    const result = parseHexacoParams(EXAMPLE.replace('modesty=4', `modesty=${bad}`));
    assert.deepEqual(result, { status: 'invalid', invalidKeys: ['modesty'] }, bad);
  }
  assert.equal(parseHexacoParams(`${EXAMPLE}&modesty=3`).status, 'invalid');
  assert.deepEqual(parseHexacoParams(EXAMPLE.replace('created=2026-11', 'created=2026-13')), {
    status: 'invalid',
    invalidKeys: ['created'],
  });
  assert.equal(parseHexacoParams(EXAMPLE.replace('modesty=4', 'modesty=1')).status, 'valid');
  assert.equal(parseHexacoParams(EXAMPLE.replace('modesty=4', 'modesty=5.000')).status, 'valid');
});

test('parseNormHash defaults to the Czech total sample', () => {
  assert.deepEqual(parseNormHash(''), { sample: 'cz', group: 'total' });
  assert.deepEqual(parseNormHash('#norms=ca-men'), { sample: 'ca', group: 'men' });
  assert.deepEqual(parseNormHash('#norms=xx-yy'), { sample: 'cz', group: 'total' });
});
