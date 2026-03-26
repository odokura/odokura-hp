import type {SidebarsConfig} from '@docusaurus/plugin-content-docs';

const sidebars: SidebarsConfig = {
  companySidebar: [
    {
      type: 'category',
      label: 'Company',
      items: ['company/overview', 'company/privacy-policy'],
    },
    {
      type: 'category',
      label: 'Apps',
      items: [
        'apps/hatsugo-note/overview',
        'apps/hatsugo-note/privacy-policy',
        'apps/hatsugo-note/terms-of-service',
      ],
    },
  ],
};

export default sidebars;
