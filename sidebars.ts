import type {SidebarsConfig} from '@docusaurus/plugin-content-docs';

const sidebars: SidebarsConfig = {
  docs: [
    {
      type: 'category',
      label: 'アプリ',
      items: [
        {
          type: 'category',
          label: 'Hatsu-go',
          items: [
            'apps/hatsugo-note/overview',
            'apps/hatsugo-note/legal/privacy-policy',
            'apps/hatsugo-note/legal/terms-of-service',
          ],
        },
      ],
    },
    {
      type: 'category',
      label: '会社情報',
      items: ['company/overview', 'company/privacy-policy', 'company/support'],
    },
    {
      type: 'category',
      label: '仕様',
      items: ['spec/hp-spec', 'spec/navigation'],
    },
  ],
};

export default sidebars;
