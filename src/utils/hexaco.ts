/**
 * HEXACO-PI-R (100 items, self-report) result scoring.
 *
 * PsychoTRON sends raw scale means (1–5); this module validates them and converts them to
 * percentiles against published norms. Everything runs in the browser; nothing is sent anywhere.
 *
 * Kept free of imports so it can be unit-tested directly with `node --test`.
 */

export const HEXACO_DOMAINS = [
  { id: 'honesty-humility', facets: ['sincerity', 'fairness', 'greed-avoidance', 'modesty'] },
  { id: 'emotionality', facets: ['fearfulness', 'anxiety', 'dependence', 'sentimentality'] },
  { id: 'extraversion', facets: ['social-self-esteem', 'social-boldness', 'sociability', 'liveliness'] },
  { id: 'agreeableness', facets: ['forgivingness', 'gentleness', 'flexibility', 'patience'] },
  { id: 'conscientiousness', facets: ['organization', 'diligence', 'perfectionism', 'prudence'] },
  { id: 'openness', facets: ['aesthetic-appreciation', 'inquisitiveness', 'creativity', 'unconventionality'] },
] as const;

/** Interstitial scale that belongs to no single domain. */
export const HEXACO_INTERSTITIAL = 'altruism';

export const HEXACO_SCALES: string[] = [
  ...HEXACO_DOMAINS.flatMap((domain) => [domain.id, ...domain.facets]),
  HEXACO_INTERSTITIAL,
];

export type NormGroup = 'total' | 'women' | 'men';
export const NORM_GROUPS: NormGroup[] = ['total', 'women', 'men'];
type MS = { m: number; sd: number };
export type ScaleNorms = Record<NormGroup, MS>;

/**
 * Source: hexaco.org, "Descriptive Statistics and Internal-Consistency Reliabilities of the HEXACO-100
 * Scales in a College Student Sample" (descriptives_100.pdf), self-report form. Canadian undergraduates,
 * English version. N = 1126 (women 691, men 429). Item means and SDs on the 1–5 scale.
 */
