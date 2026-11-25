import { useEffect, useMemo, useRef, useState, type CSSProperties, type MouseEvent } from 'react';
import { profileColors } from './ProfileRadar';
import {
  HEXACO_HEX_LETTERS,
  HEXACO_SAMPLE_TEXT,
  HEXACO_BAND_TEXT,
  HEXACO_GROUP_TEXT,
  HEXACO_SCALE_TEXT,
} from '../../assets/data/hexaco';
import {
  bandFor,
  HEXACO_DOMAINS,
  HEXACO_INTERSTITIAL,
  NORM_GROUPS,
  NORM_SAMPLES,
  normFor,
  parseHexacoParams,
  parseNormHash,
  toPercentile,
  type HexacoParseResult,
  type NormGroup,
  type NormSample,
} from '../../utils/hexaco';

type Locale = 'cz' | 'en';

export const HEXACO_EXAMPLE_SEARCH =
  'questionnaire=2026-10&created=2026-11&honesty-humility=3.5&sincerity=3.25&fairness=4&greed-avoidance=2.75&modesty=4&emotionality=3.188&fearfulness=2.5&anxiety=3.75&dependence=3.25&sentimentality=3.25&extraversion=3.375&social-self-esteem=4&social-boldness=2.75&sociability=3.5&liveliness=3.25&agreeableness=3.063&forgivingness=2.75&gentleness=3.5&flexibility=2.75&patience=3.25&conscientiousness=3.688&organization=3.5&diligence=4.25&perfectionism=3.75&prudence=3.25&openness=3.813&aesthetic-appreciation=4&inquisitiveness=3.5&creativity=4.25&unconventionality=3.5&altruism=4.25';

interface Norms {
  sample: NormSample;
  group: NormGroup;
}

