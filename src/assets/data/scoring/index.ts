import questionnaires from './questionnaires.json';
import { validateScoringConfig, type ScoringConfig, type ScoringRules } from '../../../utils/questionnaireResults';

// Dated rules are scoped by questionnaire; the same month can have four independent tables.
const ruleFiles = import.meta.glob<{ default: ScoringRules }>('./rules/**/*.json', { eager: true });

export function getScoringConfig(typology: keyof typeof questionnaires, categoryIds: string[]): ScoringConfig {
  const definition = questionnaires[typology];
  const config: ScoringConfig = {
    defaultVersion: definition.defaultVersion,
    unversionedVersion: definition.unversionedVersion,
    ...('legacyVersion' in definition ? { legacyVersion: definition.legacyVersion } : {}),
    versions: Object.fromEntries(
      definition.versions.map((id) => {
        const dated = /^\d{4}-\d{2}$/.test(id);
        const path = dated ? `./rules/${typology}/${id}.json` : `./rules/${id}.json`;
        const rules = ruleFiles[path]?.default;
        if (!rules || rules.id !== id) throw new Error(`Missing or mismatched scoring version ${id} for ${typology}`);
        return [id, rules];
      })
    ),
  };
  validateScoringConfig(config, categoryIds);
  return config;
}
