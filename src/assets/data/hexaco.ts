import type { Band, NormGroup, NormSample } from '../../utils/hexaco';

type Text = { cz: string; en: string };

/**
 * Scale names. English names follow hexaco.org; Czech names follow the Czech norm table.
 * Descriptions paraphrase hexaco.org/scaledescriptions and describe people with higher/lower scores.
 */
export const HEXACO_SCALE_TEXT: Record<string, { name: Text; high: Text; low?: Text }> = {
  'honesty-humility': {
    name: { cz: 'Poctivost-pokora', en: 'Honesty-Humility' },
    high: {
      cz: 'Lidé s vyšším skóre se vyhýbají manipulování s druhými pro vlastní prospěch, necítí velké pokušení porušovat pravidla, nezajímá je přepych a necítí nárok na zvláštní společenské postavení.',
      en: 'People with higher scores avoid manipulating others for personal gain, feel little temptation to break rules, are uninterested in lavish wealth and luxuries, and feel no special entitlement to elevated social status.',
    },
    low: {
      cz: 'Lidé s nižším skóre spíše lichotí druhým, aby získali, co chtějí, jsou ochotnější obejít pravidla pro vlastní zisk, motivuje je materiální prospěch a mají silnější pocit vlastní důležitosti.',
      en: 'People with lower scores tend to flatter others to get what they want, are more inclined to break rules for personal profit, are motivated by material gain, and feel a strong sense of self-importance.',
    },
  },
  sincerity: {
    name: { cz: 'Opravdovost', en: 'Sincerity' },
    high: {
      cz: 'Vyšší skóre: opravdovost ve vztazích, neochota předstírat nebo lichotit kvůli výhodám.',
      en: 'Higher scores: being genuine with others, unwilling to pretend or flatter to gain favours.',
    },
  },
  fairness: {
    name: { cz: 'Čestnost', en: 'Fairness' },
    high: {
      cz: 'Vyšší skóre: vyhýbání se podvodům a korupci.',
      en: 'Higher scores: avoiding fraud and corruption.',
    },
  },
  'greed-avoidance': {
    name: { cz: 'Vyhýbání se chamtivosti', en: 'Greed Avoidance' },
    high: {
      cz: 'Vyšší skóre: malý zájem o bohatství, luxus a symboly vysokého postavení.',
      en: 'Higher scores: little interest in lavish wealth, luxury goods and signs of high status.',
    },
  },
  modesty: {
    name: { cz: 'Skromnost', en: 'Modesty' },
    high: {
      cz: 'Vyšší skóre: skromné a nenáročné vystupování.',
      en: 'Higher scores: being modest and unassuming.',
    },
  },
  emotionality: {
    name: { cz: 'Emocionalita', en: 'Emotionality' },
    high: {
      cz: 'Lidé s vyšším skóre pociťují strach z fyzického nebezpečí a úzkost ve stresových situacích, potřebují emoční podporu druhých a cítí s druhými silnou empatii a citové pouto.',
      en: 'People with higher scores experience fear of physical dangers and anxiety in response to stress, feel a need for emotional support from others, and feel empathy and sentimental attachment to others.',
    },
    low: {
      cz: 'Lidé s nižším skóre se nenechají odradit hrozbou fyzického zranění, i ve stresu se příliš neznepokojují, nepotřebují své starosti sdílet a k druhým mají citově odstupnější vztah.',
      en: 'People with lower scores are not deterred by the prospect of physical harm, feel little worry even in stressful situations, have little need to share their concerns, and feel more emotionally detached from others.',
    },
  },
  fearfulness: {
    name: { cz: 'Bázlivost', en: 'Fearfulness' },
    high: {
      cz: 'Vyšší skóre: sklon prožívat strach, zejména z fyzického nebezpečí.',
      en: 'Higher scores: a tendency to experience fear, especially of physical harm.',
    },
  },
  anxiety: {
    name: { cz: 'Úzkostnost', en: 'Anxiety' },
    high: {
      cz: 'Vyšší skóre: sklon k obavám a starostem v různých situacích.',
      en: 'Higher scores: a tendency to worry in a variety of situations.',
    },
  },
  dependence: {
    name: { cz: 'Závislost', en: 'Dependence' },
    high: {
      cz: 'Vyšší skóre: potřeba emoční podpory a útěchy od druhých.',
      en: 'Higher scores: a need for emotional support and comfort from others.',
    },
  },
  sentimentality: {
    name: { cz: 'Citlivost', en: 'Sentimentality' },
    high: {
      cz: 'Vyšší skóre: silná citová pouta k druhým a empatie.',
      en: 'Higher scores: strong emotional bonds with others and empathy.',
    },
  },
  extraversion: {
    name: { cz: 'Extraverze', en: 'Extraversion' },
    high: {
      cz: 'Lidé s vyšším skóre mají o sobě dobré mínění, cítí se jistě, když vedou skupinu nebo k ní mluví, užívají si společenská setkání a prožívají nadšení a energii.',
      en: 'People with higher scores feel positively about themselves, feel confident when leading or addressing groups, enjoy social gatherings and interactions, and experience enthusiasm and energy.',
    },
    low: {
      cz: 'Lidé s nižším skóre se považují za méně oblíbené, necítí se dobře ve středu pozornosti, společenské aktivity jsou jim spíše lhostejné a cítí se méně živě a optimisticky než ostatní.',
      en: 'People with lower scores consider themselves less popular, feel awkward at the centre of attention, are indifferent to social activities, and feel less lively and optimistic than others.',
    },
  },
  'social-self-esteem': {
    name: { cz: 'Sociální sebeúcta', en: 'Social Self-Esteem' },
    high: {
      cz: 'Vyšší skóre: pozitivní sebehodnocení, zejména ve společnosti druhých.',
      en: 'Higher scores: positive self-regard, especially in social settings.',
    },
  },
  'social-boldness': {
    name: { cz: 'Sociální smělost', en: 'Social Boldness' },
    high: {
      cz: 'Vyšší skóre: jistota při vedení skupiny, mluvení na veřejnosti a jednání s neznámými lidmi.',
      en: 'Higher scores: confidence when leading a group, speaking in public or meeting strangers.',
    },
  },
  sociability: {
    name: { cz: 'Společenskost', en: 'Sociability' },
    high: {
      cz: 'Vyšší skóre: zájem o rozhovory, společnost a večírky.',
      en: 'Higher scores: enjoying conversation, company and parties.',
    },
  },
  liveliness: {
    name: { cz: 'Nadšení', en: 'Liveliness' },
    high: {
      cz: 'Vyšší skóre: běžně prožívaná energie, nadšení a dobrá nálada.',
      en: 'Higher scores: everyday energy, enthusiasm and cheerfulness.',
    },
  },
  agreeableness: {
    name: { cz: 'Přívětivost', en: 'Agreeableness (vs. Anger)' },
    high: {
      cz: 'Lidé s vyšším skóre odpouštějí křivdy, posuzují druhé shovívavě, jsou ochotni ke kompromisu a spolupráci a snadno ovládají svůj hněv.',
      en: 'People with higher scores forgive the wrongs they have suffered, are lenient in judging others, are willing to compromise and cooperate, and can easily control their temper.',
    },
    low: {
      cz: 'Lidé s nižším skóre si déle drží křivdy, kritičtěji vnímají nedostatky druhých, tvrdohlavěji hájí své stanovisko a snáze se rozzlobí, když se s nimi jedná špatně.',
      en: 'People with lower scores hold grudges, are more critical of others’ shortcomings, are stubborn in defending their point of view, and feel anger readily when mistreated.',
    },
  },
  forgivingness: {
    name: { cz: 'Ochota promíjet', en: 'Forgivingness' },
    high: {
      cz: 'Vyšší skóre: ochota znovu důvěřovat těm, kdo nám ublížili.',
      en: 'Higher scores: willingness to trust and like again those who caused harm.',
    },
  },
  gentleness: {
    name: { cz: 'Shovívavost', en: 'Gentleness' },
    high: {
      cz: 'Vyšší skóre: mírnost a shovívavost v jednání s druhými.',
      en: 'Higher scores: being mild and lenient in dealings with others.',
    },
  },
  flexibility: {
    name: { cz: 'Přizpůsobivost', en: 'Flexibility' },
    high: {
      cz: 'Vyšší skóre: ochota ke kompromisu a spolupráci.',
      en: 'Higher scores: willingness to compromise and cooperate.',
    },
  },
  patience: {
    name: { cz: 'Trpělivost', en: 'Patience' },
    high: {
      cz: 'Vyšší skóre: sklon zachovat klid, místo aby se člověk rozzlobil.',
      en: 'Higher scores: a tendency to stay calm rather than become angry.',
    },
  },
  conscientiousness: {
    name: { cz: 'Svědomitost', en: 'Conscientiousness' },
    high: {
      cz: 'Lidé s vyšším skóre si organizují čas i prostředí, pracují disciplinovaně na svých cílech, usilují o přesnost a dokonalost a pečlivě zvažují svá rozhodnutí.',
      en: 'People with higher scores organize their time and surroundings, work in a disciplined way toward their goals, strive for accuracy and perfection, and deliberate carefully when making decisions.',
    },
    low: {
      cz: 'Lidé s nižším skóre si méně dělají starosti s pořádkem a plánem, vyhýbají se náročným úkolům, spokojí se i s prací s drobnými chybami a rozhodují se spíše impulzivně.',
      en: 'People with lower scores are less concerned with orderly surroundings or schedules, avoid difficult tasks, are satisfied with work that contains some errors, and make decisions on impulse.',
    },
  },
  organization: {
    name: { cz: 'Organizace', en: 'Organization' },
    high: {
      cz: 'Vyšší skóre: snaha o pořádek, zejména ve fyzickém prostředí.',
      en: 'Higher scores: seeking order, particularly in one’s physical surroundings.',
    },
  },
  diligence: {
    name: { cz: 'Pracovitost', en: 'Diligence' },
    high: {
      cz: 'Vyšší skóre: sklon tvrdě pracovat.',
      en: 'Higher scores: a tendency to work hard.',
    },
  },
  perfectionism: {
    name: { cz: 'Perfekcionismus', en: 'Perfectionism' },
    high: {
      cz: 'Vyšší skóre: důkladnost a důraz na detaily.',
      en: 'Higher scores: thoroughness and concern with details.',
    },
  },
  prudence: {
    name: { cz: 'Rozvážnost', en: 'Prudence' },
    high: {
      cz: 'Vyšší skóre: pečlivé zvažování a ovládání impulzů.',
      en: 'Higher scores: deliberating carefully and inhibiting impulses.',
    },
  },
  openness: {
    name: { cz: 'Otevřenost vůči zkušenosti', en: 'Openness to Experience' },
    high: {
      cz: 'Lidé s vyšším skóre se nechávají pohltit krásou umění a přírody, zajímají se o různé oblasti poznání, ve všedním životě volně využívají svou představivost a zajímají je neobvyklé myšlenky i lidé.',
      en: 'People with higher scores become absorbed in the beauty of art and nature, are inquisitive about various domains of knowledge, use their imagination freely in everyday life, and take an interest in unusual ideas or people.',
    },
    low: {
      cz: 'Lidé s nižším skóre jsou uměním spíše nedotčeni, pociťují menší intelektuální zvědavost, vyhýbají se tvůrčím činnostem a nepřitahují je myšlenky, které působí radikálně nebo nekonvenčně.',
      en: 'People with lower scores are rather unimpressed by most works of art, feel little intellectual curiosity, avoid creative pursuits, and feel little attraction toward ideas that may seem radical or unconventional.',
    },
  },
  'aesthetic-appreciation': {
    name: { cz: 'Estetické prožívání', en: 'Aesthetic Appreciation' },
    high: {
      cz: 'Vyšší skóre: požitek z krásy umění a přírody.',
      en: 'Higher scores: enjoyment of beauty in art and nature.',
    },
  },
  inquisitiveness: {
    name: { cz: 'Zvídavost', en: 'Inquisitiveness' },
    high: {
      cz: 'Vyšší skóre: vyhledávání informací a zkušeností o přírodě a lidském světě.',
      en: 'Higher scores: seeking information about, and experience with, the natural and human world.',
    },
  },
  creativity: {
    name: { cz: 'Tvořivost', en: 'Creativity' },
    high: {
      cz: 'Vyšší skóre: záliba v novátorství a experimentování.',
      en: 'Higher scores: a preference for innovation and experiment.',
    },
  },
  unconventionality: {
    name: { cz: 'Nekonvenčnost', en: 'Unconventionality' },
    high: {
      cz: 'Vyšší skóre: přijímání neobvyklého.',
      en: 'Higher scores: a tendency to accept the unusual.',
    },
  },
  altruism: {
    name: { cz: 'Altruismus', en: 'Altruism (vs. Antagonism)' },
    high: {
      cz: 'Lidé s vyšším skóre jsou k druhým soucitní, štědří k těm, kdo jsou slabí nebo v nouzi, a vyhýbají se tomu, aby někomu ublížili.',
      en: 'People with higher scores are soft-hearted toward others, generous toward those who are weak or in need, and avoid causing harm.',
    },
    low: {
      cz: 'Lidé s nižším skóre nejsou představou, že by někomu ublížili, příliš znepokojeni a druzí je mohou vnímat jako tvrdé.',
      en: 'People with lower scores are not much upset by the prospect of hurting others and may be seen as hard-hearted.',
    },
  },
};