export default function HexacoReport({ locale }: { locale: Locale }) {
  const cz = locale === 'cz';
  const [results, setResults] = useState<HexacoParseResult | null>(null);
  const [norms, setNorms] = useState<Norms>({ sample: 'cz', group: 'total' });
  const [isExample, setIsExample] = useState(false);
  const [copyStatus, setCopyStatus] = useState('');
  const [resultUrl, setResultUrl] = useState('');
  const reportRef = useRef<HTMLDivElement>(null);

  const t = (text: { cz: string; en: string }) => text[locale];
  const name = (id: string) => t(HEXACO_SCALE_TEXT[id].name);
  const formatMean = (value: number) =>
    value.toLocaleString(cz ? 'cs-CZ' : 'en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

  // Keep the results (and norm choice) when switching the page language.
  const syncLanguageLinks = (url: URL) =>
    document.querySelectorAll<HTMLAnchorElement>('[data-language-link]').forEach((link) => {
      const languageUrl = new URL(link.href);
      languageUrl.search = url.search;
      languageUrl.hash = url.hash;
      link.href = languageUrl.href;
    });

  useEffect(() => {
    const parsed = parseHexacoParams(window.location.search);
    setResults(parsed);
    setNorms(parseNormHash(window.location.hash));
    setIsExample(new URLSearchParams(window.location.search).get('example') === '1');
    setResultUrl(window.location.href);
    if (parsed.status === 'valid') syncLanguageLinks(new URL(window.location.href));
  }, []);

  // The norm choice stays in the page; it is mirrored only in the URL hash, which browsers never send to servers.
  function changeNorms(next: Norms) {
    setNorms(next);
    const url = new URL(window.location.href);
    url.hash = `norms=${next.sample}-${next.group}`;
    window.history.replaceState(null, '', url);
    setResultUrl(url.href);
    syncLanguageLinks(url);
  }

  const scored = useMemo(() => {
    if (results?.status !== 'valid') return undefined;
    const score = (id: string) => {
      const value = results.scores[id];
      const norm = normFor(id, norms.sample, norms.group);
      const { percentile } = toPercentile(value, norm);
      return { id, value, percentile, band: bandFor(percentile), fallback: norm.fallback };
    };
    return {
      domains: HEXACO_DOMAINS.map((domain) => ({ ...score(domain.id), facets: domain.facets.map(score) })),
      altruism: score(HEXACO_INTERSTITIAL),
    };
  }, [results, norms]);

  useEffect(() => {
    const element = reportRef.current;
    if (
      !element ||
      !('IntersectionObserver' in window) ||
      window.matchMedia('(prefers-reduced-motion: reduce)').matches
    )
      return;
    const observer = new IntersectionObserver(
      (entries) =>
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.setAttribute('data-visible', '');
            observer.unobserve(entry.target);
          }
        }),
      { threshold: 0.08 }
    );
    element.querySelectorAll('[data-reveal]').forEach((panel) => observer.observe(panel));
    element.classList.add('report-motion-ready');
    return () => {
      observer.disconnect();
      element.classList.remove('report-motion-ready');
    };
  }, [results]);

  // In-page links scroll without replacing the `#norms=` hash.
  function jump(event: MouseEvent<HTMLAnchorElement>) {
    const target = document.getElementById(event.currentTarget.hash.slice(1));
    if (!target) return;
    event.preventDefault();
    const smooth = !window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    target.scrollIntoView({ behavior: smooth ? 'smooth' : 'auto', block: 'start' });
  }

  async function copyLink() {
    try {
      await navigator.clipboard.writeText(resultUrl);
      setCopyStatus(cz ? 'Odkaz zkopírován.' : 'Link copied.');
    } catch {
      setCopyStatus(cz ? 'Odkaz můžeš zkopírovat z pole níže.' : 'You can copy the link from the field below.');
    }
  }

  if (!results) return <p role="status">{cz ? 'Načítání výsledků…' : 'Loading results…'}</p>;

  if (results.status !== 'valid' || !scored) {
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
              ? 'Pro zobrazení profilu potřebujeme platné skóre pro všech 31 škál. Zkus znovu otevřít celý odkaz, který jsi získal/a po vyplnění dotazníku.'
              : 'Your profile needs a valid score for all 31 scales. Try opening the complete link you received after finishing the questionnaire again.'
            : cz
              ? 'Po dokončení dotazníku otevři svůj osobní odkaz na výsledky. Zobrazí se tady přehled všech škál.'
              : 'After completing the questionnaire, open your personal result link. All your scales will appear here.'}
        </p>
        {results.status === 'invalid' && (
          <p role="status">
            {cz ? 'Chybějící nebo neplatné hodnoty' : 'Missing or invalid values'}: {results.invalidKeys.join(', ')}.{' '}
            {cz ? 'Povolený rozsah' : 'Expected range'}: 1 – 5
            {results.invalidKeys.includes('created') ? (cz ? '; created ve tvaru RRRR-MM' : '; created as YYYY-MM') : ''}
            .
          </p>
        )}
        <div className="report-actions">
          <a className="btn btn-primary" href={`?${HEXACO_EXAMPLE_SEARCH}&example=1`}>
            {cz ? 'Prohlédnout ukázku výsledků' : 'View example results'}
          </a>
        </div>
      </section>
    );
  }

  const sampleText = HEXACO_SAMPLE_TEXT[norms.sample];
  const emotionalityWomen = normFor('emotionality', norms.sample, 'women').m;
  const emotionalityMen = normFor('emotionality', norms.sample, 'men').m;
  const percentileLabel = cz ? 'Percentil' : 'Percentile';
  const rawLabel = cz ? 'Průměr odpovědí' : 'Average answer';

  const bar = (percentile: number) => (
    <div className="report-bar hexaco-bar" aria-hidden="true">
      <span style={{ width: `${percentile}%` }} />
    </div>
  );

  return (
    <div className="report-content hexaco-report" ref={reportRef}>
      <dl className="report-calculation-meta" aria-label={cz ? 'Údaje o dotazníku' : 'Questionnaire details'}>
        <div>
          <dt>{cz ? 'Dotazník' : 'Questionnaire'}</dt>
          <dd>HEXACO-PI-R · 100</dd>
        </div>
        {results.questionnaire && (
          <div>
            <dt>{cz ? 'Verze otázek' : 'Questionnaire version'}</dt>
            <dd>{results.questionnaire}</dd>
          </div>
        )}
        <div>
          <dt>{cz ? 'Vyplněno' : 'Completed'}</dt>
          <dd>{results.created ?? (cz ? 'Neuvedeno' : 'Not supplied')}</dd>
        </div>
      </dl>

      {isExample && (
        <p className="report-notice" role="note">
          {cz
            ? 'Ukázka výsledků — tato čísla slouží jako příklad a nejsou tvým osobním výsledkem.'
            : 'Example results — these scores are illustrative and are not your personal results.'}
        </p>
      )}

      <form
        className="report-panel hexaco-norms"
        aria-label={cz ? 'Srovnávací skupina' : 'Comparison group'}
        onSubmit={(event) => event.preventDefault()}
      >
        <div className="hexaco-norms-copy">
          <h2>{cz ? 'S kým se srovnáváš?' : 'Who are you compared with?'}</h2>
          <p className="report-keywords">
            {cz
              ? 'Percentily se přepočítají okamžitě přímo ve tvém prohlížeči. Volba se nikam neodesílá.'
              : 'Percentiles are recalculated instantly in your browser. Your choice is not sent anywhere.'}
          </p>
        </div>
        <label>
          <span>{cz ? 'Srovnávací soubor' : 'Reference sample'}</span>
          <select
            value={norms.sample}
            onChange={(event) => changeNorms({ ...norms, sample: event.target.value as NormSample })}
          >
            {NORM_SAMPLES.map((sample) => (
              <option key={sample} value={sample}>
                {t(HEXACO_SAMPLE_TEXT[sample].name)}
              </option>
            ))}
          </select>
        </label>
        <label>
          <span>{cz ? 'Skupina' : 'Group'}</span>
          <select
            value={norms.group}
            onChange={(event) => changeNorms({ ...norms, group: event.target.value as NormGroup })}
          >
            {NORM_GROUPS.map((group) => (
              <option key={group} value={group}>
                {t(HEXACO_GROUP_TEXT[group])}
              </option>
            ))}
          </select>
        </label>
      </form>

      <nav className="report-jump-nav" aria-label={cz ? 'Sekce výsledků' : 'Result sections'}>
        <a href="#domains-title" onClick={jump}>
          <span aria-hidden="true">01</span> {cz ? 'Šest dimenzí' : 'Six domains'}
        </a>
        <a href="#altruism-title" onClick={jump}>
          <span aria-hidden="true">02</span> {name(HEXACO_INTERSTITIAL)}
        </a>
        <a href="#guide-title" onClick={jump}>
          <span aria-hidden="true">03</span> {cz ? 'Jak číst výsledky' : 'Read your results'}
        </a>
      </nav>

      <section className="report-section" aria-labelledby="domains-title">
        <div className="report-section-heading">
          <span className="report-section-index" aria-hidden="true">
            01
          </span>
          <h2 id="domains-title">{cz ? 'Šest dimenzí osobnosti' : 'Six personality domains'}</h2>
          <span className="report-heading-line" aria-hidden="true" />
        </div>
        <div className="hexaco-overview">
          <HexacoRadar
            domains={scored.domains.map(({ id, percentile }) => ({ id, percentile }))}
            label={(id) => name(id)}
            cz={cz}
          />
          <ol className="hexaco-summary">
            {scored.domains.map((domain, index) => (
              <li key={domain.id} style={{ '--profile-accent': profileColors[index] } as CSSProperties}>
                <span className="hexaco-letter" aria-hidden="true">
                  {HEXACO_HEX_LETTERS[index]}
                </span>
                <a href={`#scale-${domain.id}`} onClick={jump}>{name(domain.id)}</a>
                <strong>{domain.percentile}</strong>
                <span className="hexaco-summary-band">{t(HEXACO_BAND_TEXT[domain.band])}</span>
              </li>
            ))}
          </ol>
        </div>
        <div className="hexaco-domain-list">
          {scored.domains.map((domain, index) => (
            <article
              id={`scale-${domain.id}`}
              key={domain.id}
              className="report-panel report-score-row hexaco-domain"
              data-reveal
              style={{ '--profile-accent': profileColors[index] } as CSSProperties}
            >
              <div className="report-row-heading">
                <h3>
                  <span className="report-category-index" aria-hidden="true">
                    {HEXACO_HEX_LETTERS[index]} /{' '}
                  </span>
                  {name(domain.id)}
                </h3>
                <strong className="report-number">
                  <span className="report-score-unit">{percentileLabel} </span>
                  {domain.percentile}
                </strong>
              </div>
              {bar(domain.percentile)}
              <p className="report-preference">{t(HEXACO_BAND_TEXT[domain.band])}</p>
              <p className="report-raw-score">
                {rawLabel}: {formatMean(domain.value)} ({cz ? 'škála' : 'scale'} 1–5)
              </p>
              <p className="report-keywords">{t(HEXACO_SCALE_TEXT[domain.id].high)}</p>
              {HEXACO_SCALE_TEXT[domain.id].low && (
                <p className="report-keywords">{t(HEXACO_SCALE_TEXT[domain.id].low!)}</p>
              )}
              <h4 className="hexaco-facets-title">{cz ? 'Dílčí škály' : 'Facets'}</h4>
              <ul className="hexaco-facets">
                {domain.facets.map((facet) => (
                  <li key={facet.id} id={`scale-${facet.id}`}>
                    <div className="hexaco-facet-heading">
                      <span className="hexaco-facet-name">{name(facet.id)}</span>
                      <strong>
                        <span className="report-score-unit">{percentileLabel} </span>
                        {facet.percentile}
                      </strong>
                    </div>
                    {bar(facet.percentile)}
                    <p className="hexaco-facet-meta">
                      <span>{t(HEXACO_BAND_TEXT[facet.band])}</span>
                      <span className="report-raw-score">
                        {rawLabel}: {formatMean(facet.value)}
                      </span>
                    </p>
                    <p className="hexaco-facet-description">{t(HEXACO_SCALE_TEXT[facet.id].high)}</p>
                  </li>
                ))}
              </ul>
            </article>
          ))}
        </div>
        <p className="report-notice" role="note">
          {cz
            ? 'Dílčí škály mají jen 4 položky, a jsou proto méně přesné než šest hlavních dimenzí. Podle autorů dotazníku nemají mít vysokou vnitřní konzistenci; u většiny z nich je reliabilita (Cronbachova alfa) nižší než 0,70. Ber je jako orientační.'
            : 'Facets have only 4 items each and are therefore less precise than the six domains. According to the authors of the questionnaire, they are not intended to have high internal consistency; most have a reliability (Cronbach’s alpha) below .70. Treat them as approximate.'}
        </p>
      </section>

      <section className="report-section" aria-labelledby="altruism-title">
        <div className="report-section-heading">
          <span className="report-section-index" aria-hidden="true">
            02
          </span>
          <h2 id="altruism-title">{name(HEXACO_INTERSTITIAL)}</h2>
          <span className="report-heading-line" aria-hidden="true" />
        </div>
        <article
          id={`scale-${HEXACO_INTERSTITIAL}`}
          className="report-panel report-score-row hexaco-domain"
          data-reveal
          style={{ '--profile-accent': 'var(--csl-fg-3)' } as CSSProperties}
        >
          <p className="eyebrow">{cz ? 'Mezilehlá škála' : 'Interstitial scale'}</p>
          <div className="report-row-heading">
            <h3>{name(HEXACO_INTERSTITIAL)}</h3>
            <strong className="report-number">
              <span className="report-score-unit">{percentileLabel} </span>
              {scored.altruism.percentile}
            </strong>
          </div>
          {bar(scored.altruism.percentile)}
          <p className="report-preference">{t(HEXACO_BAND_TEXT[scored.altruism.band])}</p>
          <p className="report-raw-score">
            {rawLabel}: {formatMean(scored.altruism.value)} ({cz ? 'škála' : 'scale'} 1–5)
          </p>
          <p className="report-keywords">
            {cz
              ? 'Altruismus nepatří k žádné ze šesti dimenzí. Souvisí s několika z nich, především s poctivostí-pokorou, emocionalitou a přívětivostí.'
              : 'Altruism belongs to none of the six domains. It relates to several of them, mainly Honesty-Humility, Emotionality and Agreeableness.'}
          </p>
          <p className="report-keywords">{t(HEXACO_SCALE_TEXT[HEXACO_INTERSTITIAL].high)}</p>
          <p className="report-keywords">{t(HEXACO_SCALE_TEXT[HEXACO_INTERSTITIAL].low!)}</p>
          {scored.altruism.fallback && (
            <p className="report-keywords hexaco-fallback">
              {cz
                ? 'Český soubor pro altruismus normy neuvádí, proto ho srovnáváme s kanadskými studenty (hexaco.org).'
                : 'The Czech sample has no norms for Altruism, so it is compared with Canadian students (hexaco.org).'}
            </p>
          )}
        </article>
      </section>

      <section className="report-panel report-guide report-section" aria-labelledby="guide-title" data-reveal>
        <div className="report-section-heading">
          <span className="report-section-index" aria-hidden="true">
            03
          </span>
          <h2 id="guide-title">{cz ? 'Jak číst výsledky' : 'How to read your results'}</h2>
        </div>
        <div className="report-score-explainer">
          <h3>{cz ? 'Co znamená percentil?' : 'What does the percentile mean?'}</h3>
          <p>
            {cz
              ? 'Percentil (1–99) ukazuje, kolik procent lidí ve srovnávací skupině má nižší skóre než ty. Percentil 70 znamená, že máš vyšší skóre než zhruba 70 % srovnávací skupiny; 50 je přesně uprostřed. Percentily jsou srovnání, nikoli hodnocení: vysoké ani nízké skóre není samo o sobě dobré nebo špatné.'
              : 'The percentile (1–99) shows what percentage of people in the comparison group scored lower than you. A percentile of 70 means your score is higher than about 70% of the group; 50 is right in the middle. Percentiles are a comparison, not a verdict: neither a high nor a low score is good or bad in itself.'}
          </p>
          <p>
            {cz
              ? 'Slovní pásma: nízké (1–15), spíše nízké (16–30), průměrné (31–69), spíše vysoké (70–84), vysoké (85–99). Menším písmem je uveden i tvůj průměr odpovědí na škále 1–5, ze kterého se percentil počítá.'
              : 'Bands: low (1–15), below average (16–30), average (31–69), above average (70–84), high (85–99). The smaller text also shows your average answer on the 1–5 scale, from which the percentile is calculated.'}
          </p>
        </div>
        <ul className="hexaco-guide-list">
          <li>
            {cz
              ? `Právě tě srovnáváme se souborem: ${t(sampleText.description)}${norms.group === 'total' ? '' : ` (${t(HEXACO_GROUP_TEXT[norms.group]).toLocaleLowerCase('cs')})`}. Pro lidi, kteří se od tohoto souboru liší (například věkem nebo zemí), jsou percentily jen přibližné.`
              : `You are currently compared with: ${t(sampleText.description)}${norms.group === 'total' ? '' : ` (${t(HEXACO_GROUP_TEXT[norms.group]).toLowerCase()})`}. For people who differ from this sample (for example in age or country), percentiles are only approximate.`}
          </li>
          <li>
            {cz
              ? `Emocionalita se mezi ženami a muži výrazně liší (průměr žen ${formatMean(emotionalityWomen)}, mužů ${formatMean(emotionalityMen)}), takže právě u ní volba skupiny mění výsledek nejvíce.`
              : `Emotionality differs strongly between women and men (women average ${formatMean(emotionalityWomen)}, men ${formatMean(emotionalityMen)}), so the choice of group matters most there.`}
          </li>
          <li>
            {cz
              ? 'Percentily počítáme z průměru a směrodatné odchylky srovnávací skupiny za předpokladu normálního rozložení.'
              : 'Percentiles are calculated from the comparison group’s mean and standard deviation, assuming a normal distribution.'}
          </li>
        </ul>
        <p className="report-keywords">
          {cz
            ? 'HEXACO-PI-R © Kibeom Lee a Michael C. Ashton. Klíč pro výpočet škál, popisy škál a kanadské normy pocházejí z hexaco.org.'
            : 'HEXACO-PI-R © Kibeom Lee and Michael C. Ashton. The scoring key, scale descriptions and Canadian norms come from hexaco.org.'}
        </p>
      </section>

      <section className="report-panel report-link" aria-labelledby="link-title" data-reveal>
        <span className="report-link-symbol" aria-hidden="true">
          ↗
        </span>
        <h2 id="link-title">{cz ? 'Odkaz na tento profil' : 'Link to this profile'}</h2>
        <p>
          {cz
            ? 'Ulož si odkaz, pokud se chceš ke svému profilu vrátit. Výsledky jsou uložené jen v odkazu samotném, proto ho sdílej jen s tím, komu je chceš ukázat.'
            : 'Save the link to return to your profile later. Your results are stored only in the link itself, so share it only with people you want to show them to.'}
        </p>
        <label htmlFor="result-link">{cz ? 'Tvůj odkaz na výsledky' : 'Your result link'}</label>
        <input id="result-link" type="text" readOnly value={resultUrl} onFocus={(event) => event.target.select()} />
        <div className="report-actions">
          <button type="button" className="btn btn-primary" onClick={copyLink}>
            {cz ? 'Kopírovat odkaz' : 'Copy link'}
          </button>
        </div>
        <p role="status" aria-live="polite">
          {copyStatus}
        </p>
      </section>
    </div>
  );
}

