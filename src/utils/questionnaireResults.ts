export type ResultScale = 'mean' | 'score' | 'percentile';

export interface Score {
  id: string;
  value: number;
}

export interface LookupPoint {
  score: number;
  value: number;
}

export interface LookupConversion {
  type: 'lookup';
  method: 'exact' | 'step' | 'linear';
  /** Category-specific tables take precedence over the optional shared `default` table. */
  tables: Record<string, LookupPoint[]>;
}

export type ScoreConversion =
  | { type: 'identity' }
  | { type: 'linear'; factor: number; offset: number }
  | LookupConversion;

export interface ScoringRules {
  id: string;
  /** Stable version of the questions/input coding these standards are compatible with. */
  questionnaireVersion?: string;
  input: { scale: ResultScale; minimum: number; maximum: number; parameters?: Record<string, string> };
  output: { scale: ResultScale; minimum: number; maximum: number; precision: number };
  scoreConversion: ScoreConversion;
  percentileConversion?: LookupConversion;
  percentilePrecision?: number;
  /** Synthetic demonstration tables must be clearly identified in respondent reports. */
  percentileStatus?: 'illustrative' | 'reference';
  dominantBy: 'score' | 'percentile';
  preferenceBands: { minimum: number; maximum: number; labelIndex: number }[];
  /** Example URL values are inputs, before conversion. Optional when adding a new version. */
  exampleValues?: Record<string, number>;
  reference?: { cz: string; en: string };
}

export interface ScoringConfig {
  defaultVersion: string;
  versions: Record<string, ScoringRules>;
  legacyVersion?: string;
  /** Compatibility for existing links that predate creation-month metadata. */
  unversionedVersion?: string;
}

export interface CalculatedScore extends Score {
  inputValue: number;
  percentile?: number;
}

export type ParsedResults = (
  | { status: 'empty'; scale: ResultScale; version: string }
  | {
      status: 'invalid';
      scale: ResultScale;
      version: string;
      invalidKeys: string[];
      reason: 'version' | 'questionnaire' | 'created' | 'values' | 'conversion';
    }
  | { status: 'valid'; scale: ResultScale; version: string; scores: CalculatedScore[]; dominantIds: string[] }
) & { created?: string; questionnaireVersion?: string };

export function isScoringMonth(value: string): boolean {
  return /^[1-9]\d{3}-(?:0[1-9]|1[0-2])$/.test(value);
}

export function roundScore(value: number, precision: number): number {
  const factor = 10 ** precision;
  return Math.round((value + Number.EPSILON) * factor) / factor;
}

/** Tables never extrapolate. Between rows, use only the explicitly configured method. */
export function convertScore(value: number, categoryId: string, conversion: ScoreConversion): number | undefined {
  if (conversion.type === 'identity') return value;
  if (conversion.type === 'linear') return value * conversion.factor + conversion.offset;
  const table = conversion.tables[categoryId] ?? conversion.tables.default;
  // Arithmetic conversions can introduce a few floating-point ulps (e.g. 23 * 0.2).
  const exact = table?.find(
    (point) => Math.abs(point.score - value) <= Number.EPSILON * Math.max(1, Math.abs(value), Math.abs(point.score)) * 4
  );
  if (exact) return exact.value;
  if (!table?.length || value < table[0].score || value > table[table.length - 1].score) return undefined;
  if (conversion.method === 'exact') return undefined;
  const upperIndex = table.findIndex((point) => point.score > value);
  const lower = table[upperIndex - 1];
  const upper = table[upperIndex];
  if (conversion.method === 'step') return lower.value;
  return lower.value + ((value - lower.score) / (upper.score - lower.score)) * (upper.value - lower.value);
}

