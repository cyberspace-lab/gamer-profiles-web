import { getPermalink, getBlogPermalink, getAsset } from './utils/permalinks';

export const headerData = {
  links: [
    {
      text: 'Bartlova Typologie',
      href: getPermalink('typologie/bartle'),
    },
    { 
      text: 'BrainHex Typologie',
      href: getPermalink('typologie/brainhex'),
    },
    /* {
      text: 'Pages examples',
      links: [
        {
          text: 'Features (Anchor Link)',
          href: getPermalink('/#features'),
        },
        {
          text: 'Services',
          href: getPermalink('/services'),
        },
        {
          text: 'Pricing',
          href: getPermalink('/pricing'),
        },
        {
          text: 'About us',
          href: getPermalink('/about'),
        },
        {
          text: 'Contact',
          href: getPermalink('/contact'),
        },
        {
          text: 'Terms',
          href: getPermalink('/terms'),
        },
        {
          text: 'Privacy policy',
          href: getPermalink('/privacy'),
        },
        {
          text: 'Blog List',
          href: getBlogPermalink(),
        },
        {
          text: 'Article',
          href: getPermalink('get-started-website-with-astro-tailwind-css', 'post'),
        },
        {
          text: 'Article (with MDX)',
          href: getPermalink('markdown-elements-demo-post', 'post'),
        },
      ],
    } */
  ],
  actions: [{ text: 'CyberspaceLab', href: 'https://www.cyberspacelab.cz', target: '_blank' }],
};

export const footerData = {
  links: [
    {
      title: 'Typologie',
      links: [
        { text: 'Bartlova Typologie', href: getPermalink('typologie/bartle') }
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
    <span class="w-5 h-5 md:w-6 md:h-6 md:-mt-0.5 bg-cover mr-1.5 rtl:mr-0 rtl:ml-1.5 float-left rtl:float-right rounded-sm bg-[url(https://onwidget.com/favicon/favicon-32x32.png)]"></span>
    Made by <a class="text-blue-600 underline dark:text-muted" href="https://onwidget.com/"> onWidget</a> · All rights reserved.
  `,
};

export const typology = {
  "bartle": {
    "questionnaire": "https://surveys.cyberspacelab.cz/index.php/459843?newtest=Y&lang=cs"
  },
  "brainhex": {
    "questionnaire": "https://surveys.cyberspacelab.cz/index.php/284187?newtest=Y&lang=cs"
  }
}