// prettier-ignore
export const HEXACO_100_NORMS: Record<string, { alpha: number } & ScaleNorms> = {
  'honesty-humility':      { alpha: 0.83, total: { m: 3.19, sd: 0.62 }, women: { m: 3.27, sd: 0.59 }, men: { m: 3.05, sd: 0.65 } },
  sincerity:               { alpha: 0.65, total: { m: 3.20, sd: 0.78 }, women: { m: 3.18, sd: 0.77 }, men: { m: 3.22, sd: 0.78 } },
  fairness:                { alpha: 0.76, total: { m: 3.34, sd: 0.98 }, women: { m: 3.52, sd: 0.89 }, men: { m: 3.04, sd: 1.05 } },
  'greed-avoidance':       { alpha: 0.84, total: { m: 2.72, sd: 0.98 }, women: { m: 2.77, sd: 0.94 }, men: { m: 2.64, sd: 1.03 } },
  modesty:                 { alpha: 0.69, total: { m: 3.49, sd: 0.78 }, women: { m: 3.60, sd: 0.73 }, men: { m: 3.31, sd: 0.82 } },
  emotionality:            { alpha: 0.84, total: { m: 3.43, sd: 0.62 }, women: { m: 3.69, sd: 0.48 }, men: { m: 3.01, sd: 0.59 } },
  fearfulness:             { alpha: 0.73, total: { m: 3.06, sd: 0.89 }, women: { m: 3.35, sd: 0.82 }, men: { m: 2.59, sd: 0.81 } },
  anxiety:                 { alpha: 0.68, total: { m: 3.69, sd: 0.81 }, women: { m: 3.92, sd: 0.67 }, men: { m: 3.33, sd: 0.88 } },
  dependence:              { alpha: 0.79, total: { m: 3.38, sd: 0.87 }, women: { m: 3.63, sd: 0.79 }, men: { m: 2.96, sd: 0.84 } },
  sentimentality:          { alpha: 0.71, total: { m: 3.58, sd: 0.80 }, women: { m: 3.85, sd: 0.68 }, men: { m: 3.13, sd: 0.78 } },
  extraversion:            { alpha: 0.85, total: { m: 3.50, sd: 0.57 }, women: { m: 3.48, sd: 0.59 }, men: { m: 3.52, sd: 0.54 } },
  'social-self-esteem':    { alpha: 0.68, total: { m: 3.85, sd: 0.68 }, women: { m: 3.82, sd: 0.68 }, men: { m: 3.90, sd: 0.66 } },
  'social-boldness':       { alpha: 0.74, total: { m: 3.03, sd: 0.87 }, women: { m: 2.97, sd: 0.90 }, men: { m: 3.14, sd: 0.79 } },
  sociability:             { alpha: 0.69, total: { m: 3.59, sd: 0.75 }, women: { m: 3.62, sd: 0.73 }, men: { m: 3.54, sd: 0.77 } },
  liveliness:              { alpha: 0.77, total: { m: 3.52, sd: 0.77 }, women: { m: 3.51, sd: 0.77 }, men: { m: 3.53, sd: 0.78 } },
  agreeableness:           { alpha: 0.84, total: { m: 2.94, sd: 0.58 }, women: { m: 2.89, sd: 0.55 }, men: { m: 3.01, sd: 0.63 } },
  forgivingness:           { alpha: 0.75, total: { m: 2.75, sd: 0.83 }, women: { m: 2.69, sd: 0.80 }, men: { m: 2.83, sd: 0.88 } },
  gentleness:              { alpha: 0.66, total: { m: 3.17, sd: 0.73 }, women: { m: 3.14, sd: 0.69 }, men: { m: 3.23, sd: 0.78 } },
  flexibility:             { alpha: 0.59, total: { m: 2.74, sd: 0.72 }, women: { m: 2.71, sd: 0.70 }, men: { m: 2.79, sd: 0.77 } },
  patience:                { alpha: 0.77, total: { m: 3.11, sd: 0.86 }, women: { m: 3.04, sd: 0.81 }, men: { m: 3.20, sd: 0.93 } },
  conscientiousness:       { alpha: 0.82, total: { m: 3.44, sd: 0.56 }, women: { m: 3.49, sd: 0.53 }, men: { m: 3.34, sd: 0.59 } },
  organization:            { alpha: 0.72, total: { m: 3.26, sd: 0.91 }, women: { m: 3.33, sd: 0.90 }, men: { m: 3.15, sd: 0.91 } },
  diligence:               { alpha: 0.67, total: { m: 3.79, sd: 0.68 }, women: { m: 3.84, sd: 0.67 }, men: { m: 3.70, sd: 0.69 } },
  perfectionism:           { alpha: 0.68, total: { m: 3.50, sd: 0.78 }, women: { m: 3.59, sd: 0.75 }, men: { m: 3.36, sd: 0.80 } },
  prudence:                { alpha: 0.69, total: { m: 3.18, sd: 0.75 }, women: { m: 3.21, sd: 0.70 }, men: { m: 3.14, sd: 0.81 } },
  openness:                { alpha: 0.81, total: { m: 3.41, sd: 0.60 }, women: { m: 3.42, sd: 0.58 }, men: { m: 3.38, sd: 0.63 } },
  'aesthetic-appreciation':{ alpha: 0.65, total: { m: 3.34, sd: 0.88 }, women: { m: 3.50, sd: 0.82 }, men: { m: 3.10, sd: 0.92 } },
  inquisitiveness:         { alpha: 0.63, total: { m: 3.19, sd: 0.88 }, women: { m: 3.10, sd: 0.84 }, men: { m: 3.34, sd: 0.91 } },
  creativity:              { alpha: 0.74, total: { m: 3.63, sd: 0.85 }, women: { m: 3.66, sd: 0.85 }, men: { m: 3.59, sd: 0.85 } },
  unconventionality:       { alpha: 0.50, total: { m: 3.46, sd: 0.64 }, women: { m: 3.43, sd: 0.62 }, men: { m: 3.50, sd: 0.66 } },
  altruism:                { alpha: 0.62, total: { m: 3.90, sd: 0.67 }, women: { m: 4.06, sd: 0.60 }, men: { m: 3.63, sd: 0.69 } },
};

/**
 * Czech norms for the HEXACO-100 self-report form (item means and SDs on the 1–5 scale).
 * The source table has no Altruism row; Altruism falls back to HEXACO_100_NORMS (see `normFor`).
 */
