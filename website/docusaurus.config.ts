import {themes as prismThemes} from 'prism-react-renderer';
import type {Config} from '@docusaurus/types';
import type * as Preset from '@docusaurus/preset-classic';

const config: Config = {
  title: 'ODOKURA',
  tagline: 'Company information and app policies',
  favicon: 'img/favicon.ico',

  future: {
    v4: true,
  },

  url: 'https://www.odokura.com',
  baseUrl: '/',

  organizationName: 'odokura',
  projectName: 'odokura-hp',

  onBrokenLinks: 'throw',

  i18n: {
    defaultLocale: 'ja',
    locales: ['ja'],
  },

  presets: [
    [
      'classic',
      {
        docs: {
          sidebarPath: './sidebars.ts',
          routeBasePath: 'docs',
        },
        blog: false,
        theme: {
          customCss: './src/css/custom.css',
        },
      } satisfies Preset.Options,
    ],
  ],

  themeConfig: {
    image: 'img/docusaurus-social-card.jpg',
    colorMode: {
      defaultMode: 'light',
      disableSwitch: true,
      respectPrefersColorScheme: false,
    },
    navbar: {
      title: 'ODOKURA',
      logo: {
        alt: 'ODOKURA Logo',
        src: 'img/logo.svg',
      },
      items: [
        {
          type: 'docSidebar',
          sidebarId: 'companySidebar',
          position: 'left',
          label: 'Company',
        },
        {
          to: '/docs/apps/hatsugo-note/overview',
          label: '発語ノート',
          position: 'left',
        },
        {
          to: '/docs/apps/hatsugo-note/privacy-policy',
          label: 'Privacy',
          position: 'right',
        },
        {
          to: '/docs/apps/hatsugo-note/terms-of-service',
          label: 'Terms',
          position: 'right',
        },
      ],
    },
    footer: {
      style: 'dark',
      links: [
        {
          title: 'Company',
          items: [
            {
              label: 'Overview',
              to: '/docs/company/overview',
            },
            {
              label: 'Privacy Policy',
              to: '/docs/company/privacy-policy',
            },
          ],
        },
        {
          title: 'Apps',
          items: [
            {
              label: '発語ノート',
              to: '/docs/apps/hatsugo-note/overview',
            },
            {
              label: 'Privacy Policy',
              to: '/docs/apps/hatsugo-note/privacy-policy',
            },
            {
              label: 'Terms of Service',
              to: '/docs/apps/hatsugo-note/terms-of-service',
            },
          ],
        },
        {
          title: 'Contact',
          items: [
            {
              label: 'info@odokura.jp',
              href: 'mailto:info@odokura.jp',
            },
          ],
        },
      ],
      copyright: `Copyright © ${new Date().getFullYear()} ODOKURA LLC. Built with Docusaurus.`,
    },
    prism: {
      theme: prismThemes.github,
      darkTheme: prismThemes.dracula,
    },
  } satisfies Preset.ThemeConfig,
};

export default config;