/** Reject bad coding tables at build time, before they can be used for respondent reports. */
export function validateScoringConfig(config: ScoringConfig, categoryIds: string[]): void {
  const fail = (message: string): never => {
    throw new Error(`Invalid scoring configuration: ${message}`);
  };
  if (!categoryIds.length || new Set(categoryIds).size !== categoryIds.length)
    fail('category IDs must be unique and nonempty');
  if (!config.versions[config.defaultVersion]) fail(`missing default version ${config.defaultVersion}`);
  if (config.legacyVersion && !config.versions[config.legacyVersion])
    fail(`missing legacy version ${config.legacyVersion}`);
  if (config.unversionedVersion && !config.versions[config.unversionedVersion])
    fail(`missing compatibility version ${config.unversionedVersion}`);
  const inputFormats = new Map<string, string>();
  for (const [id, rules] of Object.entries(config.versions)) {
    if (id !== rules.id || !/^[a-z0-9][a-z0-9-]*$/.test(id)) fail(`invalid version ID ${id}`);
    if (/^\d/.test(id) && !isScoringMonth(id)) fail(`invalid year-month version ${id}`);
    if (isScoringMonth(id) && (!rules.questionnaireVersion || !isScoringMonth(rules.questionnaireVersion)))
      fail(`${id}: dated standards require a questionnaire version (YYYY-MM)`);
    if (rules.questionnaireVersion) {
      if (!isScoringMonth(id) || !isScoringMonth(rules.questionnaireVersion) || rules.questionnaireVersion > id)
        fail(`${id}: invalid questionnaire version or standards predating the questions`);
      const inputFormat = JSON.stringify([
        rules.input.scale,
        rules.input.minimum,
        rules.input.maximum,
        categoryIds.map((key) => rules.input.parameters?.[key] ?? key),
      ]);
      const previous = inputFormats.get(rules.questionnaireVersion);
      if (previous && previous !== inputFormat)
        fail(`${id}: input format changed; register a new questionnaire version`);
      inputFormats.set(rules.questionnaireVersion, inputFormat);
    }
    if (rules.percentileStatus && !['illustrative', 'reference'].includes(rules.percentileStatus))
      fail(`${id}: invalid percentile status`);
    if (rules.percentileStatus && !rules.percentileConversion) fail(`${id}: percentile status requires tables`);
    for (const range of [rules.input, rules.output]) {
      if (
        !['mean', 'score', 'percentile'].includes(range.scale) ||
        !Number.isFinite(range.minimum) ||
        !Number.isFinite(range.maximum) ||
        range.minimum >= range.maximum
      )
        fail(`${id}: invalid scale or range`);
      if (range.scale === 'percentile' && (range.minimum !== 0 || range.maximum !== 100))
        fail(`${id}: percentile scales must use 0–100`);
    }
    const precision = rules.output.precision;
    if (!Number.isInteger(precision) || precision < 0 || precision > 6)
      fail(`${id}: precision must be an integer from 0 to 6`);
    if (
      rules.percentilePrecision !== undefined &&
      (!Number.isInteger(rules.percentilePrecision) || rules.percentilePrecision < 0 || rules.percentilePrecision > 6)
    )
      fail(`${id}: invalid percentile display precision`);
    const keys = categoryIds.map((key) => rules.input.parameters?.[key] ?? key);
    if (Object.keys(rules.input.parameters ?? {}).some((key) => !categoryIds.includes(key)))
      fail(`${id}: parameter mapping refers to an unknown category`);
    if (
      keys.some((key) => !key || ['scoring', 'questionnaire', 'created', 'example'].includes(key)) ||
      new Set(keys).size !== keys.length
    )
      fail(`${id}: invalid or duplicate parameter names`);
    if (!['score', 'percentile'].includes(rules.dominantBy)) fail(`${id}: invalid dominant metric`);
    if (rules.dominantBy === 'percentile' && !rules.percentileConversion && rules.output.scale !== 'percentile')
      fail(`${id}: percentile ranking needs a percentile calculation`);
    if (!['identity', 'linear', 'lookup'].includes(rules.scoreConversion.type))
      fail(`${id}: unsupported score calculation`);
    if (
      rules.scoreConversion.type === 'linear' &&
      (!Number.isFinite(rules.scoreConversion.factor) || !Number.isFinite(rules.scoreConversion.offset))
    )
      fail(`${id}: invalid linear calculation`);
    if (rules.scoreConversion.type !== 'lookup') {
      for (const endpoint of [rules.input.minimum, rules.input.maximum]) {
        const value = convertScore(endpoint, categoryIds[0], rules.scoreConversion)!;
        if (!Number.isFinite(value) || value < rules.output.minimum || value > rules.output.maximum)
          fail(`${id}: score conversion exceeds the output range`);
      }
    }
    const conversions = [rules.scoreConversion, rules.percentileConversion].filter(
      (conversion): conversion is LookupConversion => conversion?.type === 'lookup'
    );
    if (rules.percentileConversion && rules.percentileConversion.type !== 'lookup')
      fail(`${id}: percentile calculation must use a lookup table`);
    for (const conversion of conversions) {
      if (!['exact', 'step', 'linear'].includes(conversion.method)) fail(`${id}: unsupported table method`);
      if (Object.keys(conversion.tables).some((key) => key !== 'default' && !categoryIds.includes(key)))
        fail(`${id}: table refers to an unknown category`);
      for (const categoryId of categoryIds) {
        const points = conversion.tables[categoryId] ?? conversion.tables.default;
        if (!points?.length) fail(`${id}: missing table for ${categoryId}`);
        let previousScore = -Infinity;
        let previousValue = -Infinity;
        const percentile = conversion === rules.percentileConversion || rules.output.scale === 'percentile';
        for (const point of points) {
          if (!Number.isFinite(point.score) || !Number.isFinite(point.value) || point.score <= previousScore)
            fail(`${id}: table scores must be finite, unique and ascending`);
          const minimum = percentile ? 0 : rules.output.minimum;
          const maximum = percentile ? 100 : rules.output.maximum;
          if (point.value < minimum || point.value > maximum) fail(`${id}: table value outside output range`);
          if (percentile && point.value < previousValue) fail(`${id}: percentile values must be nondecreasing`);
          previousScore = point.score;
          previousValue = point.value;
        }
        const source = conversion === rules.percentileConversion ? rules.output : rules.input;
        if (points[0].score > source.minimum || points[points.length - 1].score < source.maximum)
          fail(`${id}: table does not cover the source range for ${categoryId}`);
      }
    }
    const bands = rules.preferenceBands;
    const unit = 10 ** -precision;
    if (bands.length) {
      if (bands[0].maximum !== rules.output.maximum || bands[bands.length - 1].minimum !== rules.output.minimum)
        fail(`${id}: preference bands must cover the output range`);
      for (let i = 0; i < bands.length; i++) {
        const band = bands[i];
        if (
          !Number.isFinite(band.minimum) ||
          !Number.isFinite(band.maximum) ||
          band.minimum > band.maximum ||
          !Number.isInteger(band.labelIndex) ||
          band.labelIndex < 0
        )
          fail(`${id}: invalid preference band`);
        if (
          Math.abs(roundScore(band.minimum, precision) - band.minimum) > 1e-9 ||
          Math.abs(roundScore(band.maximum, precision) - band.maximum) > 1e-9
        )
          fail(`${id}: band boundaries must match display precision`);
        if (i && Math.abs(bands[i - 1].minimum - unit - band.maximum) > 1e-9)
          fail(`${id}: overlapping preference bands or a gap`);
      }
    }
    for (const [key, value] of Object.entries(rules.exampleValues ?? {})) {
      if (
        !categoryIds.includes(key) ||
        !Number.isFinite(value) ||
        value < rules.input.minimum ||
        value > rules.input.maximum
      )
        fail(`${id}: invalid example value for ${key}`);
    }
  }
}