// prettier-ignore
export const HEXACO_100_NORMS_CZ: Record<string, ScaleNorms> = {
  'honesty-humility':      { total: { m: 3.40, sd: 0.58 }, women: { m: 3.45, sd: 0.55 }, men: { m: 3.26, sd: 0.63 } },
  sincerity:               { total: { m: 3.42, sd: 0.73 }, women: { m: 3.45, sd: 0.71 }, men: { m: 3.35, sd: 0.78 } },
  fairness:                { total: { m: 3.45, sd: 0.89 }, women: { m: 3.54, sd: 0.85 }, men: { m: 3.24, sd: 0.94 } },
  'greed-avoidance':       { total: { m: 3.27, sd: 0.89 }, women: { m: 3.31, sd: 0.87 }, men: { m: 3.18, sd: 0.96 } },
  modesty:                 { total: { m: 3.43, sd: 0.71 }, women: { m: 3.49, sd: 0.69 }, men: { m: 3.29, sd: 0.74 } },
  emotionality:            { total: { m: 3.25, sd: 0.56 }, women: { m: 3.39, sd: 0.51 }, men: { m: 2.91, sd: 0.53 } },
  fearfulness:             { total: { m: 2.95, sd: 0.71 }, women: { m: 3.09, sd: 0.66 }, men: { m: 2.61, sd: 0.71 } },
  anxiety:                 { total: { m: 3.49, sd: 0.74 }, women: { m: 3.58, sd: 0.70 }, men: { m: 3.26, sd: 0.79 } },
  dependence:              { total: { m: 3.20, sd: 0.90 }, women: { m: 3.37, sd: 0.86 }, men: { m: 2.78, sd: 0.86 } },
  sentimentality:          { total: { m: 3.35, sd: 0.75 }, women: { m: 3.51, sd: 0.71 }, men: { m: 2.98, sd: 0.70 } },
  extraversion:            { total: { m: 3.20, sd: 0.64 }, women: { m: 3.21, sd: 0.62 }, men: { m: 3.18, sd: 0.67 } },
  'social-self-esteem':    { total: { m: 3.46, sd: 0.72 }, women: { m: 3.46, sd: 0.72 }, men: { m: 3.47, sd: 0.72 } },
  'social-boldness':       { total: { m: 2.82, sd: 0.88 }, women: { m: 2.81, sd: 0.88 }, men: { m: 2.86, sd: 0.87 } },
  sociability:             { total: { m: 3.27, sd: 0.82 }, women: { m: 3.32, sd: 0.78 }, men: { m: 3.14, sd: 0.89 } },
  liveliness:              { total: { m: 3.26, sd: 0.85 }, women: { m: 3.27, sd: 0.83 }, men: { m: 3.26, sd: 0.90 } },
  agreeableness:           { total: { m: 2.84, sd: 0.53 }, women: { m: 2.79, sd: 0.53 }, men: { m: 2.96, sd: 0.50 } },
  forgivingness:           { total: { m: 2.55, sd: 0.72 }, women: { m: 2.53, sd: 0.72 }, men: { m: 2.62, sd: 0.70 } },
  gentleness:              { total: { m: 3.10, sd: 0.70 }, women: { m: 3.07, sd: 0.70 }, men: { m: 3.18, sd: 0.70 } },
  flexibility:             { total: { m: 2.75, sd: 0.65 }, women: { m: 2.71, sd: 0.64 }, men: { m: 2.84, sd: 0.66 } },
  patience:                { total: { m: 2.94, sd: 0.79 }, women: { m: 2.84, sd: 0.77 }, men: { m: 3.20, sd: 0.78 } },
  conscientiousness:       { total: { m: 3.45, sd: 0.53 }, women: { m: 3.46, sd: 0.52 }, men: { m: 3.44, sd: 0.54 } },
  organization:            { total: { m: 3.36, sd: 0.84 }, women: { m: 3.41, sd: 0.83 }, men: { m: 3.24, sd: 0.85 } },
  diligence:               { total: { m: 3.71, sd: 0.68 }, women: { m: 3.71, sd: 0.66 }, men: { m: 3.71, sd: 0.72 } },
  perfectionism:           { total: { m: 3.50, sd: 0.73 }, women: { m: 3.53, sd: 0.71 }, men: { m: 3.44, sd: 0.77 } },
  prudence:                { total: { m: 3.23, sd: 0.69 }, women: { m: 3.18, sd: 0.68 }, men: { m: 3.36, sd: 0.69 } },
  openness:                { total: { m: 3.39, sd: 0.52 }, women: { m: 3.37, sd: 0.53 }, men: { m: 3.44, sd: 0.51 } },
  'aesthetic-appreciation':{ total: { m: 3.49, sd: 0.78 }, women: { m: 3.57, sd: 0.75 }, men: { m: 3.29, sd: 0.80 } },
  inquisitiveness:         { total: { m: 3.43, sd: 0.79 }, women: { m: 3.31, sd: 0.78 }, men: { m: 3.71, sd: 0.76 } },
  creativity:              { total: { m: 3.41, sd: 0.75 }, women: { m: 3.43, sd: 0.75 }, men: { m: 3.36, sd: 0.73 } },
  unconventionality:       { total: { m: 3.23, sd: 0.61 }, women: { m: 3.17, sd: 0.61 }, men: { m: 3.39, sd: 0.60 } },
};

