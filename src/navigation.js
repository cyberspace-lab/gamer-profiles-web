import { getPermalink } from './utils/permalinks';

export const headerData = {
  links: [
    {
      text: 'Bartlova Typologie',
      href: getPermalink('typologie/bartle'),
    },
    { 
      text: 'BrainHex',
      href: getPermalink('typologie/brainhex'),
    },
    {
      text: 'Trojan',
      href: getPermalink('typologie/trojan'),
    },
    {
      text: 'Hexad',
      href: getPermalink('typologie/hexad'),
    },
    {
      text: 'GAIN',
      href: getPermalink('typologie/gain'),
    },
  ],
  actions: [{ text: 'CyberspaceLab', href: 'https://www.cyberspacelab.cz', target: '_blank' }],
};

export const footerData = {
  links: [
    {
      title: 'Typologie',
      links: [
        { text: 'Bartlova typologie', href: getPermalink('typologie/bartle') },
        { text: 'BrainHex', href: getPermalink('typologie/brainhex') },
        { text: 'Trojan', href: getPermalink('typologie/trojan') },
        { text: 'Hexad', href: getPermalink('typologie/hexad') },
        { text: 'GAIN', href: getPermalink('typologie/gain') }
      ],
    },
    {
      title: 'Výsledky',
      links: [
        { text: 'Bartle test a výsledky', href: getPermalink('results/bartle')}
      ],
    },
    {
      title: 'CyberspaceLab',
      links: [
        { text: 'Web', href: 'https://www.cyberspacelab.cz' },
      ],
    },
  ],
  secondaryLinks: [
  ],
  socialLinks: [
    { ariaLabel: 'X', icon: 'tabler:brand-x', href: '#' },
    { ariaLabel: 'Instagram', icon: 'tabler:brand-instagram', href: 'https://www.instagram.com/cyberspacelab/' },
    { ariaLabel: 'Facebook', icon: 'tabler:brand-facebook', href: 'https://www.facebook.com/profile.php?id=100090876787762' },
  ],
  footNote: `
    <span class="text-sm text-muted dark:text-slate-400">
      © ${new Date().getFullYear()} <a class="text-primary hover:text-accent transition-colors font-medium" href="https://www.cyberspacelab.cz">CyberspaceLab</a> · Všechna práva vyhrazena
    </span>
  `,
};

export const typology = {
  "bartle": {
    "questionnaire": "#",
  },
  "brainhex": {
    "questionnaire": "#",
  }
}