/** Identify the questions, then always select their newest compatible standards. */
export function parseQuestionnaireResults(search: string, categoryIds: string[], config: ScoringConfig): ParsedResults {
  const params = new URLSearchParams(search);
  const explicitVersions = params.getAll('scoring');
  const questionnaireValues = params.getAll('questionnaire');
  const creationValues = params.getAll('created');
  const created = creationValues[0];
  const invalidVersion = (
    reason: 'created' | 'version' | 'questionnaire',
    version = explicitVersions[0] ?? config.defaultVersion
  ): ParsedResults => ({
    status: 'invalid',
    scale: config.versions[config.defaultVersion].output.scale,
    version,
    invalidKeys: [reason === 'version' ? 'scoring' : reason],
    reason,
  });
  if (creationValues.length > 1 || (created !== undefined && !isScoringMonth(created)))
    return invalidVersion('created');
  if (explicitVersions.length > 1 || (explicitVersions.length && !config.versions[explicitVersions[0]]))
    return invalidVersion('version');
  const questionnaireVersions = [
    ...new Set(
      Object.values(config.versions)
        .map((rules) => rules.questionnaireVersion)
        .filter((id): id is string => Boolean(id))
    ),
  ].sort();
  let questionnaireVersion: string | undefined;
  if (questionnaireValues.length) {
    if (questionnaireValues.length !== 1 || !questionnaireVersions.includes(questionnaireValues[0]))
      return invalidVersion('questionnaire');
    questionnaireVersion = questionnaireValues[0];
    if (created === undefined || created < questionnaireVersion) return invalidVersion('created');
  } else if (created !== undefined) {
    // Compatibility for links sent before the backend included the stable question version.
    questionnaireVersion = questionnaireVersions.filter((id) => id <= created).at(-1);
    if (!questionnaireVersion) return invalidVersion('created');
  }
  const latestStandards =
    questionnaireVersion === undefined
      ? undefined
      : Object.values(config.versions)
          .filter((rules) => rules.questionnaireVersion === questionnaireVersion)
          .sort((a, b) => a.id.localeCompare(b.id))
          .at(-1)?.id;
  // Previously copied scoring IDs are accepted within this question version, but cannot freeze its norms.
  if (
    questionnaireVersion &&
    explicitVersions.length &&
    config.versions[explicitVersions[0]].questionnaireVersion !== questionnaireVersion
  )
    return invalidVersion('version');
  const compatibilityRules = config.versions[config.unversionedVersion ?? config.defaultVersion];
  const hasDefault = categoryIds.some((id) => params.has(compatibilityRules.input.parameters?.[id] ?? id));
  const legacyRules = config.legacyVersion ? config.versions[config.legacyVersion] : undefined;
  const hasLegacy = legacyRules && categoryIds.some((id) => params.has(legacyRules.input.parameters?.[id] ?? id));
  const version =
    latestStandards ??
    explicitVersions[0] ??
    (!hasDefault && hasLegacy
      ? config.legacyVersion!
      : hasDefault
        ? (config.unversionedVersion ?? config.defaultVersion)
        : config.defaultVersion);
  const rules = config.versions[version];
  if (!rules) return invalidVersion('version', version);
  const scale = rules.output.scale;
  const keys = categoryIds.map((id) => rules.input.parameters?.[id] ?? id);
  if (!keys.some((key) => params.has(key))) return { status: 'empty', scale, version };
  if (isScoringMonth(version) && created === undefined) return invalidVersion('created', version);

  const invalidKeys: string[] = [];
  const inputs = categoryIds.map((id, i) => {
    const key = keys[i];
    const values = params.getAll(key);
    const raw = values[0]?.trim() ?? '';
    const value = Number(raw.replace(',', '.'));
    if (
      values.length !== 1 ||
      !/^-?\d+(?:[.,]\d+)?$/.test(raw) ||
      !Number.isFinite(value) ||
      value < rules.input.minimum ||
      value > rules.input.maximum
    )
      invalidKeys.push(key);
    return { id, value };
  });
  if (invalidKeys.length) return { status: 'invalid', scale, version, invalidKeys, reason: 'values' };

  const scores: CalculatedScore[] = [];
  for (const { id, value: inputValue } of inputs) {
    const value = convertScore(inputValue, id, rules.scoreConversion);
    const percentile =
      value === undefined || !rules.percentileConversion
        ? undefined
        : convertScore(value, id, rules.percentileConversion);
    if (
      value === undefined ||
      !Number.isFinite(value) ||
      value < rules.output.minimum ||
      value > rules.output.maximum ||
      (rules.percentileConversion &&
        (percentile === undefined || !Number.isFinite(percentile) || percentile < 0 || percentile > 100))
    ) {
      invalidKeys.push(keys[categoryIds.indexOf(id)]);
    } else {
      scores.push({ id, inputValue, value, ...(percentile === undefined ? {} : { percentile }) });
    }
  }
  if (invalidKeys.length) return { status: 'invalid', scale, version, invalidKeys, reason: 'conversion' };
  const rankValue = (score: CalculatedScore) =>
    rules.dominantBy === 'percentile' ? (score.percentile ?? score.value) : score.value;
  scores.sort((a, b) => rankValue(b) - rankValue(a));
  return {
    status: 'valid',
    scale,
    version,
    ...(created === undefined ? {} : { created }),
    ...(questionnaireVersion === undefined ? {} : { questionnaireVersion }),
    scores,
    dominantIds: scores.filter((score) => rankValue(score) === rankValue(scores[0])).map(({ id }) => id),
  };
}

