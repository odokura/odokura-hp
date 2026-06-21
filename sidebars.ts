import type {SidebarsConfig} from '@docusaurus/plugin-content-docs';

const sidebars: SidebarsConfig = {
  docs: [
    {
      type: 'category',
      label: '会社',
      items: ['company/overview', 'company/privacy-policy'],
    },
    {
      type: 'category',
      label: '発語ノート',
      items: [
        'apps/hatsugo-note/overview',
        'apps/hatsugo-note/legal/privacy-policy',
        'apps/hatsugo-note/legal/terms-of-service',
      ],
    },
  ],
};

export default sidebars;
