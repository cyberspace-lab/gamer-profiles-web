import czProfiles from './cz.json';
import enProfiles from './en.json';
import type { Locale } from '../../../i18n/ui';
import { getScoringConfig } from '../scoring';
import type { ScoringConfig } from '../../../utils/questionnaireResults';

export const reportTypologies = ['bartle', 'hexad', 'trojan', 'gain'] as const;
export type ReportTypology = (typeof reportTypologies)[number];

export interface ReportProfile {
  id: string;
  name: string;
  description: string;
  keywords: string;
  attributes?: string;
  image?: string;
}

export interface ReportConfig {
  typology: ReportTypology;
  locale: Locale;
  title: string;
  dominantTitle: string;
  overviewTitle: string;
  introduction: string;
  dominantHelp: string;
  overviewHelp: string;
  bands: { label: string; description: string }[];
  profiles: ReportProfile[];
  scoring: ScoringConfig;
}

const names = { bartle: 'Bartle', hexad: 'Hexad', trojan: 'Trojan', gain: 'GAIN' };

const labels = {
  cz: {
    preference: [
      'Tvoje herní srdcovka',
      'Velmi silná preference',
      'Příjemný doplněk',
      'Spíše okrajový',
      'Není to můj styl',
    ],
    hexad: [
      'Tvoje hlavní motivace',
      'Velmi silná motivace',
      'Příjemný doplněk',
      'Spíše okrajová',
      'Tahle motivace mě nežene',
    ],
    gain: ['Srdcová záležitost', 'Velmi lákavé', 'Zlatý střed', 'Okrajový zájem', 'Vůbec mě neláká'],
  },
  en: {
    preference: [
      'Your gaming passion',
      'Very strong preference',
      'A pleasant addition',
      'A minor interest',
      'Not my style',
    ],
    hexad: [
      'Your main motivation',
      'Very strong motivation',
      'A pleasant addition',
      'A minor motivation',
      'This does not motivate me',
    ],
    gain: ['Close to your heart', 'Very appealing', 'The middle ground', 'A marginal interest', 'Not appealing at all'],
  },
};