function HexacoRadar({
  domains,
  label,
  cz,
}: {
  domains: { id: string; percentile: number }[];
  label: (id: string) => string;
  cz: boolean;
}) {
  const center = 120;
  const radius = 92;
  const point = (index: number, fraction: number) => {
    const angle = (index * Math.PI * 2) / domains.length - Math.PI / 2;
    return [center + Math.cos(angle) * radius * fraction, center + Math.sin(angle) * radius * fraction];
  };
  const polygon = (fractions: number[]) => fractions.map((f, i) => point(i, f).join(',')).join(' ');
  const summary = domains.map(({ id, percentile }) => `${label(id)} ${percentile}`).join(', ');
  return (
    <figure className="report-panel hexaco-radar">
      <svg
        viewBox="0 0 240 240"
        role="img"
        aria-label={`${cz ? 'Percentily šesti dimenzí' : 'Percentiles of the six domains'}: ${summary}`}
      >
        {[1, 0.5].map((level) => (
          <polygon
            key={level}
            points={polygon(domains.map(() => level))}
            className={level === 0.5 ? 'hexaco-radar-mid' : 'report-signal-grid'}
            fill="none"
          />
        ))}
        {domains.map((_, i) => {
          const [x, y] = point(i, 1);
          return <line key={i} x1={center} y1={center} x2={x} y2={y} className="report-signal-grid" />;
        })}
        <polygon points={polygon(domains.map(({ percentile }) => percentile / 100))} className="hexaco-radar-shape" />
        {domains.map(({ id, percentile }, i) => {
          const [x, y] = point(i, percentile / 100);
          const [lx, ly] = point(i, 1.17);
          return (
            <g key={id}>
              <circle cx={x} cy={y} r="4" fill={profileColors[i]} />
              <text x={lx} y={ly} textAnchor="middle" dominantBaseline="middle" className="hexaco-radar-letter">
                {HEXACO_HEX_LETTERS[i]}
              </text>
            </g>
          );
        })}
      </svg>
      <figcaption className="report-keywords">
        {cz ? 'Šestiúhelník uprostřed odpovídá percentilu 50.' : 'The inner hexagon marks the 50th percentile.'}
      </figcaption>
    </figure>
  );
}
