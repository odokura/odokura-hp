import type {Config} from '@docusaurus/types';
import type {Options, ThemeConfig} from '@docusaurus/preset-classic';

const config: Config = {
  title: 'ODOKURA',
  tagline: 'モバイルアプリケーション・ソフトウェア開発',
  favicon: 'img/favicon.svg',

  url: 'https://www.odokura.com',
  baseUrl: '/',

  organizationName: 'odokura',
  projectName: 'odokura-hp',

  onBrokenLinks: 'throw',
  markdown: {
    hooks: {
      onBrokenMarkdownLinks: 'warn',
    },
  },

  i18n: {
    defaultLocale: 'ja',
    locales: ['ja'],
  },

  future: {
    v4: {
      removeLegacyPostBuildHeadAttribute: true,
      useCssCascadeLayers: true,
    },
  },

  presets: [
    [
      'classic',
      {
        docs: {
          sidebarPath: './sidebars.ts',
          routeBasePath: 'docs',
          include: ['company/**/*.md', 'apps/**/*.md', 'spec/**/*.md'],
        },
        blog: false,
        theme: {
          customCss: './src/css/custom.css',
        },
      } satisfies Options,
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
          href: 'mailto:info@odokura.jp',
          label: 'お問い合わせ',
          position: 'right',
        },
      ],
    },
    footer: {
      style: 'dark',
      links: [
        {
          title: '会社',
          items: [
            {
              label: '会社情報',
              to: '/docs/company/overview',
            },
            {
              label: 'プライバシーポリシー',
              to: '/docs/company/privacy-policy',
            },
          ],
        },
        {
          title: 'アプリ',
          items: [
            {
              label: 'Hatsu-go',
              to: '/docs/apps/hatsugo-note/overview',
            },
            {
              label: 'Hatsu-go プライバシーポリシー',
              to: '/docs/apps/hatsugo-note/legal/privacy-policy',
            },
            {
              label: 'Hatsu-go 利用規約',
              to: '/docs/apps/hatsugo-note/legal/terms-of-service',
            },
          ],
        },
        {
          title: 'お問い合わせ',
          items: [
            {
              label: 'info@odokura.jp',
              href: 'mailto:info@odokura.jp',
            },
          ],
        },
      ],
      copyright: `Copyright © ${new Date().getFullYear()} ODOKURA LLC.`,
    },
    prism: {
      theme: require('prism-react-renderer').themes.github,
      darkTheme: require('prism-react-renderer').themes.dracula,
    },
  } satisfies ThemeConfig,
};

export default config;