export function getReportConfig(typology: ReportTypology, locale: Locale): ReportConfig {
  const isCz = locale === 'cz';
  const kind = typology === 'gain' ? 'gain' : typology === 'hexad' ? 'hexad' : 'preference';
  const scoring = getScoringConfig(
    typology,
    czProfiles[typology].map(({ id }) => id)
  );
  for (const rules of Object.values(scoring.versions)) {
    if (rules.preferenceBands.some(({ labelIndex }) => labelIndex >= labels[locale][kind].length)) {
      throw new Error(`Scoring version ${rules.id} refers to an unknown report band label`);
    }
  }
  const noun = typology === 'trojan' ? 'herní styl' : 'herní typ';
  const dominantTitle = isCz
    ? typology === 'gain'
      ? 'Dominantní kategorie'
      : typology === 'hexad'
        ? 'Dominantní herní motivace'
        : `Dominantní ${noun}`
    : typology === 'gain'
      ? 'Dominant activity category'
      : typology === 'hexad'
        ? 'Dominant gaming motivation'
        : typology === 'trojan'
          ? 'Dominant play style'
          : 'Dominant player type';
  const overviewTitle = isCz
    ? typology === 'gain'
      ? 'Přehled všech herních kategorií'
      : typology === 'hexad'
        ? 'Přehled všech herních motivací'
        : typology === 'trojan'
          ? 'Přehled všech herních stylů'
          : 'Přehled všech herních typů'
    : typology === 'gain'
      ? 'Overview of all activity categories'
      : typology === 'hexad'
        ? 'Overview of all gaming motivations'
        : typology === 'trojan'
          ? 'Overview of all play styles'
          : 'Overview of all player types';

  const descriptions = isCz
    ? kind === 'gain'
      ? [
          'Klíčové prvky. Pokud je hra neobsahuje, s velkou pravděpodobností tě omrzí.',
          'Aktivity, které tě výrazně baví a aktivně je ve hrách vyhledáváš.',
          'Příjemný doplňkový obsah. Nevyžaduješ ho, ale jako zpestření ti nevadí.',
          'Prvky, kterým se spíše vyhýbáš nebo je ve hrách pouze toleruješ.',
          'Činnosti, které tě nebaví a mohou tě od hraní daného titulu i odradit.',
        ]
      : kind === 'hexad'
        ? [
            'Tato motivace tě při hraní výrazně pohání. Pravděpodobně představuje jeden z hlavních důvodů, proč tě hry baví a proč se k nim vracíš.',
            'Tato motivace je pro tebe důležitou součástí herního zážitku a ve hrách ji pravděpodobně aktivně vyhledáváš.',
            'Tato motivace ti vyhovuje, ale není pro tebe při hraní zásadní. Může tvůj herní zážitek zpříjemnit, aniž by byla jeho hlavním důvodem.',
            'Tato motivace pro tebe není příliš důležitá. Ve hře ti nemusí vadit, ale pravděpodobně ji aktivně nevyhledáváš.',
            'Tato motivace tě při hraní příliš nepohání a pravděpodobně není důležitým důvodem, proč si hru vybíráš.',
          ]
        : [
            `Tento ${noun} tě výrazně charakterizuje. Jeho prvky aktivně vyhledáváš a pravděpodobně významně ovlivňují tvůj herní zážitek.`,
            `Tento ${noun} tě výrazně baví a představuje důležitou součást toho, co od her očekáváš.`,
            `Tento ${noun} ti vyhovuje, ale není pro tebe při hraní zásadní. Může zpříjemnit herní zážitek, aniž bys ho vyžadoval/a.`,
            `Tento ${noun} pro tebe není příliš důležitý. Ve hře ti nemusí vadit, ale aktivně ho pravděpodobně nevyhledáváš.`,
            `Tento ${noun} tě příliš neoslovuje a pravděpodobně není tím, co tě při hraní motivuje.`,
          ]
    : kind === 'gain'
      ? [
          'These are essential activities. A game without them will probably lose your interest.',
          'You really enjoy these activities and actively seek them in games.',
          'Pleasant extra content. You do not require it, but welcome it as variety.',
          'Elements you tend to avoid or merely tolerate in games.',
          'Activities you do not enjoy, which may even discourage you from playing a game.',
        ]
      : [
          'This strongly characterizes your gaming preferences. You actively seek it, and it is probably a main reason you enjoy games.',
          'This is an important part of your gaming experience, which you probably actively seek.',
          'You enjoy this, but do not require it. It can enrich your experience without being its main purpose.',
          'This is less important to you. You may tolerate it without actively seeking it.',
          'This has little appeal and is probably not an important reason you choose a game.',
        ];

  return {
    typology,
    locale,
    title: isCz ? `Tvoje výsledky: ${names[typology]}` : `Your ${names[typology]} results`,
    dominantTitle,
    overviewTitle,
    introduction: isCz
      ? `Tvůj výsledný profil se skládá ze dvou hlavních částí: ${dominantTitle} a ${overviewTitle.toLocaleLowerCase('cs')} se skóre.`
      : `Your profile has two main parts: ${dominantTitle.toLowerCase()} and ${overviewTitle.toLowerCase()} with scores.`,
    dominantHelp: isCz
      ? kind === 'gain'
        ? 'Tato sekce popisuje herní oblast, ve které jsi dosáhl/a nejvyššího hodnocení. Ukazuje tvůj hlavní herní drajv – tedy to, co od her primárně očekáváš a co tě u nich dokáže udržet nejdéle.'
        : kind === 'hexad'
          ? 'Tato sekce popisuje herní motivaci, ve které jsi dosáhl/a nejvyššího hodnocení. Ukazuje, co tě při hraní nejvíce pohání, jaký typ odměny nebo zážitku vyhledáváš a proč se ke hrám nejraději vracíš.'
          : 'Tato sekce popisuje oblast, ve které jsi dosáhl/a nejvyššího hodnocení. Ukazuje, co tě na hraní nejvíce motivuje, co od her očekáváš a jaký typ herního zážitku tě nejvíce přitahuje.'
      : 'This section describes the area in which you scored highest. It shows what motivates you most, what you expect from games, and which experiences attract you.',
    overviewHelp: isCz
      ? 'Zde najdeš skóre všech kategorií. Vyšší skóre znamená, že daná oblast je pro tebe při hraní důležitější a pravděpodobně tě více motivuje. Nižší skóre ukazuje, že pro tebe není tak zásadní.'
      : 'Here you can see all category scores. A higher score means the area is more important to you and likely more motivating. A lower score indicates it matters less to you.',
    bands: labels[locale][kind].map((label, i) => ({
      label,
      description: descriptions[i],
    })),
    profiles: (isCz ? czProfiles : enProfiles)[typology],
    scoring,
  };
}
