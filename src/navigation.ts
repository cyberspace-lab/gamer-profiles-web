import { getPermalink } from './utils/permalinks';
import type { Locale } from './i18n';

export const getHeaderData = (locale: Locale, t: (key: string) => string) => ({
  links: [
    {
      text: t('nav.bartle'),
      href: getPermalink('typologie/bartle', locale),
    },
    {
      text: t('nav.brainhex'),
      href: getPermalink('typologie/brainhex', locale),
    },
    {
      text: t('nav.trojan'),
      href: getPermalink('typologie/trojan', locale),
    },
    {
      text: t('nav.hexad'),
      href: getPermalink('typologie/hexad', locale),
    },
    {
      text: t('nav.gain'),
      href: getPermalink('typologie/gain', locale),
    },
  ],
  actions: [{ text: t('nav.cyberspacelab'), href: 'https://www.cyberspacelab.cz', target: '_blank' }],
});

export const getFooterData = (locale: Locale, t: (key: string) => string) => ({
  links: [
    {
      title: t('footer.typologies'),
      links: [
        { text: t('nav.bartle'), href: getPermalink('typologie/bartle', locale) },
        { text: t('nav.brainhex'), href: getPermalink('typologie/brainhex', locale) },
        { text: t('nav.trojan'), href: getPermalink('typologie/trojan', locale) },
        { text: t('nav.hexad'), href: getPermalink('typologie/hexad', locale) },
        { text: t('nav.gain'), href: getPermalink('typologie/gain', locale) }
      ],
    },
    {
      title: t('footer.results'),
      links: [
        { text: t('footer.bartleTest'), href: getPermalink('results/bartle', locale)}
      ],
    },
    {
      title: t('nav.cyberspacelab'),
      links: [
        { text: t('footer.web'), href: 'https://www.cyberspacelab.cz' },
      ],
    },
  ],
  secondaryLinks: [],
  dedication: t('footer.dedication'),
  dedicationLabel: t('footer.dedicationLabel'),
  dedicationLogoAlt: t('footer.dedicationLogoAlt'),
  fundingLogoSrc: locale === 'en' ? '/images/partners/opjak-eu-msmt-en.svg' : '/images/partners/opjak-eu-msmt-cz.svg',
  fundingLogoAlt: t('footer.fundingLogoAlt'),
  socialLinks: [
    { ariaLabel: 'X', icon: 'tabler:brand-x', href: '#' },
    { ariaLabel: 'Instagram', icon: 'tabler:brand-instagram', href: 'https://www.instagram.com/cyberspacelab/' },
    { ariaLabel: 'Facebook', icon: 'tabler:brand-facebook', href: 'https://www.facebook.com/profile.php?id=100090876787762' },
  ],
  footNote: `
    <span class="text-sm text-muted dark:text-slate-400">
      © ${new Date().getFullYear()} <a class="text-primary hover:text-accent transition-colors font-medium" href="https://www.cyberspacelab.cz">CyberspaceLab</a> · ${t('footer.allRightsReserved')}
    </span>
  `,
});

export const typology = {
  "bartle": {
    "questionnaire": "#",
  },
  "brainhex": {
    "questionnaire": "#",
  }
}

// Backward compatibility exports for pages that haven't been updated yet
// These use Czech locale as default
import { defaultLang, useTranslations } from './i18n';
const defaultT = useTranslations(defaultLang);
export const headerData = getHeaderData(defaultLang, defaultT);
export const footerData = getFooterData(defaultLang, defaultT);
