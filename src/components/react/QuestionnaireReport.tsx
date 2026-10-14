import { useEffect, useRef, useState, type CSSProperties } from 'react';
import ProfileRadar, { profileColors, reportedFraction } from './ProfileRadar';
import type { ReportConfig } from '../../assets/data/reports';
import {
  createResultSearch,
  getPreferenceBand,
  parseQuestionnaireResults,
  reportedScore,
  roundScore,
  type CalculatedScore,
  type ParsedResults,
} from '../../utils/questionnaireResults';

export interface LegacyTypes {
  [id: string]: { subtypes: { [id: string]: { name: string; description: string } } };
}

export default function QuestionnaireReport({
  config,
  legacyTypes,
}: {
  config: ReportConfig;
  legacyTypes?: LegacyTypes;
}) {
  const [results, setResults] = useState<ParsedResults | null>(null);
  const [resultUrl, setResultUrl] = useState('');
  const [isExample, setIsExample] = useState(false);
  const [copyStatus, setCopyStatus] = useState('');
  const reportRef = useRef<HTMLDivElement>(null);
  const cz = config.locale === 'cz';
  const rules =
    config.scoring.versions[results?.version ?? config.scoring.defaultVersion] ??
    config.scoring.versions[config.scoring.defaultVersion];
  const format = (value: number, precision = rules.output.precision) =>
    value.toLocaleString(cz ? 'cs-CZ' : 'en-US', {
      minimumFractionDigits: precision,
      maximumFractionDigits: precision,
    });
  const percentilesProvided = rules.output.scale === 'percentile';
  const hasPercentileTable = Boolean(rules.percentileConversion);
  // Whenever norms exist, the percentile is the respondent-facing "score"; the raw result is secondary.
  const percentileScores = hasPercentileTable || percentilesProvided;
  const illustrativePercentiles = rules.percentileStatus === 'illustrative';
  const scorePrecision = hasPercentileTable ? (rules.percentilePrecision ?? 0) : rules.output.precision;
  const scoreLabel = (score: CalculatedScore) =>
    percentileScores
      ? format(reportedScore(score), scorePrecision)
      : `${format(score.value)} / ${format(rules.output.maximum)}`;
  const rawLabel =
    rules.output.scale === 'mean' ? (cz ? 'Průměr odpovědí' : 'Average answer') : cz ? 'Hrubé skóre' : 'Raw score';
  const formatBound = (value: number) => format(value, Number.isInteger(value) ? 0 : rules.output.precision);
  const rawRange = `${formatBound(rules.output.minimum)}–${formatBound(rules.output.maximum)}`;
  const decimals = (precision: number) =>
    cz
      ? precision === 0
        ? 'celá čísla'
        : `${precision} ${precision === 1 ? 'desetinné místo' : precision < 5 ? 'desetinná místa' : 'desetinných míst'}`
      : precision === 0
        ? 'whole numbers'
        : `${precision} decimal place${precision === 1 ? '' : 's'}`;
  const scaleHelp = percentileScores
    ? cz
      ? 'Skóre je na škále 0 až 100; co přesně znamená, vysvětlujeme níže.'
      : 'Scores range from 0 to 100; their meaning is explained below.'
    : `${cz ? 'Škála skóre' : 'Score range'}: ${format(rules.output.minimum)} – ${format(rules.output.maximum)}.`;
  const profileFor = (id: string) => config.profiles.find((profile) => profile.id === id)!;
  const exampleRules = config.scoring.versions[config.scoring.defaultVersion];
  const exampleUrl = `?${createResultSearch(
    config.profiles.map((profile, i) => ({
      id: profile.id,
      value:
        exampleRules.exampleValues?.[profile.id] ??
        roundScore(
          exampleRules.input.maximum -
            (i / config.profiles.length) * (exampleRules.input.maximum - exampleRules.input.minimum),
          2
        ),
    })),
    exampleRules
  )}&example=1`;
  const typologyUrl = `${cz ? '' : '/en'}/typologie/${config.typology}`;

  useEffect(() => {
    const parsed = parseQuestionnaireResults(
      window.location.search,
      config.profiles.map(({ id }) => id),
      config.scoring
    );
    setResults(parsed);
    const url = new URL(window.location.href);
    if (parsed.status === 'valid') {
      if (parsed.questionnaireVersion) {
        url.searchParams.set('questionnaire', parsed.questionnaireVersion);
        url.searchParams.delete('scoring');
      } else {
        url.searchParams.set('scoring', parsed.version);
      }
      window.history.replaceState(null, '', url);
      document.querySelectorAll<HTMLAnchorElement>('[data-language-link]').forEach((link) => {
        const languageUrl = new URL(link.href);
        languageUrl.search = url.search;
        link.href = languageUrl.href;
      });
    }
    setResultUrl(url.href);
    setIsExample(new URLSearchParams(window.location.search).get('example') === '1');
  }, [config]);

  useEffect(() => {
    const element = reportRef.current;
    if (
      !element ||
      !('IntersectionObserver' in window) ||
      window.matchMedia('(prefers-reduced-motion: reduce)').matches
    )
      return;
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.setAttribute('data-visible', '');
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.08 }
    );
    element.querySelectorAll('[data-reveal]').forEach((panel) => observer.observe(panel));
    element.classList.add('report-motion-ready');
    return () => {
      observer.disconnect();
      element.classList.remove('report-motion-ready');
    };
  }, [results]);

  async function copyLink() {
    try {
      await navigator.clipboard.writeText(resultUrl);
      setCopyStatus(cz ? 'Odkaz zkopírován.' : 'Link copied.');
    } catch {
      setCopyStatus(cz ? 'Odkaz můžeš zkopírovat z pole níže.' : 'You can copy the link from the field below.');
    }
  }

  if (!results) return <p role="status">{cz ? 'Načítání výsledků…' : 'Loading results…'}</p>;

  if (results.status !== 'valid') {
    const invalid = results.status === 'invalid';
    return (
      <section className="report-panel report-empty" aria-labelledby="result-state-title">
        <p className="eyebrow">{cz ? 'Výsledky dotazníku' : 'Questionnaire results'}</p>
        <h2 id="result-state-title">
          {invalid
            ? cz
              ? 'Odkaz obsahuje neúplné nebo neplatné výsledky'
              : 'The result link is incomplete or invalid'
            : cz
              ? 'Tvůj profil čeká na výsledky'
              : 'Your profile is waiting for your results'}
        </h2>
        <p>
          {invalid
            ? cz
              ? 'Pro zobrazení profilu potřebujeme platné skóre pro každou kategorii. Zkus znovu otevřít celý odkaz, který jsi získal/a po vyplnění dotazníku.'
              : 'Your profile needs a valid score for every category. Try opening the complete link you received after finishing the questionnaire again.'
            : cz
              ? 'Po dokončení dotazníku otevři svůj osobní odkaz na výsledky. Zobrazí se tady tvůj dominantní profil i přehled všech skóre.'
              : 'After completing the questionnaire, open your personal result link. Your dominant profile and all your scores will appear here.'}
        </p>
        {invalid && (
          <p role="status">
            {results.reason === 'questionnaire'
              ? cz
                ? 'Verze otázek v odkazu je neznámá nebo opakovaná. Otevři původní odkaz z dotazníku.'
                : 'The questionnaire version is unknown or repeated. Open the original questionnaire link.'
              : results.reason === 'created'
                ? cz
                  ? 'Chybí platný měsíc vytvoření dotazníku (created=RRRR-MM), nebo neodpovídá dostupné verzi otázek. Otevři původní odkaz z dotazníku.'
                  : 'The questionnaire creation month (created=YYYY-MM) is missing, invalid, or does not match an available questionnaire version. Open the original questionnaire link.'
                : results.reason === 'version'
                  ? cz
                    ? 'Verze výpočtu je neznámá, opakovaná nebo patří k jiné verzi otázek. Otevři původní odkaz z dotazníku.'
                    : 'The calculation version is unknown, repeated, or belongs to a different questionnaire version. Open the original questionnaire link.'
                  : results.reason === 'conversion'
                    ? cz
                      ? 'Pro některé hodnoty nebyl v použité převodní tabulce nalezen odpovídající výsledek.'
                      : 'Some values have no corresponding result in the selected conversion table.'
                    : `${cz ? 'Chybějící nebo neplatné hodnoty' : 'Missing or invalid values'}: ${results.invalidKeys.join(', ')}. ${cz ? 'Povolený rozsah' : 'Expected range'}: ${rules.input.minimum} – ${rules.input.maximum}.`}
          </p>
        )}
        <div className="report-actions">
          <a className="btn btn-primary" href={exampleUrl}>
            {cz ? 'Prohlédnout ukázku výsledků' : 'View example results'}
          </a>
          <a className="btn" href={typologyUrl}>
            {cz ? 'O typologii' : 'About this typology'}
          </a>
        </div>
      </section>
    );
  }

  const legacy = results.version === config.scoring.legacyVersion;
  const tied = results.dominantIds.length > 1;
  const subtypes =
    legacy && !tied && legacyTypes
      ? results.scores
          .slice(1)
          .filter((score) => score.value === results.scores[1].value)
          .map(({ id }) => legacyTypes[results.dominantIds[0]].subtypes[id])
      : [];

  return (
    <div className="report-content" ref={reportRef}>
      <dl className="report-calculation-meta" aria-label={cz ? 'Použitý výpočet' : 'Calculation used'}>
        <div>
          <dt>{cz ? 'Verze norem a výpočtu' : 'Standards and calculation version'}</dt>
          <dd>
            {config.typology.toUpperCase()} · {results.version}
          </dd>
        </div>
        {results.questionnaireVersion && (
          <div>
            <dt>{cz ? 'Verze otázek' : 'Questionnaire version'}</dt>
            <dd>{results.questionnaireVersion}</dd>
          </div>
        )}
        <div>
          <dt>{cz ? 'Dotazník vytvořen' : 'Questionnaire created'}</dt>
          <dd>{results.created ?? (cz ? 'Neuvedeno v původním odkazu' : 'Not supplied in the original link')}</dd>
        </div>
      </dl>
      {results.questionnaireVersion && (
        <p className="report-keywords">
          {cz
            ? 'Používáme nejnovější normy pro tuto verzi otázek. Po aktualizaci norem se výsledky mohou změnit i při otevření stejného odkazu.'
            : 'These results use the latest standards for this questionnaire version. Updated standards may change the results when you reopen the same link.'}
        </p>
      )}
      {illustrativePercentiles && (
        <p className="report-notice" role="note">
          {cz
            ? 'Skóre jsou zatím pouze ukázková. Používáme dočasné převodní tabulky bez výzkumných dat; tyto hodnoty proto zatím nevyjadřují skutečné srovnání s ostatními hráči.'
            : 'Scores are currently illustrative. The temporary conversion tables use no research data, so these values do not yet represent a real comparison with other players.'}
        </p>
      )}
      {!hasPercentileTable && !percentilesProvided && (
        <p className="report-notice">
          {cz
            ? 'Pro tuto verzi nejsou dostupné percentilové tabulky.'
            : 'Percentile tables are unavailable for this version.'}
        </p>
      )}
      {isExample && (
        <p className="report-notice" role="note">
          {cz
            ? 'Ukázka výsledků — tato čísla slouží jako příklad a nejsou tvým osobním výsledkem.'
            : 'Example results — these scores are illustrative and are not your personal results.'}
        </p>
      )}
      {legacy && (
        <p className="report-notice">
          {cz
            ? 'Tento odkaz obsahuje percentily z původního Bartlova dotazníku (0–100). Zobrazujeme hodnoty dodané v odkazu.'
            : 'This link contains percentiles from the original Bartle questionnaire (0–100). The values shown were supplied in the link.'}
        </p>
      )}

      <nav className="report-jump-nav" aria-label={cz ? 'Sekce výsledků' : 'Result sections'}>
        <a href="#dominant-title">
          <span aria-hidden="true">01</span> {cz ? 'Tvůj profil' : 'Your profile'}
        </a>
        <a href="#overview-title">
          <span aria-hidden="true">02</span> {cz ? 'Tvoje skóre' : 'Your scores'}
        </a>
        <a href="#guide-title">
          <span aria-hidden="true">03</span> {cz ? 'Jak číst výsledky' : 'Read your results'}
        </a>
      </nav>

      <section className="report-section" aria-labelledby="dominant-title">
        <div className="report-section-heading">
          <span className="report-section-index" aria-hidden="true">
            01
          </span>
          <h2 id="dominant-title">{config.dominantTitle}</h2>
          <span className="report-heading-line" aria-hidden="true" />
        </div>
        {tied && (
          <p className="report-notice">
            {cz
              ? 'Ve více kategoriích máš stejné nejvyšší skóre. Tvůj profil proto popisují všechny následující oblasti.'
              : 'Several categories share your highest score. All the following areas therefore describe your profile.'}
          </p>
        )}
        <div className="report-dominant-list">
          {results.dominantIds.map((id) => {
            const profile = profileFor(id);
            const score = results.scores.find((score) => score.id === id)!;
            return (
              <article className="report-panel report-dominant" key={id} data-reveal>
                <div className="report-dominant-body">
                  <p className="eyebrow">{cz ? 'Tvůj profil' : 'Your profile'}</p>
                  <h3>{profile.name}</h3>
                  <div className="report-score-badge">
                    <span className="report-score-icon" aria-hidden="true">
                      ✦
                    </span>
                    <p className="report-score">
                      {percentileScores && <span className="report-score-unit">{cz ? 'Skóre' : 'Score'} </span>}
                      {scoreLabel(score)}
                    </p>
                  </div>
                  {score.percentile !== undefined && (
                    <p className="report-raw-score">
                      {rawLabel}: {format(score.value)} ({cz ? 'škála' : 'scale'} {rawRange})
                    </p>
                  )}
                  {profile.attributes && (
                    <p className="report-attributes">
                      <strong>{cz ? 'Hlavní atributy kategorie: ' : 'Main category attributes: '}</strong>
                      {profile.attributes}
                    </p>
                  )}
                  {profile.description.split(/\n\s*\n/).map((paragraph, i) => (
                    <p key={i}>{paragraph}</p>
                  ))}
                </div>
                {profile.image && (
                  <div className="report-avatar-frame" aria-hidden="true">
                    <span className="report-avatar-caption">
                      {config.typology.toUpperCase()} / {cz ? 'TVŮJ PROFIL' : 'YOUR PROFILE'}
                    </span>
                    <div className="report-avatar-window">
                      <img className="report-avatar" src={profile.image} width="320" height="320" alt="" />
                    </div>
                    <span className="report-avatar-mark">✦</span>
                    <span className="report-avatar-caption">{profile.name.split(' (')[0]}</span>
                  </div>
                )}
              </article>
            );
          })}
        </div>
        {subtypes.length > 0 && (
          <div className="report-panel report-subtypes">
            <h3>{cz ? 'Podtyp' : 'Subtype'}</h3>
            {subtypes.length > 1 && (
              <p>
                {cz
                  ? 'Druhé nejvyšší hodnocení sdílí více kategorií, proto uvádíme všechny odpovídající podtypy.'
                  : 'Several categories share your second-highest score, so all matching subtypes are shown.'}
              </p>
            )}
            {subtypes.map((subtype) => (
              <div key={subtype.name}>
                <h4>{subtype.name}</h4>
                <p>{subtype.description.replace('[PLACEHOLDER] ', '')}</p>
              </div>
            ))}
          </div>
        )}
      </section>

      <section className="report-section" aria-labelledby="overview-title">
        <div className="report-section-heading">
          <span className="report-section-index" aria-hidden="true">
            02
          </span>
          <h2 id="overview-title">{config.overviewTitle}</h2>
          <span className="report-heading-line" aria-hidden="true" />
        </div>
        <p>
          {legacy
            ? cz
              ? 'Dodané percentily jednotlivých herních typů na škále 0 až 100.'
              : 'The supplied percentiles for each player type on a scale from 0 to 100.'
            : `${config.overviewHelp} ${scaleHelp}`}
        </p>
        <div className="report-overview-layout">
          <ProfileRadar profiles={config.profiles} scores={results.scores} rules={rules} locale={config.locale} />
          <ol className="report-scores">
            {results.scores.map((score) => {
              const { id, value, percentile } = score;
              const profile = profileFor(id);
              const bandIndex = getPreferenceBand(value, rules);
              const band = bandIndex === undefined ? undefined : config.bands[bandIndex];
              return (
                <li
                  className={`report-panel report-score-row${results.dominantIds.includes(id) ? ' is-dominant' : ''}`}
                  key={id}
                  data-reveal
                  style={
                    {
                      '--profile-accent':
                        profileColors[config.profiles.findIndex((profile) => profile.id === id) % profileColors.length],
                    } as CSSProperties
                  }
                >
                  <div className="report-row-heading">
                    <h3>
                      <span className="report-category-index" aria-hidden="true">
                        {String(config.profiles.findIndex((profile) => profile.id === id) + 1).padStart(2, '0')} /{' '}
                      </span>
                      {profile.name}
                    </h3>
                    <strong className="report-number">
                      {percentileScores && <span className="report-score-unit">{cz ? 'Skóre' : 'Score'} </span>}
                      {scoreLabel(score)}
                    </strong>
                  </div>
                  <div className="report-bar" aria-hidden="true">
                    <span
                      style={{
                        width: `${reportedFraction(score, rules) * 100}%`,
                      }}
                    />
                  </div>
                  {band && <p className="report-preference">{band.label}</p>}
                  {percentile !== undefined && (
                    <p className="report-raw-score">
                      {rawLabel}: {format(value)} ({cz ? 'škála' : 'scale'} {rawRange})
                    </p>
                  )}
                  <p className="report-keywords">{profile.keywords}</p>
                </li>
              );
            })}
          </ol>
        </div>
      </section>

      <section className="report-panel report-guide report-section" aria-labelledby="guide-title" data-reveal>
        <div className="report-section-heading">
          <span className="report-section-index" aria-hidden="true">
            03
          </span>
          <h2 id="guide-title">{cz ? 'Jak číst výsledky' : 'How to read your results'}</h2>
        </div>
        {percentileScores && (
          <div className="report-score-explainer">
            <h3>{cz ? 'Co znamená skóre?' : 'What does the score mean?'}</h3>
            <p>
              {cz
                ? 'Skóre je percentil na škále 0 až 100. Ukazuje, jak si v dané oblasti stojíš ve srovnání s ostatními hráči: skóre 80 znamená, že máš vyšší hodnotu než přibližně 80 % hráčů v referenčním souboru, a skóre 50 tě řadí zhruba doprostřed. Nejde tedy o procento správných odpovědí ani o známku.'
                : 'Your score is a percentile on a scale from 0 to 100. It shows where you stand in each area compared with other players: a score of 80 means your result is higher than approximately 80% of players in the reference sample, and a score of 50 places you roughly in the middle. It is not a percentage of correct answers or a grade.'}
            </p>
            {hasPercentileTable && (
              <>
                <p>
                  {cz
                    ? `Menším písmem pod skóre je uveden i tvůj ${rawLabel.toLocaleLowerCase('cs')} (škála ${rawRange}), ze kterého se skóre počítá.${rules.preferenceBands.length ? ' Z něj vychází i slovní hodnocení u každé kategorie – vyjadřuje, jak silně jsi s výroky souhlasil/a, nikoli srovnání s ostatními.' : ''}`
                    : `The smaller text under each score shows your ${rawLabel.toLowerCase()} (scale ${rawRange}), from which the score is calculated.${rules.preferenceBands.length ? ' The verbal rating for each category is also based on it – it reflects how strongly you agreed with the statements, not a comparison with other players.' : ''}`}
                </p>
                <p className="report-keywords">
                  {cz
                    ? `Skóre zaokrouhlujeme na ${decimals(scorePrecision)}. Dominantní profil určujeme z nezaokrouhlen${rules.dominantBy === 'percentile' ? 'ého skóre' : 'é hodnoty: ' + rawLabel.toLocaleLowerCase('cs')}.`
                    : `Scores are rounded to ${decimals(scorePrecision)}. The dominant profile uses the unrounded ${rules.dominantBy === 'percentile' ? 'score' : rawLabel.toLowerCase()}.`}
                </p>
              </>
            )}
          </div>
        )}
        {!percentileScores && (
          <>
            <p>{config.introduction}</p>
            <ol className="report-explanation">
              <li>
                <h3>{config.dominantTitle}</h3>
                <p>{config.dominantHelp}</p>
              </li>
              <li>
                <h3>{config.overviewTitle}</h3>
                <p>{config.overviewHelp}</p>
              </li>
            </ol>
            <dl className="report-bands">
              {rules.preferenceBands.map((range) => {
                const band = config.bands[range.labelIndex];
                return (
                  <div
                    key={range.minimum}
                    className="report-band"
                    style={{ '--band-accent': profileColors[range.labelIndex % profileColors.length] } as CSSProperties}
                  >
                    <dt>
                      {cz ? 'Skóre' : 'Score'} {format(range.minimum)} – {format(range.maximum)} ({band.label})
                    </dt>
                    <dd>{band.description}</dd>
                  </div>
                );
              })}
            </dl>
            <p className="report-keywords">
              {cz
                ? `Skóre zaokrouhlujeme na ${decimals(rules.output.precision)}; stejnou hodnotu používáme pro slovní hodnocení. Dominantní profil určujeme z nezaokrouhleného skóre.`
                : `Scores are rounded to ${decimals(rules.output.precision)}; the same value determines the verbal rating. The dominant profile uses unrounded scores.`}
            </p>
          </>
        )}
        {rules.reference && <p>{rules.reference[config.locale]}</p>}
      </section>

      <section className="report-panel report-link" aria-labelledby="link-title" data-reveal>
        <span className="report-link-symbol" aria-hidden="true">
          ↗
        </span>
        <h2 id="link-title">{cz ? 'Odkaz na tento profil' : 'Link to this profile'}</h2>
        <p>
          {cz
            ? 'Ulož si odkaz, pokud se chceš ke svému profilu vrátit.'
            : 'Save the link to return to your profile later.'}
        </p>
        <label htmlFor="result-link">{cz ? 'Tvůj odkaz na výsledky' : 'Your result link'}</label>
        <input id="result-link" type="text" readOnly value={resultUrl} onFocus={(event) => event.target.select()} />
        <div className="report-actions">
          <button type="button" className="btn btn-primary" onClick={copyLink}>
            {cz ? 'Kopírovat odkaz' : 'Copy link'}
          </button>
          <a className="btn btn-secondary" href={typologyUrl}>
            {cz ? 'Více o typologii' : 'More about this typology'}
          </a>
        </div>
        <p role="status" aria-live="polite">
          {copyStatus}
        </p>
      </section>
    </div>
  );
}
