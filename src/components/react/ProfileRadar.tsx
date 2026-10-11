import type { ReportProfile } from '../../assets/data/reports';
import type { CalculatedScore, ScoringRules } from '../../utils/questionnaireResults';

export const profileColors = [
  'var(--csl-accent-cyan)',
  'var(--csl-accent-magenta)',
  'var(--csl-accent-primary)',
  'var(--csl-blue)',
  'var(--csl-amber)',
  'color-mix(in srgb, var(--csl-accent-magenta) 65%, var(--csl-amber))',
];

export function scoreFraction(value: number, rules: ScoringRules): number {
  const baseline = Math.min(0, rules.output.minimum);
  return Math.max(0, Math.min(1, (value - baseline) / (rules.output.maximum - baseline)));
}

export default function ProfileRadar({
  profiles,
  scores,
  rules,
  locale,
}: {
  profiles: ReportProfile[];
  scores: CalculatedScore[];
  rules: ScoringRules;
  locale: 'cz' | 'en';
}) {
  const point = (index: number, radius: number) => {
    const angle = (index * 2 * Math.PI) / profiles.length - Math.PI / 2;
    return [180 + Math.cos(angle) * radius, 180 + Math.sin(angle) * radius];
  };
  const polygon = (radius: number) => profiles.map((_, index) => point(index, radius).join(',')).join(' ');
  const values = profiles.map((profile) => scores.find(({ id }) => id === profile.id)!.value);
  const resultPoints = values.map((value, index) => point(index, scoreFraction(value, rules) * 118));

  return (
    <figure className="report-radar report-panel" data-reveal>
      <div className="report-radar-heading">
        <span className="eyebrow">{locale === 'cz' ? 'Mapa tvého hraní' : 'Your gaming map'}</span>
        <span className="report-radar-symbol" aria-hidden="true">
          ◈
        </span>
      </div>
      <svg className="report-radar-chart" viewBox="0 0 360 360" aria-hidden="true">
        {[0.2, 0.4, 0.6, 0.8, 1].map((level) => (
          <polygon key={level} points={polygon(118 * level)} className="report-radar-grid" />
        ))}
        {profiles.map((profile, index) => {
          const [x, y] = point(index, 118);
          const [labelX, labelY] = point(index, 145);
          return (
            <g key={profile.id}>
              <line x1="180" y1="180" x2={x} y2={y} className="report-radar-axis" />
              <circle cx={labelX} cy={labelY} r="12" className="report-radar-label-bg" />
              <text x={labelX} y={labelY} dy="0.35em" textAnchor="middle" className="report-radar-label">
                {index + 1}
              </text>
            </g>
          );
        })}
        <polygon points={resultPoints.map((point) => point.join(',')).join(' ')} className="report-radar-result" />
        {resultPoints.map(([x, y], index) => (
          <circle
            key={index}
            cx={x}
            cy={y}
            r="4.5"
            fill={profileColors[index % profileColors.length]}
            className="report-radar-dot"
          />
        ))}
        <circle cx="180" cy="180" r="3" className="report-radar-center" />
      </svg>
      <ol className="report-radar-legend">
        {profiles.map((profile, index) => (
          <li key={profile.id}>
            <span
              className="report-legend-dot"
              style={{ background: profileColors[index % profileColors.length] }}
              aria-hidden="true"
            />
            <span>
              <span className="report-legend-index">{index + 1}.</span> {profile.name.split(' (')[0]}
            </span>
          </li>
        ))}
      </ol>
      <figcaption>
        {locale === 'cz'
          ? 'Čím dál od středu, tím vyšší je tvůj skór.'
          : 'The farther from the center, the higher your score.'}
      </figcaption>
    </figure>
  );
}