export const HEXACO_BAND_TEXT: Record<Band, Text> = {
  low: { cz: 'nízké', en: 'low' },
  below: { cz: 'spíše nízké', en: 'below average' },
  average: { cz: 'průměrné', en: 'average' },
  above: { cz: 'spíše vysoké', en: 'above average' },
  high: { cz: 'vysoké', en: 'high' },
};

export const HEXACO_GROUP_TEXT: Record<NormGroup, Text> = {
  total: { cz: 'Všichni', en: 'All' },
  women: { cz: 'Ženy', en: 'Women' },
  men: { cz: 'Muži', en: 'Men' },
};

export const HEXACO_SAMPLE_TEXT: Record<NormSample, { name: Text; description: Text }> = {
  cz: {
    name: { cz: 'Český soubor', en: 'Czech sample' },
    description: {
      cz: 'české normy pro sebeposuzovací formu HEXACO-100',
      en: 'Czech norms for the HEXACO-100 self-report form',
    },
  },
  ca: {
    name: { cz: 'Kanadští studenti (hexaco.org)', en: 'Canadian students (hexaco.org)' },
    description: {
      cz: 'kanadští vysokoškolští studenti, anglická verze, N = 1126 (691 žen, 429 mužů)',
      en: 'Canadian university students, English version, N = 1126 (691 women, 429 men)',
    },
  },
};

/** Letters of the six domains, in HEXACO_DOMAINS order. */
export const HEXACO_HEX_LETTERS = ['H', 'E', 'X', 'A', 'C', 'O'];