/** Respondents see the percentile as their score whenever the standards provide one. */
export function reportedScore(score: CalculatedScore): number {
  return score.percentile ?? score.value;
}

export function getPreferenceBand(value: number, rules: ScoringRules): number | undefined {
  const rounded = roundScore(value, rules.output.precision);
  return rules.preferenceBands.find((band) => rounded >= band.minimum && rounded <= band.maximum)?.labelIndex;
}

/** Preserve original inputs and question identity; standards are selected again whenever the link is opened. */
export function createResultSearch(scores: (Score | CalculatedScore)[], rules: ScoringRules, created?: string): string {
  const params = new URLSearchParams(
    scores.map((score) => [
      rules.input.parameters?.[score.id] ?? score.id,
      String('inputValue' in score ? score.inputValue : score.value),
    ])
  );
  if (rules.questionnaireVersion) {
    const month = created ?? rules.questionnaireVersion;
    if (!isScoringMonth(month) || month < rules.questionnaireVersion)
      throw new Error('Result links require a valid creation month at or after the questionnaire version');
    params.set('questionnaire', rules.questionnaireVersion);
    params.set('created', month);
  } else {
    if (created !== undefined || isScoringMonth(rules.id))
      throw new Error('Dated result links require a stable questionnaire version');
    // Historical links have no known question identity and retain their original interpretation.
    params.set('scoring', rules.id);
  }
  return params.toString();
}