export type NormSample = 'cz' | 'ca';
export const NORM_SAMPLES: NormSample[] = ['cz', 'ca'];
export const DEFAULT_NORMS: { sample: NormSample; group: NormGroup } = { sample: 'cz', group: 'total' };

/** Norms for one scale; `fallback` is true when the Czech table lacks the scale and Canadian norms are used. */
export function normFor(scale: string, sample: NormSample, group: NormGroup): MS & { fallback: boolean } {
  const czech = sample === 'cz' ? HEXACO_100_NORMS_CZ[scale] : undefined;
  const norms = czech ?? HEXACO_100_NORMS[scale];
  if (!norms) throw new Error(`No HEXACO norms for ${scale}`);
  return { ...norms[group], fallback: sample === 'cz' && !czech };
}

/** Standard normal CDF via the Abramowitz–Stegun 7.1.26 erf approximation (|error| < 1.5e-7). */
export function normalCdf(z: number): number {
  const x = Math.abs(z) / Math.SQRT2;
  const t = 1 / (1 + 0.3275911 * x);
  const poly = ((((1.061405429 * t - 1.453152027) * t + 1.421413741) * t - 0.284496736) * t + 0.254829592) * t;
  const erf = 1 - poly * Math.exp(-x * x);
  return z >= 0 ? (1 + erf) / 2 : (1 - erf) / 2;
}

export function toPercentile(score: number, norm: MS): { z: number; percentile: number } {
  const z = (score - norm.m) / norm.sd;
  // Report 1–99 so extreme answers never read as 0 or 100.
  const percentile = Math.min(99, Math.max(1, Math.round(normalCdf(z) * 100)));
  return { z, percentile };
}

export type Band = 'low' | 'below' | 'average' | 'above' | 'high';
export const BANDS: Band[] = ['low', 'below', 'average', 'above', 'high'];

/** Bands follow z = ±0.5 and ±1. */
export function bandFor(p: number): Band {
  if (p < 16) return 'low';
  if (p < 31) return 'below';
  if (p < 70) return 'average';
  if (p < 85) return 'above';
  return 'high';
}

export type HexacoParseResult =
  | { status: 'empty' }
  | { status: 'invalid'; invalidKeys: string[] }
  | { status: 'valid'; scores: Record<string, number>; questionnaire?: string; created?: string };

const MONTH = /^[1-9]\d{3}-(?:0[1-9]|1[0-2])$/;
const DECIMAL = /^\d+(?:[.,]\d+)?$/;

/** All 31 scales must be present exactly once, numeric and within 1–5; otherwise nothing is shown. */
export function parseHexacoParams(search: string): HexacoParseResult {
  const params = new URLSearchParams(search);
  if (!HEXACO_SCALES.some((key) => params.has(key))) return { status: 'empty' };
  const invalidKeys: string[] = [];
  const scores: Record<string, number> = {};
  for (const key of HEXACO_SCALES) {
    const values = params.getAll(key);
    const raw = values[0]?.trim() ?? '';
    const value = Number(raw.replace(',', '.'));
    if (values.length !== 1 || !DECIMAL.test(raw) || !Number.isFinite(value) || value < 1 || value > 5)
      invalidKeys.push(key);
    else scores[key] = value;
  }
  const created = params.getAll('created');
  if (created.length > 1 || (created.length === 1 && !MONTH.test(created[0]))) invalidKeys.push('created');
  if (invalidKeys.length) return { status: 'invalid', invalidKeys };
  // `questionnaire` is the revision string; any value is accepted and only displayed.
  const questionnaire = params.get('questionnaire')?.trim() || undefined;
  return { status: 'valid', scores, questionnaire, created: created[0] };
}

export function parseNormHash(hash: string): { sample: NormSample; group: NormGroup } {
  const value = new URLSearchParams(hash.replace(/^#/, '')).get('norms') ?? '';
  const [sample, group] = value.split('-') as [NormSample, NormGroup];
  return {
    sample: NORM_SAMPLES.includes(sample) ? sample : DEFAULT_NORMS.sample,
    group: NORM_GROUPS.includes(group) ? group : DEFAULT_NORMS.group,
  };
}
